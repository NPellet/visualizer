'use strict';

const _ = require('lodash');

define(['modules/default/defaultview', 'src/util/typerenderer', 'src/util/api', 'src/util/util', 'src/util/color'], function (Default, Renderer, API, Util, Color) {
  function View() {
  }
  
  $.extend(true, View.prototype, Default, {
    
    init: function () {
      var html = [];
      html.push('<div></div>');
      this.dom = $(html.join(''));
      this.module.getDomContent().html(this.dom);
    },
    
    blank: {
      plate: function () {
        this.plate = null;
        API.killHighlight(this.module.getId());
        this.dom.empty();
      },
    },

    inDom: function () {
      var that = this;
      this.dom.on('mouseenter mouseleave click', 'td', function (e) {
        var plateVar = that.plateVar,
          plate = $(this).parents(':eq(3)').index(),
          trIndex = $(this).parent().index(),
          tdIndex = $(this).index(),
          cols = that.cols,
          rows = that.rows,
          direction = that.module.getConfiguration('direction', 'vertical') || 'vertical',
          elementId = direction === 'vertical' ?
            (plate * cols * rows) + tdIndex * rows + trIndex :
            (plate * cols * rows) + trIndex * cols + tdIndex;
        if (!plateVar[elementId]) return;
        let highlight = plateVar[elementId]._highlight;
        if (e.type === 'mouseenter') {
          that.module.controller.createDataFromEvent(
            'onTrackMouse',
            'trackData',
            plateVar[elementId],
          );
          that.module.controller.sendActionFromEvent(
            'onTrackMouse',
            'trackData',
            plateVar[elementId],
          );
          API.highlight([highlight], 1);
        } else if (e.type === 'mouseleave') {
          API.highlight([highlight], 0);
        } else if (e.type === 'click') {
          that.module.controller.sendActionFromEvent(
            'onTrackClick',
            'trackData',
            plateVar[elementId],
          );
        }
      });
      this.resolveReady();
    },

    update: {

      cellList: function (moduleValue) {
        var cfg = this.module.getConfiguration,
          cols = cfg('colnumber', 4) || 4,
          rows = cfg('rownumber', 4) || 4,
          style = cfg('shape', 'style2') || 'style2',
          direction = cfg('direction', 'vertical') || 'vertical',
          random = cfg('random', 'sequential') || 'sequential',
          colorJpath = cfg('colorjpath', false),
          val = moduleValue.get(),
          plateVar = moduleValue.get(),
          mode = random === 'random' ? true : false,
          tables = plateVar,
          labelsList = plateVar.map((x) => x.pos);
        this.plateVar = plateVar;
        let shape;
        switch (style) {
          case 'style1': {
            shape = {
              shift: false,
              margin: undefined,
            };
            break;
          }
          case 'style2': {
            shape = {
              margin: true,
              index: 0,
            };
            break;
          }
          case 'style3': {
            shape = {
              margin: true,
              index: 1,
            };
            break;
          }
        }
        let entries = Object.entries({
          cols: cols,
          rows: rows
        });
        for (let i = 0; i < entries.length; i++) {
          if (Number.isNaN(parseInt(entries[i][1]))) {
            entries[i][1] = entries[i][1].toUpperCase().charCodeAt(0) - 64;
          } else {
            entries[i][1] = parseInt(entries[i][1]);
          }
        }
        var nbRows = entries[0][1],
          nbColumns = entries[0][1];
        var nbPlate = Math.ceil(plateVar.length / (nbRows * nbColumns)),
          tables = this.buildGrid(plateVar, labelsList, nbPlate, nbRows, nbColumns, direction, shape);
        this.dom.html(tables);
        var tableNodes = this.dom.find(':eq(0)').children();
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
        grid = mode ? grid.map((item, index, array) => array[index]) : grid;
        let jpathItems = moduleValue[0];
        for (let i = 0; i < grid.length; i++) {
          this.addConfigs(grid, i, colorJpath, jpathItems);
        }
      },

      sampleList: function (moduleValue) {
        var val = moduleValue.get();
        this.sampleList = val;
      },
      
      plate: function (moduleValue) {
        var cfg = this.module.getConfiguration,
          cols = cfg('colnumber', 4) || 4,
          rows = cfg('rownumber', 4) || 4,
          style = cfg('shape', 'style2') || 'style2',
          direction = cfg('direction', 'vertical') || 'vertical',
          random = cfg('random', 'sequential') || 'sequential',
          colorJpath = cfg('colorjpath', false),
          val = moduleValue.get(),
          colorMode = this.module.getConfigurationCheckbox('colorBySample', 'yes'),
          replicates = val.replicates;
        this.plate = val;
        let mode = random === 'random' ? true : false;
        let shape;
        switch (style) {
          case 'style1': {
            shape = {
              shift: false,
              margin: undefined,
            };
            break;
          }
          case 'style2': {
            shape = {
              margin: true,
              index: 0,
            };
            break;
          }
          case 'style3': {
            shape = {
              margin: true,
              index: 1,
            };
            break;
          }
        }
  
        var parameters = val.parameters,
          nestedList = this.buildList(parameters),
          cellLabels = createCellLabels({
            cols: cols,
            rows: rows
          }, 2, { direction: direction }),
          color = Color.getDistinctColorsAsString(nestedList.length),
          labelsList = cellLabels.cellLabels,
          axis = cellLabels.axis,
          nbRows = axis.filter((x) => x[0] === 'rows')[0][1].length,
          nbColumns = axis.filter((x) => x[0] === 'cols')[0][1].length;
        this.nestedList = nestedList;
        this.rows = nbRows;
        this.cols = nbColumns;
        var order = sortArray(nestedList.length * replicates);
        addReplicates(nestedList, labelsList, color, replicates, order, mode);
        this.module.controller.createDataFromEvent('onSample', 'list', nestedList);
        var plateVar = builtPlate(nestedList, labelsList, replicates, nbRows, nbColumns),
          nbPlate = Math.ceil(plateVar.length / (nbRows * nbColumns)),
          tables = this.buildGrid(plateVar, labelsList, nbPlate, nbRows, nbColumns, direction, shape);
        this.module.controller.createDataFromEvent('onList', 'list', plateVar);
        this.plateVar = plateVar;
        this.dom.html(tables);
        var tableNodes = this.dom.find(':eq(0)').children();
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

        if (!colorMode) {
          let arrayPath = colorJpath.split('.').splice(1, 2);
          let jpathItems = moduleValue[`${arrayPath[0]}`][`${arrayPath[1]}`];
          for (let i = 0; i < grid.length; i++) {
            this.addConfigs(grid, i, colorJpath, jpathItems);
          }
        }

        grid = mode ? grid.map((item, index, array) => array[order[index]]) : grid;
        let highlightList = nestedList.map((item) => item._highlight);
        for (let i = 0; i < highlightList.length; i++) {
          this.listenHighlight(grid, highlightList[i]);
        }
      }
    },

    addConfigs: function (grid, currentItem, colorJpath, jpathItems) {
      var that = this,
        color = Color.getDistinctColorsAsString(jpathItems.length);
      this.plateVar.getChild([currentItem]).then(function (element) {
        if (colorJpath) {
          if (!element) return;
          element.getChild(colorJpath.split('.').splice(1).join('.'), true).then(function (val) {
            let index = jpathItems.findIndex((item) => item === val.get());
            $(grid[currentItem].value).find(':eq(1)').css(
              { 'background-color': color[index] }
            );
          });
        }
      });
    },

    listenHighlight: function (grid, highlightList) {
      var that = this,
        replicates = that.plate.replicates,
        nestedList = that.nestedList;
      API.listenHighlight({ _highlight: highlightList }, function (onOff, key) {
        let rowIndex = nestedList.findIndex((x) => x._highlight === key[0]);
        let gridIndex = new Array(replicates).fill(rowIndex * replicates)
          .map((item, index) => item + index);
        if (onOff === 1) {
          for (let i = 0; i < gridIndex.length; i++) {
            if (!grid[gridIndex[i]]) return;
            $(grid[gridIndex[i]].value).find(':eq(0)').css({
              'border-color': '#F74949'
            });
          }
        } else if (onOff === 0) {
          for (let i = 0; i < gridIndex.length; i++) {
            if (!grid[gridIndex[i]]) return;
            $(grid[gridIndex[i]].value).find(':eq(0)').css({
              'border-color': '#ddd'
            });
          }
        }
      }, false, that.module.getId());
    },

    buildGrid: function (plateVar, labelsList, nbPlates, nbRows, nbColumns, direction, shape) {
      let colorMode = this.module.getConfigurationCheckbox('colorBySample', 'yes');
      let cellBorderStyle = this.module.getConfiguration('cellBorderStyle', 'solid');
      let cellSize = this.module.getConfiguration('cellSize', 30);
      let plateGrid = $('<div>');
      for (let u = 0; u < nbPlates; u++) {
        var table = $('<table>');
        for (let i = 0; i < nbRows; i++) {
          let row = $('<tr>').attr({ name: `row${String(i)}` }).css({
            'vertical-align': 'top'
          });
          for (let j = 0; j < nbColumns; j++) {
            let index = direction === 'vertical' ?
                (u * nbRows * nbColumns) + (j * nbRows) + i :
                (u * nbRows * nbColumns) + (i * nbColumns) + j,
              td = $('<td>'),
              cellBottom = $('<div>').addClass('cell-bottom').css({
                'border-style': cellBorderStyle,
                'border-radius': `${cellSize}px`,
                height: `${cellSize}px`,
                width: `${cellSize}px`,
              }),
              cellTop = $('<div>').addClass('cell-top'),
              label = $('<div>').text(typeof labelsList[index] === 'string' ? labelsList[index].slice(0, -2) : index + 1);
            label.addClass('cell-top');
            if (shape.margin && (j + shape.index) % 2 !== 0) cellBottom.css({ margin: '30px 0px 0px 0px' });
            let element = colorMode ? plateVar : new Array(plateVar.length).fill({ color: 'rgba(141, 234, 106)' });
            cellTop.css({
              'background-color': `${element[index] !== undefined ? element[index].color : '#FFFFFF'}`
            });
            cellTop.append(label);
            cellBottom.append(cellTop);
            td.append(cellBottom);
            row.append(td);
          }
          table.append(row);
        }
        let divTag = $('<div>').css({ 'border-style': 'inset' }).append(table);
        plateGrid.append(divTag);
      }
      return plateGrid;
    },

    buildList: function (parameters) {
      let variables = Object.entries(parameters);
      variables = variables.filter((x) => Array.isArray(x[1]));
      let currentList = []; let nestedList = [];
      for (let i = 0; i < variables.length; i++) {
        let calculatedVariable = []; let obj = {};
        if (!Array.isArray(variables[i][1])) {
          throw new RangeError(`Variable ${variables[i][0]} is not an array`);
        }
        let currentVariable = nestedList.length !== 0 ? nestedList :
          currentList[i - 1]; nestedList = [];
        for (let j = 0; j < variables[i][1].length; j++) {
          obj[`${variables[i][0]}`] = variables[i][1][j];
          calculatedVariable.push(Object.assign({}, obj));
          if (i === 0) continue;
          for (let k = 0; k < currentVariable.length; k++) {
            currentVariable[k][`${variables[i][0]}`] = String(variables[i][1][j]);
          }
          nestedList.push(...JSON.parse(JSON.stringify(currentVariable)));
        }
        currentList.push(calculatedVariable);
      }
      nestedList.map((x) => x.valueOf());
      return nestedList;
    }
  });

  return View;
});

