/**
 * @author Peter Nitsch
 */

TERM.AnsiViewer = function (fontmap){
	
	this.parser = new TERM.AnsiParser(this);
	
	var fontmap = fontmap;
	var font = new TERM.Font();
	var canvas = document.getElementById("canvas");
	var width = canvas.width;
	var height = canvas.height;
	this.cursor = new TERM.Cursor(width,height);
	var topMargin = 1;
	var botMargin = 25;
	var ctx = canvas.getContext("2d");
	var scroll = true;
	var _savedPosition = new TERM.Point();
        var cursorKeyAppMode = false;
	var autoWrapMode = true;
	var currentCursorPosX,currentCursorPosy;
	var origCursorImg,blinkCursorImg;
	var cursorBlink = false;
	var intervalCursorFunction;
	
	this.readBytes = function (bytes) {
		clearInterval(this.intervalCursorFunction);
		this.undrawCursor();
		this.parser.parse(bytes);
		var inst = this;
		this.intervalCursorFunction = setInterval(function() {
			inst.drawCursor();
		}, 500);
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

		if(autoWrapMode && !this.cursor.infiniteWidth && this.cursor.x + this.cursor.columnWidth > this.cursor.maxColumnWidth * this.cursor.columnWidth){
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
	
	this.drawCursor = function() {
		if (this.currentCursorPosX != this.cursor.x || this.currentCursorPosY != this.cursor.y ) {
			
			origCursorImg = ctx.getImageData(this.cursor.x, this.cursor.y, 8, 16 );
			var pix = origCursorImg.data;
			blinkCursorImg = ctx.createImageData(8, 16);
			var newPix = blinkCursorImg.data;
			this.currentCursorPosX = this.cursor.x;
			this.currentCursorPosY = this.cursor.y;
			
			var bgColorR = pix[0];
			var bgColorG = pix[1];
			var bgColorB = pix[2];
			
			var fgColorR,fgColorG,fgColorB;
			for (var i = 256; i < 288; i+=4) {
				if (pix[i] != bgColorR || pix[i+1] != bgColorG ||pix[i+2] != bgColorB) {
					fgColorR=pix[i];
					fgColorG=pix[i+1];
					fgColorB=pix[i+2];
					break;
				}
			}
			
			if (i>=288) {
				// we didnt find fgcolor
				fgColorR=168;
				fgColorG=168;
				fgColorB=168;
			}
			
			for ( var i = 0, n = pix.length; i < n; i +=4) {
				if (pix[i] == bgColorR && pix[i+1] == bgColorG && pix[i+2] == bgColorB) {
					newPix[i] = fgColorR;
					newPix[i+1] = fgColorG;
					newPix[i+2] = fgColorB;
					newPix[i+3] = 255;
				} else {
					newPix[i] = bgColorR;
					newPix[i+1] = bgColorG;
					newPix[i+2] = bgColorB;
					newPix[i+3] = 255;
				}
				
			}
		}
		
		
		if (cursorBlink) {
			ctx.putImageData(origCursorImg,this.cursor.x, this.cursor.y);	
		} else {
			ctx.putImageData(blinkCursorImg,this.cursor.x, this.cursor.y);	
		}
		cursorBlink = !cursorBlink;
	};
	
	this.undrawCursor = function() {
		if (cursorBlink) {
			ctx.putImageData(origCursorImg,this.currentCursorPosX, this.currentCursorPosY);
			cursorBlink = false;
		}
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
		var scrollMax = Math.min(botMargin-1,this.cursor.maxLines); 
		if(this.cursor.y > this.cursor.lineHeight*(scrollMax-val) && scroll){
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
		if (x < this.cursor.maxColumns) {
			this.cursor.x = x * this.cursor.columnWidth;
		} else {
			this.cursor.x = (this.cursor.maxColumns - 1) * this.cursor.columnWidth;
		}
		if (y < this.cursor.maxLines) {
			this.cursor.y = y * this.cursor.lineHeight;
		} else {
			this.cursor.y = (this.cursor.maxLines - 1) * this.cursor.lineHeight;
		}
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
		ctx.fillRect(0, (topMargin - 1) * this.cursor.lineHeight, this.cursor.maxColumnWidth * this.cursor.columnWidth, ((botMargin +1) * this.cursor.lineHeight) - (topMargin * this.cursor.lineHeight) ); // calculate the height correctly, botMArgin - topMargin
	};

	
	this.eraseUp = function() {
		ctx.fillStyle = this.cursor.backgroundColor;
		ctx.fillRect(0, 0, this.cursor.maxColumnWidth * this.cursor.columnWidth, this.cursor.y);
	};

	this.eraseScreen = function() {
		ctx.fillStyle = this.cursor.backgroundColor;
		ctx.fillRect(0, 0, this.cursor.maxColumnWidth * this.cursor.columnWidth, this.cursor.maxLines * this.cursor.lineHeight);
	};

	this.eraseDown = function() {
		ctx.fillStyle = this.cursor.backgroundColor;
		ctx.fillRect(0, this.cursor.y, this.cursor.maxColumnWidth * this.cursor.columnWidth, (this.cursor.maxLines * this.cursor.lineHeight) - this.cursor.y);
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
		if (start!=undefined && end!=undefined) {
			topMargin = start;
			botMargin = end;
		}
		this.home();
	};
	
	this.reverseIndex = function() {
		if (this.cursor.y <= ((topMargin - 1) * this.cursor.lineHeight)) {
			this.scrollDown(1);
		} else {
			this.cursor.y  = this.cursor.y - this.cursor.lineHeight;
		}
	};
			
	this.scrollDown = function(val) {
		var x=0;
		var y= (topMargin-1)* this.cursor.lineHeight;
		var width = canvas.width ;
		var height = this.cursor.lineHeight * (botMargin - topMargin);
		var canvasData = ctx.getImageData(x,y ,width , height );
		this.displayCleared();
		ctx.putImageData(canvasData, 0, this.cursor.lineHeight*(topMargin-1) + (val * this.cursor.lineHeight) );
	};
			
	this.scrollUp = function(val) {
		var x=0;
		var y= topMargin * this.cursor.lineHeight;
		var width = canvas.width ;
		var height = this.cursor.lineHeight * (botMargin - topMargin);
		var canvasData = ctx.getImageData(x,y ,width , height );
		this.displayCleared();
		ctx.putImageData(canvasData, 0, this.cursor.lineHeight*(topMargin-1) );
	};
	
	this.cursorKeyToAppMode = function(mode) {
		cursorKeyAppMode = mode;
	};

	this.setAutoWrap = function(mode) {
		autoWrapMode = mode;
	};
	
	this.clearCanvas();
	var inst = this;
	this.intervalCursorFunction = setInterval(function() {
			inst.drawCursor();
	}, 500);

};
