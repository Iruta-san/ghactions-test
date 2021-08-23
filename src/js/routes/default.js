/* eslint-disable no-console */
// import helpers from '../helpers';

export const def = {
	name: 'default',
	leave({
		next,
	}) {
		const done = this.async();

		if (next.namespace === 'page' || next.namespace === 'profile') {
			$(next.container).find('.sidebar').fadeOut('slow', () => {
				done();
			});
		} else {
			setTimeout(() => {
				done();
			}, 500);
		}
	},
	enter({
		next,
	}) {
		$('.site').removeClass('is-hidden').css({
			opacity: 1,
		});
		$('.site__media').removeClass('is-hidden').css({
			opacity: 0.2,
		});
		if (next.namespace !== 'page' && next.namespace !== 'profile') {
			$(next.container).find('.sidebar').show();
		}
	},
};
