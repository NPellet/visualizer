onmessage = function (event) {
    var gridData = JSON.parse(event.data);
    var minValue = Infinity, maxValue = -Infinity;
    for (let i = 0; i < gridData.length; i++) {
        for (let j = 0; j < gridData[i].length; j++) {
            if (gridData[i][j] < minValue) minValue = gridData[i][j];
            if (gridData[i][j] > maxValue) maxValue = gridData[i][j];
        }
    }
    this.postMessage({
        min: minValue,
        max: maxValue
    });
};
