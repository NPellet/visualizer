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
      plate: function () {
        this.plate = null;
        this.cellsList = null;
        this.samplesList = null;
        API.killHighlight(this.module.getId());
        this.dom.empty();
      },
      cellsList: function () {
        this.plate = null;
        this.cellsList = null;
        API.killHighlight(this.module.getId());
        this.dom.empty();
      },
      samplesList: function () {
        this.plate = null;
        this.cellsList = null;
        this.samplesList = null;
        API.killHighlight(this.module.getId());
        this.dom.empty();
      },
    },

    inDom: function () {
      const that = this;
      this.dom.on('mouseenter mouseleave click', 'td', function (e) {
        const cellsList = that.cellsList;
        const plate = $(this).parents(':eq(3)').index();
        const trIndex = $(this).parent().index();
        const tdIndex = $(this).index();
        const cols = that.cols;
        const rows = that.rows;
        const direction = that.module.getConfiguration('direction', 'vertical') || 'vertical';
        const elementId = direction === 'vertical' ?
          (plate * cols * rows) + tdIndex * rows + trIndex :
          (plate * cols * rows) + trIndex * cols + tdIndex;
        if (!cellsList[elementId]) return;
        let highlight = cellsList[elementId]._highlight;
        if (e.type === 'mouseenter') {
          that.module.controller.createDataFromEvent(
            'onTrackMouse',
            'trackData',
            cellsList[elementId],
          );
          that.module.controller.sendActionFromEvent(
            'onTrackMouse',
            'trackData',
            cellsList[elementId],
          );
          API.highlight([highlight], 1);
        } else if (e.type === 'mouseleave') {
          API.highlight([highlight], 0);
        } else if (e.type === 'click') {
          that.module.controller.sendActionFromEvent(
            'onTrackClick',
            'trackData',
            cellsList[elementId],
          );
        }
      });
      this.resolveReady();
    },

    update: {
      plate: function (moduleValue) {
        const cfg = this.module.getConfiguration;
        const cfgc = this.module.getConfigurationCheckbox;
        const cols = cfg('colnumber', 4) || 4;
        const rows = cfg('rownumber', 4) || 4;
        const style = cfg('shape', 'aligned') || 'aligned';
        const direction = cfg('direction', 'vertical') || 'vertical';
        const random = cfg('random', 'sequential') || 'sequential';
        const colorJpath = cfg('colorjpath', false);
        const val = moduleValue.get();
        const colorBySample = cfgc('colorBySample', 'yes');
        const colorByJpathValue = cfgc('colorByJpathValue', 'yes');
        const colorByJpath = cfgc('colorByJpath', 'yes');
        const replicates = val.replicates;
        const mode = random === 'random' ? true : false;
        const control = val.control ? Object.entries(val.control) : false;
        this.plate = val;
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
        const parameters = val.parameters;
        const samplesList = this.buildList(parameters);
        const nbSamples = samplesList.length * replicates;
        const cellLabels = createCellLabels({
          cols: cols,
          rows: rows
        }, 2, { direction: direction });
        const color = Color.getDistinctColorsAsString(samplesList.length);
        let labelsList = cellLabels.cellLabels;
        const axis = cellLabels.axis;
        const nbRows = axis.filter((x) => x[0] === 'rows')[0][1].length;
        const nbColumns = axis.filter((x) => x[0] === 'cols')[0][1].length;
        this.samplesList = samplesList;
        this.rows = nbRows;
        this.cols = nbColumns;
        let controlItems = addControls(samplesList, labelsList, control, replicates);
        const order = sortArray(nbSamples + controlItems.length);
        addReplicates(samplesList, labelsList, color, replicates, order, mode);
        this.module.controller.createDataFromEvent('onSample', 'list', samplesList);
        const cellsList = builtPlate(samplesList, labelsList, nbRows, nbColumns);
        const nbPlate = Math.ceil(cellsList.length / (nbRows * nbColumns));
        const tables = this.buildGrid(cellsList, labelsList, nbPlate, nbRows, nbColumns, direction, shape);
        this.module.controller.createDataFromEvent('onList', 'list', cellsList);
        this.cellsList = cellsList;
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

        if (!colorBySample && colorByJpath) {
          let arrayPath = colorJpath ? colorJpath.split('.') : undefined;
          arrayPath = arrayPath[arrayPath.length - 1];
          const jpathItems = moduleValue.parameters[`${arrayPath}`].map((x) => x.value.substr());
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath, jpathItems);
          }
        }

        if (!colorBySample && colorByJpathValue) {
          const jpathValue = cfg('jpathValue', 4) || 4;
          let arrayPath = jpathValue.split('.');
          arrayPath = arrayPath[arrayPath.length - 1];
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath);
          }
        }
        
        grid = mode ? grid.map((item, index, array) => array[order[index]]) : grid;
        const highlightList = samplesList.map((item) => item._highlight);
        for (let i = 0; i < highlightList.length; i++) {
          this.listenHighlight(grid, highlightList[i], samplesList, i);
        }
      },

      cellsList: function (moduleValue) {
        const cfg = this.module.getConfiguration;
        const cfgc = this.module.getConfigurationCheckbox;
        const cols = cfg('colnumber', 4) || 4;
        const rows = cfg('rownumber', 4) || 4;
        const style = cfg('shape', 'aligned') || 'aligned';
        const direction = cfg('direction', 'vertical') || 'vertical';
        const colorJpath = cfg('colorjpath', false);
        const cellsList = moduleValue.get();
        const labelsList = cellsList.map((x) => x.cell);
        const colorBySample = cfgc('colorBySample', 'yes');
        const colorByJpathValue = cfgc('colorByJpathValue', 'yes');
        const colorByJpath = cfgc('colorByJpath', 'yes');
        this.cellsList = cellsList;
        this.module.controller.createDataFromEvent('onList', 'list', cellsList);
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
        const entries = Object.entries({
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
        let samplesList = [];
        for (let i = 0; i < cellsList.length; i++) {
          let sampleLabels = DataObject.resurrect(cellsList[i]).cells;
          if (samplesList.find((x) => JSON.stringify(x) === JSON.stringify(sampleLabels)) === undefined) {
            samplesList.push(sampleLabels);
          }
        }
        let order = [];
        for (let i = 0; i < samplesList.length; i++) {
          for (let j = 0; j < samplesList[i].length; j++) {
            order.push(labelsList.findIndex((x) => x === samplesList[i][j]));
          }
        }
        const nbRows = entries.filter((x) => x[0] === 'rows')[0][1];
        const nbColumns = entries.filter((x) => x[0] === 'cols')[0][1];
        this.rows = nbRows;
        this.cols = nbColumns;
        const nbPlate = Math.ceil(cellsList.length / (nbRows * nbColumns));
        const tables = this.buildGrid(cellsList, labelsList, nbPlate, nbRows, nbColumns, direction, shape);
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

        let getData = {
          highlightList: [],
          samplesList: []
        };
        moduleValue.filter(function (item) {
          let element = this.highlightList.find((x) => x === item._highlight.substr());
          if (element === undefined) {
            this.samplesList.push(item);
            this.highlightList.push(item._highlight.substr());
          }
        }, getData);
        if (!colorBySample && colorByJpath) {
          let arrayPath = colorJpath.split('.');
          arrayPath = arrayPath[arrayPath.length - 1];
          let jpathItems = [];
          moduleValue.filter(function (item) {
            let value = item[`${arrayPath}`] ? item[`${arrayPath}`].value : null;
            let element = this.find((x) => x === value);
            if (element === undefined && value !== null && typeof value !== 'object') this.push(value);
          }, jpathItems);
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath, jpathItems);
          }
        }

        if (!colorBySample && colorByJpathValue) {
          let jpathValue = cfg('jpathValue', 4) || 4;
          let arrayPath = jpathValue.split('.');
          arrayPath = arrayPath[arrayPath.length - 1];
          
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath);
          }
        }

        grid = grid.map((item, index, array) => array[order[index]]);
        for (let i = 0; i < getData.highlightList.length; i++) {
          this.listenHighlight(grid, getData.highlightList[i], getData.samplesList, i);
        }
      },

      samplesList: function (moduleValue) {
        const cfg = this.module.getConfiguration;
        const cfgc = this.module.getConfigurationCheckbox;
        const cols = cfg('colnumber', 4) || 4;
        const rows = cfg('rownumber', 4) || 4;
        const style = cfg('shape', 'aligned') || 'aligned';
        const direction = cfg('direction', 'vertical') || 'vertical';
        const colorJpath = cfg('colorjpath', false);
        const samplesList = moduleValue.get();
        const labels = samplesList.map((element) => element.cells);
        const colorBySample = cfgc('colorBySample', 'yes');
        const colorByJpathValue = cfgc('colorByJpathValue', 'yes');
        const colorByJpath = cfgc('colorByJpath', 'yes');
        this.samplesList = samplesList;
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
        const cellLabels = createCellLabels({
          cols: cols,
          rows: rows
        }, 2, { direction: direction });
        let labelsList = cellLabels.cellLabels;
        let order = [];
        for (let i = 0; i < samplesList.length; i++) {
          for (let j = 0; j < samplesList[i].cells.length; j++) {
            order.push(labelsList.findIndex((x) => x === samplesList[i].cells[j]));
          }
        }
        const axis = cellLabels.axis;
        const nbRows = axis.filter((x) => x[0] === 'rows')[0][1].length;
        const nbColumns = axis.filter((x) => x[0] === 'cols')[0][1].length;
        const cellsList = builtPlate(samplesList, labelsList, nbRows, nbColumns);
        this.module.controller.createDataFromEvent('onList', 'list', cellsList);
        this.cellsList = cellsList;
        let nbPlate = Math.ceil(cellsList.length / (nbRows * nbColumns));
        let tables = this.buildGrid(this.cellsList, labelsList, nbPlate, nbRows, nbColumns, direction, shape);
        this.dom.html(tables);
        this.rows = nbRows;
        this.cols = nbColumns;
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

        if (!colorBySample && colorByJpath) {
          let arrayPath = colorJpath.split('.');
          arrayPath = arrayPath[arrayPath.length - 1];
          let jpathItems = [];
          moduleValue.filter(function (item) {
            let element = item[`${arrayPath}`] ? this.find((x) => x === item[`${arrayPath}`].value) : 'control';
            if (element === undefined && typeof item[`${arrayPath}`].value === 'string') {
              this.push(item[`${arrayPath}`].value);
            }
          }, jpathItems);
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath, jpathItems);
          }
        }

        if (!colorBySample && colorByJpathValue) {
          let jpathValue = cfg('jpathValue', 4) || 4;
          let arrayPath = jpathValue.split('.');
          arrayPath = arrayPath[arrayPath.length - 1];
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath);
          }
        }
        grid = grid.map((item, index, array) => array[order[index]]);
        let highlightList = samplesList.map((item) => item._highlight);
        for (let i = 0; i < highlightList.length; i++) {
          this.listenHighlight(grid, highlightList[i], samplesList, i);
        }
      },
    },

    addConfigurations: function (grid, currentItem, colorJpath, jpathItems) {
      let color;
      if (jpathItems) color = Color.getDistinctColorsAsString(jpathItems.length);
      const element = this.cellsList[currentItem];
      if (colorJpath) {
        if (!element) return;
        const val = element[`${colorJpath}`];
        if (jpathItems) {
          for (let i = 0; i < jpathItems.length; i++) {
            jpathItems[i] = typeof jpathItems[i] === 'object' ?
              jpathItems[i].label : jpathItems[i];
          }
          const index = typeof val === 'object' ?
            jpathItems.findIndex((item) => item == val.value) : val;
          $(grid[currentItem].value).find(':eq(1)').css(
            { 'background-color': color[index] }
          );
        } else {
          let cfg = this.module.getConfiguration;
          let min = cfg('min', 4) || 4;
          let max = cfg('max', 4) || 4;
          let color = cfg('color', 4) || 4;
          max = parseFloat(max);
          min = parseFloat(min);
          let arrayColor = new Array(10).fill(min)
            .map((item, index, array) => item + ((max - min) / 10) * index);
          const index = typeof val === 'object' ?
            arrayColor.findIndex((x) => x > val.value) : val;
          color[3] = index / 10;
          if (index) {
            $(grid[currentItem].value).find(':eq(1)').css(
              { 'background-color': `rgba(${color})` }
            );
          }
        }
      }
    },

    listenHighlight: function (grid, highlightList, samplesList, i) {
      const that = this;
      const replicates = samplesList[i].cells.length;
      API.listenHighlight({ _highlight: highlightList }, function (onOff, key) {
        const sampleIndex = samplesList.findIndex((x) => x._highlight === key[0]);
        let counter = 0;
        for (let i = 0; i < sampleIndex; i++) {
          for (let j = 0; j < samplesList[i].cells.length; j++) {
            counter++;
          }
        }
        const gridIndex = new Array(replicates).fill(counter)
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

    buildGrid: function (cellsList, labelsList, nbPlates, nbRows, nbColumns, direction, shape) {
      let colorBySample = this.module.getConfigurationCheckbox('colorBySample', 'yes');
      let cellBorderStyle = this.module.getConfiguration('cellBorderStyle', 'solid');
      let cellSize = this.module.getConfiguration('cellSize', 30);
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
                (u * nbRows * nbColumns) + (i * nbColumns) + j,
              td = $('<td>'),
              cellBottom = $('<div>').addClass('well-plate-cell-bottom').css({
                'border-style': cellBorderStyle,
                'border-radius': `${cellSize}px`,
                height: `${cellSize}px`,
                width: `${cellSize}px`,
              }),
              cellTop = $('<div>').addClass('well-plate-cell-top'),
              label = $('<div>').text(typeof labelsList[index] === 'object' || typeof labelsList[index] === 'string' ?
                labelsList[index].slice(0, -2) : index + 1);
            label.addClass('well-plate-cell-top');
            if (shape.margin && (j + shape.index) % 2 !== 0) cellBottom.css({ margin: '30px 0px 0px 0px' });
            let element = colorBySample ? cellsList : new Array(cellsList.length).fill({ color: 'rgba(141, 234, 106)' });
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
      let currentList = [];
      let samplesList = [];
      for (let i = 0; i < variables.length; i++) {
        let calculatedVariable = [];
        let obj = {};
        if (!Array.isArray(variables[i][1])) {
          throw new RangeError(`Variable ${variables[i][0]} is not an array`);
        }
        let currentVariable = samplesList.length !== 0 ? samplesList : currentList[i - 1];
        samplesList = [];
        for (let j = 0; j < variables[i][1].length; j++) {
          obj[`${variables[i][0]}`] = variables[i][1][j];
          calculatedVariable.push(Object.assign({}, obj));
          if (i === 0) continue;
          for (let k = 0; k < currentVariable.length; k++) {
            currentVariable[k][`${variables[i][0]}`] = variables[i][1][j];
          }
          samplesList.push(...JSON.parse(JSON.stringify(currentVariable)));
        }
        currentList.push(calculatedVariable);
      }
      samplesList.map((x) => x.valueOf());
      return samplesList;
    }
  });
  return View;
});

