var count = 0;

 
function generateVisibleGridArea(gridData, gridImage, cols, rows, cellWidth, cellHeight, canvas) {
	
	var dataColumns = gridData.length;
	var gridImageData = gridImage.data;
	var gridWidth = gridImage.width;
	var gridHeight = gridImage.height;
	
	var color, x=0, y=0, i=0, j=0, pixelNum=0;
	
	while (x<cols) {
	
		while (y<rows) {
			color = Math.round(gridData[x][y] * 255);
			
			// The Math.min ensures that we don't try to draw beyond the visible edge of the canvas
			drawCell(x*cellWidth, y*cellHeight, Math.min(cellWidth,gridWidth - x*cellWidth,canvas.width - x*cellWidth), Math.min(cellHeight, gridHeight - y*cellHeight,canvas.height - y*cellHeight), gridWidth, color, gridImageData);
			y++;
		}
		y=0;
		x++;
	}
	
	return gridImage;
}     
function generateGrid(gridData, gridImage, cols, rows, cellWidth, cellHeight) {
	
	var dataColumns = gridData.length;
	var gridImageData = gridImage.data;
	var gridWidth = gridImage.width;
	var gridHeight = gridImage.height;
	
	var color, x=0, y=0, i=0, j=0, pixelNum=0;
	
	while (x<cols) {
	
		while (y<rows) {
			color = Math.round(gridData[x][y] * 255);
			
			// The Math.min ensures that we don't try to draw beyond the edge of the canvas
			drawCell(x*cellWidth, y*cellHeight, Math.min(cellWidth,gridWidth - x*cellWidth), Math.min(cellHeight, gridHeight - y*cellHeight), gridWidth, color, gridImageData);
			y++;
		}
		y=0;
		x++;
	}
	
	return gridImage;
}

function generateGridArea(gridData, gridImage, startCol, startRow, endCol, endRow, cellWidth, cellHeight) {
	
	var dataColumns = gridData.length;
	var gridImageData = gridImage.data;
	var gridWidth = gridImage.width;
	var gridHeight = gridImage.height;
	
	
	var color, x=startCol, y=startRow, i=0, j=0, pixelNum=0;
	
	while (x<endCol) {
	
		while (y<endRow) {
		
			color = Math.round(gridData[x][y] * 255);
				
			// The Math.min calls ensure that we don't try to draw beyond the edges of the canvas
			drawCell(x*cellWidth, y*cellHeight, Math.min(cellWidth, gridWidth - x*cellWidth), Math.min(cellHeight, gridHeight - y*cellHeight), gridWidth, color, gridImageData);
			y++;
		}
		y=startRow;
		x++;
	}
	
	return gridImage;
}


function drawCell(startX, startY, cellWidth, cellHeight, gridWidth, color, gridImageData) {
	
	//cellWidth or Height will be <0 when the cell is off the edge of the screen, due to the use of Math.min
	if ((cellWidth<0) || (cellHeight<0))
		return;
		
	var i=0, j=0, pixelNum = 0;
	while (j<cellHeight) {
		while (i<cellWidth) {
		count++;
			pixelNum = 4 * (startX + i + (startY + j) * gridWidth);
			gridImageData[pixelNum+0] = color; // Red value
			gridImageData[pixelNum+1] = color; // Green value
			gridImageData[pixelNum+2] = color; // Blue value
			gridImageData[pixelNum+3] = 255; // Alpha value
			i++;
		}
		i=0;
		j++;
	}
	j=0;
}

onmessage = function(event) {
	//first only generate the visible part of the grid to have a quick render
	count = 0;
	var now = new Date().getTime();
	var d = event.data;
	if (typeof d.startCol != 'undefined' && typeof d.endCol != 'undefined' && typeof d.startRow != 'undefined' && typeof d.endRow != 'undefined') {
		postMessage(generateGridArea(d.gridData, d.gridImageData, d.startCol, d.startRow, d.endCol, d.endRow, d.cellWidth, d.cellHeight, d.canvas));
	}
	var diff = new Date().getTime() - now;
	//then generate the whole thing, once we've given the user something to look at in the meantime
	//postMessage(generateGrid(event.data.gridData, event.data.gridImageData, event.data.cols, event.data.rows, event.data.cellWidth, event.data.cellHeight));
	//postMessage(generateGridArea(event.data.gridData, event.data.gridImageData, 0,0,15,15, 20, 20));
}
