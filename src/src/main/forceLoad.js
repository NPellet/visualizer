'use strict';

// force loading of important dynamic files to put them in the build
define([
    // headers
    'src/header/components/blankview',
    'src/header/components/copydata',
    'src/header/components/copyview',
    'src/header/components/couchshare',
    'src/header/components/default',
    'src/header/components/feedback',
    'src/header/components/pastedata',
    'src/header/components/pasteview',

    'src/util/sandbox',
    'src/util/searchBox',

    'modules/default/defaultcontroller',
    'modules/default/defaultmodel',
    'modules/default/defaultview',

    'modules/types/client_interaction/code_executor/controller',
    'modules/types/client_interaction/code_executor/model',
    'modules/types/client_interaction/code_executor/view',
    'modules/types/display/single_value/controller',
    'modules/types/display/single_value/model',
    'modules/types/display/single_value/view',
    'modules/types/edition/slick_grid/controller',
    'modules/types/edition/slick_grid/model',
    'modules/types/edition/slick_grid/view',

    //'lib/forms/fieldelement',
    //'lib/forms/fieldlistelement',
    //'lib/forms/types/checkbox/element',
    //'lib/forms/types/checkbox/list',
    //'lib/forms/types/checkbox/table',
    //'lib/forms/types/combo/element',
    //'lib/forms/types/combo/table',
    //'lib/forms/types/jscode/element',
    //'lib/forms/types/jscode/list',
    //'lib/forms/types/text/element',
    //'lib/forms/types/text/list',
    //'lib/forms/types/text/table'
], function () {
    return {};
});
