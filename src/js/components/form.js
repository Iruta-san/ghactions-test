/* eslint-disable new-cap */
/* eslint-disable class-methods-use-this */
import 'jquery-validation';
import helpers from '../helpers';
import states from '../states';
import {getTranslate, validMessage} from '../translate';

export default class AjaxForm {
	static get Defaults() {
		return {
			// Whether to use ajax to submit form
			useAjax: true,

			// If form was submitted and ajax responded with success, then
			// redirect page to this URL
			successRedirectUrl: false,

			// If form was submitted and ajax responded with success, then
			// reload page
			successReload: false,

			// Automatically save on input change
			autoSave: false,
		};
	}

	constructor($form, opts = {}) {
		this.options = $.extend({}, this.constructor.Defaults, opts);

		this.$form = $form;
		this.$errorMessage = $form.find('.js-form-error-message');
		this.$formBtn = $form.find('.js-form-button');
		this.$formBtnSpan = this.$formBtn.find('.btn__content');

		this.customResponseHandlers = [];
		this.isLoading = false;
		this.formName = $form.attr('name') || '';

		$form.on('reset.form', this.reset.bind(this));

		if (this.options.autoSave) {
			$form.on('change.form', helpers.debounce(this.submit.bind(this), 250));
		}

		// jQuery validation plugin is missing
		this.$formBtn.on('click.form', (event) => {
			event.preventDefault();
			$(event.currentTarget).prop('disabled', true).addClass('is-disabled');

			this.submit();
		});

		$form.on('submit.form', (event) => {
			if (this.options.useAjax) {
				event.preventDefault();
			}
		});
	}

	destroy() {
		this.$formBtn.off('.form');
		this.$form.off('.form');
	}

	/**
	* Returns form values
	*
	* @returns {object} Form values
	* @protected
	*/
	getFormValues() {
		const $form = this.$form;
		const values = $form.serialize();

		// If values needs to be transformed, it should be done here
		return values;
	}

	/**
	* Returns form data object
	*
	* @returns {FormData} Form data
	* @protected
	*/
	getFormData() {
		return new FormData(this.$form.get(0));
	}

	/**
	* Reset form
	*/
	reset() {
		this.hideSuccessMessage();
		this.hideGenericErrorMessage();
	}

	/**
	* Disable form
	*/
	disable() {
		const $form = this.$form;
		this.submitBtnText = this.$formBtnSpan.text();

		// Select elements don't have "readonly" attribute
		$form.find('input, select, textarea').prop('readonly', true).addClass('readonly');
		$('[type="submit"]').prop('disabled', true).addClass('is-disabled');

		this.$formBtnSpan.text(getTranslate[helpers.locale].loading);
	}

	/**
	* Enable form
	*/
	enable() {
		const $form = this.$form;

		// Select elements don't have "readonly" attribute
		$form.find('input, select, textarea').prop('readonly', false).removeClass('readonly');
		$('[type="submit"]').prop('disabled', false).removeClass('is-disabled');
		this.$formBtnSpan.text(this.submitBtnText);
	}

	/*
	* Loading state
	* Set loading state
	*
	* @param {boolean} state Loading state
	*/
	setLoading(state) {
		this.isLoading = state;
	}

	/**
	* Server-side validation
	* Submit form data to server
	*/
	submit() {
		// prevent double submit
		if (this.isLoading) {
			return;
		}

		const $form = this.$form;
		const values = this.getFormValues();
		const url = `${window.url}${$form.attr('action')}`;
		const method = $form.attr('method');
		const isGET = method.toLowerCase() !== 'post' && method.toLowerCase() !== 'put';

		if (!$form.valid() && $form.find('.has-error').length) {
			if ($form.find('input').length) {
				$form.find('input').trigger('update');
			}

			return;
		}

		this.setLoading(true);
		this.disable();

		if (this.options.useAjax) {
			$.ajax({
				url,
				method,
				processData: !!isGET,
				headers: {
					'Content-Type': 'application/json',
				},
				data: isGET ? values : this.getFormData(),
			})
				.always(this.handleResponseComplete.bind(this))
				.done(this.handleResponseSuccess.bind(this, values))
				.fail(this.handleResponseFailure.bind(this, values));
		} else {
			$form.get(0).submit();
		}
	}

	/**
	* Handle response from server
	*
	* @protected
	*/
	// eslint-disable-next-line no-unused-vars
	handleResponseComplete(request, response) {
		this.setLoading(false);
		this.enable();
	}

	/**
	* Handle successful request to server
	*
	* @param {object} request Request data
	* @param {object} response Server response
	* @protected
	*/
	handleResponseSuccess(request, response) {
		this.$form[0].reset();

		if (response.status || response === 'success') {
			// Custom response handlers
			$.each(this.customResponseHandlers, (handler) => {
				handler(request, response, null, this);
			});

			this.handleSuccess(request, response);
		} else {
			let errors = response.errors || response.error || [];

			if (typeof errors === 'string') {
				errors = [{message: errors}];
			}

			// Custom response handlers
			$.each(this.customResponseHandlers, (handler) => {
				handler(request, response, errors, this);
			});

			this.handleErrorResponse(errors);
		}
	}

