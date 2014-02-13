/**
 * @author Peter Nitsch
 */

TERM.AnsiViewer = function (fontmap){
	
	this.cursor = new TERM.Cursor();
	this.parser = new TERM.AnsiParser(this);
	
	var fontmap = fontmap;
	var font = new TERM.Font();
	var canvas = document.getElementById("canvas");
	var width = canvas.width;
	var height = canvas.height;
	var topMargin = 1;
	var botMargin = 25;
	var ctx = canvas.getContext("2d");
	var scroll = true;
	var _savedPosition = new TERM.Point();
	
	this.readBytes = function (bytes) {
		this.parser.parse(bytes);
	};
	
	this.clearCanvas = function(){
		ctx.fillStyle = BLACK_NORMAL;
		ctx.fillRect(0, 0, width, height);
	};

	this.colorTable = function(val) {
		switch(val) {
			case BLACK_NORMAL: return 0; break;
			case BLUE_NORMAL: return 1; break;
			case GREEN_NORMAL: return 2; break;
			case CYAN_NORMAL: return 3; break;
			case RED_NORMAL: return 4; break;
			case MAGENTA_NORMAL: return 5; break;
			case YELLOW_NORMAL: return 6; break;
			case WHITE_NORMAL: return 7; break;
			case BLACK_BOLD: return 8; break;
			case BLUE_BOLD: return 9; break;
			case GREEN_BOLD: return 10; break;
			case CYAN_BOLD: return 11; break;
			case RED_BOLD: return 12; break;
			case MAGENTA_BOLD: return 13; break;
			case YELLOW_BOLD: return 14; break;
			case WHITE_BOLD: return 15; break;
		}
		return 0;
	};

	this.drawCharacter = function(character) {
		this.draw(character);
		this.cursor.moveForward(1);

		if(!this.cursor.infiniteWidth && this.cursor.x + this.cursor.columnWidth > this.cursor.maxColumnWidth * this.cursor.columnWidth){
			this.moveDown(1);
			this.cursor.carriageReturn();
		}
	};
	
	this.draw = function(charCode) {
		//console.log(charCode +" "+ this.cursor.x +" "+ this.cursor.y)
		
		ctx.fillStyle = this.cursor.backgroundColor;
		ctx.fillRect(this.cursor.x, this.cursor.y, font.width, font.height);

		ctx.drawImage(fontmap, 
			charCode*(font.width+1), this.colorTable(this.cursor.foregroundColor)*font.height, font.width, font.height,
			this.cursor.x, this.cursor.y, font.width, font.height);
	};
	
	this.carriageReturn = function() {
		this.cursor.carriageReturn();
	};
	
	this.formFeed = function() {
		this.cursor.x = 0;
		this.cursor.y = 0;
	};

	this.moveBackward = function(val, erase) {
		var movements = val;

		while( movements > 0 ) {
			this.cursor.moveBackward(1);
			if(erase) this.draw(SPACE);
			movements--;
		}
	};

	this.moveDown = function(val) {
		if(this.cursor.y >= this.cursor.lineHeight*(this.cursor.maxLineHeight-val) && scroll){
			this.scrollUp(val);
		} else {
			this.cursor.moveDown(val);
		}
	};

	this.moveForward = function(val) {
		this.cursor.moveForward(val);
	};

	this.moveUp = function(val) {
		this.cursor.moveUp(val);
	};

	this.reposition = function(x, y) {
		this.cursor.x = x * this.cursor.columnWidth;
		this.cursor.y = y * this.cursor.lineHeight;
	};
	
	this.repositionColumn = function(x) {
		this.cursor.x = x * this.cursor.columnWidth;
	};


	this.restorePosition = function() {
		this.cursor.x = _savedPosition.x;
		this.cursor.y = _savedPosition.y;
	};

	this.savePosition = function() {
		_savedPosition.x = this.cursor.x;
		_savedPosition.y = this.cursor.y;
	};

	this.displayCleared = function() {
		ctx.fillStyle = this.cursor.backgroundColor;
		ctx.fillRect(0, 0, this.cursor.maxColumnWidth * this.cursor.columnWidth, this.cursor.maxLineHeight * this.cursor.lineHeight);
	};

	
	this.eraseUp = function() {
		ctx.fillStyle = this.cursor.backgroundColor;
		ctx.fillRect(0, 0, this.cursor.maxColumnWidth * this.cursor.columnWidth, this.cursor.y);
	};

	this.eraseScreen = function() {
		ctx.fillStyle = this.cursor.backgroundColor;
		ctx.fillRect(0, 0, this.cursor.maxColumnWidth * this.cursor.columnWidth, this.cursor.maxLineHeight * this.cursor.lineHeight);
	};

	this.eraseDown = function() {
		ctx.fillStyle = this.cursor.backgroundColor;
		ctx.fillRect(0, this.cursor.y, this.cursor.maxColumnWidth * this.cursor.columnWidth, (this.cursor.maxLineHeight * this.cursor.lineHeight) - this.cursor.y);
	};

	this.eraseEndOfLine = function() {
		ctx.fillStyle = this.cursor.backgroundColor;
		var w = (this.cursor.maxColumnWidth * this.cursor.columnWidth) - (this.cursor.x - this.cursor.columnWidth);
		ctx.fillRect(this.cursor.x, this.cursor.y, w, this.cursor.lineHeight);
	};

	this.eraseStartOfLine = function() {
		ctx.fillStyle = this.cursor.backgroundColor;
		ctx.fillRect(0, this.cursor.y, this.cursor.x, this.cursor.lineHeight);
	};

	this.eraseLine = function() {
		ctx.fillStyle = this.cursor.backgroundColor;
		ctx.fillRect(0, this.cursor.y, this.cursor.maxColumnWidth * this.cursor.columnWidth, this.cursor.lineHeight);
	};
	
	this.eraseChars = function(val) {
		ctx.fillStyle = this.cursor.backgroundColor;
		var w = val * this.cursor.columnWidth;
		ctx.fillRect(this.cursor.x, this.cursor.y, w, this.cursor.lineHeight);
	};

	
	this.backgroundColorChanged = function(color) {
		this.cursor.backgroundColor = color;
	};

	this.foregroundColorChanged = function(color) {
		this.cursor.foregroundColor = color;
	};

	this.home = function() {
		this.cursor.x = 0;
		this.cursor.y = 0;
	};

	this.scrollScreen = function(start, end) {
		topMargin = start;
		botMargin = end;
	};
			
	this.scrollUp = function(val) {
		var x=0;
		var y= topMargin * this.cursor.lineHeight;
		var width = canvas.width ;
		var height = this.cursor.lineHeight * (this.cursor.maxLineHeight -1);
		var canvasData = ctx.getImageData(x,y ,width , height );
		this.displayCleared();
		ctx.putImageData(canvasData, 0, 0 );
	};
	
	this.clearCanvas();

};