import helpers from '../helpers';

// нажали на купить
const analytics = {};

//купить через главную страницу
analytics.buyMain = () => {
	if (window.analyticsLocal) {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		'ecommerce': {
			currencyCode: helpers.currencyName,
			click: {
				actionField: {list: 'Form'},
				products: [{
					name: 'Coins',
					id: 'FUT',
				}],
			},
		},
		'event': 'CustomEvent',
		'category': 'FormOnIndex',
		'action': 'SendForm',
		'non-interaction': 'False',
		'userId': helpers.getCookie('_ga'),
        'Timestamp': + new Date(),
	});
};


//оплата PayPal
analytics.selectPayPal = () => {
    if (window.analyticsLocal) {
        return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'CustomEvent',
        category: 'PayPal',
        action: 'Payment',
        'userId': helpers.getCookie('_ga'),
        'Timestamp': + new Date(),
    });
};

//оплата картой
analytics.selectPayCard = () => {
    if (window.analyticsLocal) {
        return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'CustomEvent',
        category: 'PayByCard',
        action: 'Payment',
        'userId': helpers.getCookie('_ga'),
        'Timestamp': + new Date(),
    });
};




// после оплаты
analytics.final = (data) => {
    if (window.analyticsLocal) {
        return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'ecommerce': {
            currencyCode: helpers.currencyName,
            purchase: {
                actionField: {
                    name: 'Coins',
                    id: data.id,
                    affiliation: 'royalfut.com',
                    revenue: data.paymentAmount,
                    tax: '',
                    shipping: '',
                    coupon: data.coupon, // coupon number
                },
                products: [{
                    name: 'Coins',
                    id: data.id,
                    brand: data.platform, // ps or xbox
                    category: data.method, // easy or manual
                    variant: 'card', // card or paypal
                    price: data.price,
                    quantity: data.amount,
                    coupon: data.coupon,
                }],
            },
        },
        'event': 'CustomEvent',
        'category': 'PayByCard',
        'action': 'Purchase',
        'platform': data.platform, // ps or xbox
        'CoinsAmoun': data.amount,
        'userId': helpers.getCookie('_ga'),
        'Timestamp': + new Date(),
    });
};


//купить в шапке сайта
analytics.buy = (email) => {
    return;
	if (window.analyticsLocal) {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		'ecommerce': {
			currencyCode: helpers.currencyName,
			click: {
				actionField: {list: 'Form'},
				products: [{
					name: 'Coins',
					id: 'FUT',
				}],
			},
		},
		'event': 'CustomEvent',
		'category': 'Buy Coins',
		'action': 'Step 1',
		'non-interaction': 'False',
		'userId': email, // email
	});
};

// авторизация
analytics.login = (email) => {
    return;
	if (window.analyticsLocal) {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'CustomEvent',
		category: 'Auth',
		action: 'Sign in',
		userId: email, // email
	});
};

// регистрация
analytics.sinup = (email) => {    return;
	if (window.analyticsLocal) {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'CustomEvent',
		category: 'Auth',
		action: 'Sign up',
		userId: email, // email
	});
};

// после выбора платформы
analytics.step1 = (data) => {    return;
	if (window.analyticsLocal) {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		'ecommerce': {
			currencyCode: helpers.currencyName,
			checkout: {
				actionField: {
					step: 1,
					option: 'Choose Your Platform',
				},
				products: [{
					name: 'Coins',
					id: 'FUT',
					brand: data.platform, // ps or xbox
				}],
			},
		},
		'event': 'CustomEvent',
		'category': 'Buy Coins',
		'action': 'Step 2',
		'non-interaction': 'False',
		'platform': data.platform, // ps or xbox
		'userId': data.email, // email
	});
};

// после выбора кол-ва
analytics.step2 = (data) => {    return;
	if (window.analyticsLocal) {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		'ecommerce': {
			currencyCode: helpers.currencyName,
			checkout: {
				actionField: {
					step: 2,
					option: 'Amount',
				},
				products: [{
					name: 'Coins',
					id: 'FUT',
					brand: data.platform, // ps or xbox
					price: '',
					quantity: data.amount,
				}],
			},
		},
		'event': 'CustomEvent',
		'category': 'Buy Coins',
		'action': 'Step 3',
		'non-interaction': 'False',
		'platform': data.platform, // ps or xbox
		'coins': data.amount,
		'userId': data.email, // email
	});
};

