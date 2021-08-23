/* eslint-disable indent */
/* eslint-disable no-undef */
import helpers from './helpers';
import moment from 'moment';
import {getStatus, getTranslate, getTranslateMessage} from './translate';
let states = {};
let num = 0;

// template for header user info
states.headerUser = (data) => {
return `
		<div class="header__user">
			<a class="header__user-name" href="/${helpers.locale === 'en' ? '' : `${helpers.locale}/`}profile.html">${data.name}</a>
			${data.currency ? `<div class="header__user-money">
				<span class="currency">${data.currency ? data.currency : helpers.currency}</span>
				<span class="text">${data.money ? data.money : 0}</span>
			</div>` : ''}
			<button class="btn header__button js-logout-btn" type="button"><span class="btn__content">${getTranslate[helpers.locale].logOut}</span></button>
		</div>`;
};

states.headerUserNotify = (data) => {
	return `${getTranslate[helpers.locale].youLogged} <em>${data.name}</em>`;
};

// template for code button
states.inputCode = (value, text) => {
	return `<div class="input__code" data-value="${value}"><span class="input__code-text">${text}</span><button class="btn input__code-btn" type="button"><div class="btn__content"><svg><use xlink:href="../images/sprites.svg#close"></use></svg></div></button></div>`;
};

// template for profile table heading status
// eslint-disable-next-line consistent-return
states.profileTableHeadingStatus = (status) => {
	status = status.toLowerCase();

	if (status === 'created' ||
		status === 'accepted') {
		return {
			text: getStatus[helpers.locale][status],
			status: 'created',
		};
	}

	if (status === 'out_of_stock' ||
		status === 'warning' ||
		status === 'wrong_credentials' ||
		status === 'wrong_backup' ||
		status === 'no_enough_stock' ||
		status === 'not_enough_stock' ||
		status === 'no_enough_coins_to_start' ||
		status === 'not_enough_coins_to_start' ||
		status === 'error_fut' ||
		status === 'waiting_payment' ||
		status === 'error_payment' ||
		status === 'no_access_to_fifa_21_webapp' ||
		status === 'fut_error') {
		return {
			text: getStatus[helpers.locale][status],
			status: 'warning',
		};
	}

	if (status === 'customer_online') {
		return {
			text: getStatus[helpers.locale][status],
			status: 'warning',
		};
	}

	if (status === 'success' ||
		status === 'finished' ||
		status === 'payed') {
		return {
			text: getStatus[helpers.locale][status],
			status: 'success',
		};
	}

	return {
		text: typeof getStatus[helpers.locale][status] === 'undefined' ? getStatus[helpers.locale].progress : getStatus[helpers.locale][status],
		status: 'progress',
	};
};

// eslint-disable-next-line no-shadow
function AddZero(num) {
	return num >= 0 && num < 10 ? `0${num}` : `${num}`;
}

const now = new Date();
// eslint-disable-next-line new-cap
const date = [AddZero(now.getMonth() + 1), AddZero(now.getDate()), now.getFullYear()].join('/');
// eslint-disable-next-line new-cap
const date2 = [AddZero(now.getMonth() + 1), AddZero(now.getDate() - 1), now.getFullYear()].join('/');

// template for profile table heading
states.profileTableHeading = (data) => {
	let day = moment(data.createdAt).format('L');
	// eslint-disable-next-line no-nested-ternary
	let currency = data.currency ? data.currency === 'RUB' ? '₽' : '€' : helpers.currency;
	let emailClass = helpers.locale==='ar'?'arabic':'';
	if (day === date) {
		day = getTranslate[helpers.locale].toDay;
	}

	if (day === date2) {
		day = getTranslate[helpers.locale].yesterDay;
	}



	return `<div class="profile-order-table__heading js-accordion-btn" id="accordion-heading-${data.id}" role="button" aria-expanded="false" aria-controls="accordion-content-${data.id}" href="#accordion-content-${data.id}">
		<div class="profile-order-table__devider">
			<span>${day}</span><div class="profile-order-table__devider-line"></div>
		</div>
		<div class="profile-order-table__content">
			<div class="profile-order-table__col profile-order-table__col--num">
				<div class="profile-order-table__col-head">${getTranslate[helpers.locale].numDay}</div><span>${helpers.numberWithCommasForArabic(data.id)}</span>
			</div>
			<div class="profile-order-table__col profile-order-table__col--login">
				<div class="profile-order-table__col-head">${getTranslate[helpers.locale].login}</div>
				<svg class="profile-order-table__platform"><use xlink:href="/images/sprites.svg#platform-${data.platform}"></use></svg>
				<span class="${emailClass}">${data.mail || helpers.secure.get('_secure_meta_user').email}</span>
			</div>
			<div class="profile-order-table__col profile-order-table__col--amount">
				<div class="profile-order-table__col-head">${getTranslate[helpers.locale].amount}</div><span>${helpers.numberWithCommasForArabic(data.coinCount)}</span>
			</div>
			<div class="profile-order-table__col profile-order-table__col--price">
				<div class="profile-order-table__col-head">${getTranslate[helpers.locale].price}</div><span>${currency}${helpers.numberWithCommasForArabic(data.overallPrice.toFixed(2))}</span>
			</div>
			<div class="profile-order-table__col profile-order-table__col--status">
				<div class="profile-order-table__col-head">${getTranslate[helpers.locale].status}</div>
				<div class="profile-order-table__progress profile-order-table__progress--${states.profileTableHeadingStatus(data.status).status}"><span>${states.profileTableHeadingStatus(data.status).text}</span><img src="../images/profile/${states.profileTableHeadingStatus(data.status).status}.svg" alt="status"></div>
			</div>
			<div class="profile-order-table__arrow"><svg><use xlink:href="../images/sprites.svg#arrow-down"></use></svg></div></div>
	</div>`;
};

