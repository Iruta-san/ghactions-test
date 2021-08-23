/* eslint-disable no-console */
import helpers from '../helpers';
import {formValidation} from './form';
import {getTranslate} from '../translate';
import states from '../states';
import coupon from './coupon';
import modal from './modal';
import analytics from './analytics';

let payPalError = '';
let analytic = {
	email: helpers.secure.get('_secure_meta_user').email,
};
let orderCreated = false;
let userOrder = helpers.secureEasy.get('user_order') || {};
let orderId = helpers.secureEasy.get('user_order_id') || '';

function setAmount(id) {
	const $inputCoinsIn = $('#amountCoins');
	const $inputAmountIn = $('#amountAmount');
	const $inputCoinsRange = $('#amountCoinsRange');
	const $inputAmountRange = $('#amountAmountRange');
	const maxVal = helpers.coinsInfo[id].coins || 9999999;
	const price = helpers.coinsInfo[id].pricePerCurrencyMap[helpers.currencyName];
	const step = $inputCoinsRange.attr('step');
	const min = $inputCoinsIn.attr('min');
	const value = $inputCoinsIn.val();

	// установим максимальное значение символов
	$inputCoinsIn.add($inputCoinsRange).attr('maxlength', maxVal.length);

	$inputCoinsRange.attr('data-price', price).data('price', price);
	$inputCoinsRange.attr('max', maxVal);
	$inputCoinsRange.attr('min', min);
	$inputCoinsRange.attr('step', step);
	// $inputAmountRange.attr('value', min);

	$inputAmountRange.attr('data-price', price).data('price', price);
	$inputAmountRange.attr('max', maxVal * price);
	$inputAmountRange.attr('min', min * price);
	$inputAmountRange.attr('step', step * price);
	$inputAmountRange.attr('value', (value * price).toFixed(2));

	$inputCoinsIn
		.attr('value', value)
		.attr('min', min)
		.attr('max', maxVal);

	$inputAmountIn
		.attr('value', (value * price).toFixed(2))
		.attr('min', min * price)
		.attr('max', maxVal * price);
}

function translateMethod(method) {
	const values = {
		en: {
			easy: 'Comfort trade',
			manual: 'Manual',
		},
		ru: {
			easy: 'Комфортный',
			manual: 'Трансферный рынок',
		},
		de: {
			easy: 'Komforthandel',
			manual: 'Manual',
		},
		fr: {
			easy: 'Transaction confort',
			manual: 'Manuel',
		},
		it: {
			easy: 'Scambio comfort',
			manual: 'MANUALE',
		},
		ar: {
			easy: 'التداول المريح',
			manual: 'الطريقة اليدوية',
		},
		nl: {
			easy: 'Comfort ruil',
			manual: 'HANDMATIG',
		},
		es: {
			easy: 'Tradeo cómodo',
			manual: 'MANUAL',
		},
		pt: {
			easy: 'Negociação Comfort',
			manual: 'MANUAL',
		},
		ch: {
			easy: '舒适交易',
			manual: '手动',
		},
		tr: {
			easy: 'Rahat işlem',
			manual: 'MANUEL',
		},
		pl: {
			easy: 'Comfort trade',
			manual: 'RĘCZNY',
		},
		sw: {
			easy: 'Smidig leverans',
			manual: 'MANUELL',
		},
		no: {
			easy: 'Comfort trade',
			manual: 'MANUELL',
		},
	};

	return values[helpers.locale][method.toLowerCase()];
}

