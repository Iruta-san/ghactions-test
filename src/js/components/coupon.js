import helpers from '../helpers';

let $paymentMethod = '';
let $couponContent = '';

function openCoupon() {
	if (helpers.isMobile()) {
		$couponContent.slideDown(400, () => {
			$couponContent.removeClass('hidden');
		});
	} else {
		$couponContent.fadeIn(200, () => {
			$couponContent.removeClass('hidden');
		});
	}

	if ($couponContent.find('input').length) {
		$couponContent.find('input').trigger('update');
	}
}

function closeCoupon() {
	if (helpers.isMobile()) {
		$couponContent.slideUp(400, () => {
			$couponContent.addClass('hidden');
		});
	} else {
		$couponContent.fadeOut(200, () => {
			$couponContent.addClass('hidden');
		});
	}
}

function init() {
	$paymentMethod = $('.payment-method');
	$couponContent = $('.payment-method__coupon-content');

	if ($paymentMethod.length) {
		$couponContent.addClass('hidden');

		helpers.$document
			.on('click.coupon', (e) => {
				if (!$couponContent.hasClass('hidden') &&
					!$couponContent.is(e.target) &&
					$couponContent.has(e.target).length === 0) {
					closeCoupon();
				}
			})
			.on('click.coupon', '.payment-method__total-coupon .btn', () => {
				if ($couponContent.hasClass('hidden')) {
					openCoupon();
				} else {
					closeCoupon();
				}
			});
	}
}

function destroy() {
	helpers.$document.off('.coupon');
	$paymentMethod = '';
	$couponContent = '';
}

export default {
	init,
	destroy,
	openCoupon,
	closeCoupon,
};
