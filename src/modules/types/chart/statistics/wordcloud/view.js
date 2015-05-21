'use strict';

define(['modules/default/defaultview', 'src/util/util', 'src/util/ui', 'lib/d3/d3.layout.cloud'], function (Default, Util, ui, d3) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {
            this._id = Util.getNextUniqueId();
            this.dom = ui.getSafeElement('div')
                .attr('id', this._id)
                .attr('class', 'layout-cloud');
            this.module.getDomContent().html(this.dom);
        },
        blank: {
            textvalue: function () {
                this.dom.empty();
            }
        },
        update: {
            textvalue: function (value) {
                if (!value.get()) {
                    return;
                }
                value = value.get();
                this.redrawChart(value);
            }
        },
        onActionReceive: {
        },
        inDom: function () {
            this.resolveReady();
        },
        onResize: function () {
            if (this.parcoords) {
                this.parcoords.width(this.width).height(this.height).resize().render();
            }
        },
        redrawChart: function (mytext) {
            //####### BEGIN VARS ########
            var that = this;
            var fill = d3.scale.category20b();
            var w = this.width,
                h = this.height;
            var tags, fetcher;
            var fontSize;
            var words = [];

            var unicodePunctuationRe = '!-#%-*,-/:;?@\\[-\\]_{}¡§«¶·»¿;·՚-՟։֊־׀׃׆׳״؉؊،؍؛؞؟٪-٭۔܀-܍߷-߹࠰-࠾࡞।॥॰૰෴๏๚๛༄-༒༔༺-༽྅࿐-࿔࿙࿚၊-၏჻፠-፨᐀᙭᙮᚛᚜᛫-᛭᜵᜶។-៖៘-៚᠀-᠊᥄᥅᨞᨟᪠-᪦᪨-᪭᭚-᭠᯼-᯿᰻-᰿᱾᱿᳀-᳇᳓‐-‧‰-⁃⁅-⁑⁓-⁞⁽⁾₍₎〈〉❨-❵⟅⟆⟦-⟯⦃-⦘⧘-⧛⧼⧽⳹-⳼⳾⳿⵰⸀-⸮⸰-⸻、-〃〈-】〔-〟〰〽゠・꓾꓿꘍-꘏꙳꙾꛲-꛷꡴-꡷꣎꣏꣸-꣺꤮꤯꥟꧁-꧍꧞꧟꩜-꩟꫞꫟꫰꫱꯫﴾﴿︐-︙︰-﹒﹔-﹡﹣﹨﹪﹫！-＃％-＊，-／：；？＠［-］＿｛｝｟-･';

            var stopWords = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/;
            var punctuation = new RegExp('[' + unicodePunctuationRe + ']', 'g');
            var wordSeparators = /[ \f\n\r\t\v\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g;
            var discard = /^(@|https?:|\/\/)/;
            
            var svg = d3.select('#' + this._id).append('svg')
                .attr('width', w)
                .attr('height', h)
                .style('display', 'block');

            var background = svg.append('g'),
                vis = svg.append('g')
                    .attr('transform', 'translate(' + [w >> 1, h >> 1] + ')');

            //####### END VARS ########

            //####### BEGIN FUNCTIONS ########
            var layout = d3.layout.cloud()
                .timeInterval(10)
                .size([w, h])
                .fontSize(function (d) {
                    return fontSize(+d.value);
                })
                .text(function (d) {return d.key; })
                .on('end', draw);
            
            function parseText(text) {
                tags = {};
                var cases = {};

                text.split(that.module.getConfigurationCheckbox('oneWordPerLine') ? /\n/g : wordSeparators).forEach(function (word) {
                    if (discard.test(word)) return;
                    word = word.replace(punctuation, '');
                    if (stopWords.test(word.toLowerCase())) return;
                    cases[word.toLowerCase()] = word;
                    tags[word = word.toLowerCase()] = (tags[word] || 0) + 1;
                });
                tags = d3.entries(tags).sort(function (a, b) { return b.value - a.value; });
                tags.forEach(function (d) { d.key = cases[d.key]; });
                generate();
            }

            function generate() {
                layout
                    .spiral(that.module.getConfiguration('spiral'));
                fontSize = d3.scale[that.module.getConfiguration('scale')]().range([10, 100]);
                if (tags.length) fontSize.domain([+tags[tags.length - 1].value || 1, +tags[0].value]);
                words = [];
                layout.stop().words(tags).start();
            }

            function draw(data, bounds) {
                var scale = bounds ? Math.min(
                    w / Math.abs(bounds[1].x - w / 2),
                    w / Math.abs(bounds[0].x - w / 2),
                    h / Math.abs(bounds[1].y - h / 2),
                    h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;
                words = data;
                var text = vis.selectAll('text')
                    .data(words, function (d) { return d.text.toLowerCase(); });
                text.transition()
                    .duration(1000)
                    .attr('transform', function (d) { return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')'; })
                    .style('font-size', function (d) { return d.size + 'px'; });
                text.enter().append('text')
                    .attr('text-anchor', 'middle')
                    .attr('transform', function (d) { return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')'; })
                    .style('font-size', '1px')
                    .transition()
                    .duration(1000)
                    .style('font-size', function (d) { return d.size + 'px'; });
                text.style('font-family', function (d) { return d.font; })
                    .style('fill', function (d) { return fill(d.text.toLowerCase()); })
                    .text(function (d) { return d.text; });
                var exitGroup = background.append('g')
                    .attr('transform', vis.attr('transform'));
                var exitGroupNode = exitGroup.node();
                text.exit().each(function () {
                    exitGroupNode.appendChild(this);
                });
                exitGroup.transition()
                    .duration(1000)
                    .style('opacity', 1e-6)
                    .remove();
                vis.transition()
                    .delay(1000)
                    .duration(750)
                    .attr('transform', 'translate(' + [w >> 1, h >> 1] + ')scale(' + scale + ')');
            }

            //####### END FUNCTIONS ########

            parseText(mytext);
        }
    });

    return View;

});
