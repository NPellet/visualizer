/* eslint-disable no-implicit-globals */
'use strict';

function getColorFromValue(value) {
  var minValue = min;
  var maxValue = max;
  if (!highContrast) {
    minValue = 0;
    maxValue = 1;
  }
  var diff = maxValue - minValue;
  var segNb = colors.length - 1;
  var step = diff / segNb;
  var color1Id = Math.round((segNb * (value - minValue)) / diff);
  color1Id = Math.min(Math.max(0, color1Id), colors.length - 2);

  return getColorBetween(
    value,
    colors[color1Id],
    colors[color1Id + 1],
    color1Id * step + minValue,
    (color1Id + 1) * step + minValue,
  );
}

function getColorBetween(value, color1, color2, color1Val, color2Val) {
  // Between 0 and 1
  var ratio = (value - color1Val) / (color2Val - color1Val);

  return [
    Number.parseInt(ratio * (color2[0] - color1[0]) + color1[0], 10),
    Number.parseInt(ratio * (color2[1] - color1[1]) + color1[1], 10),
    Number.parseInt(ratio * (color2[2] - color1[2]) + color1[2], 10),
    Number.parseInt(ratio * (color2[3] - color1[3]) + color1[3], 10),
  ];
}

function generate(indexX, indexY, buffer, nbValX) {
  var startX = indexX * squareLoading,
    startY = indexY * squareLoading,
    endX = startX + squareLoading,
    endY = startY + squareLoading;

  var x = startX,
    y = startY;

  var bufferData = buffer.data;

  for (; x < endX; x++) {
    y = startY;
    for (; y < endY; y++) {
      let val;
      if (data[y] === undefined || data[y][x] === undefined) {
        // throw "Errrrror !!!";
        continue;
      } else {
        val = data[y][x];
        if (val.value) val = val.value;
      }

      const color = getColorFromValue(val);
      drawCell(val, x - startX, y - startY, color, bufferData, nbValX);
    }
  }

  return buffer;
}

function drawCell(value, startX, startY, color, bufferData, nbValX) {
  var squareWidth = nbValX * pxPerCell;

  var i = 0,
    j = 0,
    pixelNum;
  while (j < pxPerCell) {
    while (i < pxPerCell) {
      pixelNum =
        4 * (startX * pxPerCell + i + (startY * pxPerCell + j) * squareWidth);
      bufferData[pixelNum + 0] = color[0]; // Red value
      bufferData[pixelNum + 1] = color[1]; // Green value
      bufferData[pixelNum + 2] = color[2]; // Blue value
      bufferData[pixelNum + 3] = 255; // Alpha value
      i++;
    }
    i = 0;
    j++;
  }
  j = 0;
}

var data, min, max, colors, pxPerCell, squareLoading, highContrast;
self.addEventListener('message', (event) => {
  var d = event.data;

  if (d.title === 'init') {
    // pxPerCell = d.message.pxPerCell;
    colors = d.message.colors;
    squareLoading = d.message.squareLoading;
    highContrast = d.message.highcontrast;
  } else if (d.title === 'changeData') {
    data = JSON.parse(d.message.data);
    min = d.message.min;
    max = d.message.max;
  } else if (d.title === 'doPx') {
    pxPerCell = d.message.pxPerCell;
    postMessage({
      pxPerCell,
      indexX: d.message.indexX,
      indexY: d.message.indexY,
      data: generate(
        d.message.indexX,
        d.message.indexY,
        d.message.buffer,
        d.message.nbValX,
      ),
    });
  }
});
