/* global barba */
import helpers, {lastPageYOffset} from '../helpers';
import analytics from './analytics';

let winWidth = helpers.$window.innerWidth();
let $burgerBtn = '';
let $burgerMenu = '';
let $linkMenu = '';
let $language = '';
let $languageBtn = '';
let $languageContent = '';
let $signInBtn = '';
let $buyHeader = '';
let $buyHeaderBtn = '';
let $buy = '';
let $buyConsole = '';

function openMenu() {
	helpers.saveScrollPosition();
	helpers.$html.css({
		top: `-${lastPageYOffset}px`,
	}).addClass('is-lock-scroll');

	helpers.$body.css({
		paddingRight: `${helpers.getScrollbarWidth()}px`,
	});
	helpers.$header.css({
		transition: '0s',
		right: `${helpers.getScrollbarWidth()}px`,
	});
	$burgerBtn.addClass('is-active');
	$burgerMenu.addClass('is-active');
	helpers.$header.addClass('is-active');
}

function closeMenu() {
	if ($burgerBtn.hasClass('is-active')) {
		helpers.$html.css({
			top: '',
		}).removeClass('is-lock-scroll');
		helpers.$body.css({
			paddingRight: '',
		});
		helpers.$header.css({
			right: '',
		});
		helpers.restoreScrollPosition();
		$burgerBtn.removeClass('is-active');
		$burgerMenu.removeClass('is-active');
		helpers.$header.removeClass('is-active');
		closeMenuConsole($buy)
		setTimeout(() => {
			helpers.$header.css({
				transition: '',
			});
		}, 400);
	}
}

function menuToggle(e) {
	if ($(e.currentTarget).hasClass('is-active')) {
		closeMenu();
	} else {
		openMenu();
	}
}

function closeLanguage($btn) {
	$languageContent.fadeOut().removeClass('is-active');
	$btn.removeClass('is-active');
}

function openLanguage($btn) {
	$languageContent.fadeIn().addClass('is-active');
	$btn.addClass('is-active');
}

function languageToggle(e) {
	if (helpers.isMobile()) {
		return;
	}

	if ($languageBtn.hasClass('is-active')) {
		closeLanguage($languageBtn);
	} else if (e.type !== 'mouseleave') {
		openLanguage($languageBtn);
	}
}

function languageToggleClick(e) {
	if ($(e.currentTarget).hasClass('is-active')) {
		closeLanguage($(e.currentTarget));
	} else {
		openLanguage($(e.currentTarget));
	}
}

function showSigninTab() {
	$('.js-tabs-btn[data-id=sign-in]').trigger('click');
}

function closeMenuConsole($btn) {
	$buyConsole.fadeOut().addClass('hide');
	$btn.removeClass('is-active');
}

function openMenuConsole($btn) {
	$buyConsole.fadeIn().removeClass('hide');
	$btn.addClass('is-active');
}

function toggleMenuConsole(e) {
	if (helpers.isMobile()) {
		// if (!$buyConsole.hasClass('hide')) {
		// 	closeMenuConsole($buy);
		// } else {
		// 	openMenuConsole($buy);
		// }
		return;
	} else {
		if (!$buyConsole.hasClass('hide')) {
			closeMenuConsole($buy);
		} else if (e.type !== 'mouseleave') {
			openMenuConsole($buy);
		}
	}
}

function toggleMenuConsoleClick(e) {
	if (!$buyConsole.hasClass('hide')) {
		closeMenuConsole($buy);
	} else {
		openMenuConsole($buy);
	}
}

function init() {
	helpers.$header = $('.header');
	$burgerBtn = $('.js-burger-btn');
	$burgerMenu = $('.js-burger-menu');
	$linkMenu = $('.menu__link, .footer__link');
	$language = $('.header__language');
	$languageBtn = $('.header__language-btn');
	$languageContent = $('.header__dropdown');
	$signInBtn = $('.js-signin-btn');
	$buyHeader = $('.js-buy-header-hover');
	$buyHeaderBtn = $('.js-buy-header-hover .menu__buy-btn');
	$buy = $('.js-buy');
	$buyConsole = $('.js-buy-console-hover');

	$burgerBtn.on('click.burger', menuToggle);
	$language.on('mouseenter.header mouseleave.header', languageToggle);
	$languageBtn.on('click.header', languageToggleClick);
	$signInBtn.on('click', showSigninTab);
	$buyHeader.on('mouseenter.header mouseleave.header', toggleMenuConsole);
	$buyHeaderBtn.on('click.header', toggleMenuConsoleClick);



	$linkMenu.each((i, e) => {
		let location = window.location.pathname;
		let link = $(e).attr('href');

		if (location === link) {
			$(e).addClass('is-active');
		}
	});

	$linkMenu.each((i, e) => {
		let location = window.location.hash;
		let link = $(e).attr('href');
		let substrLinkLength
		if (link != undefined) {
			substrLinkLength = link.slice(link.length - 4, link.length)
		}
		if (location === substrLinkLength) {
			var div = document.getElementById("faq");
			var rect = div.getBoundingClientRect();
			console.log(rect);
			let y = rect.top;
			window.scrollTo( 0, y )
		}
	});

	$burgerMenu.click(function(e) {
		if (e.target.tagName.toLowerCase() != 'button') {
			closeMenu();
		}
		$language.off('.header');
		$linkMenu.removeClass('is-active');
		$('.header__dropdown-link').off('.header');
		$('.js-buy').off('.header');
	});

	$('.header__dropdown-link').each((i, el) => {
		const locale = $(el).data('locale') === 'en' ? '' : `/${$(el).data('locale')}`;
		const path = window.location.pathname.slice(3, 4).indexOf('/') >= 0 ? window.location.pathname.substring(3) : window.location.pathname;

		$(el).attr('href', locale + path);
	})
		.on('click.header', (e) => {
			e.preventDefault();
			e.stopPropagation();

			helpers.locale = $(e.currentTarget).data('locale');
			let hash = window.location.hash;

			barba.go($(e.currentTarget).attr('href') + hash, 'localeChange');
			closeLanguage($languageBtn);
		})
		.on('hover', (e) => {
			barba.prefetch($(e.currentTarget).attr('href'));
		});

	$('.js-buy').on('click.header', () => {
		analytics.buy(helpers.secure.get('_secure_meta_user').email);
	});
}

function destroy() {
	closeMenu();
	$burgerBtn.off('.burger');
	$languageBtn.off('.header');
	$language.off('.header');
	$linkMenu.removeClass('is-active');
	$('.header__dropdown-link').off('.header');
	$('.js-buy').off('.header');
}

function resize() {
	helpers.debounce(() => {
		if (winWidth !== helpers.$window.innerWidth()) {
			closeMenu();

			winWidth = helpers.$window.innerWidth();
		}
	}, 300);
}

$('#amountCoins').click(function() {
	$(this).select();
});
$('#amountCoins').focus(function() {
	$(this).select();
});

$('#amountAmount').click(function() {
	$(this).select();
});
$('#amountAmount').focus(function() {
	$(this).select();
});


helpers.$window.on('resize', resize);

export default {
	init,
	destroy,
	openMenu,
	closeMenu,
};
