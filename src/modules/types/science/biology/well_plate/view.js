'use strict';


define(['modules/default/defaultview', 'src/util/api', 'src/util/color'], function (Default, API, Color) {
  function View() {
  }
  
  $.extend(true, View.prototype, Default, {
    
    init: function () {
      let html = [];
      html.push('<div></div>');
      this.dom = $(html.join(''));
      this.module.getDomContent().html(this.dom);
    },
    
    blank: {
      wellsList: function () {
        this.plate = null;
        this.wellsList = null;
        API.killHighlight(this.module.getId());
        this.dom.empty();
      },
      plateSetup: function () {
        this.plateSetup = null;
        API.killHighlight(this.module.getId());
        this.dom.empty();
      }
    },

    inDom: function () {
      const that = this;
      this.dom.on('mouseenter mouseleave click', 'td', function (event) {
        const wellsList = that.wellsList;
        const plate = $(this).parents(':eq(3)').index();
        const trIndex = $(this).parent().index();
        const tdIndex = $(this).index();
        const cols = that.cols;
        const rows = that.rows;
        const direction = that.module.getConfiguration('direction', 'vertical') || 'vertical';
        const elementId = direction === 'vertical' ?
          (plate * cols * rows) + tdIndex * rows + trIndex :
          (plate * cols * rows) + trIndex * cols + tdIndex;
        if (!wellsList[elementId]) return;
        let highlight = wellsList[elementId]._highlight;
        if (event.type === 'mouseenter') {
          that.module.controller.createDataFromEvent(
            'onTrackMouse',
            'trackData',
            wellsList[elementId],
          );
          that.module.controller.sendActionFromEvent(
            'onTrackMouse',
            'trackData',
            wellsList[elementId],
          );
          that.module.controller.sendActionFromEvent(
            'onTrackMouse',
            'mouseEvent',
            event,
          );
          that.module.controller.sendActionFromEvent(
            'onTrackMouse',
            'dataAndEvent',
            {
              data: wellsList[elementId],
              event: event,
            },
          );
          API.highlight([highlight], 1);
        } else if (event.type === 'mouseleave') {
          API.highlight([highlight], 0);
        } else if (event.type === 'click') {
          that.module.controller.createDataFromEvent(
            'onTrackClick',
            'trackData',
            wellsList[elementId],
          );
          that.module.controller.sendActionFromEvent(
            'onTrackClick',
            'trackData',
            wellsList[elementId],
          );
          that.module.controller.sendActionFromEvent(
            'onTrackClick',
            'mouseEvent',
            event,
          );
          that.module.controller.sendActionFromEvent(
            'onTrackClick',
            'dataAndEvent',
            {
              data: wellsList[elementId],
              event: event,
            },
          );
        }
      });
      this.resolveReady();
    },

    update: {
      wellsList: function (moduleValue) {
        const cfg = this.module.getConfiguration;
        let colNumber = cfg('colnumber') || 10;
        let rowNumber = cfg('rownumber') || 10;
        let style = cfg('shape') || 'aligned';
        let direction = cfg('direction') || 'vertical';
        const colorJpath = cfg('colorjpath', false);
        const wellsList = moduleValue.get();
        const colorOptions = cfg('colorOptions');
        this.wellsList = wellsList;
        let shape;
        switch (style) {
          case 'aligned': {
            shape = {
              shift: false,
              margin: undefined,
            };
            break;
          }
          case 'pairShifted': {
            shape = {
              margin: true,
              index: 0,
            };
            break;
          }
          case 'oddShifted': {
            shape = {
              margin: true,
              index: 1,
            };
            break;
          }
        }
        const wellLabels = createWellLabels({
          cols: colNumber,
          rows: rowNumber
        }, 10, { direction: direction });
        const labelsList = wellLabels.wellLabels;
        const axis = wellLabels.axis;
        const nbRows = axis.filter((x) => x[0] === 'rows')[0][1].length;
        const nbColumns = axis.filter((x) => x[0] === 'cols')[0][1].length;
        this.rows = nbRows;
        this.cols = nbColumns;
        const nbPlate = Math.ceil(wellsList.length / (nbRows * nbColumns));
        const tables = this.buildGrid(wellsList, labelsList, nbPlate, nbRows, nbColumns, direction, shape);
        this.dom.html(tables);
        const tableNodes = this.dom.find(':eq(0)').children();
        let grid = [];
        for (let u = 0; u < tableNodes.length; u++) {
          let tr = $(tableNodes[u]).find(':eq(1)').children();
          let td = $(tr[0]).children();
          let [rows, columns] = direction === 'vertical' ?
            [td.length, tr.length] : [tr.length, td.length];
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
              let [a, b] = direction === 'vertical' ?
                [j, i] : [i, j];
              grid.push({
                index: (a * rows) + b,
                value: tr[a].childNodes[b]
              });
            }
          }
        }
        if (colorOptions === 'colorByJpath') {
          let arrayPath = colorJpath.split('.');
          arrayPath.shift();
          arrayPath = arrayPath.join('.');
          let jpathItems = [];
          moduleValue.filter(function (item) {
            let previous = arrayPath.split('.');
            if (previous.length !== 1) {
              previous.pop();
              previous = previous.join('.');
            }
            let value = eval(`item.${previous}`) ? eval(`item.${arrayPath}`) : null;
            value = DataObject.resurrect(value);
            let element = this.find((x) => x === value);
            if (element === undefined && value !== null && typeof value !== 'object') this.push(value);
          }, jpathItems);
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath, jpathItems);
          }
        }

        if (colorOptions === 'colorByJpathValue') {
          let jpathValue = cfg('jpathValue');
          let arrayPath = jpathValue.split('.');
          arrayPath.shift();
          arrayPath = arrayPath.join('.');
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath);
          }
        }
        for (let i = 0; i < wellsList.length; i++) {
          this.listenHighlight(grid, wellsList[i]._highlight, i);
        }
      },

      plateSetup: function (moduleValue) {
        var list = moduleValue.get();
        checkJpath(list);
        let path = list.color ? 'color' : 'group';
        if (path) {
          delete list.color;
        }
        let configurations = this.module.definition.configuration.groups[path][0];
        this.plateSetup = list;
        const plateSetup = this.plateSetup;
        if (plateSetup !== undefined) {
          this.module.definition.configuration.groups[path][0] = Object.assign({}, configurations, plateSetup);
        }
        const cfg = this.module.getConfiguration;
        let colNumber = cfg('colnumber') || 10;
        let rowNumber = cfg('rownumber') || 10;
        let style = cfg('shape') || 'aligned';
        let direction = cfg('direction') || 'vertical';
        const colorJpath = cfg('colorjpath', false);
        const wellsList = this.wellsList;
        const colorOptions = cfg('colorOptions');
        let shape;
        switch (style) {
          case 'aligned': {
            shape = {
              shift: false,
              margin: undefined,
            };
            break;
          }
          case 'pairShifted': {
            shape = {
              margin: true,
              index: 0,
            };
            break;
          }
          case 'oddShifted': {
            shape = {
              margin: true,
              index: 1,
            };
            break;
          }
        }
        const wellLabels = createWellLabels({
          cols: colNumber,
          rows: rowNumber
        }, 10, { direction: direction });
        const labelsList = wellLabels.wellLabels;
        const axis = wellLabels.axis;
        const nbRows = axis.filter((x) => x[0] === 'rows')[0][1].length;
        const nbColumns = axis.filter((x) => x[0] === 'cols')[0][1].length;
        this.rows = nbRows;
        this.cols = nbColumns;
        const nbPlate = Math.ceil(wellsList.length / (nbRows * nbColumns));
        const tables = this.buildGrid(wellsList, labelsList, nbPlate, nbRows, nbColumns, direction, shape);
        this.dom.html(tables);
        const tableNodes = this.dom.find(':eq(0)').children();
        let grid = [];
        for (let u = 0; u < tableNodes.length; u++) {
          let tr = $(tableNodes[u]).find(':eq(1)').children();
          let td = $(tr[0]).children();
          let [rows, columns] = direction === 'vertical' ?
            [td.length, tr.length] : [tr.length, td.length];
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
              let [a, b] = direction === 'vertical' ?
                [j, i] : [i, j];
              grid.push({
                index: (a * rows) + b,
                value: tr[a].childNodes[b]
              });
            }
          }
        }
        if (colorOptions === 'colorByJpath') {
          let arrayPath = colorJpath.split('.');
          arrayPath.shift();
          arrayPath = arrayPath.join('.');
          let jpathItems = [];
          this.wellsList.filter(function (item) {
            let previous = arrayPath.split('.');
            if (previous.length !== 1) {
              previous.pop();
              previous = previous.join('.');
            }
            let value = eval(`item.${previous}`) ? eval(`item.${arrayPath}`) : null;
            value = DataObject.resurrect(value);
            let element = this.find((x) => x === value);
            if (element === undefined && value !== null && typeof value !== 'object') this.push(value);
          }, jpathItems);
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath, jpathItems);
          }
        }

        if (colorOptions === 'colorByJpathValue') {
          let jpathValue = cfg('jpathValue');
          let arrayPath = jpathValue.split('.');
          arrayPath.shift();
          arrayPath = arrayPath.join('.');
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath);
          }
        }
        for (let i = 0; i < wellsList.length; i++) {
          this.listenHighlight(grid, wellsList[i]._highlight, i);
        }
      }
    },

    addConfigurations: function (grid, currentItem, colorJpath, jpathItems) {
      let color;
      if (jpathItems) color = Color.getDistinctColorsAsString(jpathItems.length);
      const element = this.wellsList[currentItem];
      if (colorJpath) {
        let previous = colorJpath.split('.');
        if (previous.length !== 1) {
          previous.pop();
          previous = previous.join('.');
        }
        if (element === undefined) return;
        if (eval(`element.${previous}`) === undefined) return;
        const val = DataObject.resurrect(eval(`element.${colorJpath}`));
        if (jpathItems) {
          const index = jpathItems.findIndex((item) => item == val);
          $(grid[currentItem].value).find(':eq(1)').css(
            { 'background-color': color[index] }
          );
        } else {
          if (Number.isNaN(parseInt(val, 10))) return;
          let cfg = this.module.getConfiguration;
          let min = cfg('min');
          let max = cfg('max');
          let spectrumColors = cfg('spectrumColors');
          max = parseFloat(max);
          min = parseFloat(min);
          if (val < min || val > max) return;
          let arrayColor = new Array(10).fill(min)
            .map((item, idx) => item + ((max - min) / 10) * idx);
          const index = typeof val === 'object' ?
            arrayColor.findIndex((x) => x > val) : val;
          spectrumColors[3] = parseFloat(index) / max;
          if (index) {
            $(grid[currentItem].value).find(':eq(1)').css(
              { 'background-color': `rgba(${spectrumColors})` }
            );
          }
        }
      }
    },

    listenHighlight: function (grid, highlight, i) {
      const that = this;
      API.listenHighlight({ _highlight: highlight }, function (onOff, key) {
        if (onOff === 1) {
          if (!grid[i]) return;
          $(grid[i].value).find(':eq(0)').css({
            'border-color': '#F74949'
          });
        } else if (onOff === 0) {
          if (!grid[i]) return;
          $(grid[i].value).find(':eq(0)').css({
            'border-color': '#ddd'
          });
        }
      }, false, that.module.getId());
    },

    buildGrid: function (wellsList, labelsList, nbPlates, nbRows, nbColumns, direction, shape) {
      let plateIndex = this.module.getConfiguration('plateIndex', 0);
      let colorOptions = this.module.getConfiguration('colorOptions', undefined);
      let wellSize = this.module.getConfiguration('wellSize', 30);
      let plateGrid = $('<div>');
      for (let u = 0; u < nbPlates; u++) {
        let table = $('<table>');
        for (let i = 0; i < nbRows; i++) {
          let row = $('<tr>').attr({ name: `row${String(i)}` }).css({
            'vertical-align': 'top'
          });
          for (let j = 0; j < nbColumns; j++) {
            let index = direction === 'vertical' ?
              (u * nbRows * nbColumns) + (j * nbRows) + i :
              (u * nbRows * nbColumns) + (i * nbColumns) + j;
            let td = $('<td>');
            let wellBottom = $('<div>').addClass('well-plate-well-bottom').css({
              'border-radius': `${wellSize}px`,
              height: `${wellSize}px`,
              width: `${wellSize}px`,
            });
            let wellTop = $('<div>').addClass('well-plate-well-top');
            let label = Number.isNaN(parseInt(labelsList[index][0], 10)) ?
              labelsList[index] : (plateIndex * nbColumns * nbRows) + index + 1;
            wellTop.text('<div>').text(label);
            if (shape.margin && (j + shape.index) % 2 !== 0) wellBottom.css({ margin: '30px 0px 0px 0px' });
            let element = (colorOptions === 'colorBySample') ?
              wellsList : new Array(wellsList.length).fill({ color: 'rgba(141, 234, 106)' });
            wellTop.css({
              'background-color': `${element[index] !== undefined ? element[index].color : '#FFFFFF'}`,
              'line-height': `${wellSize}px`
            });
            wellBottom.append(wellTop);
            td.append(wellBottom);
            row.append(td);
          }
          table.append(row);
        }
        let divTag = $('<div>').css({ 'border-style': 'inset' }).append(table);
        plateGrid.append(divTag);
      }
      return plateGrid;
    },
  });
  return View;
});

