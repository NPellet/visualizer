'use strict';

define(['require', 'jquery', 'forms/title'], function (require, $, Title) {

    var id = 0;
    var stack = {};

    $(document).on('click', '.form-button', function (event) {
        var btn = stack[$(this).data('id')];
        if (btn && !btn.isDisabled()) {
            btn.doClick(event, $(this));
        }
    });

    class Button {
        constructor(label, onclick, options) {
            this.title = new Title(label);
            this.onclick = onclick;
            this.id = ++id;
            this.options = options || {};

            if (this.options.value) {
                this.value = this.options.value;
            }
            else {
                this.value = false;
            }

            this.color = this.options.color;
            stack[this.id] = this;
        }

        getTitle() {
            return this.title;
        }

        setTitle(objtitle) {

            if (!( objtitle instanceof Title )) {
                objtitle = new Title(objtitle);
            }

            this.title = objtitle;
            this.applyStyle();
            return this;
        }

        getId() {
            return this.id;
        }

        setOnClick(func) {
            this.onclick = func;
        }

        setColor(color) {
            // Color is a class name
            this.oldColor = this.color;
            this.color = color;
            this.applyStyle();
        }

        setColorCss(color) {
            this.dom.css('color', color);
            return this;
        }

        setValue(val) {
            this.value = val;
            return this;
        }

        setIcon(icon) {
            this.icon = icon;
            return this;
        }

        setTooltip(tooltip) {
            this.tooltip = tooltip;
            this.applyStyle();
            return this;
        }

        getTooltip() {
            return this.tooltip;
        }

        render() {
            var html = '';
            html += '<button type="button" class="form-button';
            html += '" data-id="';
            html += this.id;
            html += '" id="button-' + this.id + '"><span /><span />';
            html += '</button>';

            this.dom = $(html);

            this.applyStyle();
            return this.dom;
        }

        applyStyle() {
            if (!this.dom) {
                return;
            }

            if (this.tooltip) {
                this.dom.attr('title', this.tooltip);
            }
            else {
                this.dom.attr('title');
            }

            if (this.color) {
                this.dom.removeClass(this.oldColor);
                this.dom.addClass(this.color);
            }

            if (this.options.disabled) {
                this.dom.addClass('disabled');
            } else {
                this.dom.removeClass('disabled');
            }

            if (this.options.hidden) {
                this.dom.addClass('hidden');
            } else {
                this.dom.removeClass('hidden');
            }

            if (this.options.checkbox) {
                if (this.value) {
                    this.dom.addClass('bi-active');
                } else {
                    this.dom.removeClass('bi-active');
                }
            }

            this.dom.children().eq(1).html(this.title.getLabel());

            if (this.icon) {
                this.dom.children().eq(0).html('<img src="' + require.toUrl('./images/' + this.icon + '.png') + '" />');
            }

        }

        doClick(event, item) {
            this.value = !this.value;
            this.applyStyle();
            if (this.onclick) this.onclick(event, this.value, item);
        }

        getDom() {
            if (!this.dom) {
                console.warn('The button dom has not been created yet');
                return;
            }
            return this.dom;
        }

        disable() {
            if (this.isDisabled()) return;
            this.options.disabled = true;
            this.applyStyle();
        }

        enable() {
            if (!this.isDisabled()) return;
            this.options.disabled = false;
            this.applyStyle();
        }

        isDisabled() {
            return !!this.options.disabled;
        }

        isHidden() {
            return !!this.options.hidden;
        }

        hide() {
            if (this.isHidden()) return;
            this.options.hidden = true;
            this.applyStyle();
        }

        show() {
            if (!this.isHidden()) return;
            this.options.hidden = false;
            this.applyStyle();
        }
    }

    return Button;
});
