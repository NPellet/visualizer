'use strict';

define(['lib/chemistry/sdf-parser'], function (parse) {

    return {
        filter: function (dataObject, resolve, reject) {


            resolve(parse(dataObject.get()));
        }
    };
});