function createWellLabels(config, nbPlates, options = {}) {
  let {
    direction = 'vertical'
  } = options;
  let entries = Object.entries(config);
  for (let i = 0; i < entries.length; i++) {
    if (Number.isNaN(parseInt(entries[i][1], 10))) {
      let label = entries[i][1].toUpperCase().charCodeAt(0);
      let axis = new Array(label - 64).fill()
        .map((item, index) => String.fromCharCode(index + 65));
      entries[i][1] = axis;
    } else {
      let axis = new Array(parseInt(entries[i][1], 10)).fill()
        .map((item, index) => index + 1);
      entries[i][1] = axis;
    }
  }
  let wellLabels = [];
  let [rows, columns] = [entries[0][1], entries[1][1]];
  if (Number.isInteger(rows[0]) && Number.isInteger(columns[0])) {
    let rod = direction === 'vertical' ? rows : columns;
    for (let u = 0; u < nbPlates; u++) {
      for (let i = 0; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
          let [rowIndex, columnIndex] = direction === 'vertical' ? [i, j] : [j, i];
          row[j] = `${columnIndex * rod.length + rod[rowIndex]}`;
        }
        wellLabels.push(...row);
      }
    }
  } else {
    [rows, columns] = direction === 'vertical' ? [rows, columns] : [columns, rows];
    for (let u = 0; u < nbPlates; u++) {
      for (let i = 0; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
          let element = typeof rows[i] === 'string' ?
            rows[i] + columns[j] : columns[j] + rows[i];
          row[j] = `${element}`;
        }
        wellLabels.push(...row);
      }
    }
  }
  return {
    wellLabels: wellLabels,
    axis: entries
  };
}

function checkJpath(setup) {
  const entries = Object.entries(setup);
  for (let i = 0; i < entries.length; i++) {
    setup[entries[i][0]] = Array.isArray(entries[i][1]) ? entries[i][1] : [entries[i][1]];
  }
}
