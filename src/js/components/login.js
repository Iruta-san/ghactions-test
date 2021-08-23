import {formValidation} from './form';
import states from '../states';
import {getTranslate, getTranslateMessage} from '../translate';
import helpers from '../helpers';
import modal from './modal';
import analytics from './analytics';

let $loginBtn = '';
let $stateHeaderUser = '';
let $stateSigninBtn = '';
let $stateSigninLink = '';
let email = '';
let loginArr = [];
let showSuccess;

// eslint-disable-next-line no-unused-vars
function getUserOrders() {
	return new Promise((resolve) => {
		const settings = {
			// eslint-disable-next-line no-undef
			url: urlForOrder,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Token ${helpers.secure.get('_secure_meta_token')}`,
			},
		};

		$('[type="submit"]').prop('disabled', true).addClass('is-disabled');

		$.ajax(settings)
			.done((response) => {
				$('[type="submit"]').prop('disabled', false).removeClass('is-disabled');
				const orders = response.orders.sort((a, b) => {
					if (a.id > b.id) {
						return 1;
					}

					if (a.id < b.id) {
						return -1;
					}

					return 0;
				});

				for (let i = 0; i < orders.length; i++) {
					const order = orders[i];

					if (
						order.status.toLowerCase() === 'waiting_payment' ||
						order.status.toLowerCase() === 'created' ||
						order.status.toLowerCase() === 'accepted') {
						$('.header-order__notify').append(states.orderNotifyProgress(order));

						setTimeout(() => {
							$('.header-order__notify').find(`[data-id="${order.id}"]`).fadeOut();
						}, 5000);
					} else if (status.toLowerCase() === 'paid') {
						$('.header-order__notify').append(states.orderNotifyProgress(order, `${getTranslateMessage([helpers.locale].forPaidError, order.id)}`));

						setTimeout(() => {
							$('.header-order__notify').find(`[data-id="${order.id}"]`).fadeOut();
						}, 5000);
					} else if (
						order.status.toLowerCase() === 'out_of_stock' ||
						order.status.toLowerCase() === 'warning' ||
						order.status.toLowerCase() === 'no_enough_stock' ||
						order.status.toLowerCase() === 'not_enough_stock' ||
						order.status.toLowerCase() === 'no_enough_coins_to_start' ||
						order.status.toLowerCase() === 'not_enough_coins_to_start' ||
						order.status.toLowerCase() === 'error_fut' ||
						order.status.toLowerCase() === 'fut_error') {
						$('.header-order__notify').append(states.orderNotifyError(order));
					} else if (status.toLowerCase() === 'wrong_credentials') {
						$('.header-order__notify').append(states.orderNotifyError(order, `${getTranslateMessage([helpers.locale].forCredentialsError, order.id)}`));
					} else if (status.toLowerCase() === 'wrong_backup') {
						$('.header-order__notify').append(states.orderNotifyError(order, `${getTranslateMessage([helpers.locale].forBackupError, order.id)}`));
					} else if (status.toLowerCase() === 'customer_online') {
						$('.header-order__notify').append(states.orderNotifyError(order, `${getTranslateMessage([helpers.locale].forCustomerError, order.id)}`));
					} else if (order.status.toLowerCase() === 'error_payment') {
						$('.header-order__notify').append(states.orderNotifyError(order, `${getTranslate[helpers.locale].forPaymentError}`));
					}
				}

				resolve();
			});
	});
}

function showSuccessMesage(data){
	const $headerNotify = $('.header__notify:not(.header__notify--error)');
	$headerNotify.find('.header__notify-text').html(states.headerUserNotify(data));
	$headerNotify.removeClass('is-hidden').show();

	clearTimeout(showSuccess);
	showSuccess = setTimeout(() => {
		helpers.secure.set('showSuccessMesage', null);
		$headerNotify.fadeOut();
	}, 5000);
}

function setUserData(params, forForm) {
	let data = {};
	$stateSigninBtn.add($stateSigninLink).addClass('is-hidden');

	$loginBtn.addClass('is-hidden');
	modal.close();

	data.name = params.username;

	if (params.money) {
		data.money = params.money;
	}

	if (params.currency) {
		data.currency = params.currency;
		helpers.currency = params.currency;
	}

	$stateHeaderUser.removeClass('is-hidden').html('').html(states.headerUser(data));



	if (!helpers.secure.get('_secure_meta_token') || params.token !== !helpers.secure.get('_secure_meta_token')) {
		helpers.secure.set('_secure_meta_token', params.token);
	}

	if (!helpers.secure.get('_secure_meta_user')) {
		helpers.secure.set('_secure_meta_user', params);
	}

	if (helpers.secure.get('location')){
		let loc = helpers.secure.get('location');
        helpers.locale = helpers.secure.get('location_locale');

        //helpers.secure.set('user_locale', helpers.locale);
        helpers.secure.set('location_locale', null);
		helpers.secure.set('location', null);

		if (loc.indexOf('order') > -1){
			barba.force(loc);
		} else {
			helpers.secure.set('needPlatform', false);
			barba.go(loc, 'localeChange');
		}

		helpers.secure.set('showSuccessMesage', data);

	} else {
		if (forForm) {
			showSuccessMesage(data);
		}
	}

	helpers.secure.get('showSuccessMesage') && showSuccessMesage(data);

	// getUserOrders();
}

class Login {
	constructor($form, namespace) {
		this.ns = namespace;

		this.$form = $form;
		this.$errorMessage = $form.find('.js-form-error-message');
		this.$formBtn = $form.find('.js-form-submit');
		this.$formBtnSpan = this.$formBtn.find('.btn__content');

		this.customValidators = [];
		this.customResponseHandlers = [];
		this.isLoading = false;

		$form.on(`submit.${this.ns}`, (event) => {
			event.preventDefault();
			event.stopPropagation();

			this.submit();
		});

		helpers.$body
			.on(`click.${this.ns}`, '.js-notify-btn', (e) => {
				$(e.currentTarget).closest('.header__notify').fadeOut();
				helpers.secure.set('showSuccessMesage', null);
			})
			.on(`click.${this.ns}`, '.js-order-notify-btn', (e) => {
				$(e.currentTarget).closest('.header-order__notify-item').fadeOut();
			})
			.on(`click.${this.ns}`, '.js-fb-login', (e) => {
				helpers.secure.set('location', location.href);
				helpers.secure.set('location_locale', helpers.locale);
				setTimeout(function () {
					//helpers.setCookie('token','');
					//location.href = '/order/?successLogin=yes#_=_';
					location.href = urlForFacebook;
				}, 0);
			})
			.on(`click.${this.ns}`, '.js-google-login', (e) => {
				auth2.grantOfflineAccess().then(this.signInCallback);
			});
	}

	signInCallback(authResult) {
		if (authResult['code']) {
		  $.ajax({
			url: `${urlForGoogle}?code=${authResult['code']}`,
			headers: {
			  'X-Requested-With': 'XMLHttpRequest'
			},
			contentType: 'application/octet-stream; charset=utf-8',
			processData: false,
		  })
		  .then(() => {
			  helpers.secure.set('location', location.href);
			  helpers.secure.set('location_locale', helpers.locale);
			  location.href = '/order/?successLogin=yes#_=_'; });
		} else {
			console.log(authResult);
		}
	}

	destroy() {
		this.$formBtn.off(`.${this.ns}`);
		this.$form.off(`.${this.ns}`);
		helpers.$body.off(`.${this.ns}`);
	}

	getValues() {
		const $form = this.$form;
		const $input = $form.find('input');
		const values = {
			user: {
				region: helpers.region,
			},
		};

		$input.each((i, el) => {
			values.user[$(el).attr('name')] = $(el).val();
		});

		email = values.user.email;

		helpers.secure.set('_secure_meta_password', values.user.password);

		return JSON.stringify(values);
	}

	/**
	 * Reset form
	 */
	reset() {
		this.$form[0].reset();

		this.$form.find('.input__group').removeClass('has-success has-error');
		this.$form.find('.input__least').removeClass('input__least--success input__least--error');

		this.enable();
	}

	/**
	* Disable form
	*/
	disable() {
		this.isLoading = true;
		const $form = this.$form;
		this.submitBtnText = this.$formBtnSpan.text();

		// Select elements don't have "readonly" attribute
		$form.find('input, select, textarea').prop('readonly', true).addClass('readonly');
		$form.find('button[type="submit"], input[type="submit"]').prop('disabled', true);

		this.$formBtnSpan.text(getTranslate[helpers.locale].loading);
	}

	/**
	* Enable form
	*/
	enable() {
		this.isLoading = false;
		const $form = this.$form;

		// Select elements don't have "readonly" attribute
		$form.find('input, select, textarea').prop('readonly', false).removeClass('readonly');
		$form.find('button[type="submit"], input[type="submit"]').prop('disabled', false);
		this.$formBtnSpan.text(this.submitBtnText);
	}

	submit() {
		const $form = this.$form;
		const values = this.getValues();
		const url = `${window.url}${$form.attr('action')}`;
		const method = $form.attr('method');

		if (!$form.valid() && $form.find('.has-error').length) {
			if ($form.find('input').length) {
				$form.find('input').trigger('update');
			}

			return;
		}

		this.disable();

		$.ajax({
			url,
			method,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Token ${helpers.secure.get('_secure_meta_token')}`,
			},
			data: values,
		})
			.always(this.handleResponseComplete.bind(this))
			.done(this.handleResponseSuccess.bind(this))
			.fail(this.handleResponseFailure.bind(this, values));
	}

	// eslint-disable-next-line no-unused-vars
	handleResponseComplete(request, response) {
		this.enable();
	}

	handleResponseSuccess(request, response) {
		this.reset();

		const $hide = this.$form.find('.js-form-error');

		$hide.addClass('is-hidden');

		if (this.$form.data('form') === 'login') {
			analytics.login(email);
			analytics.logIn();
		} else {
			analytics.sinup(email);
			analytics.signUp();
		}

		if (response.status || response === 'success') {
			const $button = this.$form.find('.js-password-view');
			const input = $button.siblings('input');

			setUserData(request.user, true);

			this.$form.find('input').each((i, el) => {
				$(el).val('');
				$(el).closest('.input__group').removeClass('has-success has-active has-hovered');
			});

			input.attr('type', 'password');
			$button.removeClass('is-active').attr('title', `${getTranslate[helpers.locale].seePassword}`);
		} else {
			let errors = response.errors || response.error || [];

			if (typeof errors === 'string') {
				errors = [{
					message: errors,
				}];
			}

			// Custom response handlers
			$.each(this.customResponseHandlers, (handler) => {
				handler(request, response, errors, this);
			});

			this.showGenericErrorMessage(errors);
		}
	}

	handleResponseFailure(request, response) {
		// eslint-disable-next-line no-console
		console.log(response);
		let message = '';

		if (!response.responseJSON) {
			message = response.statusText;

			this.showGenericErrorMessage(message);

			return;
		}

		const errors = Object.entries(response.responseJSON.errors);

		if (response.responseJSON.code) {
			const code = Object.entries(response.responseJSON.code);

			for (let i = 0; i < code.length; i++) {
				const coma = ', ';

				if (code[i][1] === 'MissingOrInvalidCredentialsCode') {
					message += `${getTranslate[helpers.locale].MissingOrInvalidCredentialsCode}${i === errors.length - 1 ? '' : coma}`;
				}
			}
		}

		// Custom response handlers
		$.each(this.customResponseHandlers, (handler) => {
			handler(request, response, null, this);
		});

		for (let i = 0; i < errors.length; i++) {
			const element = errors[i];
			const coma = ', ';
			let mail = false;

			if (element[0].indexOf('email or password') >= 0) {
				message += getTranslate[helpers.locale].emailOrPassword;

				break;
			}

			if (element[0].indexOf('email') >= 0) {
				element[0] = getTranslate[helpers.locale].email;

				if (helpers.locale === 'ru' && !mail) {
					mail = true;
				}
			}

			if (element[0].indexOf('username') >= 0) {
				element[0] = getTranslate[helpers.locale].username;
			}

			if (element[0].indexOf('password') >= 0) {
				element[0] = getTranslate[helpers.locale].password;
			}

			if (element[1][0].indexOf('is invalid') >= 0) {
				element[1] = getTranslate[helpers.locale].isInvalid;
			}

			if (element[1][0].indexOf('is already taken') >= 0) {
				element[1] = getTranslate[helpers.locale].isAlreadyTaken;

				if (helpers.locale === 'ru' && mail) {
					element[1] = getTranslate[helpers.locale].isAlreadyTaken1;
				}
			}

			message += `${element[0]} ${element[1]}${i === errors.length - 1 ? '' : coma}`;
		}

		this.showGenericErrorMessage(message);
	}

	// eslint-disable-next-line class-methods-use-this
	showGenericErrorMessage(message) {
		const template = states.errorTemplate(message);

		helpers.$body.append(template.html);

		$(`[data-id="error-${template.num}"]`).last().removeClass('is-hidden');

		setTimeout(() => {
			$(`[data-id="error-${template.num}"]`).fadeOut();
		}, 5000);
	}
}