function payPal() {
	$('#paypal-button').html('');
	// eslint-disable-next-line no-undef
	if (paypal) {
		console.log('paypal button');
		// eslint-disable-next-line
		paypal.Buttons({
			// env: 'production',
			env: 'sandbox',
			locale: getTranslate[helpers.locale].paymentsLanguage,
			style: {
				size: 'responsive',
				color: 'gold',
				shape: 'rect',
				tagline: false,
				fundingicons: 'true',
			},
			funding: {
				// eslint-disable-next-line no-undef
				allowed: [paypal.FUNDING.CARD],
				// eslint-disable-next-line no-undef
				disallowed: [paypal.FUNDING.CREDIT],
			},
			onClick(data, actions) {
				// console.log(data, actions, window.paypal, window.paypal.Buttons);
				// eslint-disable-next-line no-use-before-define
				prePay('/paypal').done(() => {
					console.log('pp OK');
					return actions.resolve();
				}).fail((er) => {
					payPalError = er.responseText.errors;
					console.log('pp ERROR');
					//openError('ERROR');
					return actions.reject();
				});
			},
			createOrder(data, actions) {
				if (payPalError && payPalError.length > 0) {
					throw new Error(payPalError);
				}

				analytic.platform = userOrder.platform;
				analytic.amount = userOrder.amount.coins;
				analytic.method = userOrder.method;
				analytic.paymentAmount = userOrder.amount.amount;
				// console.log(analytic);
				analytics.step4(analytic);
				analytics.selectPay();
				analytics.selectPayPal();

				return actions.order.create({
					purchase_units: [{
						amount: {
							currency_code: `${helpers.currencyName}`,
							value: userOrder.amount.amount,
						},
						description: getTranslate[helpers.locale].buyingCoins,
						custom_id: orderId,
						reference_id: orderId,
						invoice_number: orderId,
					}],
				});
			},
			onApprove(data, actions) {
				if (payPalError && payPalError.length > 0) {
					throw new Error(payPalError);
				}

				// This function captures the funds from the transaction.
				// eslint-disable-next-line newline-before-return
				return actions.order.capture().then((details) => {
					// console.log(details);
					const $page = $('[data-id="delivery"]');
					const $deliveryForm = $page.find('.js-delivery-form');
					// скрываем старую вкладку
					// eslint-disable-next-line no-use-before-define
					$('[data-id="payment-method"]').removeClass('is-active').find('.site__content').slideUp(() => {
						$page.find('.site__tab-name span').text(orderId);
						$deliveryForm.attr('action', `${$deliveryForm.attr('action')}/${orderId}/place`);

						// прокидываем данные для вкладки
						$('[data-id="payment-method"]')
							.attr('data-price', userOrder.amount.amount)
							.data('price', userOrder.amount.amount)
							.find('.site__tab-value')
							.html(`${helpers.currency}${helpers.numberWithCommas(Number(userOrder.amount.amount).toFixed(2))}`);

						// отправляем аналитику
						analytic.platform = userOrder.platform;
						analytic.amount = userOrder.amount.coins;
						analytic.method = userOrder.method;
						analytic.paymentAmount = userOrder.amount.amount;
						analytic.id = orderId;
						analytic.price = helpers.coinsInfo[userOrder.platform].pricePerCurrencyMap[helpers.currencyName];
						analytics.step5(analytic);
						analytics.final(analytic);
						$('.is-prev').removeClass('is-prev');
						// eslint-disable-next-line no-use-before-define
						openPage($page, 'delivery');
					});
				});
			},
			onCancel(data) {
				//console.log(data);
				// Show a cancel page, or return to cart
				// eslint-disable-next-line no-use-before-define
				// openError(data);
			},
			onError(data) {
				//console.log(data);
				// Show a cancel page, or return to cart
				// eslint-disable-next-line no-use-before-define
				openError(data);
			},
		}).render('#paypal-button');
		// This function displays Smart Payment Buttons on your web page.
	}
}

function openPage($page, id) {
	$page.addClass('is-active');
    if (window.location.pathname.includes('order')) {
		if (window.location.hash) helpers.scrollTo($page, 600, helpers.isMobile() ? -100 : -200);

		// if (!window.location.hash || window.location.hash !== id) {
			// history.replaceState(null, null, `#${id}`);
			// window.dispatchEvent(new HashChangeEvent('hashchange'));
		// }


        $page.find('.site__content').slideDown(() => {
            if ($page.find('input').length) {
                $page.find('input').trigger('update');

                setTimeout(() => {
                    $('#amountCoins').get(0).focus();
                }, 600);
            }
        });
    }
}

