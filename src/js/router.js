/* global barba, barbaRouter, urlForUser, urlForUserLogin */

import helpers from './helpers';
import Accordion from './components/accordion';
import Input from './components/inputs';
import header from './components/header';
import modal from './components/modal';
import profile from './components/profile';
import tabs from './components/tabs';
import login from './components/login';
import sitePages from './components/sitePages';
import coupon from './components/coupon';
import {def} from './routes/default';
import {getTranslate} from './translate';
import slider from './components/slider';
import analytics from './components/analytics';

let inputArr = [];
let accordionArr = [];
const routes = [
    {
        path: '/profile/:type',
        name: 'profile',
    }, {
        path: '/order',
        name: 'order',
    }, {
        path: '/:page',
        name: 'page',
    }, {
        path: '/',
        name: 'home',
    },
];

barba.use(barbaRouter, {
    routes,
});

barba.hooks.afterLeave((data) => {
    header.destroy();
    modal.destroy();
    tabs.destroy();
    coupon.destroy();
    login.destroy();
    slider.destroy();
    console.log('data.trigger: ' + data.trigger);

    for (let i = 0; i < inputArr.length; i++) {
        const element = inputArr[i];

        element.destroy();
    }

    inputArr = [];

    for (let i = 0; i < accordionArr.length; i++) {
        const element = accordionArr[i];

        element.destroy();
    }

    accordionArr = [];

    if (data.current.namespace === 'order' || data.current.namespace === 'home') {
        if (data.trigger === 'localeChange' || data.current.namespace === 'home') {
            sitePages.destroy(false);
        } else {
            sitePages.destroy();
        }
    }

    if (data.current.namespace === 'profile') {
        profile.destroy();
    }
});