	/**
	* Handle failed request to server
	*
	* @param {object} request Request data
	* @param {object} response Server response
	* @protected
	*/
	handleResponseFailure(request, response) {
		// eslint-disable-next-line no-console
		console.log(response);
		let message = '';

		if (!response.responseJSON) {
			message = response.statusText;

			this.showGenericErrorMessage(message);

			return;
		}

		const errors = Object.entries(response.responseJSON.errors);

		// Custom response handlers
		$.each(this.customResponseHandlers, (handler) => {
			handler(request, response, null, this);
		});

		for (let i = 0; i < errors.length; i++) {
			const element = errors[i];
			const coma = ', ';

			message += `${element[0]} ${element[1]}${i === errors.length - 1 ? '' : coma}`;
		}

		this.showGenericErrorMessage(message);
	}

	/**
	*  Handle request errors
	*
	* @param {array} errors Errors
	* @protected
	*/
	handleErrorResponse(errors) {
		const $form = this.$form;
		let genericErr = '';

		// Convert format
		// eslint-disable-next-line no-shadow
		const err = errors.reduce((err, error) => {
			if (error.id && error.id !== this.formName) {
				const name = this.getInputName(error.id);

				// Validate that such input exists, otherwise error will be thrown
				if ($form.find(`[name="${name}"]`).length) {
					err[name] = error.message;
				}
			} else {
				// Message not associated with any input
				genericErr = error.message;
			}

			return err;
		}, {});

		// Show generic error
		if (genericErr) {
			this.showGenericErrorMessage(genericErr);
		}

		// Show error messages
		this.setErrors(err);
	}

	/**
	* Returns full input name
	*
	* @param {string} id Input id or name
	* @returns {string} Input name
	*/
	getInputName(id) {
		const formName = this.formName;
		let name = id;

		if (formName) {
			name = `${formName}[${id.replace(/^([^[]+)/, '$1]')}`;
		}

		return name;
	}

	/**
	* Handle success
	*
	* @param {object} request Request data
	* @param {object} response Server response
	* @protected
	*/
	handleSuccess(request, response) {
		const options = this.options;

		if (options.successRedirectUrl) {
			// Redirect
			document.location = options.successRedirectUrl;
		} else if (options.successReload) {
			// Reload
			document.location.reload();
		} else {
			// Show success message
			this.showSuccessMessage(request, response);
			this.$form.trigger('submit:success');
		}
	}

	/**
	* Show generic error message
	*
	* @protected
	*/
	showGenericErrorMessage(message) {
		const template = states.errorTemplate(message);

		helpers.$body.append(template.html);

		$(`[data-id="error-${template.num}"]`).last().removeClass('is-hidden');

		setTimeout(() => {
			$(`[data-id="error-${template.num}"]`).fadeOut();
		}, 5000);
	}

	/**
	* Hide generic error message
	*
	* @protected
	*/
	hideGenericErrorMessage() {
		this.$errorMessage.addClass('is-hidden');
	}

	/*
	* Success message
	* Show success message and hide content
	*
	* @protected
	*/
	showSuccessMessage() {
		const $form = this.$form;
		const $hide = $form.find('.js-form-content');
		const $show = $form.find('.js-form-success');
		const isSuccessHidden = $hide.hasClass('is-hidden');

		if (isSuccessHidden) {
			return;
		}

		$hide.addClass('is-hidden');
		$show.removeClass('is-hidden');
	}

	/**
	* Hide sucess message and show content
	*
	* @protected
	*/
	hideSuccessMessage() {
		const $form = this.$form;
		const $hide = $form.find('.js-form-success');
		const $show = $form.find('.js-form-content');
		const isSuccessHidden = $hide.hasClass('is-hidden');

		if (isSuccessHidden) {
			return;
		}

		$hide.addClass('is-hidden');
		$show.removeClass('is-hidden');
	}
}

export function formValidation($form) {
	/*
	* Define default error messages which are not in $.validator by default
	*
	* IMPORTANT, DO NOT USE FOR LOCALIZATION!!!
	* For localization define window.LOCALES.errors in .html
	*/
	$.extend($.validator.messages, validMessage[helpers.locale],
		$.validator.messages, window.LOCALES && window.LOCALES.errors);

	const getErrorElement = (element) => {
		const $element = $(element);

		return $element.closest('.input__label');
	};

	const errorHighlight = (element) => {
		const $element = getErrorElement(element);
		const $row = $element.closest('.input__group');
		const $submitBtn = $form.find('[type="submit"]');

		$submitBtn.addClass('is-disabled').attr('disabled', true).attr('title', 'Please fill in details');
		$row.removeClass('has-success').addClass('has-error');
	};

	const errorUnhighlight = (element) => {
		const $element = getErrorElement(element);
		const $row = $element.closest('.input__group');
		const $submitBtn = $form.find('[type="submit"]');

		$submitBtn.removeClass('is-disabled').attr('disabled', false).removeAttr('title');
		$row.removeClass('has-error').addClass('has-success');
	};

	const getValidationOptions = () => {
		return {
			rules: {},
		};
	};

	$form.validate($.extend({
		debug: true,
		highlight: errorHighlight,
		unhighlight: errorUnhighlight,
	}, getValidationOptions()));
}
