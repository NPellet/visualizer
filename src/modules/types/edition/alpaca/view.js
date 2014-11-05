'use strict';

require.config({
    packages:[
        {
            name: "alpaca",
            main: "../components/alpaca/alpaca"
        }
    ]
});

define(['modules/default/defaultview', 'src/util/util', 'jquery', 'forms/button', 'lodash', 'alpaca'], function (Default, Util, $, Button, _) {

    function View() {
        this._id = Util.getNextUniqueId();
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {
            console.log('init alpaca');
        },
        inDom: function () {

        },
        initForm: function () {

        },
        update: {
            inputValue: function (value) {

            },
            schema: function (value) {

            }
        },
        renderForm: function () {

        },
        exportForm: function () {

        }
    });

    return View;

});