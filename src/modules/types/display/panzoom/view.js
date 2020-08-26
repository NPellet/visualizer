if (this.button) {
  this.action = {
    name: this.button,
    value: undefined,
  };
}

if (this.variable) {
  switch (this.variable) {
    case 'pixelSize':
      this.action = {
        name: 'UpdateSize',
      };
      break;
  }
}

const action = this.action;

switch (action.name) {
  case 'UpdateSize':
    updateSize();
    break;
  case 'DefineLength':
    defineLength();
    break;
  case 'SetPixelSize':
    setPixelSize();
    break;
}

async function setPixelSize() {
  const pixelSize = API.getData('pixelSize');
  let defaultValue = '10 um';
  if (pixelSize && pixelSize.unit && pixelSize.SI) {
    let sizeUnit = mathjs.unit(String(pixelSize.unit));
    sizeUnit.value = Number(pixelSize.SI);
    defaultValue = sizeUnit.toString();
  }

  let pixelSizeString = await UI.enterValue({
    description: 'Specify the size of the pixel',
    label: 'Pixel size:',
    value: defaultValue,
  });
  const unit = mathjs.unit(mathjs.eval(pixelSizeString));

  pixelSize.unit = unit.formatUnits();
  pixelSize.SI = unit.value;
  pixelSize.triggerChange();
}

async function defineLength() {
  const line = action && action.value;
  let length = await UI.enterValue({
    description: 'Allows to define the size of a pixel',
    label: 'Length of the line',
    value: '10 mm',
  });
  const unit = mathjs.unit(mathjs.eval(length));
  let result = {
    unit: unit.formatUnits(),
    SI: unit.value,
  };
  let lineLengthInPixels = getLineLength(line);

  const pixelSizeUnit = mathjs.divide(unit, lineLengthInPixels);

  pixelSize.unit = pixelSizeUnit.formatUnits();
  pixelSize.SI = pixelSizeUnit.value;
  pixelSize.triggerChange();
}

async function updateSize() {
  await delay();
  const pixelSize = API.getData('pixelSize').resurrect();
  const annotations = API.getData('annotations');
  if (annotations) {
    for (let annotation of annotations) {
      switch (DataObject.resurrect(annotation.kind)) {
        case 'polygon':
          let surface = getPolygonSurface(annotation);
          annotation.surface = {
            unit: pixelSize.unit + '^2',
            SI: pixelSize.SI * pixelSize.SI * surface,
          };
          break;
        case 'line':
          let length = getLineLength(annotation);
          annotation.length = {
            unit: pixelSize.unit,
            SI: pixelSize.SI * length,
          };
          break;
      }
    }
    annotations.triggerChange();
  }
  const rois = API.getData('rois');
  let pixelSizeNm = pixelSize.SI * 1e9;
  if (rois) {
    for (var roi of rois) {
      roi.mbrWidthNm = roi.mbrWidth * pixelSizeNm;
      roi.mbrHeightNm = roi.mbrHeight * pixelSizeNm;
      roi.mbrAverageNm = (roi.mbrWidthNm + roi.mbrHeightNm) / 2;
    }
    rois.triggerChange();
  }
}

function getLineLength(line) {
  const options = DataObject.resurrect(line.options);
  return Math.sqrt(
    (options.x1 - options.x2) ** 2 + (options.y1 - options.y2) ** 2,
  );
}

function getPolygonSurface(polygon) {
  const points = DataObject.resurrect(polygon.options).points;
  if (!points) return;
  let vertices = points.split(' ').map((value) => {
    let xy = value.split(',');
    return { x: Number(xy[0]), y: Number(xy[1]) };
  });

  let total = 0;

  for (let i = 0; i < vertices.length; i++) {
    let addX = vertices[i].x;
    let addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
    let subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
    let subY = vertices[i].y;

    total += addX * addY * 0.5;
    total -= subX * subY * 0.5;
  }

  return Math.abs(total);
}
