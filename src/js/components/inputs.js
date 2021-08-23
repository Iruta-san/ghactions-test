/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-console */
/* global IMask */
import helpers from '../helpers';
import states from '../states';
import {getTranslate} from '../translate';
import modal from "./modal";

const values = [
    {
        value: 1000000,
        text: ()=>`1${helpers.$html.attr('lang') === 'ru' ? 'м' : helpers.$html.attr('lang') === 'ar' ? 'م' : 'm'}`,
    },
    {
        value: 2000000,
        text: ()=>`2${helpers.$html.attr('lang') === 'ru' ? 'м' : helpers.$html.attr('lang') === 'ar' ? 'م' : 'm'}`,
    },
    {
        value: 3000000,
        text: ()=>`3${helpers.$html.attr('lang') === 'ru' ? 'м' : helpers.$html.attr('lang') === 'ar' ? 'م' : 'm'}`,
    },
    {
        value: 4000000,
        text: ()=>`4${helpers.$html.attr('lang') === 'ru' ? 'м' : helpers.$html.attr('lang') === 'ar' ? 'م' : 'm'}`,
    },
    {
        value: 5000000,
        text: ()=>`5${helpers.$html.attr('lang') === 'ru' ? 'м' : helpers.$html.attr('lang') === 'ar' ? 'م' : 'm'}`,
    },
    {
        value: 6000000,
        text: ()=>`6${helpers.$html.attr('lang') === 'ru' ? 'м' : helpers.$html.attr('lang') === 'ar' ? 'م' : 'm'}`,
    },
    {
        value: 7000000,
        text: ()=>`7${helpers.$html.attr('lang') === 'ru' ? 'м' : helpers.$html.attr('lang') === 'ar' ? 'م' : 'm'}`,
    },
    // {
    // 	value: 8000000,
    // 	text: `8${helpers.$html.attr('lang') === 'ru' ? 'м' : helpers.$html.attr('lang') === 'ar' ? 'م' : 'm'}`,
    // },
    // {
    // 	value: 9000000,
    // 	text: `9${helpers.$html.attr('lang') === 'ru' ? 'м' : helpers.$html.attr('lang') === 'ar' ? 'م' : 'm'}`,
    // },
    // {
    // 	value: 10000000,
    // 	text: `10${helpers.$html.attr('lang') === 'ru' ? 'м' : helpers.$html.attr('lang') === 'ar' ? 'م' : 'm'}`,
    // },
];

export function fromSlider(value) {
    return Math.round(Math.pow(10, value));
}

export function toSlider(value) {
    return Math.log(value) / Math.log(10);
}

export default class Inputs {
    constructor($group) {
        this.$group = $group;
        this.$label = $group.find('.input__label');
        this.$input = $group.find('.input__input');
        this.$range = $group.find('.input__input-range');
        this.$labelPlaceholder = $group.find('.input__label-placeholder');
        this.$labelError = $group.find('.error');
        this.$viewBtn = $group.find('.js-password-view');
        this.$inputs = $group.find('.js-inputs');

        this.codesCounter = 0;

        this.setLabelWidthStyleProperty = this.setLabelWidthStyleProperty.bind(this);
        this.setLabelErrorWidthStyleProperty = this.setLabelErrorWidthStyleProperty.bind(this);
        this.viewPassword = this.viewPassword.bind(this);
        this.$inputCoins = $('#amountCoinsRange');
        this.$inputAmount = $('#amountAmountRange');
        if(this.$group.hasClass('input__calculate')) {
            this.range();
        } else if (this.$group.hasClass('is-range')) {
            this.range();
            this.markRange(this.$range);
        } else {
            this.init();
        }
    }

    // eslint-disable-next-line class-methods-use-this
    markRange($input) {
        // console.log('markRange', helpers);
        let element = $input.find('input');

        $input.find('.datalist').remove();

        if (element.attr('list') && element.attr('min') && element.attr('max') && element.attr('step')) {
            let datalist = '';
            let max = parseInt(element.attr('max'), 10);
            let min = parseInt(element.attr('min'), 10);

            for (let i = 0; i < values.length; i++) {
                const val = values[i].value;

                if (val > max) {
                    break;
                }

                datalist += `<div class="option" style="${helpers.locale==='ar' ? 'right' : 'left'}: ${(val - min) * 100 / (max - min)}%"><span>${helpers.numberWithCommas(values[i].text())}</span></div>`;
            }

            element.after(`<div class="datalist">${datalist}</div>`);
        }
    }