// template for profile table body
states.profileTableBody = (data) => {
	let isEditable = false;
	let codes = [];

	for (let i = 0; i < data.labels.length; i++) {
		const element = data.labels[i];

		if (element.toLowerCase() === 'place_on_fut') {
			isEditable = true;
		}
	}

	if (data.backupCode1) {
		for (let i = 1; i <= 8; i++) {
			const code = data[`backupCode${i}`];

			if (code) {
				codes.push(code);
			}
		}
	}

	return `<div class="profile-order-table__body js-accordion-content" id="accordion-content-${data.id}" role="region" aria-labelledby="accordion-heading-${data.id}" aria-hidden="true" data-method="${data.deliveryMethod}">
		<form class="form profile-order-table__form js-form-order-profile" ${isEditable ? '' : 'disabled'} autocomplete="off" action="/${data.id}/place" method="POST">
			<div class="form__message form__message--error js-form-error-message is-hidden"></div>
			<div class="form__message form__message--success js-form-success-message is-hidden">
				<div class="text">${getTranslate[helpers.locale].profileFormSuccess}: <span class="status"></span></div>
			</div>
			<div class="js-form-content">
				<fieldset class="input__group js-profile-codes ${codes && codes.length ? 'has-success' : ''} ${data.status.toLowerCase() === 'wrong_backup' ? 'has-error' : ''}">
					<label class="input__label input__label--codes" for="profile-order-${data.id}-codes" data-length="8">
						<div class="js-input-codes">
							${codes && codes.length ?
								codes.map((code) => {
									return states.inputCode(code, helpers.numberWithCommas4(code));
								}).join('') : ''}
						</div>
						<input class="input__input" id="profile-order-${data.id}-codes" autocomplete="off" name="codes" type="text" inputmode="decimal" minlength="8" placeholder="${getTranslate[helpers.locale].enterCode}">
						<label for="profile-order-${data.id}-codes" class="input__input--masked is-placeholder">${getTranslate[helpers.locale].enterCode}</label>
						${data.status.toLowerCase() === 'wrong_backup' ?
							`<label for="profile-order-${data.id}-codes" class="error">${getTranslate[helpers.locale].wrongCode}</label>` : ''}
						<span class="input__label-placeholder">${getTranslate[helpers.locale].backupCode}</span>
						<div class="input__borders"><div class="input__border input__border-left"></div><div class="input__border input__border-middle"><div class="input-top__borders"><div class="input__border input__border-start"></div><div class="input__border input__border-end"></div></div><div class="input-bottom__borders"><div class="input__border input__border-start"></div><div class="input__border input__border-end"></div></div></div><div class="input__border input__border-right"></div></div>
					</label>
				</fieldset>
				<div class="form__group">
					<div class="form__col">
						<fieldset class="input__group ${data.mail ? 'has-success' : ''} ${data.status.toLowerCase() === 'wrong_credentials' ? 'has-error' : ''}">
							<label class="input__label input__label--email" for="profile-email-order-${data.id}">
								<input class="input__input" id="profile-email-order-${data.id}" name="email" type="email" required minlength="7" value="${data.mail ? data.mail : ''}" autocomplete="off" placeholder="${getTranslate[helpers.locale].email}">
								<span class="input__label-placeholder">${getTranslate[helpers.locale].account}</span>
								${data.status.toLowerCase() === 'wrong_credentials' ? `<label for="profile-order-${data.id}-codes" class="error">${getTranslate[helpers.locale].wrongCredentials}</label>` : ''}
								<div class="input__borders"><div class="input__border input__border-left"></div><div class="input__border input__border-middle"><div class="input-top__borders"><div class="input__border input__border-start"></div><div class="input__border input__border-end"></div></div><div class="input-bottom__borders"><div class="input__border input__border-start"></div><div class="input__border input__border-end"></div></div></div><div class="input__border input__border-right"></div></div>
							</label>
						</fieldset>
					</div>
					<div class="form__col">
						<fieldset class="input__group ${data.status.toLowerCase() === 'wrong_credentials' ? 'has-error' : ''}">
							<label class="input__label input__label--password" for="profile-password-order-${data.id}">
								<input class="input__input" id="profile-password-order-${data.id}" name="password" type="password" required minlength="2" placeholder="${getTranslate[helpers.locale].password}">
								<span class="input__label-placeholder">${getTranslate[helpers.locale].password}</span>
								${data.status.toLowerCase() === 'wrong_credentials' ? `<label for="profile-order-${data.id}-codes" class="error">${getTranslate[helpers.locale].wrongCredentials}</label>` : ''}
								<button class="input__view btn js-password-view" type="button" title="${getTranslate[helpers.locale].seePassword}"><div class="btn__content"><svg class="eye"><use xlink:href="../images/sprites.svg#eye"></use></svg><svg class="eye-close"><use xlink:href="../images/sprites.svg#eye-close"></use></svg></div></button>
								<div class="input__borders"><div class="input__border input__border-left"></div><div class="input__border input__border-middle"><div class="input-top__borders"><div class="input__border input__border-start"></div><div class="input__border input__border-end"></div></div><div class="input-bottom__borders"><div class="input__border input__border-start"></div><div class="input__border input__border-end"></div></div></div><div class="input__border input__border-right"></div></div>
							</label>
						</fieldset>
					</div>
				</div>
				${isEditable ? `
					<div class="form__group">
						${data.status.toLowerCase === 'war' ? `
							<button class="btn profile__button-event js-profile-button-report" type="button"><div class="btn__content"><svg><use xlink:href="../images/sprites.svg#warning"></use></svg><span>${getTranslate[helpers.locale].reportProblem}</span></div></button>
							<button class="btn profile__button-event js-profile-button-cancel" type="button"><div class="btn__content"><svg><use xlink:href="../images/sprites.svg#cancel"></use></svg><span>${getTranslate[helpers.locale].cancelOrder}</span></div></button>
						` : ''}
						<button class="btn profile__button profile__group-button js-form-submit" type="submit"><div class="btn__content">${getTranslate[helpers.locale].saveChanges}</div></button>
					</div>
				` : ''}
			</div>
		</form>
	</div>`;
};