function openPageOnce($page, id) {
	// console.log($page);
	if ($page.data('id') === 'amount') {
		setAmount(userOrder.platform || document.querySelector('[data-platform]')?.dataset.platform || 'ps4');
	}
	if ($page.data('id') === 'payment-method') {
		$page
			.find('.payment-method__total-value')
			.attr('data-price', userOrder.amount.amount)
			.data('price', userOrder.amount.amount)
			.html(`${helpers.currency}${helpers.numberWithCommas(userOrder.amount.amount)}`);
		const $payMentCouponForm = $page.find('.js-payment-method-form-coupon');

		$payMentCouponForm.attr('action', `${$payMentCouponForm.attr('action')}/${orderId}`);

		payPal();
	}

	if ($page.data('id') === 'delivery') {
		const $deliveryForm = $page.find('.js-delivery-form');

		$page.find('.site__tab-name span').text(orderId);

		$deliveryForm.attr('action', `${$deliveryForm.attr('action')}/${orderId}/place`);
		analytic.platform = userOrder.platform;
		analytic.amount = userOrder.amount.coins;
		analytic.method = userOrder.method;
		analytic.paymentAmount = userOrder.amount.amount;
		analytic.id = orderId;
		analytic.price = helpers.coinsInfo[userOrder.platform].pricePerCurrencyMap[helpers.currencyName];
		analytics.step5(analytic);
		analytics.final(analytic);
	}

	if (id === 'delivery-progress') {
		const $deliveryForm = $page.find('.js-delivery-form');

		$page.find('.site__tab-name span').text(orderId);

		const tab = 'formStep3';
		const $btns = $deliveryForm.closest('.js-tabs').find('.js-tabs-btn');
		const $content = $deliveryForm.closest('.js-tabs').find('.js-tabs-content');
		const $curContent = $content.filter(`[data-id="${tab}"]`);
		const $curBtn = $btns.filter(`[data-id="${tab}"]`);

		// console.log(userOrder);
		$btns.addClass('is-disabled is-active');
		$curBtn.addClass('is-active');
		$content.removeClass('is-active').addClass('is-hidden');
		$curContent.removeClass('is-hidden').addClass('is-active');
		analytic.platform = userOrder.platform;
		analytic.amount = userOrder.amount.coins;
		analytic.method = userOrder.method;
		analytic.paymentAmount = userOrder.amount.amount;
		analytic.id = orderId;
		// console.log(analytic);
		analytics.step7(analytic);
	}

	openPage($page, id);

	const $prevPages = $page.prevAll();

	$prevPages.each((i, page) => {
		const $prev = $(page);
		const value = userOrder[$prev.data('id')];

		if ($prev.length) {
			if ($page.data('id') !== 'delivery') {
				$prev.addClass('is-prev');
			} else {
				$prev.addClass('is-delivery');
			}

			if ($prev.data('id') === 'platform') {
				let needPlatform = helpers.secure.get('needPlatform');
				let platformName = userOrder.platformName && needPlatform ? `<span>${userOrder.platformName}</span>` : '';
				$prev.attr('data-platform', value);
				$prev.find('.site__tab-value').html(`${platformName}<svg><use xlink:href="/images/sprites.svg#platform-${value}"></use></svg>`);
				helpers.secure.remove('needPlatform');
			}

			if ($prev.data('id') === 'amount') {
				const price = Number(value.amount).toFixed(2);
				// const price = (value.coins *
				// helpers.coinsInfo[userOrder.platform].pricePerCurrencyMap[helpers.currencyName]).toFixed(2);

				setAmount(userOrder.platform || document.querySelector('[data-platform]').dataset.platform);
				$prev.attr('data-coins', value.coins);
				$prev.attr('data-amount', price);
				$prev.find('.site__tab-value').html(`${helpers.numberWithCommasForArabic(value.coins)} ${getTranslate[helpers.locale].coinsFor} <nobr>${helpers.currency}${helpers.numberWithCommasForArabic(price)}</nobr>`);
			}

			if ($prev.data('id') === 'method') {
				$prev.find('.site__tab-value').html(translateMethod(value));
				$prev.attr('data-method', value);
			}

			if ($prev.data('id') === 'payment-method') {
				const price = Number(userOrder.amount.amount).toFixed(2);
				// const price = (userOrder.amount.coins *
				// helpers.coinsInfo[userOrder.platform].pricePerCurrencyMap[helpers.currencyName]).toFixed(2);

				$prev
					.attr('data-price', userOrder.amount.amount)
					.data('price', userOrder.amount.amount)
					.find('.site__tab-value')
					.html(`${helpers.currency}${helpers.numberWithCommas(price)}`);
			}
		}
	});

	setTimeout(() => {
		$page.filter('.is-prev').removeClass('is-prev');
	}, 500);
}

function openNextPage($page, id) {
	$page.find('.site__content').slideUp(() => {
		$page.removeClass('is-active').addClass('is-prev');

		if (!id) {
			id = $page.next().data('id');
		}

		openPage($page.next(), id);
	});
}