    range() {
        this.render();
        this.setLabelWidthStyleProperty();

        this.options = {
            coinsMax: Number(this.$inputCoins.attr('max')),
            coinsMin: Number(this.$inputCoins.attr('min')),
            amountMax: Number(this.$inputAmount.attr('max')),
            amountMin: Number(this.$inputAmount.attr('min')),
            price: Number(this.$inputAmount.data('price')),
        };

        window.addEventListener('resize', this.setLabelWidthStyleProperty);

        this.$input.on('update.inputs', (e) => {
            const val = e.currentTarget.value.split(' ').join('');

            this.setLabelWidthStyleProperty();

            $(e.currentTarget).val(helpers.numberWithCommas(val));

            this.options = {
                coinsMax: Number(this.$inputCoins.attr('max')),
                coinsMin: Number(this.$inputCoins.attr('min')),
                amountMax: Number(this.$inputAmount.attr('max')),
                amountMin: Number(this.$inputAmount.attr('min')),
                price: Number(this.$inputAmount.data('price')),
            };

            this.markRange(this.$range);

            setTimeout(() => {
                this.setLabelErrorWidthStyleProperty(e.currentTarget);
            }, 300);

            this.sliderFill($(e.currentTarget));
        });

        $('#amountCoins').on('input.inputs', (e) => {
            let val = e.currentTarget.value
                .split(' ').join('')
                .split('.').join('')
                .replace(/[^0-9\\.]/g, '');

            if (Number(val) > Number(e.currentTarget.max)) {
                e.currentTarget.value = e.currentTarget.max;

                val = e.currentTarget.max;
            }

            $(e.currentTarget).val(helpers.numberWithCommas(Number(val).toFixed(0)));

            this.amountFill(val);
        }).on('blur.inputs', (e) => {
            let val = e.currentTarget.value
                .split(' ').join('')
                .split('.').join('')
                .replace(/[^0-9\\.]/g, '');

            if (Number(val) < Number(e.currentTarget.min)) {
                e.currentTarget.value = e.currentTarget.min;

                val = e.currentTarget.min;
            }

            if (Number(val) > Number(e.currentTarget.max)) {
                e.currentTarget.value = e.currentTarget.max;

                val = e.currentTarget.max;
            }

            $(e.currentTarget).val(helpers.numberWithCommas(Number(val).toFixed(0)));

            this.amountFill(val);
        }).toggleClass('arabic', helpers.locale==='ar');

        $('#amountAmount').on('input.inputs', (e) => { // все ок
            let val = e.currentTarget.value
                .replace(/[^0-9\\.]/g, '');
                // .split(' ').join('')
                // .split('.').join('')

            if (Number(val) > Number(e.currentTarget.max)) {
                e.currentTarget.value = e.currentTarget.max;

                val = e.currentTarget.max;
            }

            $(e.currentTarget).val(helpers.numberWithCommas(Number(val).toFixed(2)));

            this.coinsFill(val);
        }).on('blur.inputs', (e) => {
            let val = e.currentTarget.value
                .replace(/[^0-9\\.]/g, '');
                // .split(' ').join('')
                // .split('.').join('')

            if (Number(val) < Number(e.currentTarget.min)) {
                e.currentTarget.value = e.currentTarget.min;

                val = e.currentTarget.min;
            }

            if (Number(val) > Number(e.currentTarget.max)) {
                e.currentTarget.value = e.currentTarget.max;

                val = e.currentTarget.max;
            }

            $(e.currentTarget).val(helpers.numberWithCommas(Number(val).toFixed(2)));

            this.coinsFill(val);
        });

        if (this.$group.hasClass('input-range')) {
            // this.sliderFill(this.$range.find('input'));
            this.$range.find('input').on('input', (e) => {
                this.sliderFill($(e.currentTarget));
            });
        }
    }