function sortArray(length) {
  var array = new Array(length).fill().map((item, index) => index),
    currentIndex, currentElement,
    top = array.length;
  while (top--) {
    currentIndex = Math.ceil(Math.random() * top);
    currentElement = array[currentIndex];
    array[currentIndex] = array[top];
    array[top] = currentElement;
  }
  return array;
}

function createCellLabels(config, nbPlates, options = {}) {
  let {
    direction = 'vertical'
  } = options;
  let entries = Object.entries(config);
  for (let i = 0; i < entries.length; i++) {
    if (Number.isNaN(parseInt(entries[i][1]))) {
      let label = entries[i][1].toUpperCase().charCodeAt(0);
      let axis = new Array(label - 64).fill()
        .map((item, index) => String.fromCharCode(index + 65));
      entries[i][1] = axis;
    } else {
      let axis = new Array(parseInt(entries[i][1])).fill()
        .map((item, index) => index + 1);
      entries[i][1] = axis;
    }
  }
  let cellLabels = [];
  let [rows, columns] = [entries[0][1], entries[1][1]];
  if (Number.isInteger(rows[0]) && Number.isInteger(columns[0])) {
    let rod = direction === 'vertical' ? rows : columns;
    for (let u = 0; u < nbPlates; u++) {
      for (let i = 0; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
          let [rowIndex, columnIndex] = direction === 'vertical' ? [i, j] : [j, i];
          row[j] = `${columnIndex * rod.length + rod[rowIndex]}-${u + 1}`;
        }
        cellLabels.push(...row);
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
          row[j] = `${element}-${u + 1}`;
        }
        cellLabels.push(...row);
      }
    }
  }
  return {
    cellLabels: cellLabels,
    axis: entries
  };
}

