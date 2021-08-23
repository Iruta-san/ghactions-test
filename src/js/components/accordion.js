import helpers from '../helpers';

export default class Accordion {
	static get Defaults() {
		return {
			headingSelector: '[aria-controls]',
			contentSelector: '[role="region"]',

			activeAccordionClassName: '',
			activeHeadingClassName: 'is-active',
			activeContentClassName: 'is-active',

			// Prevent toggle if user clicked on input / label in the heading
			ignoreSelector: 'label, input',

			hiddenAttribute: 'aria-hidden',
			expandedAttribute: 'aria-expanded',

			// Only one item can be opened at a time
			onlyOne: false,
		};
	}

	constructor($container, opts) {
		// eslint-disable-next-line no-multi-assign
		const options = this.options = $.extend({}, this.constructor.Defaults, opts);

		this.$container = $container;

		this.$headings = $container.find(options.headingSelector);
		this.$contents = $container.find(options.contentSelector);

		this.enable();
	}

	destroy() {
		this.disable();
	}

	/**
	 * Add event listeners
	 *
	 * @protected
	 */
	enable() {
		// const $container = this.$container;
		const options = this.options;

		// When user clicks on a heading open content. We bind to document to allow headings to be
		// placed anywhere in the page + have multiple headings for single content
		// We use body instead of document to make sure we stop it before it propagates to document and callbacks for
		// other plugins are called after we have prevented default behaviour
		helpers.$body.on('click.accordion', options.headingSelector, this.handleHeadingClick.bind(this));

		// Clean up global events to prevent memory leaks and errors, if pages are dynamically loaded using JS
		// Requires lib/jquery.destroyed.js */
		// $container.on('destroyed', this.destroy.bind(this));
	}

	/**
	 * Remove event listeners
	 *
	 * @protected
	 */
	// eslint-disable-next-line class-methods-use-this
	disable() {
		// Cleanup global events
		helpers.$body.off('click.accordion');
	}

	/**
	 * Handle heading click
	 * Make sure heading belongs to this accordion instance before toggling content
	 *
	 * @param {object} event Event
	 * @protected
	 */
	handleHeadingClick(event) {
		const $heading = $(event.target).closest(this.options.headingSelector).not(this.options.contentSelector);
		const activeId = $heading.attr('aria-controls');
		const $content = this.getContent(activeId);

		if ($content.length) {
			// Make sure we are not clicking on elements which shouldn't toggle accordion
			const $ignore = $(event.target).closest(this.options.ignoreSelector);

			if (!$ignore.parents($heading).length) {
				this.toggle(activeId);

				if ($(event.target).parent('button').attr('type') !== 'submit' && !$(event.target).is('button')) {
					event.preventDefault();
				} else if ($(event.target).attr('type') !== 'submit' && !$(event.target).parent('button').length) {
					event.preventDefault();
				}
			}
		}
	}

	/**
	 * Returns list of all content / heading IDs
	 *
	 * @returns {Array} List of IDs
	 */
	getAllIds() {
		const headingIds = this.$headings.toArray().map((element) => {
			return $(element).attr('aria-controls');
		});

		const contentIds = this.$contents.toArray().map((element) => {
			return $(element).attr('id');
		});

		return this.unique(headingIds.concat(contentIds));
	}

	// eslint-disable-next-line class-methods-use-this
	unique(arr) {
		let result = [];

		for (let str of arr) {
			if (!result.includes(str)) {
				result.push(str);
			}
		}

		return result;
	}

	/**
	 * Returns list of all content / heading IDs which are active
	 *
	 * @returns {Array} List of IDs
	 */
	getAllActiveIds() {
		return this.getAllIds().filter((id) => this.isActive(id));
	}

	/**
	 * Returns content element by id
	 *
	 * @param {string} id Item id
	 * @returns {object} Content jQuery element
	 */
	getContent(id) {
		return this.$container.find(`#${id}`);
	}

