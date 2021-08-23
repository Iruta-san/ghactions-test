/* global SecureLS */
let vars = {};
export let lastPageYOffset = null;

vars.currency = '€';
// eslint-disable-next-line no-undef
vars.secure = new window.SecureLS({
	encodingType: 'des',
	isCompression: false,
	encryptionSecret: 'key-fifa-21',
});
// eslint-disable-next-line no-undef
vars.secureEasy = new window.SecureLS();
vars.$document = $(document);
vars.$window = $(window);
vars.$body = $(document.body);
vars.$html = $(document.documentElement);
vars.$siteContainer = $('.site-container');
vars.$loader = $('.loader:not(.loader-content)');
vars.$header = $('.header');
vars.$site = $('.site');
vars.$footer = $('.footer');
vars.$sidebar = vars.$body.find('.sidebar');
vars.isMobile = () => innerWidth <= 1024;
vars.isIE = () => vars.$html.hasClass('is-browser-ie');
vars.winWidth = window.innerWidth;
vars.dirRtl = vars.$html.attr('dir') === 'rtl';
vars.setCookie = (name, value, days) => {
	let expires = '';

	if (days) {
		let date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = `; expires=${date.toUTCString()}`;
	}

	document.cookie = `${name}=${value || ''}${expires}; path=/`;
};

vars.getCookie = (name) => {
	let nameEQ = `${name}=`;
	let ca = document.cookie.split(';');

	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];

		while (c.charAt(0) === ' ') {
			c = c.substring(1, c.length);
		}

		if (c.indexOf(nameEQ) === 0) {
			return c.substring(nameEQ.length, c.length);
		}
	}

	return null;
};
vars.eraseCookie = (name) => {
	document.cookie = `${name}=; Max-Age=-99999999;path=/`;
};

const debounced = [];
const cancelFunc = (timeout) => () => {
	clearTimeout(timeout);
};

vars.debounce = (fn, wait, ...args) => {
	let d = debounced.find(({funcString}) => funcString === fn.toString());

	if (d) {
		d.cancel();
	} else {
		d = {};
		debounced.push(d);
	}

	d.func = fn;
	d.funcString = fn.toString();
	d.timeout = setTimeout(fn, wait, ...args);
	d.cancel = cancelFunc(d.timeout);
};

vars.saveScrollPosition = () => {
	vars.$html.css('scroll-behavior', 'initial');
	lastPageYOffset = window.pageYOffset || document.documentElement.scrollTop;
};

vars.restoreScrollPosition = () => {
	if (lastPageYOffset !== null) {
		window.scrollTo(window.pageXOffset, lastPageYOffset);
		lastPageYOffset = null;
		vars.$html.css('scroll-behavior', '');
	}
};

// smooth scrolling
vars.scrollTo = ($container, time = 500, offset = 0) => {
	vars.$html.css('scroll-behavior', 'initial');
	$('html, body').animate({
		scrollTop: `${$container.offset().top + offset}`,
	}, time);

	setTimeout(() => {
		vars.$html.css('scroll-behavior', '');
	}, time + 100);
};

let scrollDiv;

vars.getScrollbarWidth = () => {
	const width = window.innerWidth - vars.$html.get(0).clientWidth;

	if (width || document.documentElement.clientHeight >= document.documentElement.offsetHeight) {
		return width;
	}

	// Document doesn't have a scrollbar, possibly because there is not enough content so browser doesn't show it
	if (!scrollDiv) {
		scrollDiv = document.createElement('div');
		scrollDiv.style.cssText = 'width:100px;height:100px;overflow:scroll !important;position:absolute;top:-9999px';
		document.body.appendChild(scrollDiv);
	}

	return scrollDiv.offsetWidth - scrollDiv.clientWidth;
};

function hasHoverSupport() {
	let hoverSupport;

	if (vars.isIE && vars.getScrollbarWidth()) {
		// On touch devices scrollbar width is usually 0
		hoverSupport = true;
	} else if (vars.isMobile()) {
		hoverSupport = false;
	} else if (window.matchMedia('(any-hover: hover)').matches || window.matchMedia('(hover: hover)').matches) {
		hoverSupport = true;
	} else if (window.matchMedia('(hover: none)').matches) {
		hoverSupport = false;
	} else {
		hoverSupport = typeof vars.$html.ontouchstart === 'undefined';
	}

	return hoverSupport;
}

if (!hasHoverSupport()) {
	vars.$html.removeClass('has-hover').addClass('no-hover');
} else {
	vars.$html.removeClass('no-hover').addClass('has-hover');
}

function resize() {
	vars.debounce(() => {
		if (vars.winWidth !== window.innerWidth) {
			if (!hasHoverSupport()) {
				vars.$html.removeClass('has-hover').addClass('no-hover');
			} else {
				vars.$html.removeClass('no-hover').addClass('has-hover');
			}

			vars.winWidth = window.innerWidth;
		}
	}, 300);
}

vars.$window.on('resize', resize);

vars.getSpecialChars = (sting) => {
	let name = '';

	for (let j = 0; j < sting.split('-').length; j++) {
		let word = sting.split('-')[j];

		if (j > 0) {
			word = word.replace(word.charAt(0), word.charAt(0).toUpperCase());
		}

		name += word;
	}

	return name;
};

vars.getSpecialAttributes = (el, namespace) => {
	let options = {};

	if (!el.hasAttributes()) {
		return;
	}

	$.each(el.attributes, (index, attr) => {
		if (attr.name.indexOf(`data-${namespace}`) >= 0) {
			const word = attr.name;
			// eslint-disable-next-line no-nested-ternary
			let value = attr.value === 'true' ? true : attr.value === false ? false : attr.value;
			const name = vars.getSpecialChars(word.replace(`data-${namespace}-`, ''));

			options[name] = value;
		}
	});

	// eslint-disable-next-line consistent-return
	return options;
};

vars.numberWithCommas = (x, coma = ' ') => {
	let parts = x.toString().split('.');

	return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, coma) + (parts[1] ? `.${parts[1]}` : '');
};

// eslint-disable-next-line consistent-return
vars.numberWithCommasForArabic = (x, coma) => {
	if (vars.dirRtl || vars.locale==='ar') {
		if (!coma) {
			coma = '&nbsp;';
		}

		let parts = x.toString().split('.');

		return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, coma) + (parts[1] ? `.${parts[1]}` : '');
	}

	return vars.numberWithCommas(x, coma);
};

vars.numberWithCommas4 = (x, coma = ' ') => {
	let parts = x.toString().split('.');

	return parts[0].replace(/\B(?=(\d{4})+(?!\d))/g, coma) + (parts[1] ? `.${parts[1]}` : '');
};

export default vars;
