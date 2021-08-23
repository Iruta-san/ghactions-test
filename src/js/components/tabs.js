import helpers from '../helpers';

function init() {
	const $tabBtn = $('.js-tabs-btn').filter(`[data-id="${window.location.hash.substr(1)}"]`);
	const $tabContent = $('.js-tabs-content').filter(`[data-id="${window.location.hash.substr(1)}"]`);

	if ($tabBtn.length) {
		$('.js-tabs-btn').removeClass('is-active');
		$('.js-tabs-content').removeClass('is-active').addClass('is-hidden');
		$tabBtn.addClass('is-active');
		$tabContent.removeClass('is-hidden').addClass('is-active');
	}

	helpers.$body.on('click.tabs', '.js-tabs-btn', (e) => {
		const $this = $(e.currentTarget);
		const id = $this.data('id');
		const canScroll = $this.data('scroll');
		const setUrl = $this.data('set-url');
		const $btns = $this.closest('.js-tabs').find('.js-tabs-btn');
		const $content = $this.closest('.js-tabs').find('.js-tabs-content');
		const $curContent = $content.filter(`[data-id="${id}"]`);
		const $curBtn = $btns.filter(`[data-id="${id}"]`);

		$btns.each((i, el) => {
			const alwaysActive = $(el).data('always-active');

			if (!alwaysActive && canScroll !== 'true') {
				$(el).removeClass('is-active');
			}
		});

		if ($content.not('.is-hidden').closest('form').length && !$content.not('.is-hidden').closest('form').valid()) {
			$content.not('.is-hidden').find('input').each((i, el) => {
				$(el).trigger('update');
			});

			return;
		}

		if (setUrl && setUrl !== 'false') {
			window.location.hash = id;
		}

		$curBtn.addClass('is-active');

		$content.removeClass('is-active').addClass('is-hidden');
		$curContent.removeClass('is-hidden').addClass('is-active');

		if (canScroll && canScroll !== 'false') {
			helpers.scrollTo($this, 500, helpers.isMobile() ? 0 : -140);
		}

		if ($content.not('.is-hidden').find('input').length) {
			$content.not('.is-hidden').find('input').each((i, el) => {
				$(el).trigger('update');
			});
		}
	});
}

function destroy() {
	helpers.$body.off('.tabs');
}

export default {
	init,
	destroy,
};