	/**
	 * Returns heading element by id
	 *
	 * @param {string} id Item id
	 * @returns {object} Heading jQuery element
	 */
	getHeading(id) {
		return this.$container.find(`[aria-controls="${id}"]`);
	}

	/**
	 * Returns if item with given id is expanded
	 *
	 * @param {string} id Item id
	 * @returns {boolean} True if item is exanded, otherwise false
	 */
	isActive(id) {
		const options = this.options;
		const $heading = this.getHeading(id);
		const $content = this.getContent(id);

		if (options.activeHeadingClassName && $heading.length) {
			return $heading.hasClass(options.activeHeadingClassName);
		} else if (options.hiddenAttribute && $content.length) {
			const attr = $content.attr(options.hiddenAttribute);

			return !attr || attr === 'false';
		} else if (options.expandedAttribute && $heading.length) {
			const attr = $heading.attr(options.expandedAttribute);

			return attr && attr === 'true';
		}

		return false;
	}

	/**
	 * Expand item
	 *
	 * @param {string} id Item id
	 */
	open(id) {
		if (typeof id === 'undefined') {
			if (!this.options.onlyOne) {
				$.each(this.getAllIds(), this.open.bind(this));
			}
		} else {
			if (this.options.onlyOne) {
				let active = this.getAllActiveIds();

				if (active.indexOf(id) === -1) {
					$.each(active, (i, el) => {
						return this.animateContent(el, 'out');
					});
				}
			}

			if (id && !this.isActive(id)) {
				this.animateContent(id, 'in');
			}
		}
	}

	/**
	 * Collapse item
	 *
	 * @param {string} id Item id
	 */
	close(id) {
		if (typeof id === 'undefined') {
			if (!this.options.atLeastOne) {
				// Collapse all items
				$.each(this.getAllIds(), this.close.bind(this));
			}
		} else if (!this.options.atLeastOne || this.getAllActiveIds().length > 1) {
			if (id && this.isActive(id)) {
				this.animateContent(id, 'out');
			}
		}
	}

	/**
	 * Toggle item
	 *
	 * @param {string} id Item id
	 */
	toggle(id) {
		if (this.isActive(id)) {
			this.close(id);
		} else {
			this.open(id);
		}
	}

	/**
	 * Animate item heading
	 *
	 * @param {string} id Item id
	 * @param {string} direction Either 'in' to expand element or 'out' to collapse
	 * @protected
	 */
	animateHeading(id, direction) {
		const $heading = this.getHeading(id);
		const headingClassName = this.options.activeHeadingClassName;
		const expandedAttribute = this.options.expandedAttribute;

		if (direction === 'in') {
			$heading.addClass(headingClassName).attr(expandedAttribute, 'false');
		} else {
			$heading.removeClass(headingClassName).attr(expandedAttribute, 'true');
		}
	}

	/**
	 * Animate item content
	 *
	 * @param {string} id Item id
	 * @param {string} direction Either 'in' to expand element or 'out' to collapse
	 * @protected
	 */
	animateContent(id, direction) {
		const $content = this.getContent(id);

		if (direction === 'in') {
			$content.addClass(this.options.activeContentClassName);
			$content.parent().addClass(this.options.activeAccordionClassName);

			this.animateHeading(id, direction);

			$content.slideDown(400, () => {
				$content.attr(this.options.hiddenAttribute, false);
				helpers.scrollTo($content.parent(), 500, helpers.isMobile() ? -80 : -140);
			});

			if ($content.find('input').length) {
				$content.find('input').trigger('update');
			}
		} else {
			$content.parent().removeClass(this.options.activeAccordionClassName);

			$content.slideUp(400, () => {
				$content.attr(this.options.hiddenAttribute, true);
				$content.removeClass(this.options.activeContentClassName);
				this.animateHeading(id, direction);
			});
		}
	}
}
