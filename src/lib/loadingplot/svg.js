'use strict';

define(function () {

    function SVG(width, height, viewWidth, viewHeight, navigation) {
        this._nameSpace = 'http://www.w3.org/2000/svg';
        this._px = 'px';
        this.navigation = navigation;
        this.zonesDone = [];

        this.zoomChangeCallback = $.Callbacks();
        this.moveCallback = $.Callbacks();


        this._els = [];
        this._viewBox = [];
        this._svgEl = document.createElementNS(this._nameSpace, 'svg');
        this._svgEl.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        this._svgEl.setAttribute('draggable', 'true');
        this._svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');


        this._groupElements = document.createElementNS(this._nameSpace, 'g');
        this._svgEl.appendChild(this._groupElements);

        this._groupLabels = document.createElementNS(this._nameSpace, 'g');
        this._svgEl.appendChild(this._groupLabels);

        if (this.navigation) {
            this.navRect = document.createElementNS(this._nameSpace, 'rect');
            this.navRect.setAttribute('stroke', 'red');
            this.navRect.setAttribute('fill', 'none');

            this._svgEl.appendChild(this.navRect);
        }
    }

    SVG.prototype.create = function () {
        this.deltaZoom(0, 0, 0);
        this._setEvents();
    };

    SVG.prototype.remove = function () {
        this._svgEl.parentElement.removeChild(this._svgEl);
    };

    SVG.prototype.setViewBoxWidth = function (x, y, w, h, force) {
        this._viewWidth = w;
        this._viewHeight = h;

        this._viewBox = [x, y, this._viewWidth, this._viewHeight];

        this.zones = [];
        this.initZoom();
    };

    SVG.prototype.onZoomChange = function (clbk) {
        this.zoomChangeCallback.add(clbk);
    };

    SVG.prototype.onMove = function (clbk) {
        this.moveCallback.add(clbk);
    };

    SVG.prototype.setSize = function (width, height) {
        this._width = width;
        this._height = height;

        this._svgEl.setAttribute('width', width + this._px);
        this._svgEl.setAttribute('height', height + this._px);


        this.initZoom();
    };

    SVG.prototype.initZoom = function () {
        if (!this._viewBox[2]) {
            return;
        }

        var rX = this._width / this._viewBox[2];
        var rY = this._height / this._viewBox[3];

        var zoom = Math.min(rY, rX);
        this._zoom = zoom;
        this._izoom = zoom;
        this._zoomMode = zoom == rY ? 'y' : 'x';

        if (this._zoomMode == 'y') {
            if (!this._width) {
                return;
            }
            this._viewBox[2] = this._width / rY;
            this._viewWidth = this._viewBox[2];
        } else {
            if (!this._height) {
                return;
            }
            this._viewBox[3] = this._height / rX;
            this._viewHeight = this._viewBox[3];
        }

        this.setViewBox(true);
    };

    SVG.prototype.bindTo = function (dom) {
        this._wrapper = dom;
    };

    SVG.prototype.ready = function () {
        $(this._wrapper).append(this._svgEl);
        this.setViewBox(true);
        var pos = $(this._svgEl).offset();
        var self = this;
        $(this._svgEl).on('mouseenter', '[class=highlightgroup]', function () {
            var id = $(this).data('id');
            self._els[id].mouseover();
        }).on('mouseout', '[class=highlightgroup]', function () {
            var id = $(this).data('id');
            self._els[id].mouseout();
        });

        this._svgPosX = pos.left;
        this._svgPosY = pos.top;
        this.doZones();
    };

    SVG.prototype._setEvents = function () {

        if (this.navigation) {
            return;
        }

        var self = this;
        $(this._svgEl).mousewheel(function (event, delta) {
            self.deltaZoom((event.pageX - self._svgPosX) / self._width, (event.pageY - self._svgPosY) / self._height, delta);
            return false;
        });
        this._svgEl.addEventListener('mousedown', function (event) {
            self._dragStart(event);
        });
        this._svgEl.addEventListener('mouseup', function (event) {
            self._dragStop(event);
        });
        this._svgEl.addEventListener('mousemove', function (event) {
            self._dragMove(event);
        });
    };

    SVG.prototype._dragStart = function (event) {
        this._dragging = true;
        this._dragX = event.pageX;
        this._dragY = event.pageY;
    };

    SVG.prototype._dragMove = function (event) {

        if (!this._dragging) {
            return;
        }

        var newX = event.pageX, diffX = (newX - this._dragX);
        var newY = event.pageY, diffY = (newY - this._dragY);

        var ratioX = diffX / this._zoom, ratioY = diffY / this._zoom;
        var diffXViewbox = ratioX/* * this._viewBox[2]*/;
        var diffYViewbox = ratioY/* * this._viewBox[3]*/;

        this._viewBox[0] -= diffXViewbox;
        this._viewBox[1] -= diffYViewbox;

        this.moveCallback.fire(this._viewBox[0] + (this._viewBox[2] / 2), this._viewBox[1] + (this._viewBox[3] / 2));

        this._dragX = newX;
        this._dragY = newY;
        this.setViewBox();
        this.doZones();
    };

    SVG.prototype.setCenter = function (x, y) {

        this._viewBox[0] = x - (this._viewBox[2] / 2);
        this._viewBox[1] = y - (this._viewBox[3] / 2);
        this.setViewBox();

        if (this.navigation) {
            return;
        }

        this.moveCallback.fire(this._viewBox[0] + (this._viewBox[2] / 2), this._viewBox[1] + (this._viewBox[3] / 2));
        this.doZones();
    };

    SVG.prototype.setZoom = function (zoom01) {
        this.deltaZoom(0.5, 0.5, null, Math.pow(2.71828182846, (zoom01 * 3.68887945411394 - 0.693147180559945)) * this._izoom);
    };

    SVG.prototype._dragStop = function () {
        this._dragging = false;
    };

    SVG.prototype.deltaZoom = function (x, y, delta, abs) {
        if (delta !== null) {
            if (Math.abs(delta) >= 1)
                delta = delta < 0 ? -0.5 : 0.25;

            if (!this._currentDelta) {
                this._currentDelta = 0;
                this._accumulatedDelta = 0;
            }
            var parent = this._svgEl.parentNode;
            this._currentDelta += delta;
        } else {
            delta = 0;

            this._zoom = abs;
            if (this._zoomMode == 'y') {
                var boxWidthY = this._height / this._zoom;
                this._currentDelta = Math.log(boxWidthY / this._viewHeight) / Math.log(2);
            } else {
                var boxWidthX = this._width / this._zoom;
                this._currentDelta = Math.log(boxWidthX / this._viewWidth) / Math.log(2);
            }

            if (isNaN(this._currentDelta)) {
                this._currentDelta = 0;
                return;
            }
        }

        var boxWidthX = this._viewWidth * Math.pow(2, this._currentDelta);
        var boxWidthY = this._viewHeight * Math.pow(2, this._currentDelta);

        var _zoom = (this._zoomMode == 'y') ? this._height / boxWidthY : this._width / boxWidthX;
        if (_zoom / this._izoom < 0.5) {
            this._currentDelta -= delta;
            return;
        }

        if (_zoom / this._izoom > 20) {
            this._currentDelta -= delta;
            return;
        }
        this._zoom = _zoom;

        this._viewBox[0] -= x * (boxWidthX - this._viewBox[2]);
        this._viewBox[1] -= y * (boxWidthY - this._viewBox[3]);
        this._viewBox[2] = boxWidthX;
        this._viewBox[3] = boxWidthY;
        this.setViewBox();

        if (this.navigation)
            return;

        this.moveCallback.fire(this._viewBox[0] + (this._viewBox[2] / 2), this._viewBox[1] + (this._viewBox[3] / 2));
        this.zoomChangeCallback.fire(((Math.log(this._zoom / this._izoom) + 0.693147180559945) / 3.68887945411394));
        this.changeZoomElements(this._zoom);
        this.timeSpringUpdate(200);
    };

    SVG.prototype.timeSpringUpdate = function (timing) {
        window.clearTimeout(this._timeoutZoom);
        this._timeoutZoom = window.setTimeout(function () {
            // FIXME wtf ?
            //LoadingPlot.SVGElement.prototype.Springs.resolve();
        }, timing);
    };

    SVG.prototype.getViewBox = function () {
        return this._viewBox;
    };

    SVG.prototype.setViewBox = function (force, x1, y1, x2, y2) {

        if (x1 && x2 && y1 && y2)
            this._viewBox = [x1, y1, x2, y2];

        if (this.navigation && !force) {

            this.navRect.setAttribute('x', this._viewBox[0]);
            this.navRect.setAttribute('y', this._viewBox[1]);
            this.navRect.setAttribute('width', this._viewBox[2]);
            this.navRect.setAttribute('height', this._viewBox[3]);
        } else {
            this._svgEl.setAttributeNS(null, 'viewBox', this._viewBox.join(' '));
        }
    };

    SVG.prototype.doZones = function () {

        var minX = Math.floor(20 * this._viewBox[0] / this._viewWidth) - 2;
        var minY = Math.floor(20 * this._viewBox[1] / this._viewHeight) - 2;
        var nbX = Math.ceil(20 * this._viewBox[2] / this._viewWidth) + 2;
        var nbY = Math.ceil(20 * this._viewBox[3] / this._viewWidth) + 2;

        this._zoneMinX = minX;
        this._zoneMinY = minY;
        this._zoneNbX = nbX;
        this._zoneNbY = nbY;

        for (var i = 0; i <= nbX; i++) {
            for (var j = 0; j <= nbY; j++) {
                var index = (i + minX) * 1000 + j + minY;
                if (this.zonesDone[index])
                    continue;
                if (this.zones[i + minX] && this.zones[i + minX][j + minY])
                    for (var k = 0; k < this.zones[i + minX][j + minY].length; k++)
                        this.zones[i + minX][j + minY][k].changeZoom(this._zoom);
                this.zonesDone[index] = true;
            }
        }
    };

    SVG.prototype.changeZoomElements = function (newZoom) {

        this._zoom = newZoom;
        this.zonesDone = [];
        this.doZones();

    };

    SVG.prototype.add = function (el) {
        this._els.push(el);
        var _x = el.getX(), _y = el.getY();

        var indexX = Math.floor(20 * _x / this._viewWidth);
        var indexY = Math.floor(20 * _y / this._viewHeight);

        this.zones[indexX] = this.zones[indexX] || [];
        this.zones[indexX][indexY] = this.zones[indexX][indexY] || [];
        this.zones[indexX][indexY].push(el);

        el.id = this._els.length - 1;
        el.zoneIndexX = indexX;
        el.zoneIndexY = indexY;

        if (!el._nodes)
            return;
        for (var i in el._nodes)
            this._groupElements.appendChild(el._nodes[i]);

        if (el._label)
            this._groupLabels.appendChild(el._label);
        el.inDom();
    };

    SVG.prototype.getElementsForSprings = function () {

        this._zoneNbX = 20;
        this._zoneNbY = 20;
        this._zoneMinX = 0;
        this._zoneMinY = 0;
        var coords = [], labels = [], el;
        for (var i = 0; i <= this._zoneNbX; i++) {
            for (var j = 0; j <= this._zoneNbY; j++) {
                if (this.zones[i + this._zoneMinX] && this.zones[i + this._zoneMinX][j + this._zoneMinY]) {
                    for (var k = 0; k < this.zones[i + this._zoneMinX][j + this._zoneMinY].length; k++) {
                        if (el = this.zones[i + this._zoneMinX][j + this._zoneMinY][k].getCoordsSprings(coords)) {
                            labels.push(el);
                        }
                    }
                }
            }
        }

        return [coords, labels];

    };

    return SVG;

});
