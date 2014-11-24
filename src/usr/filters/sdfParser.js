'use strict';

define(['components/sdf-parser/dist/sdf-parser'], function (parse) {

    return {
        filter: function (dataObject, resolve, reject) {


            resolve(parse(dataObject.get()));
        }
    };
});


