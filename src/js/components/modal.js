/* global Scrollbar */
import helpers, {lastPageYOffset} from '../helpers';

const objectScrollbar = () => {
	const $objectContent = $('[data-scrollbar]');
	const $objectContentMobile = $('[data-scrollbar-mobile]');

	$objectContent.each((i, el) => {
		Scrollbar.init(el);
	});

	$objectContentMobile.each((i, el) => {
		if (helpers.isMobile()) {
			Scrollbar.init(el);
		}
	});
};

function reset() {
	helpers.$body.css({
		paddingRight: '',
	});
	helpers.$header.add(helpers.$footer).add('.modal__bg').css({
		right: '',
	});
	helpers.$html.css({
		top: '',
	}).removeClass('is-lock-scroll');
	helpers.restoreScrollPosition();
	setTimeout(() => {
		helpers.$header.add(helpers.$footer).css({
			transition: '',
		});
	}, 400);
}

function close() {
	if ($('.modal').hasClass('is-opened')) {
		reset();

		const $modal = $('.modal.is-opened');

		$modal.removeClass('is-opened');
	}
}

function open(id) {
	if ($('.modal').hasClass('is-opened')) {
		close();
	}

	let $modal = $(`[data-modal="${id}"]`);

	helpers.saveScrollPosition();

	if (helpers.isMobile()) {
		helpers.$html.css({
			top: `-${lastPageYOffset}px`,
		});
	}

	helpers.$html.addClass('is-lock-scroll');
	helpers.$body.css({
		paddingRight: `${helpers.getScrollbarWidth()}px`,
	});
	helpers.$header.add(helpers.$footer).css({
		transition: '0s',
	});
	helpers.$header.add(helpers.$footer).add('.modal__bg').css({
		right: `${helpers.getScrollbarWidth()}px`,
	});

	$modal.addClass('is-opened');

	$modal.find('.modal__wrapper').animate({
		scrollTop: 0,
	}, 0);
}

function init() {
	helpers.$document
		.on('click.modal', '.js-modal-btn', (e) => {
			const id = $(e.currentTarget).data('id');

			open(id);
		})
		.on('click.modal', '.js-modal-close', close)
		.on('keyup.modal', (e) => {
			if (e.keyCode === 27 && $('.modal').hasClass('is-opened')) {
				close();
			}
		});

	objectScrollbar();
}

function destroy() {
	helpers.$document.on('.modal');
	close();
	const $objectContent = $('[data-scrollbar]');
	const $objectContentMobile = $('[data-scrollbar-mobile]');

	$objectContent.add($objectContentMobile).each((i, el) => {
		Scrollbar.destroy(el);
	});

	$objectContentMobile.each((i, el) => {
		Scrollbar.destroy(el);
	});
}

export default {
	init,
	destroy,
	open,
	close,
};