    init() {
        this.render();
        this.setLabelWidthStyleProperty();

        window.addEventListener('resize', this.setLabelWidthStyleProperty);

        helpers.$body.on('mouseenter.inputs', 'fieldset, label, input, select, textarea', (e) => {
            $(e.target).closest('.input__group').addClass('has-hovered');
        })
            .on('mouseleave.inputs', 'fieldset, label, input, select, textarea', (e) => {
                $(e.target).closest('.input__group').removeClass('has-hovered');
            })
            .on('click.inputs', '.input__code-btn', (e) => {
                $(e.currentTarget).closest('.input__label').find('.input__input').removeClass('is-disabled').attr('disabled', false);
                $(e.currentTarget).closest('.input__code').remove();
            });

        this.$inputs.on('input.inputs', (e) => {
            if (e.target.value.length < e.target.minLength) {
                $(e.target).parent().next('.input__least').addClass('input__least--error').removeClass('input__least--success');
            } else {
                $(e.target).parent().next('.input__least').addClass('input__least--success').removeClass('input__least--error');
            }
        });

        this.$input.on('update.inputs', (e) => {
            this.setLabelWidthStyleProperty();

            setTimeout(() => {
                this.setLabelErrorWidthStyleProperty(e.target);
            }, 300);
        })
            .on('keyup.inputs', (e) => {
                setTimeout(() => {
                    this.setLabelErrorWidthStyleProperty(e.target);
                }, 300);
            })
            .on('change.inputs focus.inputs', (e) => {
                $(e.target).closest('.input__group').addClass('has-focused');
            })
            .on('blur.inputs', (e) => {
                $(e.target).closest('.input__group').removeClass('has-focused');
                this.setLabelErrorWidthStyleProperty(e.target);
            })
            .on('input.inputs', (e) => {
                if ($(e.target).closest('.input__label--codes').length) {
                    const target = e.currentTarget;
                    const regex = /^[0-9]+$/;
                    const $span = $(target).siblings('.input__input--masked');

                    if (target.value.match(regex) === null) {
                        target.value = target.value.slice(0, -1);

                        if (target.value.length < 1) {
                            $span.addClass('is-placeholder').html($(target).attr('placeholder'));
                            $(target).attr('required', false);

                            return;
                        }

                        return;
                    }

                    if ($(target).attr('required')) {
                        $(target).attr('required', false);
                    }

                    if (target.value.length > 0) {
                        $span.removeClass('is-placeholder');
                    } else {
                        $span.addClass('is-placeholder').html($(target).attr('placeholder'));
                        $(target).attr('required', true);

                        return;
                    }

                    if (target.value.length === 8) {
                        $(target).closest('.input__group').removeClass('has-error');
                        $(target).siblings('.error').remove();
                        $(target).siblings('.js-input-codes').append(states.inputCode(target.value, helpers.numberWithCommas4(target.value)));
                        $(target).trigger('focus');
                        target.value = '';
                        $span.html($(target).attr('placeholder')).addClass('is-placeholder');
                        this.codesCounter += 1;

                        return;
                    }

                    if ($(target).closest('.input__label--codes').data('length') <= this.codesCounter) {
                        $(target).addClass('is-disabled').attr('disabled', true);
                        target.value = '';
                    }

                    $span.html(helpers.numberWithCommas4(target.value));
                }
            })
            .each((i, el) => {
                this.setLabelErrorWidthStyleProperty(el);
            });

        if (this.$viewBtn.length) {
            this.$viewBtn.on('click.inputs', (e) => {
                this.viewPassword($(e.currentTarget));
            });
        }
    }

    destroy() {
        helpers.$body.off('.inputs');
        this.$input.off('.inputs');
        this.$inputs.off('.inputs');
        $('#amountAmount').off('.inputs');
        $('#amountCoins').off('.inputs');
        this.$label.find('.input__label-placeholder--reference, .input__borders').remove();
    }

    amountFill(value) {
        const coinsValue = Number(value);
        const amountValue = Number(value) * this.options.price;

        this.$inputCoins.val(Number(coinsValue).toFixed(0));
        this.$inputAmount.val(Number(amountValue).toFixed(2));
        this.$inputAmount.closest('.input__label').find('.input__input').val(helpers.numberWithCommas(Number(amountValue).toFixed(2)));

        this.$inputCoins.siblings('.slider-fill-lower').css('width', `${(coinsValue - this.options.coinsMin) * 100 / (this.options.coinsMax - this.options.coinsMin)}%`);
        this.$inputCoins.siblings('.slider-fill-upper').css('width', `${100 - (coinsValue - this.options.coinsMin) * 100 / (this.options.coinsMax - this.options.coinsMin)}%`);

        this.$inputAmount.siblings('.slider-fill-lower').css('width', `${(amountValue - this.options.amountMin) * 100 / (this.options.amountMax - this.options.amountMin)}%`);
        this.$inputAmount.siblings('.slider-fill-upper').css('width', `${100 - (amountValue - this.options.amountMin) * 100 / (this.options.amountMax - this.options.amountMin)}%`);
    }