function sortArray(length) {
  let array = new Array(length).fill().map((item, index) => index),
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

function builtPlate(samplesList, labelsList, rows, cols) {
  let result = [];
  let iterations = samplesList.length;
  for (let i = 0; i < iterations; i++) {
    let block = [];
    let obj = {};
    let replicates = samplesList[i].cells.length;
    for (let j = 0; j < replicates; j++) {
      let nbPlate = Math.ceil((i * replicates + j + 1) / (rows * cols));
      let label = samplesList[i] && typeof samplesList[i].cells[j] === 'string' ?
        samplesList[i].cells[j] : samplesList[i].cells[j];
      obj = Object.assign({}, {
        cell: samplesList[i] ? `${label}` : labelsList[i],
        plate: nbPlate,
      }, samplesList[i] ? samplesList[i] : {});
      block.push(obj);
    }
    result.push(...block);
  }

  result = result.map((item, index, array) =>
    array[array.findIndex(function (x) {
      let element = typeof x.cell == 'string' ?
        `${String(labelsList[index])}` : index;
      return element == x.cell;
    })]
  );
  return result;
}

function addReplicates(list, labelsList, color, replicates, order, mode) {
  let counter = 0;
  let samples = [];
  for (let i = 0; i < list.length; i++) {
    replicates = list[i].cells ? list[i].cells.length : replicates;
    for (let j = 0; j < replicates; j++) {
      let element = mode ? order[counter] : counter;
      let item = typeof labelsList[0] === 'string' ?
        labelsList[element] : element;
      samples.push(item);
      counter++;
    }
    list[i] = Object.assign({}, list[i],
      {
        cells: samples,
        color: color[i],
        _highlight: String(Math.random())
      });
    samples = [];
  }
}

function addControls(list, labelsList, control, replicates) {
  let counter = 0;
  let items = [];
  let samples = [];
  let pivot = list.length * replicates;
  for (let i = 0; i < control.length; i++) {
    let label = control[i][0];
    for (let j = 0; j < control[i][1].length; j++) {
      let item = typeof labelsList[0] === 'string' ?
        labelsList[pivot + counter] : pivot + counter;
      samples.push(item);
      counter++;
    }
    for (let k = 0; k < control[i][1].length; k++) {
      let newItem = {
        cells: [samples[k]],
        color: 'rgba(100, 100, 100, 1)',
        [`${label}`]: control[i][1][k]
      };
      list.push(newItem);
      items.push(samples[k]);
    }
    samples = [];
  }
  return items;
}