// после выбора метода
analytics.step3 = (data) => {    return;
	if (window.analyticsLocal) {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		'ecommerce': {
			currencyCode: helpers.currencyName,
			checkout: {
				actionField: {
					step: 3,
					option: 'Method',
				},
				products: [{
					name: 'Coins',
					id: 'FUT',
					brand: data.platform, // ps or xbox
					category: data.method, // easy or manual
					price: '',
					quantity: data.amount,
				}],
			},
		},
		'event': 'CustomEvent',
		'category': 'Buy Coins',
		'action': 'Step 4',
		'non-interaction': 'False',
		'platform': data.platform, // ps or xbox
		'coins': data.amount,
		'product': data.method, // easy or manual
		'userId': data.email, // email
	});
};

// после купона
analytics.step4 = (data) => {    return;
	if (window.analyticsLocal) {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		'ecommerce': {
			currencyCode: helpers.currencyName,
			checkout: {
				actionField: {
					step: 4,
					option: 'Payment',
				},
				products: [{
					name: 'Coins',
					id: 'FUT',
					brand: data.platform, // ps or xbox
					category: data.method, // easy or manual
					variant: 'card', // card or paypal
					price: data.price,
					quantity: data.amount,
					coupon: data.coupon, // coupon number
				}],
			},
		},
		'event': 'CustomEvent',
		'category': 'Buy Coins',
		'action': 'Step 5',
		'non-interaction': 'False',
		'platform': data.platform, // ps or xbox
		'coins': data.amount,
		'product': data.method, // easy or manual
		'payment method': 'card', // card or paypal
		'coupon': data.coupon, // coupon number
		'payment amount': data.paymentAmount,
		'userId': data.email, // email
	});
};

// после оплаты
analytics.step5 = (data) => {    return;
	if (window.analyticsLocal) {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		'ecommerce': {
			currencyCode: helpers.currencyName,
			purchase: {
				actionField: {
					name: 'Coins',
					id: data.id,
					affiliation: 'royalfut.com',
					revenue: data.paymentAmount,
					tax: '',
					shipping: '',
					coupon: data.coupon, // coupon number
				},
				products: [{
					name: 'Coins',
					id: data.id,
					brand: data.platform, // ps or xbox
					category: data.method, // easy or manual
					variant: 'card', // card or paypal
					price: data.price,
					quantity: data.amount,
					coupon: data.coupon,
				}],
			},
		},
		'event': 'CustomEvent',
		'category': 'Buy Coins',
		'action': 'Step 6',
		'platform': data.platform, // ps or xbox
		'coins amount': data.amount,
		'product': data.method, // easy or manual
		'payment method': 'card', // card or paypal
		'coupon': data.coupon, // coupon number
		'payment amount': data.paymentAmount,
		'userId': data.email, // email
	});
};

// после заполнения данных
analytics.step7 = (data) => {    return;
	if (window.analyticsLocal) {
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		'event': 'CustomEvent',
		'category': 'Buy Coins',
		'action': 'Step 8',
		'platform': data.platform, // ps or xbox
		'coins amount': data.amount,
		'product': data.method, // easy or manual
		'payment method': 'card', // card or paypal
		'coupon': data.coupon, // coupon number
		'payment amount': data.paymentAmount,
		'userId': data.email, // email
	});
};

//выбор платформы
analytics.selectPlatform = (name) => {    return;
	if (window.analyticsLocal) {
		return;
	}
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'CustomEvent',
		category: 'click_button',
		action: name,
	});
};

//выбор монет
analytics.selectCoins = () => {    return;
	if (window.analyticsLocal) {
		return;
	}
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'CustomEvent',
		category: 'click_button',
		action: 'Proceed',
	});
};

//выбор способа получения
analytics.selectMethod = () => {    return;
	if (window.analyticsLocal) {
		return;
	}
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'CustomEvent',
		category: 'click_button',
		action: 'EasyBtn',
	});
};

//оплата картой
analytics.selectPay = () => {    return;
	if (window.analyticsLocal) {
		return;
	}
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'CustomEvent',
		category: 'click_button',
		action: 'PaybyCard',
	});
};

// выбор доставки
analytics.selectDelivering = () => {    return;
	if (window.analyticsLocal) {
		return;
	}
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'CustomEvent',
		category: 'click_button',
		action: 'Delivering',
	});
};

//регистрация
analytics.signUp = () => {    return;
	if (window.analyticsLocal) {
		return;
	}
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'CustomEvent',
		category: 'SubmitForm',
		action: 'SignUp',
	});
};

//авторизация
analytics.logIn = () => {    return;
	if (window.analyticsLocal) {
		return;
	}
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: 'CustomEvent',
		category: 'SubmitForm',
		action: 'LogIn',
	});
};

export default analytics;