function init() {
	$loginBtn = $('.js-login-btn');
	$stateHeaderUser = $('.js-state-header-user');
	$stateSigninBtn = $('.js-state-signin-btn');
	$stateSigninLink = $('.js-state-signin-link');
	const $formLogin = $('.js-form-login');
	helpers.eraseCookie('logged_social');
	if (helpers.secure.get('_secure_meta_user')) {
		setUserData(helpers.secure.get('_secure_meta_user'));
	} else if(helpers.getCookie('token')){
		let data = {
			username: helpers.getCookie('username'),
			email: helpers.getCookie('email'),
			token: helpers.getCookie('token'),
		}

		helpers.setCookie('logged_social', true);

		helpers.secure.set('needPlatform', true);
		helpers.eraseCookie('username');
		helpers.eraseCookie('email');
		helpers.eraseCookie('token');
		setUserData(data, true);
	}else{
		$stateSigninBtn.add($stateSigninLink).removeClass('is-hidden');
	}

	if (location.search.indexOf('successLogin')){
		let value = location.search.split('successLogin=')[1];
		if (value=='no'){
			history.replaceState({error:'login'}, '', '/');
			const message = getTranslate[helpers.locale].fbError;
			const template = states.errorTemplate(message);

			helpers.$body.append(template.html);

			$(`[data-id="error-${template.num}"]`).last().removeClass('is-hidden');

			setTimeout(() => {
				$(`[data-id="error-${template.num}"]`).fadeOut();
			}, 5000);
		}
	}

	$formLogin.each((i, el) => {
		// eslint-disable-next-line no-unused-vars
		const login = new Login($(el), $(el).data('form'));

		loginArr.push(login);
		formValidation($(el));
	});

	helpers.$body.on('click.login', '.js-logout-btn', (event) => {
		event.preventDefault();

		gapi.auth2.getAuthInstance().disconnect();
		helpers.secure.remove('_secure_meta_user');
		helpers.secure.remove('_secure_meta_token');
		helpers.secure.remove('_secure_meta_password');
		helpers.secureEasy.remove('_secure__ls__metadata');
		helpers.secureEasy.remove('user_order');
		helpers.secureEasy.remove('user_order_id');
		$stateHeaderUser.addClass('is-hidden').html('');
		$stateSigninBtn.add($stateSigninLink).removeClass('is-hidden');
		$('.header__notify').fadeOut();

		document.location = `/${helpers.locale === 'en' ? '' : `${helpers.locale}/`}`;
	});
}


