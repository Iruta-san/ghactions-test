function init() {
	let $sidebar = $('.sidebar');
	let $slider = $('.sidebar__slider');
	let $dots = $('.sidebar__dots');

	$sidebar.removeClass('is-fade');

	$slider.slick({
		infinite: true,
		slidesToShow: 1,
		slidesToScroll: 1,
		centerPadding: 0,
		variableWidth: false,
		adaptiveHeight: true,
		arrows: false,
		asNavFor: '.sidebar__dots',
		autoplay: true,
		autoplaySpeed: 5000,
	});

	$dots.slick({
		infinite: true,
		slidesToShow: 5,
		slidesToScroll: 1,
		asNavFor: '.sidebar__slider',
		arrows: false,
		centerMode: true,
		variableWidth: true,
		focusOnSelect: true,
		swipe: false,
	});

	$('.sidebar__dots button').text('');
}

function destroy() {
	let $sidebar = $('.sidebar');
	let $slider = $('.sidebar__slider');
	let $dots = $('.sidebar__dots');

	if ($slider.hasClass('slick-initialized')) {
		$sidebar.addClass('is-fade');
		$slider.slick('unslick');
		$dots.slick('unslick');
	}
}

export default {
	init,
	destroy,
};