function prePay(paypal = '') {
	console.log('prePay: ' + paypal);
	let settings = {
		// eslint-disable-next-line no-undef
		url: `${urlForOrder}/${orderId}/prepay${paypal}`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Token ${helpers.secure.get('_secure_meta_token')}`,
		},
	};

	return $.ajax(settings);
}

function openError(text) {
	payPalError = text;
	const template = states.errorTemplate(text);

	helpers.$body.append(template.html);

	$(`[data-id="error-${template.num}"]`).last().removeClass('is-hidden');

	setTimeout(() => {
		$(`[data-id="error-${template.num}"]`).fadeOut();
	}, 5000);
}

function changePlatform() {

	const platformId = $('.main__radios-block input:checked').data('id');
	const platformName = $('.main__radios-block input:checked').data('name');

	const inputCoinsVal = Number($('#amountCoins').val().split(' ').join(''));
	const amount = inputCoinsVal *
		helpers.coinsInfo[platformId].pricePerCurrencyMap[helpers.currencyName];
	// setAmount(platformId);


    userOrder['amount'] = {
        coins: inputCoinsVal,
        amount: Number(amount).toFixed(2),
    };
    userOrder.platform = platformId;
    userOrder.platformName = platformName;
    userOrder.method = 'Easy';
    // save current value on cookies
    helpers.secureEasy.set('user_order', userOrder);
}

function changeOrder(dirty = false) {

	const platformId = location.pathname.includes('xbox') ? 'xbox' : 'ps4';

    const inputCoinsVal = Number($('#amountCoins').val().split(' ').join(''));
    const amount = inputCoinsVal *
        helpers.coinsInfo[platformId].pricePerCurrencyMap[helpers.currencyName];


    userOrder['amount'] = {
        coins: inputCoinsVal,
        amount: Number(amount).toFixed(2),
    };
    userOrder.method = 'Easy';
	userOrder.dirty = dirty;
    // save current value on cookies
    helpers.secureEasy.set('user_order', userOrder);
}

function loadData(id = 'platform') {
	let throwPaymentError = false;
	const order = helpers.secureEasy.get('user_order');

	if (id === 'payment-method') {
		setTimeout(() => {
			$('[data-id="platform"]').removeClass('is-prev');
			$('[data-id="amount"]').removeClass('is-prev');
			$('[data-id="method"]').removeClass('is-prev');
		}, 10);
	}

	if (id === 'payment-method' && !orderId) {
		id = 'method';
	}

	if (id === 'payment-fail') {
		id = 'payment-method';
		throwPaymentError = true;
	}

	if (id !== 'delivery' && id !== 'delivery-progress' && (!$(`[data-id="${id}"]`).length || !helpers.secureEasy.get('user_order'))) {
		id = 'platform';
	}

	if (id === 'delivery-progress') {
		openPageOnce($('[data-id="delivery"]'), id);
	}
	if ($('[data-platform]').length && !order.dirty) {
		id = 'amount';
		openPageOnce($(`[data-id="${id}"]`), id);
	} else if (order.dirty) {
		id = 'method';
		openPageOnce($(`[data-id="${id}"]`), id);
	} else {
		openPageOnce($(`[data-id="${id}"]`), id);
	}

	if (throwPaymentError) {
		openError(`${getTranslate[helpers.locale].forPaymentError}`);
	}
}

function createOrder($currentPage, method) {
	return new Promise((resolve) => {
		const settings = {
			// eslint-disable-next-line no-undef
			url: urlForOrder,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Token ${helpers.secure.get('_secure_meta_token')}`,
			},
			data: JSON.stringify({
				platform: userOrder.platform || document.querySelector('[data-platform]').dataset.platform,
				deliveryMethod: userOrder.method,
				currency: helpers.currencyName,
				coinCount: Number(userOrder.amount.coins),
			}),
		};

		$('.js-select-method').prop('disabled', true).addClass('is-disabled');

		$.ajax(settings).done((response) => {
			// console.log(response.order);
			userOrder.platform = response.order.platform;
			userOrder.amount.coins = response.order.coinCount;
			userOrder.method = response.order.deliveryMethod;
			userOrder.amount.amount = response.order.overallPrice;

			$('.js-select-method').prop('disabled', false).removeClass('is-disabled');
			helpers.secureEasy.set('user_order_id', response.order.id);
			orderId = helpers.secureEasy.get('user_order_id');

			if ($currentPage && $currentPage.length && method) {
				$currentPage.attr('data-method', method).attr('data-order', orderId);
				$currentPage.find('.site__tab-value').html(translateMethod(method));
				// set price on payment block
				$currentPage.next()
					.find('.payment-method__total-value')
					.attr('data-price', userOrder.amount.amount)
					.data('price', userOrder.amount.amount)
					.html(`${helpers.currency}${helpers.numberWithCommas(userOrder.amount.amount)}`);

				const $payMentCouponForm = $currentPage.next().find('.js-payment-method-form-coupon');

				$payMentCouponForm.attr('action', `${$payMentCouponForm.attr('action')}/${orderId}`);

				payPal();
				openNextPage($currentPage);
			}

			resolve();
		}).fail((error) => {
			$('.js-select-method').prop('disabled', false).removeClass('is-disabled');
			// console.log(error);
			openError(`${getTranslate[helpers.locale].orderCreationError}`);
			resolve();
		});
	});
}