states.promoCodeBtn = () => {
	return `<a class="btn payment-method__total-coupon-title" role="button">${getTranslate[helpers.locale].haveCoupon}</a>`;
};

states.promoCodeTemplate = (data) => {
	return `
		<div class="payment-method__total-coupon-title">${data.promoCode}</div>
		<div class="payment-method__total-coupon-addon">
			<span>${(Number(data.price) - Number(data.newValue)).toFixed(2)} (-${data.discount.toFixed(2)}%)</span>
			<svg id="closeCoupon"><use xlink:href="../images/sprites.svg#cross"></use></svg>
		</div>`;
};

states.orderNotifyProgress = (data) => {
	return `
		<a href="/${helpers.locale === 'en' ? '' : `${helpers.locale}/`}order.html#delivery-progress" data-id="${data.id}" class="header-order__notify-item header-order__notify-item--progress">
			<span>${getTranslateMessage([helpers.locale].yourOrder, data.id)}</span>
			<img src="../images/profile/progress.svg" alt="status">
		</a>
	`;
};

states.orderNotifyError = (data, text = `${getStatus(data.status).text}`) => {
	return `
		<a href="/${helpers.locale === 'en' ? '' : `${helpers.locale}/`}order.html#delivery" data-id="${data.id}" class="header-order__notify-item header-order__notify-item--error">
			<span>${text}</span>
			<img src="../images/profile/progress.svg" alt="status">
		</a>
	`;
};

states.errorTemplate = (text) => {
	const id = `error-${num}`;

	return {
		html: `
			<div class="header__notify header__notify--error is-hidden" data-id="${id}">
				<span>${text}</span>
				<button class="btn header__notify-btn js-notify-btn" type="button">
					<span class="btn__content">
						<svg><use xlink:href="../images/sprites.svg#close-alt"></use></svg>
						<svg class="circle" viewBox="25 25 50 50"><circle cx="50" cy="50" r="24"></circle></svg>
					</span>
				</button>
			</div>
		`,
		num: num++,
	};
};

export default states;