barba.hooks.beforeEnter((data) => {
    if (data.next.namespace === 'home' || data.next.namespace === 'order') {
        helpers.$sidebar.show();
    }

	// удалить выбранные параметры заказа на главной (в т.ч. кол-во монет)
	// чтобы они не устанавливались на других страницах при переходе с главной
	if (data.current.namespace === 'home' && !helpers.getCookie('click_to_buy')) {
		helpers.secureEasy.remove('user_order');
	}

    if (data.next.namespace === 'home') {
        sitePages.init(data.next.url.hash, data.trigger === 'localeChange');
        if (!helpers.getCookie('logged_social')) {
           helpers.secureEasy.remove('user_order');
        }
        helpers.secureEasy.remove('user_order_id');
        if ($('.main__calc-inputs').length > 0) {
            $(document).ready(function () {
                const $inputCoinsIn = $('#amountCoins');
                setTimeout(() => {
                    $('.main__count-block').on('click', 'button', function () {
                        const str = $(this).attr("data-count");
                        $inputCoinsIn.val(str.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).trigger('input');
                        sitePages.changePlatform();
                        $('.main__calc-inputs').find('input').trigger('update');
                    });
                    $('.main__radios-block').on('click', '.js-select-platform', function () {
                        setTimeout(()=>{
                            sitePages.changePlatform();
                            $('.main__calc-inputs').find('input').trigger('update');
                        }, 0);
                    });
                    $('#amountCoins, #amountAmount').on('input', function() {
                        sitePages.changePlatform();
                    });
                    $('#amountCoins, #amountAmount').on('focusout', function() {
                        setTimeout(()=>{
                            sitePages.changePlatform();
                        }, 10);
                    });

                    $('.js-buy-main').on('click', function (e) {
                        e.preventDefault();
                        // console.log('asd', $('.loader:not(.loader-content)'))
                        if (!helpers.secure.get('_secure_meta_user')) {
                            modal.open('sign-in');
                            $('.js-tabs-btn[data-id="sign-up"]').trigger('click');
                        } else {
                            // sitePages.changePlatform($('.main__radios-block input:checked').data('id'));
                            // sitePages.createOrder();
                            $('.loader:not(.loader-content)').addClass('loader-custom');
                            setTimeout(()=> {
                                $('.loader:not(.loader-content)').removeClass('loader-custom');
                            }, 3000);
                            helpers.setCookie('click_to_buy', true);
                            const hash = '#payment-method';
                            analytics.buyMain();
                            barba.go($(e.currentTarget).data('href') + hash, 'barba');
                        }
                    });
                    setTimeout(()=> {
                        let order = helpers.secureEasy.get('user_order');
                        let coins = order?.amount?.coins
                        let  platform = order?.platform || '';
                        sitePages.setAmount($('.main__radios-block input:checked').data('id'));
                        if (coins){
                            $('.main__calc-inputs').find('input#amountCoins').val(coins).trigger('update');
                        } else {
                            $('.main__calc-inputs').find('input').trigger('update');
                        }
                        $(`.main__calc-inputs [data-count="${coins}"]`).trigger('click');

                        if (platform) {
                            $(`[data-id="${platform}"].js-select-platform`).trigger('click');
                        } else {
                            $(`.js-select-platform`).trigger('click');
                        }
                    }, 100);
                }, 0);
            });
        }
    }

	if (data.next.namespace === 'order') {
		if ($('.order').length > 0) {
			$(document).ready(function () {
                const $inputCoinsIn = $('#amountCoins');
                setTimeout(() => {
                    $('#amountCoinsRange').on('input', function () {
                        const value = this.value;
                        $inputCoinsIn.val(value.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).trigger('input');
                    });
                    $('#amountCoins, #amountAmount').on('input', function() {
						sitePages.changeOrder(true);
                    });
                    $('#amountCoins, #amountAmount').on('focusout', function() {
                        setTimeout(()=>{
                            sitePages.changeOrder(true);
                        }, 10);
                    });
                    setTimeout(()=> {
                        let order = helpers.secureEasy.get('user_order');
                        let coins = order?.amount?.coins
                        let platform = order?.platform || '';
                        if (coins){
                            $('#amountCoins').val(coins).trigger('update');
                        }
                    }, 100);
                }, 0);
            });
		}
	}

    if (data.trigger === 'localeChange') {
        helpers.secureEasy.set('user_locale', helpers.locale);
        helpers.currency = getTranslate[helpers.locale].currency;
        helpers.currencyName = getTranslate[helpers.locale].currencyName;
        helpers.$html.attr('data-lang', helpers.locale).attr('lang', helpers.locale).attr('dir', helpers.locale === 'ar' ? 'rtl' : 'ltr');
    }

    helpers.scrollTo(helpers.$html, 0);

    if (helpers.secure.get('_secure_meta_token')) {
        const getUserData = {
            // eslint-disable-next-line no-undef
            url: urlForUser,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${helpers.secure.get('_secure_meta_token')}`,
            },
        };
        const authUser = {
            url: urlForUserLogin,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                user: {
                    email: helpers.secure.get('_secure_meta_user').email,
                    password: helpers.secure.get('_secure_meta_password'),
                },
            }),
        };

        $.ajax(getUserData).done((response) => {
            if (helpers.secure.get('_secure_meta_user') !== response.user) {
                helpers.secure.set('_secure_meta_user', response.user);
            }

            if (!helpers.secure.get('_secure_meta_token') || response.token !== !helpers.secure.get('_secure_meta_token')) {
                helpers.secure.set('_secure_meta_token', response.user.token);
            }
        })
            .fail((error) => {
                // console.log(error);
                if (error.status === 401) {
                    // console.log(error.status);
                    $.ajax(authUser).done((request, response) => {
                        if (response.status || response === 'success') {
                            login.setUserData(request.user);
                        }
                    });
                }
            });
    }
});

barba.hooks.enter(() => {
    objectFitImages();
});

barba.hooks.afterEnter((data) => {
    // делаем задержку на прогрузку контента
    setTimeout(() => {
        header.init();
        modal.init();
        tabs.init();
        coupon.init();
        login.init();
        login.fb();
        slider.init();

        if (data.current.namespace === 'home' && helpers.getCookie('click_to_buy')) {
            helpers.eraseCookie('click_to_buy');
        }

        if (data.next.namespace === 'order') {
            // eslint-disable-next-line no-undef
            const paypalUrl = `https://www.paypal.com/sdk/js?client-id=${paypalId}&currency=${helpers.currencyName}`;
            const paypalScript = document.createElement('script');
            const head = document.head || document.getElementsByTagName('head')[0];
            paypalScript.onload = () => {
                sitePages.init(data.next.url.hash, data.trigger === 'localeChange');
            };

            window.addEventListener("pageshow", function(e) {
                e.persisted
                && sitePages.init(data.next.url.hash, data.trigger === 'localeChange')
                && console.log('from cache');
            }, false);

            paypalScript.src = paypalUrl;
            paypalScript.async = true;
            head.insertBefore(paypalScript, head.firstChild);
        }

        if (data.next.namespace === 'profile') {
            profile.init();
        }

        const $inputGroup = $('.input__group');
        const $accordion = $('.js-accordion');

        $inputGroup.each((i, el) => {
            const namespace = 'input';
            const options = helpers.getSpecialAttributes(el, namespace);
            // eslint-disable-next-line no-unused-vars
            const inputGroup = new Input($(el), options);

            inputArr.push(inputGroup);
        });

        $accordion.each((i, el) => {
            const namespace = 'accordion';
            const options = helpers.getSpecialAttributes(el, namespace);
            // eslint-disable-next-line no-unused-vars
            const accordion = new Accordion($(el), options);

            accordionArr.push(accordion);
        });

        if ($('#trustbox').length) {
            const trustbox = $('#trustbox').last()[0];
            window.Trustpilot.loadFromElement(trustbox);
        }

        if (!helpers.secure.get('cookie')) {
            $('.cookie').removeClass('is-hidden');

            helpers.$body.on('click', '.cookie__button', () => {
                $('.cookie').addClass('is-hidden');
                helpers.secure.set('cookie', true);
            });
        }

        if (data.trigger === 'localeChange') {
            if (helpers.secure.get('_secure_meta_user')) {
                login.setUserData(helpers.secure.get('_secure_meta_user'));
            } else {
                $('.js-state-signin-btn').add($('.js-state-signin-link')).removeClass('is-hidden');
            }
        }
    }, 100);
});