    coinsFill(value) {
        const coinsValue = Number(value) / this.options.price;
        const amountValue = Number(value);

        this.$inputCoins.val(Number(coinsValue).toFixed(0));
        this.$inputAmount.val(Number(amountValue).toFixed(0));
        this.$inputCoins.closest('.input__label').find('.input__input').val(helpers.numberWithCommas(Number(coinsValue).toFixed(0)));

        this.$inputCoins.siblings('.slider-fill-lower').css('width', `${(coinsValue - this.options.coinsMin) * 100 / (this.options.coinsMax - this.options.coinsMin)}%`);
        this.$inputCoins.siblings('.slider-fill-upper').css('width', `${100 - (coinsValue - this.options.coinsMin) * 100 / (this.options.coinsMax - this.options.coinsMin)}%`);

        this.$inputAmount.siblings('.slider-fill-lower').css('width', `${(amountValue - this.options.amountMin) * 100 / (this.options.amountMax - this.options.amountMin)}%`);
        this.$inputAmount.siblings('.slider-fill-upper').css('width', `${100 - (amountValue - this.options.amountMin) * 100 / (this.options.amountMax - this.options.amountMin)}%`);
    }

    sliderFill($el) {
        if (this.$inputCoins.length && this.$inputAmount.length) {
            const value = $el.val().split(' ').join('');
            let coinsValue = '';
            let amountValue = '';

            if ($el.data('input') === 'amount') {
                coinsValue = (Number(value) / this.options.price).toFixed(0);
                amountValue = Number(value).toFixed(2);
            } else {
                coinsValue = Number(value).toFixed(0);
                amountValue = (Number(value) * this.options.price).toFixed(2);
            }

            // кустарным способом избавляемся от суммы меньше 1000
            // coinsValue = Number(Math.min(coinsValue / 1000)).toFixed(0) * 1000;

            this.$inputCoins.val(coinsValue);
            this.$inputCoins.closest('.input__label').find('.input__input').val(coinsValue);

            this.$inputAmount.val(amountValue);
            this.$inputAmount.closest('.input__label').attr('data-char', helpers.currency).find('.input__input').val(helpers.numberWithCommas(amountValue));

            this.$inputCoins.siblings('.slider-fill-lower').css('width', `${(coinsValue - this.options.coinsMin) * 100 / (this.options.coinsMax - this.options.coinsMin)}%`);
            this.$inputCoins.siblings('.slider-fill-upper').css('width', `${100 - (coinsValue - this.options.coinsMin) * 100 / (this.options.coinsMax - this.options.coinsMin)}%`);

            this.$inputAmount.siblings('.slider-fill-lower').css('width', `${(amountValue - this.options.amountMin) * 100 / (this.options.amountMax - this.options.amountMin)}%`);
            this.$inputAmount.siblings('.slider-fill-upper').css('width', `${100 - (amountValue - this.options.amountMin) * 100 / (this.options.amountMax - this.options.amountMin)}%`);
        }

        this.thousandsSeparator();
    }

    // eslint-disable-next-line class-methods-use-this
    thousandsSeparator() {
        const $input = $('.input-thousands');

        $input.each((i, el) => {
            $(el).val(helpers.numberWithCommas(el.value.split(' ').join('')));
        });
    }

    setLabelWidthStyleProperty() {
        if (this.$label) {
            const width = this.$labelPlaceholder.width();

            this.$group.css('--label-active-width', `${width}px`);
        } else {
            this.$group.css('--label-active-width', '0px');
        }
    }

    // eslint-disable-next-line class-methods-use-this
    setLabelErrorWidthStyleProperty(element) {
        const $element = $(element).closest('.input__label');
        const $row = $element.closest('.input__group');

        if ($element.find('.error').length) {
            let width = $element.find('.error').width();

            if (width < 1) {
                width = -16;
            }

            $row.css('--label-error-width', `${width}px`);
        } else {
            $row.css('--label-error-width', '-16px');
        }
    }

    render() {
        return this.$label.append(`
		<span class="input__label-placeholder input__label-placeholder--reference">${this.$labelPlaceholder.text()}</span>
		<div class="input__borders">
			<div class="input__border input__border-left"></div>
			<div class="input__border input__border-middle">
				<div class="input-top__borders">
					<div class="input__border input__border-start"></div>
					<div class="input__border input__border-end"></div>
				</div>
				<div class="input-bottom__borders">
					<div class="input__border input__border-start"></div>
					<div class="input__border input__border-end"></div>
				</div>
			</div>
			<div class="input__border input__border-right"></div>
		</div>`);
    }

    // eslint-disable-next-line class-methods-use-this
    viewPassword($button) {
        const input = $button.siblings('input');

        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            $button.addClass('is-active').attr('title', getTranslate[helpers.locale].hidePassword);
        } else {
            input.attr('type', 'password');
            $button.removeClass('is-active').attr('title', getTranslate[helpers.locale].seePassword);
        }
    }
}