function fb() {
    return; //TODO
	function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
		console.log('statusChangeCallback');
		console.log(response);                   // The current login status of the person.
		if (response.status === 'connected') {   // Logged into your webpage and Facebook.
			testAPI();
		} else {                                 // Not logged into your webpage or we are unable to tell.
			document.getElementById('status').innerHTML = 'Please log ' +
				'into this webpage.';
		}
	}

	function checkLoginState() {               // Called when a person is finished with the Login Button.
		FB.getLoginStatus(function(response) {   // See the onlogin handler
			statusChangeCallback(response);
		});
	}

	function testAPI() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
		console.log('Welcome!  Fetching your information.... ');
		FB.api('/me', function(response) {
			console.log('Successful login for: ' + response.name);
		});
	}

	$('.js-fb-login').on('click', function () {
		FB.login(function(response) {
			if (response.status === 'connected') {
				console.log(response);
			} else {
				// The person is not logged into your webpage or we are unable to tell.
			}
		}, {scope: 'public_profile,email'});
	});


	window.fbAsyncInit = function() {
		FB.init({
			appId      : '128042159225777',
			cookie     : true,                     // Enable cookies to allow the server to access the session.
			xfbml      : true,                     // Parse social plugins on this webpage.
			version    : '10.0'           // Use this Graph API version for this call.
		});


		FB.getLoginStatus(function(response) {   // Called after the JS SDK has been initialized.
			statusChangeCallback(response);        // Returns the login status.
		});
	};
}

function destroy() {
	$loginBtn = '';
	$stateHeaderUser = '';
	$stateSigninBtn = '';
	$stateSigninLink = '';
	helpers.$body.off('.login');

	for (let i = 0; i < loginArr.length; i++) {
		const element = loginArr[i];

		element.destroy();
	}
	loginArr = [];
}

export default {
	init,
	destroy,
	setUserData,
	fb,
};
