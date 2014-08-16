define(['bowser', 'lodash', 'modernizr', 'jquery-cookie'], function(bowser, _, modernizr) {
    var features = {
        canvas: {
            name: 'Canvas',
            type: 'recommended'
        },
        webgl: {
            name: 'WebGL',
            type: 'recommended'
        },
        smil: {
            name: 'SMIL (canvas animation)',
            type: 'recommended'
        },
        localstorage: {
            name: 'LocalStorage',
            type: 'recommended'
        }
    };

    for(var f in features) {
        if(modernizr[f]) {
            features[f].has = true;
            features[f].color = 'green';
        }
        else {
            features[f].has = false;
            features[f].color = 'red';
        }
    }

    var browserHasAllFeatures = _.every(_.map(features, function(val) {
        return val.has;
    }));

    var browsers = {
        chrome: 5.0,
        msie: 11.0,
        firefox: 5.0
    };

    var recommendedBrowsers = {
        browserName: bowser.name,
        browserVersion: bowser.version,
        browsers: [
            {
                name: 'Chrome',
                url: 'https://www.google.com/intl/en/chrome/browser/',
                message: '(Recommended)'
            },
            {
                name: 'Firefox',
                url: 'https://www.mozilla.org/en-US/firefox/new/'
            }
        ]
    };

    function checkBrowser() {
        var browserKeys = _.keys(browsers);
        var bmap = _.map(browserKeys, function(val){
            return bowser[val];
        });
        var browserListed = _.any(bmap);



        if(!browserListed) {
            console.log('browser not recognized')
            return true;
        }

        var bowserKey = browserKeys[bmap.indexOf(true)];
        // Required version is more recent than actual version
        if(browsers[bowserKey] > +bowser.version) return false;

        return true;
    }

    var browserIsCompatible = checkBrowser();


    function browserErrorMessage() {
        var tmpl = '<h1>Incompatible browser</h1>';

        tmpl += '<b><%- browserName %> <%- browserVersion %> </b> is incompatible with the visualizer<br/>';
        tmpl += 'Please update your browser to one of the following: <br/>';
        tmpl += '<ul class="browser-list"><% _.forEach(browsers, function(b) { %><li class="<%- b.name.toLowerCase() %>"><a href="<%- b.url %>"> <%- b.name %> </a> <span style="color:orange"><%- b.message %></span></li><% }); %></ul>';
        return _.template(tmpl, recommendedBrowsers);
    }

    function featureErrorMessage() {
        var tmpl = '<h1>Your browser is missing some important features </h1><br/>';


        tmpl += '<table><% _.forEach(features, function(f) { %> <tr>  <td style="width:20px; background-color: <%- f.color %>;"></td> <td> <%- f.name %>  </td></tr> <% }); %> </table><br/>';
        tmpl += '<p>We recommend updating your browser to one of the following:</p>';
        tmpl += '<ul class="browser-list"><% _.forEach(browsers, function(b) { %><li class="<%- b.name.toLowerCase() %>"><a href="<%- b.url %>"> <%- b.name %> </a> <span style="color:orange"><%- b.message %></span></li><% }); %></ul>';

        var feat = {features: _.cloneDeep(features)};
        return _.template(tmpl, _.merge(feat, recommendedBrowsers));
    }



    return {
        checkCompatibility: function() {
            return new Promise(function(resolve) {
                if(!browserIsCompatible) {
                    console.log('browser is not compatible');
                    return resolve(browserErrorMessage());
                }

                if($.cookie('visualizer-skip-feature-warning')) {
                    console.log('user does not want to see warning');
                    return resolve();
                }

                if(browserHasAllFeatures) {
                    console.log('user has all required features');
                    return resolve();
                }

                var $dialog = $('#ci-dialog');
                $dialog.html(featureErrorMessage());
                $dialog.append($('<input id="skip-warning-checkbox" type="checkbox">Don\'t show this again</input>'));
                $dialog.dialog({
                    modal: true,
                    buttons: {
                        Ok: function() {
                            $(this).dialog('close');
                            if($('#skip-warning-checkbox').is(':checked')) {
                                $.cookie('visualizer-skip-feature-warning', true);
                            }
                            resolve();
                        }
                    },
                    close: function() {
                        resolve();
                    },
                    width: 600
                });
            });

        }


    }
});