function updateOrder($currentPage, method) {
	return new Promise((resolve) => {
		const settings = {
			// eslint-disable-next-line no-undef
			url: `${urlForOrder}/${orderId}`,
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Token ${helpers.secure.get('_secure_meta_token')}`,
			},
			data: JSON.stringify({
				platform: userOrder.platform,
				deliveryMethod: userOrder.method,
				currency: helpers.currencyName,
				coinCount: Number(userOrder.amount.coins),
			}),
		};

		// console.log(settings.url, orderId);
		$('.js-select-method').prop('disabled', true).addClass('is-disabled');

		$.ajax(settings).done((response) => {
			$('.js-select-method').prop('disabled', false).removeClass('is-disabled');
			// console.log(response);
			userOrder.platform = response.platform;
			userOrder.amount.coins = response.coinCount;
			userOrder.method = response.deliveryMethod;
			userOrder.amount.amount = response.overallPrice;

			if ($currentPage && $currentPage.length && method) {
				$currentPage.attr('data-method', method).attr('data-order', orderId);
				$currentPage.find('.site__tab-value').html(translateMethod(method));
				// set price on payment block
				$currentPage.next()
					.find('.payment-method__total-value')
					.attr('data-price', userOrder.amount.amount)
					.data('price', userOrder.amount.amount)
					.html(`${helpers.currency}${helpers.numberWithCommas(userOrder.amount.amount)}`);

				payPal();
				openNextPage($currentPage);
			}

			resolve();
		}).fail((error) => {
			$('.js-select-method').prop('disabled', false).removeClass('is-disabled');
			$('.payment-method__method-wrapper').addClass('is-disabled');
			console.log(error);
			openError(`${getTranslate[helpers.locale].orderUpdateError}`);

			resolve();
		});
	});
}

function loadCoupon($btn) {
	const $value = $('#costValue');
	const $valueOld = $('#costValueOld');
	const $form = $btn.closest('form');
	const url = `${window.url}${$form.attr('action')}`;
	const method = $form.attr('method');
	const promoCode = $form.find('input').val();
	const price = Number($value.data('price'));
	const $coupon = $('.payment-method__total-coupon');
	analytics.step4(userOrder);

	const settings = {
		url,
		method,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Token ${helpers.secure.get('_secure_meta_token')}`,
		},
		data: JSON.stringify({
			platform: userOrder.platform,
			deliveryMethod: userOrder.method,
			coinCount: Number(userOrder.amount.coins),
			currency: helpers.currencyName,
			promoCode,
		}),
	};

	if (!$form.valid() && $form.find('.has-error').length) {
		if ($form.find('input').length) {
			$form.find('input').trigger('update');
		}

		return;
	}

	$('[type="submit"]').prop('disabled', true).addClass('is-disabled');

	$.ajax(settings).done((response) => {
		$('[type="submit"]').prop('disabled', false).removeClass('is-disabled');
		// console.log(response);
		$form.find('.js-form-error').addClass('is-hidden');
		let couponFailed = false;
		let text = `${getTranslate[helpers.locale].invalidPromo}`;

		for (let i = 0; i < response.labels.length; i++) {
			const element = response.labels[i];

			if (element.toLowerCase() === 'promo_not_found') {
				couponFailed = true;
			} else if (element.toLowerCase() === 'promo_out_of_date') {
				couponFailed = true;
				text = `${getTranslate[helpers.locale].couponExpired}`;
			}
		}

		const data = {
			promoCode,
			price,
			newValue: response.overallPrice,
			discount: 100 - (response.overallPrice / price).toFixed(2) * 100,
		};

		if (!couponFailed) {
			$value.html(`${helpers.currency}${helpers.numberWithCommas(response.overallPrice)}`);
			$valueOld.html(`${helpers.currency}${helpers.numberWithCommas(price)}`);
			$valueOld.slideDown(200);
			$coupon.html(states.promoCodeTemplate(data));
			coupon.closeCoupon();
			userOrder.amount.amount = response.overallPrice;
			analytic.paymentAmount = userOrder.amount.amount;

			// console.log(userOrder, userOrder.amount.amount);
			analytic.coupon = promoCode;
			analytic.paymentAmount = userOrder.amount.amount;
			analytic.price = helpers.coinsInfo[userOrder.platform].pricePerCurrencyMap[helpers.currencyName];
			// console.log(analytic);
			analytics.step4(analytic, userOrder);
		} else {
			$form.find('.js-form-error').text(text).removeClass('is-hidden');
		}
	}).fail((error) => {
		$('[type="submit"]').prop('disabled', false).removeClass('is-disabled');
		// console.log(error);
		$form.find('.js-form-error').text(`${getTranslate[helpers.locale].invalidPromo}`).removeClass('is-hidden');
		// coupon.closeCoupon();
	});
}

function executeOrder($btn) {
	helpers.$window.off('beforeunload.pages');

	const $form = $btn.closest('form');
	const url = `${window.url}${$form.attr('action')}`;
	const method = $form.attr('method');
	const values = {
		mail: $form.find('[name="email"]').val(),
		password: $form.find('[name="password"]').val(),
	};
	const $formError = $form.find('.js-form-error-message');

	$formError.addClass('is-hidden').html('');

	if ($form.find('.js-delivery-codes .input__input').val().length !== 0 || $form.find('.js-delivery-codes .input__input').val().length > 8) {
		$form.find('.js-delivery-codes .input__input').attr('required', true);
		$form.find('.js-delivery-codes').removeClass('has-success').addClass('has-error');
		// console.log($form.find('.js-delivery-codes'));
		$form.find('.js-delivery-codes .input__label').append(`<label id="${$form.find('.js-delivery-codes .input__label').attr('for')}-error" class="error" for="${$form.find('.js-delivery-codes .input__label').attr('for')}">${getTranslate[helpers.locale].profileCodesErrors}</label>`);

		if ($form.find('input').length) {
			$form.find('input').trigger('update');
		}

		return;
	}

	if (!$form.find('.input__code').length) {
		$form.find('.js-delivery-codes .input__input').attr('required', true);
		$form.find('.js-delivery-codes').removeClass('has-success').addClass('has-error');
		$form.find('.js-delivery-codes .input__label').append(`<label id="${$form.find('.js-delivery-codes .input__label').attr('for')}-error" class="error" for="${$form.find('.js-delivery-codes .input__label').attr('for')}">${getTranslate[helpers.locale].profileCodesErrors}</label>`);

		if ($form.find('input').length) {
			$form.find('input').trigger('update');
		}

		return;
	}

	if (!$form.valid() && $form.find('.has-error').length) {
		if ($form.find('input').length) {
			$form.find('input').trigger('update');
		}

		return;
	}

	$form.find('.js-delivery-codes').removeClass('has-error').addClass('has-success');
	$form.find('.js-delivery-codes .input__label .error').remove();

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

	$('.js-delivery-btn').prop('disabled', true).addClass('is-disabled');

	$.ajax(settings).done((response) => {
		$('.js-delivery-btn').prop('disabled', false).removeClass('is-disabled');
		const id = 'formStep3';
		const $btns = $form.closest('.js-tabs').find('.js-tabs-btn');
		const $content = $form.closest('.js-tabs').find('.js-tabs-content');
		const $curContent = $content.filter(`[data-id="${id}"]`);
		const $curBtn = $btns.filter(`[data-id="${id}"]`);

		$btns.addClass('is-disabled');
		$curBtn.addClass('is-active');
		$content.removeClass('is-active').addClass('is-hidden');
		$curContent.removeClass('is-hidden').addClass('is-active');

		history.replaceState(null, null, '#delivery-progress');
		window.dispatchEvent(new HashChangeEvent('hashchange'));

		// console.log(response.id);
		// $('.header-order__notify').append(states.orderNotifyProgress(response));

		// setTimeout(() => {
		// 	$('.header-order__notify').find(`[data-id="${response.id}"]`).fadeOut();
		// }, 5000);

		analytic.platform = userOrder.platform;
		analytic.amount = userOrder.amount.coins;
		analytic.method = userOrder.method;
		analytic.paymentAmount = userOrder.amount.amount;
		analytic.id = orderId;
		// console.log(analytic);
		analytics.step7(analytic);
		helpers.secureEasy.remove('user_order');
		helpers.secureEasy.remove('user_order_id');
		orderId = '';
		orderCreated = false;
		userOrder = {};
	}).fail((error) => {
		$('.js-delivery-btn').prop('disabled', false).removeClass('is-disabled');
		// console.log(error);

		if (!error.responseJSON) {
			openError(error.statusText);

			return;
		}

		const errors = Object.entries(error.responseJSON.errors);
		let message = '';

		for (let i = 0; i < errors.length; i++) {
			const element = errors[i];
			const coma = ', ';

			message += `${element[0]} ${element[1]}${i === errors.length - 1 ? '' : coma}`;
		}

		openError(message);
	});
}

function init(id = 'platform', localeChange) {
	console.log('ID ----- ' + id);
	const $page = $('.site__page');
	const payRedirect = (acquiringLink) => {
		// console.log(userOrder);
		helpers.secureEasy.set('user_order', userOrder);

		analytic.platform = userOrder.platform;
		analytic.amount = userOrder.amount.coins;
		analytic.method = userOrder.method;
		analytic.paymentAmount = userOrder.amount.amount;
		// console.log(analytic);
		analytics.step4(analytic);
		analytics.selectPay();
		analytics.selectPayCard();

		setTimeout(() => {
			location.href = acquiringLink;
		}, 30);
	};

	if (id !== 'payment-fail' && id !== 'payment-method' && id !== 'delivery' && id !== 'delivery-progress' && userOrder.method && orderId && !localeChange) {
		helpers.secureEasy.remove('user_order_id');
		orderId = '';
	}

	// console.log([orderId, userOrder, id, localeChange]);
	if ((id === 'payment-fail' || id === 'payment-method') && userOrder.method && orderId) {
		// Eсли неудачная оплата, то создаёт заказ по новой
		if (id === 'payment-fail') {
			console.log('path 1.1', id);
			createOrder().then(() => {
				loadData(id);
			});
			// или обновляем данные
		} else {
			console.log('path 1.2', id);
			updateOrder().then(() => {
				loadData(id);
			});
		}
		// Если изменили локаль и уже были на этапе выбора способо оплаты
	} else if (localeChange && orderId && id !== 'delivery' && id !== 'delivery-progress') {
		console.log('path 2.1', id);
		updateOrder().then(() => {
			loadData(id);
		});
		// Если изменили локаль и ещё не были на этапе выбора способо оплаты
	} else if (localeChange && !orderId) {
		console.log('path 2.2', id);
		id = id !== 'platform' ? 'amount' : 'platform';

		loadData(id);
		// просто грузим данные
	} else if (id === 'payment-method' && orderId === '' && id !== 'payment-fail') {
		createOrder().then(() => {
			loadData(id);
		});
	} else {
		console.log('path 3', id);
		loadData(id);
	}

	const $value = $('#costValue');
	const $valueOld = $('#costValueOld');
	const $coupon = $('.payment-method__total-coupon');
	const $couponContent = $('.payment-method__coupon-content');

	$page.each((i, el) => {
		formValidation($(el).find('form'));
	});

	$couponContent.addClass('hidden');
	helpers.$body.off('click.pages', '#couponApply');
	helpers.$body.off('click.pages', '.js-delivery-btn');
	helpers.$body.off('click.pages', '.js-pay');
	helpers.$body.off('click.pages', '#closeCoupon');
	helpers.$body.off('click.pages', '.js-select-page');
	helpers.$body.off('click.pages', '.js-select-platform');
	helpers.$body.off('submit.pages', '.js-payment-method-form-coupon', '.js-delivery-form');
	helpers.$body.off('click.pages', '.js-delivering-btn');
	helpers.$body
		.on('click.pages', '#couponApply', (e) => {
			e.preventDefault();

			loadCoupon($(e.currentTarget));
		})
		.on('click.pages', '.js-delivery-btn', (e) => {
			e.preventDefault();

			executeOrder($(e.currentTarget));
		})
		.on('submit.pages', '.js-payment-method-form-coupon', '.js-delivery-form', (e) => {
			e.preventDefault();
		})
		.on('click.pages', '#closeCoupon', () => {
			$value.html(`${helpers.currency}${helpers.numberWithCommas(Number($value.data('price')))}`);
			$valueOld.slideUp(200);
			$coupon.html(states.promoCodeBtn);
			userOrder.amount.amount = Number($value.data('price'));
			analytic.paymentAmount = userOrder.amount.amount;
			coupon.closeCoupon();
		})
		.on('click.pages', '.js-select-page', (e) => {
			$('.js-select-page').prop('disabled', true).addClass('is-disabled');
			const $this = $(e.currentTarget);
			const currentId = $(e.currentTarget).data('id');

			if ($this.hasClass('is-prev')) {
				const $activePage = $page.filter('.is-active');
				if ($activePage.data('id') === 'payment-method') {
					$value.html(`${helpers.currency}${helpers.numberWithCommas(Number($value.data('price')))}`);
					$valueOld.slideUp(200);
					$coupon.html(states.promoCodeBtn);
					userOrder.amount.amount = Number($value.data('price'));
					analytic.paymentAmount = userOrder.amount.amount;
					coupon.closeCoupon();
				}

				$activePage.find('.site__content').slideUp(() => {
					$activePage.removeClass('is-active');

					$this
						.removeClass('is-prev')
						.removeAttr('data-coins data-amount data-platform data-method data-price data-order');

					$this.nextAll()
						.removeClass('is-prev')
						.removeAttr('data-coins data-amount data-platform data-method data-price data-order')
						.find('.site__tab-value').html('');

					$this.find('.site__tab-value').html('');

					openPage($this, currentId);
					$('.js-select-page').prop('disabled', false).removeClass('is-disabled');
				});
			} else {
				$('.js-select-page').prop('disabled', false).removeClass('is-disabled');
			}
		})
		.on('click.pages', '.js-select-platform', (e) => {
			$('.js-select-platform').prop('disabled', true).addClass('is-disabled');

			const platformId = $(e.currentTarget).data('id');
			const platformName = $(e.currentTarget).data('name');
			const name = $(e.currentTarget).find('.platform__card-name').text();
			const $currentPage = $(e.currentTarget).closest('.site__page');
			const currentId = $currentPage.data('id');

			$currentPage.attr('data-platform', platformId);

			$currentPage.find('.site__tab-value').html(`<span>${platformName}</span><svg><use xlink:href="/images/sprites.svg#platform-${platformId}"></use></svg>`);

			setAmount(platformId);

			setTimeout(() => {
				openNextPage($currentPage);
			}, 100);

			analytic.platform = platformId;
			// console.log(analytic);
			analytics.step1(analytic);
			analytics.selectPlatform(name);
			userOrder[currentId] = platformId;
			userOrder.platformName = platformName;
			// save current value on cookies
			// console.log(userOrder);
			helpers.secureEasy.set('user_order', userOrder);
			setTimeout(() => {
				$('.js-select-platform').prop('disabled', false).removeClass('is-disabled');
			}, 300);
		})
		.on('click.pages', '.js-select-amount', (e) => {
			$('.js-select-amount').prop('disabled', true).addClass('is-disabled');
			const $currentPage = $(e.currentTarget).closest('.site__page');
			const currentId = $currentPage.data('id');
			const inputCoinsVal = Number($('#amountCoins').val().split(' ').join(''));
			const amount = inputCoinsVal *
				helpers.coinsInfo[userOrder.platform || document.querySelector('[data-platform]').dataset.platform].pricePerCurrencyMap[helpers.currencyName];

			$currentPage.attr('data-coins', inputCoinsVal);
			$currentPage.attr('data-amount', Number(amount).toFixed(2));
			$currentPage.find('.site__tab-value').html(`${helpers.numberWithCommasForArabic(inputCoinsVal)} ${getTranslate[helpers.locale].coinsFor} <nobr>${helpers.currency}${helpers.numberWithCommasForArabic(Number(amount).toFixed(2))}</nobr>`);

			openNextPage($currentPage);

			analytic.platform = userOrder.platform;
			analytic.amount = helpers.numberWithCommas(inputCoinsVal);
			// console.log(analytic);
			analytics.step2(analytic);
			analytics.selectCoins();
			userOrder[currentId] = {
				coins: inputCoinsVal,
				amount: Number(amount).toFixed(2),
			};
			// save current value on cookies
			// console.log(userOrder);
			helpers.secureEasy.set('user_order', userOrder);
			setTimeout(() => {
				$('.js-select-amount').prop('disabled', false).removeClass('is-disabled');
			}, 300);
		})
		.on('click.pages', '.js-select-method', (e) => {
			if (!helpers.secure.get('_secure_meta_user')) {
				modal.open('sign-in');
				$('.js-tabs-btn[data-id=sign-up]').trigger('click');

				return;
			}
			$('.js-select-method').prop('disabled', true).addClass('is-disabled');

			const $currentPage = $(e.currentTarget).closest('.site__page');
			const currentId = $currentPage.data('id');
			const method = $(e.currentTarget).data('method');

			analytic.email = helpers.secure.get('_secure_meta_user').email;
			analytic.platform = userOrder.platform;
			analytic.amount = userOrder.amount.coins;
			analytic.method = method;
			// console.log(analytic);
			analytics.step3(analytic);
			analytics.selectMethod();
			userOrder[currentId] = method;
			// save current value on cookies
			// console.log(userOrder);
			helpers.secureEasy.set('user_order', userOrder);

			// console.log({orderCreated: orderCreated, orderId: orderId});
			if (!orderCreated && orderId && orderId.length) {
				orderCreated = true;
			}
			// console.log({orderCreated: orderCreated, orderId: orderId});

			if (!orderCreated) {
				// console.log('create order', orderId, orderCreated);
				createOrder($currentPage, method);
				orderCreated = true;
			} else {
				// console.log('update order', orderId, orderCreated);
				updateOrder($currentPage, method);
			}
		})
		.on('click.pages', '.js-pay', () => {
			// const $currentPage = $(e.currentTarget).closest('.site__page');
			if(!$('.js-pay').prop('disabled')) {
				$('.js-pay').prop('disabled', true).addClass('is-disabled');
				prePay()
					.done((response) => {
						const locale = window.location.pathname.slice(3, 4).indexOf('/') >= 0 ? window.location.pathname.substring(1, 3) : 'en';

						helpers.secure.set('pay_locale', locale);

						if (response.acquiringLink) {
							payRedirect(response.acquiringLink);
						} else {
							$('.js-pay').prop('disabled', false).removeClass('is-disabled');
						}
					})
					.fail((error) => {
						// console.log(error);
						//openError(error.statusText);
					});
			}
		})
		.on('click.pages', '.js-delivering-btn', () => {
			analytics.selectPay();
		});
}

function destroy(triggered = true) {
	console.log('DESTROY--------');
	helpers.$body.off('click.pages');
	helpers.$window.off('beforeunload.pages');
	helpers.$body.off('submit.pages');

	if (triggered) {
		helpers.secureEasy.remove('user_order');
		helpers.secureEasy.remove('user_order_id');
		orderId = '';
		orderCreated = false;
		userOrder = {};
		analytic = {
			email: helpers.secure.get('_secure_meta_user').email,
		};
	}
	// console.log(orderCreated, orderId);
}

export default {
	init,
	destroy,
	loadData,
    createOrder,
    setAmount,
    changePlatform,
	changeOrder,
};