function builtPlate(nestedList, labelsList, replicates, rows, cols) {
  let result = [];
  let iterations = nestedList.length;
  
  for (let i = 0; i < iterations; i++) {
    let block = []; let obj = {};
    for (let j = 0; j < replicates; j++) {
      let nbPlate = Math.ceil((i * replicates + j + 1) / (rows * cols));
      let label = nestedList[i] && typeof nestedList[i].cells[j] === 'string' ?
        nestedList[i].cells[j] : nestedList[i].cells[j];
      obj = Object.assign({}, {
        pos: nestedList[i] ? `${label}` : labelsList[i],
        plate: nbPlate,
      }, nestedList[i] ? nestedList[i] : {});
      block.push(obj);
    }
    result.push(...block);
  }
  
  result = result.map((item, index, array) =>
    array[array.findIndex(function (x) {
      let element = typeof x.pos == 'string' ? `${String(labelsList[index])}` : index;
      return element === x.pos;
    })]
  );
  return result;
}

function addReplicates(list, labelsList, color, replicates, order, mode) {
  let counter = 0;
  let samples = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < replicates; j++) {
      let element = mode ? order[counter] : counter;
      let item = typeof labelsList[0] === 'string' ?
        labelsList[element] : element;
      samples.push(item);
      counter++;
    }
    list[i] = Object.assign({}, {
      cells: samples,
      color: color[i],
      _highlight: String(Math.random())
    }, list[i]);
    samples = [];
  }
}