function getLocale() {
    return new Promise((resolve) => {
        const payLocale = !!helpers.secure.get('pay_locale');
        // helpers.secure.set('pay_locale', 'ru');

        helpers.locale = helpers.secure.get('pay_locale') || helpers.secureEasy.get('user_locale');

        const settings = {
            // eslint-disable-next-line no-undef
            url: urlForStock,
            // url: 'http://ec2-3-139-119-35.us-east-2.compute.amazonaws.com/api/stock',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: '{"ip": ""}',
        };

        $.ajax(settings).done((response) => {
            helpers.region = response.region;
            helpers.coinsInfo = {
                ps4: response.ps4,
                ps5: response.ps4,
                xbox: response.xbox,
                xboxs: response.xbox,
            };
            if (payLocale) {
                let path = window.location.pathname.slice(3, 4).indexOf('/') >= 0 ? window.location.pathname.substring(4) : window.location.pathname.substring(1);
                let hash = window.location.hash;

                helpers.secureEasy.remove('pay_locale');
                document.location = `/${helpers.locale === 'en' ? '' : `${helpers.locale}/`}${path + hash}`;

                if (helpers.locale === 'ru' || helpers.locale === 'en') {
                    helpers.secureEasy.set('user_locale', helpers.locale);

                    // init Barba
                    barba.init({
                        sync: true,
                        transitions: [def],
                        views: [],
                        debug: true,
                    });
                }
            } else {
                helpers.locale = response.locale.toLowerCase();

                // init Barba
                barba.init({
                    sync: true,
                    transitions: [def],
                    views: [],
                    debug: true,
                });

                const location = window.location.pathname.slice(3, 4).indexOf('/') >= 0 ? window.location.pathname.substring(1, 3) : 'en';

                if (!helpers.secureEasy.get('user_locale') && location !== helpers.locale) {
                    helpers.secureEasy.set('user_locale', helpers.locale);

                    barba.go(`/${helpers.locale === 'en' ? '' : `${helpers.locale}/`}`, 'localeChange');
                } else if (!helpers.secureEasy.get('user_locale') && location === helpers.locale) {
                    helpers.secureEasy.set('user_locale', helpers.locale);
                } else if (helpers.secureEasy.get('user_locale') && helpers.secureEasy.get('user_locale') !== location) {
                    helpers.secureEasy.set('user_locale', location);
                }
            }

            helpers.locale = helpers.secureEasy.get('user_locale');
            helpers.currency = getTranslate[helpers.locale].currency;
            helpers.currencyName = getTranslate[helpers.locale].currencyName;
            helpers.$html.attr('data-lang', helpers.locale).attr('lang', helpers.locale).attr('dir', helpers.locale === 'ar' ? 'rtl' : 'ltr');

            // eslint-disable-next-line no-undef
            paymentsLanguage = getTranslate[helpers.locale].paymentsLanguage;

            resolve();
        });
    });
}

function init() {
    getLocale().then(() => {
        helpers.$loader.fadeOut(500);
        helpers.$site.removeClass('is-hidden').animate({
            opacity: 1,
        }, 500);
        $('.site__media').removeClass('is-hidden').animate({
            opacity: 0.2,
        }, 500);
    });
}

init();
