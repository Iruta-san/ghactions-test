/* eslint-disable no-console */
import {formValidation} from './form';
import login from './login';
import helpers from '../helpers';
import states from '../states';
import {getTranslate} from '../translate';
import Input from './inputs';

let profileArr = [];
let $profileForm = '';
let $btnImage = '';
let $profileImage = '';
let $profileImageText = '';
let $profileOrderTableTop = '';
let $profileOrderTableBody = '';

function executeOrder($btn) {
	const $form = $btn.closest('form');
	// eslint-disable-next-line no-undef
	const url = `${urlForOrder}${$form.attr('action')}`;
	const method = $form.attr('method');
	const values = {
		mail: $form.find('[name="email"]').val(),
		password: $form.find('[name="password"]').val(),
	};
	const $formContent = $form.find('.js-form-content');
	const $formError = $form.find('.js-form-error-message');
	const $formSuccess = $form.find('.js-form-success-message');

	$formError.addClass('is-hidden').html('');

	if ($form.find('.js-profile-codes .input__input').val().length !== 0 || $form.find('.js-profile-codes .input__input').val().length > 8) {
		$form.find('.js-profile-codes .input__input').attr('required', true);
		$form.find('.js-profile-codes').removeClass('has-success').addClass('has-error');
		console.log($form.find('.js-profile-codes'));
		$form.find('.js-profile-codes .input__label').append(`<label id="${$form.find('.js-profile-codes .input__label').attr('for')}-error" class="error" for="${$form.find('.js-profile-codes .input__label').attr('for')}">${getTranslate[helpers.locale].profileCodesErrors}</label>`);

		if ($form.find('input').length) {
			$form.find('input').trigger('update');
		}

		return;
	}

	if (!$form.find('.input__code').length) {
		$form.find('.js-profile-codes .input__input').attr('required', true);
		$form.find('.js-profile-codes').removeClass('has-success').addClass('has-error');
		$form.find('.js-profile-codes .input__label').append(`<label id="${$form.find('.js-profile-codes .input__label').attr('for')}-error" class="error" for="${$form.find('.js-profile-codes .input__label').attr('for')}">${getTranslate[helpers.locale].profileCodesErrors}</label>`);

		if ($form.find('input').length) {
			$form.find('input').trigger('update');
		}

		return;
	}

	$form.find('.js-profile-codes').removeClass('has-error').addClass('has-success');
	$form.find('.js-profile-codes .input__label .error').remove();

	if (!$form.valid() && $form.find('.has-error').length) {
		if ($form.find('input').length) {
			$form.find('input').trigger('update');
		}

		return;
	}

	$form.find('.input__code').each((i, el) => {
		values[`backupCode${i + 1}`] = $(el).data('value').toString();
	});

	let settings = {
		url,
		method,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Token ${helpers.secure.get('_secure_meta_token')}`,
		},
		data: JSON.stringify(values),
	};

	$('[type="submit"]').prop('disabled', true).addClass('is-disabled');

	$.ajax(settings).done((response) => {
		$('[type="submit"]').prop('disabled', false).removeClass('is-disabled');
		console.log(response);
		$formContent.slideUp();
		$formSuccess.removeClass('is-hidden').find('.text .status').text(response.status.toLowerCase().split('_').join(' '));
	}).fail((error) => {
		$('[type="submit"]').prop('disabled', false).removeClass('is-disabled');
		console.log(error);
		if (error.responseJSON.code) {
			const code = Object.entries(error.responseJSON.code);
			let mess = '';

			for (let i = 0; i < code.length; i++) {
				if (code[i][1] === 'MissingOrInvalidCredentialsCode') {
					mess = getTranslate[helpers.locale].MissingOrInvalidCredentialsCode;
				}
			}

			const template = states.errorTemplate(mess);

			helpers.$body.append(template.html);

			$(`[data-id="error-${template.num}"]`).last().removeClass('is-hidden');

			setTimeout(() => {
				$(`[data-id="error-${template.num}"]`).fadeOut();
			}, 5000);
		} else {
			const template = states.errorTemplate(error.responseText);

			helpers.$body.append(template.html);

			$(`[data-id="error-${template.num}"]`).last().removeClass('is-hidden');

			setTimeout(() => {
				$(`[data-id="error-${template.num}"]`).fadeOut();
			}, 5000);
		}
	});
}

function setUserData(params) {
	if (helpers.secure.get('_secure_meta_user')) {
		const data = params ? params : helpers.secure.get('_secure_meta_user');

		$profileForm.each((i, form) => {
			const $input = $(form).find('input');

			if ($(form).is('[name="origin"]') && data.origin) {
				$input.each((j, el) => {
					if (data.origin[$(el).attr('name')]) {
						$(el).val(data.origin[$(el).attr('name')]);
						$(el).closest('.input__group').addClass('has-success');
					}
				});
			} else if (!$(form).is('[name="origin"]')) {
				$input.each((j, el) => {
					if (data[$(el).attr('name')]) {
						$(el).val(data[$(el).attr('name')]);
						$(el).closest('.input__group').addClass('has-success');
					}

					if ($(el).is('[name="password"]') && helpers.secure.get('_secure_meta_password')) {
						$(el).val(helpers.secure.get('_secure_meta_password'));
						$(el).closest('.input__group').addClass('has-success');
					}
				});
			}
		});

		$('.profile__title').text(data.username);

		if (data.image) {
			$profileImage.attr('src', data.image).fadeIn();
			$profileImageText.hide();
		} else {
			$profileImageText.text(data.username.charAt(0));
		}

		if (helpers.secure.get('_secure_meta_token')) {
			const settings = {
				// eslint-disable-next-line no-undef
				url: urlForOrder,
				method: 'GET',
				headers: {
					// eslint-disable-next-line quote-props
					'Authorization': `Token ${helpers.secure.get('_secure_meta_token')}`,
				},
			};

			$('[type="submit"]').prop('disabled', true).addClass('is-disabled');

			$.ajax(settings).done((response) => {
				$('[type="submit"]').prop('disabled', false).removeClass('is-disabled');
				if (!helpers.isMobile()) {
					$profileOrderTableTop.show();
				}

				let template = '';

				for (let i = 0; i < response.orders.length; i++) {
					const order = response.orders[i];

					template += `
						<div class="profile-order-table__container">
							${states.profileTableHeading(order)}
							${states.profileTableBody(order)}
						</div>`;
				}

				$profileOrderTableBody.html(template);

				setTimeout(() => {
					// eslint-disable-next-line no-loop-func
					$profileOrderTableBody.find('.input__group').each((j, el) => {
						const namespace = 'input';
						const options = helpers.getSpecialAttributes(el, namespace);
						// eslint-disable-next-line no-unused-vars
						const inputGroup = new Input($(el), options);
					});

					$profileOrderTableBody.find('.js-form-order-profile').each((j, el) => {
						$(el).find('.js-form-submit').on('click.profile', (e) => {
							e.preventDefault();
							e.stopPropagation();

							executeOrder($(e.currentTarget));
						});

						formValidation($(el));
					});
				}, 500);
			}).fail((error) => {
				$('[type="submit"]').prop('disabled', false).removeClass('is-disabled');
				console.log(error);
				const template = states.errorTemplate(error.statusText);

				helpers.$body.append(template.html);

				$(`[data-id="error-${template.num}"]`).last().removeClass('is-hidden');

				setTimeout(() => {
					$(`[data-id="error-${template.num}"]`).fadeOut();
				}, 5000);
			});
		}
	} else if (helpers.$body.find('.profile').length) {
		document.location = '/';
	}
}

class UpdateProfile {
	constructor($form, namespace) {
		this.ns = namespace;

		this.$form = $form;
		this.$errorMessage = $form.find('.js-form-error-message');
		this.$formInput = $form.find('input');
		this.$formBtn = $form.find('.js-form-submit');
		this.$formBtnSpan = this.$formBtn.find('.btn__content');

		this.customValidators = [];
		this.customResponseHandlers = [];
		this.isLoading = false;
		this.userImage = helpers.secure.get('_secure_meta_user').image || $profileImage.attr('src');

		$form.on(`submit.${this.ns}`, (event) => {
			event.preventDefault();
			event.stopPropagation();

			this.submit();
		});

		this.$formInput.on(`change.${this.ns}`, (e) => {
			if ($(e.currentTarget).val().length !== 0) {
				this.$formBtn.removeClass('is-hidden');
			} else {
				this.$formBtn.addClass('is-hidden');
			}
		});

		this.updateImage();
	}

	destroy() {
		this.$formBtn.off(`.${this.ns}`);
		this.$form.off(`.${this.ns}`);
		this.$formInput.off(`.${this.ns}`);
		$btnImage.off(`.${this.ns}`);
	}

	getValues() {
		const $form = this.$form;
		const $input = $form.find('input');
		const values = {
			user: {
				image: this.userImage,
				origin: {},
			},
		};

		$input.each((i, el) => {
			if ($form.is('[name="origin"]')) {
				values.user.origin[$(el).attr('name')] = $(el).val();
			} else {
				values.user[$(el).attr('name')] = $(el).val();
			}

			if ($(el).is('[name="password"]') && helpers.secure.get('_secure_meta_password')) {
				helpers.secure.set('_secure_meta_password', $(el).val());
			}
		});

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
		const url = $form.attr('action');
		const method = $form.attr('method');

		if ($form.find('.has-error').length) {
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

		if (response.status || response === 'success') {
			setUserData(request.user);
			login.setUserData(request.user);
			// setUserInfo(request.user);
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

	updateImage() {
		// добавить фото
		$btnImage.on(`change.${this.ns}`, (e) => {
			let fr = new FileReader();

			let oneFile = e.currentTarget.files.item(0);

			if (!oneFile) {
				return;
			}

			$profileImage.removeClass('is-active');

			if (e.currentTarget.files.size > Number($(e.currentTarget).data('size'))) {
				e.currentTarget.files = null;
				// eslint-disable-next-line no-alert
				alert('The file is too large.');
			} else {
				fr.onload = (event) => {
					$profileImage.attr({
						src: event.target.result,
					}).fadeIn();
					$profileImageText.hide();
					this.userImage = event.target.result;
				};

				fr.readAsDataURL(oneFile);

				this.$formBtn.removeClass('is-hidden');
			}

			// eslint-disable-next-line consistent-return
			return true;
		});
	}
}

function init() {
	$profileForm = $('.js-form-profile');
	$btnImage = $('.js-add-photo');
	$profileImage = $('.profile__media img');
	$profileImageText = $('.profile__media-text');
	$profileOrderTableTop = $('.profile-order-table__top');
	$profileOrderTableBody = $('.js-profile-order-table-body');

	$profileForm.each((i, el) => {
		// eslint-disable-next-line no-unused-vars
		const profile = new UpdateProfile($(el), `form-${i}`);

		profileArr.push(profile);
		formValidation($(el));
	});

	setUserData();
}

function destroy() {
	$btnImage.off('.profile');

	for (let i = 0; i < profileArr.length; i++) {
		const element = profileArr[i];

		element.destroy();
	}

	profileArr = [];
	$profileForm = '';
	$btnImage = '';
	$profileImage = '';
	$profileImageText = '';
	$profileOrderTableTop = '';
	$profileOrderTableBody = '';
}

export default {
	init,
	destroy,
};
