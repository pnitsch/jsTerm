/**
 * @author Peter Nitsch
 */

TERM.Cursor = function (){
	
	this.foregroundColor = WHITE_NORMAL;
	this.backgroundColor = BLACK_NORMAL;
	this.position = new TERM.Point();
	this.maxColumnWidth = 80;
	this.maxLineHeight = 25;
	this.columnWidth = 8;
	this.lineHeight = 16;
	this.maxColumns = 80;
	this.infiniteWidth = false;
	this.infiniteHeight = false;
		
	this.moveForward = function(columns) {
		if( this.position.x + (columns*this.columnWidth) <= this.maxColumns * this.columnWidth )
			this.position.x = this.position.x + (columns*this.columnWidth);
		else
			this.position.x = (this.maxColumns * this.columnWidth) - this.columnWidth;
	};	
		
	this.moveBackward = function(columns) {
		if( this.position.x - (columns*this.columnWidth) >= 0 )
			this.position.x = this.position.x - (columns*this.columnWidth);
		else
			this.position.x = 0;
	};

	this.moveDown = function(lines) {
		this.position.y = this.position.y + (lines*this.lineHeight);
	};

	this.moveUp = function(lines) {
		if( this.position.y - (lines*this.lineHeight) >= 0 ) 
			this.position.y = this.position.y - (lines*this.lineHeight);
		else
			this.position.y = 0;
	};

	this.carriageReturn = function() {
		this.position.x = 0;
	};
	
};

TERM.Cursor.prototype = {
	
	get x (){
		return this.position.x;
	},
	set x (val){
		this.position.x = val;
	},
	
	get y (){
		return this.position.y;
	},
	set y (val){
		this.position.y = val;
	}
	
};