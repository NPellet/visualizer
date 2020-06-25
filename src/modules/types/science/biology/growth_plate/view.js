'use strict';

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
      }
    },

    inDom: function () {
      var that = this;
      this.dom.on('mouseenter mouseleave click', 'td', function (e) {
        var plateVar = that.plateVar;
        var plate = $(this).parents(':eq(3)').index();
        var trIndex = $(this).parent().index();
        var tdIndex = $(this).index();
        var cols = that.cols;
        var rows = that.rows;
        var direction = that.module.getConfiguration('direction', 'vertical') || 'vertical';
        let elementId = direction === 'vertical' ?
          (plate * cols * rows) + tdIndex * rows + trIndex :
          (plate * cols * rows) + trIndex * cols + tdIndex;
        if (!plateVar[elementId]) return;
        let highlight = plateVar[elementId]._highlight;
        if (e.type === 'mouseenter') {
          that.module.controller.createDataFromEvent('onHover', 'cell', plateVar[elementId]);
          API.highlight([highlight], 1);
        } else if (e.type === 'mouseleave') {
          API.highlight([highlight], 0);
        }
      });
      this.resolveReady();
    },

    update: {
      plate: function (moduleValue) {
        var cfg = this.module.getConfiguration,
          cols = cfg('colnumber', 4) || 4,
          rows = cfg('rownumber', 4) || 4,
          style = cfg('shape', 'style2') || 'style2',
          direction = cfg('direction', 'vertical') || 'vertical',
          val = moduleValue.get();
        var replicates = val.replicates;
        this.plate = val;
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
        addReplicates(nestedList, labelsList, color, replicates);
        this.module.controller.createDataFromEvent('onSample', 'list', nestedList);
        var plateVar = builtPlate(nestedList, labelsList, replicates);
        var nbPlate = Math.ceil(plateVar.length / (nbRows * nbColumns)),
          tables = this.buildGrid(plateVar, labelsList, nbPlate, nbRows, nbColumns, direction, shape);
        this.module.controller.createDataFromEvent('onList', 'list', plateVar);
        this.plateVar = plateVar;
        this.plates = nbPlate;
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
        let highlightList = nestedList.map((item) => item._highlight);
        for (var i = 0; i < highlightList.length; i++) {
          this.listenHighlight(grid, highlightList[i], i);
        }
      }
    },

    listenHighlight: function (grid, highlightList) {
      var that = this;
      var replicates = that.plate.replicates;
      var nestedList = that.nestedList;
      API.listenHighlight({ _highlight: highlightList }, function (onOff, key) {
        let rowIndex = nestedList.findIndex((x) => x._highlight === key[0]);
        let gridIndex = new Array(replicates).fill(rowIndex * replicates)
          .map((item, index) => item + index);
        if (onOff === 1) {
          for (let i = 0; i < gridIndex.length; i++) {
            if (!grid[gridIndex[i]]) return;
            $(grid[gridIndex[i]].value).find(':eq(0)').css({
              'background-color': '#F74949'
            });
          }
        } else if (onOff === 0) {
          for (let i = 0; i < gridIndex.length; i++) {
            if (!grid[gridIndex[i]]) return;
            $(grid[gridIndex[i]].value).find(':eq(0)').css({
              'background-color': '#FFFFFF'
            });
          }
        }
      }, false, that.module.getId());
    },

    buildGrid: function (plateVar, labelsList, nbPlate, nbRows, nbColumns, direction, shape) {
      let plateGrid = $('<div>');
      for (let u = 0; u < nbPlate; u++) {
        var table = $('<table>');
        for (let i = 0; i < nbRows; i++) {
          let row = $('<tr>').attr({ name: `row${String(i)}` }).css({
            'vertical-align': 'top'
          });
          for (let j = 0; j < nbColumns; j++) {
            let index = direction === 'vertical' ?
              (u * nbRows * nbColumns) + (j * nbRows) + i :
              (u * nbRows * nbColumns) + (i * nbColumns) + j;
            let td = $('<td>');
            let cellBottom = $('<div>').addClass('cell-bottom');
            let cellTop = $('<div>').addClass('cell-top');
            let label = $('<div>').text(typeof labelsList[index] === 'string' ? labelsList[index] : index + 1);
            if (shape.margin && (j + shape.index) % 2 !== 0) cellBottom.css({ margin: '30px 0px 0px 0px' });
            cellTop.css({
              'background-color': `${plateVar[index] !== undefined ? plateVar[index].color : '#ddd'}`
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
      return nestedList;
    }
  });

  return View;
});

function sortArray(array) {
  var currentIndex, currentElement,
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
    for (let u = 0; u < 1; u++) { // Here there is some thing to fix //
      for (let i = 0; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
          let [rowIndex, columnIndex] = direction === 'vertical' ? [i, j] : [j, i];
          row[j] = columnIndex * rod.length + rod[rowIndex];
        }
        cellLabels.push(...row);
      }
    }
  } else {
    [rows, columns] = direction === 'vertical' ? [rows, columns] : [columns, rows];
    for (let u = 0; u < nbPlates; u++) { // Here there is some thing to fix //
      for (let i = 0; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
          row[j] = rows[i] + columns[j];
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

function builtPlate(nestedList, labelsList, replicates) {
  let result = [];
  let iterations = nestedList.length;
  for (let i = 0; i < iterations; i++) {
    let block = []; let obj = {};
    let replicates = nestedList[i] ? nestedList[0].cells.length : 1;
    for (let j = 0; j < replicates; j++) {
      obj = Object.assign({}, {
        pos: nestedList[i] ? nestedList[i].cells[j] : labelsList[i],
        label: '--',
      }, nestedList[i] ? nestedList[i] : {});
      block.push(obj);
    }
    result.push(...block);
  }
  return result;
}

function addReplicates(list, labelsList, color, replicates) {
  let counter = 0;
  let samples = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < replicates; j++) {
      let item = typeof labelsList[0] === 'string' ?
        labelsList[counter] : counter + 1;
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
