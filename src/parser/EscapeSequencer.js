/**
 * @author Peter Nitsch
 */

TERM.EscapeSequencer = function (viewer){
	
	var viewer = viewer;
	var telnet;
	
	var _customCommand;
	var _currentCustomCommand = {};
	
	this.actionCharacterLib = [];
	
	this.init = function() {
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_H ] = this.cursorPosition;	
		this.actionCharacterLib[ LATIN_SMALL_LETTER_F ] = this.cursorPosition;	
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_A ] = this.cursorUp;	
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_B ] = this.cursorDown;	
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_C] = this.cursorForward;	
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_D ] = this.cursorBackward;	
		this.actionCharacterLib[ LATIN_SMALL_LETTER_S ] = this.saveCursorPosition;	
		this.actionCharacterLib[ LATIN_SMALL_LETTER_U ] = this.restoreCursorPosition;	
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_K ] = this.eraseLine;	
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_J ] = this.eraseDisplay;	
		this.actionCharacterLib[ LATIN_SMALL_LETTER_N ] = this.deviceRequest;
		this.actionCharacterLib[ LATIN_SMALL_LETTER_M ] = this.setGraphicsMode;
		this.actionCharacterLib[ LATIN_SMALL_LETTER_H ] = this.setMode;	
		this.actionCharacterLib[ LATIN_SMALL_LETTER_L ] = this.resetMode;	
		this.actionCharacterLib[ LATIN_SMALL_LETTER_P ] = this.setKeyboardStrings;	
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_M ] = this.scrollUp;
		this.actionCharacterLib[ LATIN_SMALL_LETTER_R ] = this.scrollScreen;
		
		// TO DO
		this.actionCharacterLib[ LATIN_SMALL_LETTER_A ] = this.unused;	
		this.actionCharacterLib[ LATIN_SMALL_LETTER_D ] = this.unused;	
		this.actionCharacterLib[ LATIN_SMALL_LETTER_E ] = this.unused;	
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_L ] = this.unused;
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_P ] = this.unused;
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_E ] = this.unused;	
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_F ] = this.unused;
		this.actionCharacterLib[ LATIN_CAPITAL_LETTER_X ] = this.unused;
		
	};
	
	this.executeCommand = function(command) {
		try {
			this.actionCharacterLib[ command[command.length-1] ]( command );
		} catch(error) {
			console.log(error);
		}
	};
	
	this.checkCommandAction = function(position, character) {
		if( this.actionCharacterLib[character] != undefined )
			return true;

		return false;
	};
	
	this.unused = function(params) {
		// EMPTY
	};
	
	this.deviceRequest = function(params) {
		if( params[2]==DIGIT_FIVE ){
			TERM.socket.writeByte(ESCAPE);
			TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
			TERM.socket.writeByte(DIGIT_ZERO);
			TERM.socket.writeByte(LATIN_SMALL_LETTER_N);
		} else if( params[2]==DIGIT_SIX ) {
			var i;
	    	var rows = "" + viewer.cursor.y;
	    	var cols = "" + viewer.cursor.x;

			TERM.socket.writeByte(ESCAPE);
			TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
			for(i=0;i<rows.length;i++)	TERM.socket.writeByte(rows.charCodeAt(i));
			TERM.socket.writeByte(SEMICOLON);
			for(i=0;i<cols.length;i++)	TERM.socket.writeByte(cols.charCodeAt(i));
			TERM.socket.writeByte(LATIN_CAPITAL_LETTER_R);
		} else {
			// 0 - Report Device OK
			// 3 - Report Device Failure 
		}
	};
	
	this.cursorPosition = function(params) {
		var lastCharacter = params[params.length-1];
		
		if( params.length==3 && lastCharacter==LATIN_CAPITAL_LETTER_H){
			viewer.home();
		} else {
			var lineArray = [];
			var lineStr = "";
			var line = 0;
			
			var columnArray = [];
			var columnStr = "";
			var column = 0;
			
			if(params.indexOf(SEMICOLON) != -1){
				var semicolonIndex = params.indexOf(SEMICOLON);
				
				if( params[semicolonIndex-1] != LEFT_SQUARE_BRACKET ) {
					lineArray = params.slice(2, semicolonIndex);
					for( i=0; i<lineArray.length; i++ ){
						lineStr += (lineArray[i] - 48).toString();
					}
					line = parseInt(lineStr);
				}
				
				columnArray = params.slice(semicolonIndex+1, params.length-1);
				for( i=0; i<columnArray.length; i++ ){
					columnStr += (columnArray[i] - 48).toString();
				}
				column = parseInt(columnStr);
				
			} else if(params.slice(2, params.indexOf(lastCharacter)).length > 0){
				lineArray = params.slice(2, params.length-1);
				for( i=0; i<lineArray.length; i++ ){
					lineStr += (lineArray[i] - 48).toString();
				}
				line = parseInt(lineStr);
			} 
			
			column = (column>0) ? column-1 : 0;
			line = (line>0) ? line-1 : 0;
			
			viewer.reposition(column, line);
		}
	};
	
	this.cursorUp = function(params) {
		var valueArray = params.slice(2, params.length-1);
		var valueStr = "";
		for( i=0; i<valueArray.length; i++ ){
			valueStr += (valueArray[i] - 48).toString();
		}
		var value = (valueStr.length > 0) ? parseInt(valueStr) : 1;
		
		viewer.moveUp(value);
	};
	
	this.cursorDown = function(params) {
		var valueArray = params.slice(2, params.length-1);
		var valueStr = "";
		for( i=0; i<valueArray.length; i++ ){
			valueStr += (valueArray[i] - 48).toString();
		}
		var value = (valueStr.length > 0) ? parseInt(valueStr) : 1;
		
		viewer.moveDown(value);
	};
	
	this.cursorForward = function(params) {		
		var valueArray = params.slice(2, params.length-1);
		var valueStr = "";
		for( i=0; i<valueArray.length; i++ ){
			valueStr += (valueArray[i] - 48).toString();
		}
		var value = (valueStr.length > 0) ? parseInt(valueStr) : 1;
		
		viewer.moveForward(value);
	};
	
	this.cursorBackward = function(params) {
		var valueArray = params.slice(2, params.length-1);
		var valueStr = "";
		for( i=0; i<valueArray.length; i++ ){
			valueStr += (valueArray[i] - 48).toString();
		}
		var value = (valueStr.length > 0) ? parseInt(valueStr) : 1;
		
		viewer.moveBackward(value);
	};
	
	this.saveCursorPosition = function(params) {
		viewer.savePosition();
	};
	
	this.restoreCursorPosition = function(params) {
		viewer.restorePosition();
	};
	
	// Set Graphic Mode functions
	var _bold = false;
	var _reverse = false;

	var _boldColors = [BLACK_BOLD, RED_BOLD, GREEN_BOLD, YELLOW_BOLD, BLUE_BOLD, MAGENTA_BOLD, CYAN_BOLD, WHITE_BOLD];
	var _normalColors = [BLACK_NORMAL, RED_NORMAL, GREEN_NORMAL, YELLOW_NORMAL, BLUE_NORMAL, MAGENTA_NORMAL, CYAN_NORMAL, WHITE_NORMAL];		

	var _currentForegroundColor = WHITE_NORMAL;
	var _currentBackgroundColor = BLACK_NORMAL;
	
	this.setGraphicsMode = function(params) {
		for( i=2; i<params.length; i++ ){
			switch( params[i] ){

				/*  Reset */
				case LATIN_SMALL_LETTER_M:
				case DIGIT_ZERO:
					if(params[i-1] == SEMICOLON || params[i-1] == LEFT_SQUARE_BRACKET){
						_bold = false;
						_reverse = false;
						
						_currentForegroundColor = WHITE_NORMAL;
						_currentBackgroundColor = BLACK_NORMAL;
						
						viewer.foregroundColorChanged(_currentForegroundColor);
						viewer.backgroundColorChanged(_currentBackgroundColor);
					}
				break;
				
				/*  Bold ON */
				case DIGIT_ONE:
					if(params[i-1] == SEMICOLON || params[i-1] == LEFT_SQUARE_BRACKET) {
						_bold = true;

						for( j=0; j<_normalColors.length; j++ ){
							if( _currentForegroundColor == _normalColors[j] )
								_currentForegroundColor = _boldColors[j];
						}
						
						viewer.foregroundColorChanged(_currentForegroundColor);
					}
				break;
				
				/* Dim */
				case DIGIT_TWO:						
					if(params[i-1] == SEMICOLON || params[i-1] == LEFT_SQUARE_BRACKET) {
						_bold = false;

						for( j=0; j<_normalColors.length; j++ ){
							if( _currentForegroundColor == _boldColors[j] )
								_currentForegroundColor = _normalColors[j];
						}
						
						viewer.foregroundColorChanged(_currentForegroundColor);
					}
				break;
				
				/* Set foreground color */
				case DIGIT_THREE:
					if(params[i-1] == SEMICOLON || params[i-1] == LEFT_SQUARE_BRACKET){
						if(params[i+1] != SEMICOLON && params[i+1] != LATIN_SMALL_LETTER_M){
							
							var position = params[i+1] - 48;
							if(_reverse) {
								_currentBackgroundColor = _normalColors[position];
								viewer.backgroundColorChanged(_currentBackgroundColor);
							}else {
								_currentForegroundColor = (_bold) ? _boldColors[position] : _normalColors[position];
								viewer.foregroundColorChanged(_currentForegroundColor);
							}
							
						}
					}
				break;
				
				/* Set background color */
				case DIGIT_FOUR:
					if(params[i-1] == SEMICOLON || params[i-1] == LEFT_SQUARE_BRACKET){
						if(params[i+1] != SEMICOLON && params[i+1] != LATIN_SMALL_LETTER_M){
							position = params[i+1] - 48;
							if(_reverse) {
								_currentForegroundColor = (_bold) ? _boldColors[position] : _normalColors[position];
								viewer.foregroundColorChanged(_currentForegroundColor);
							} else {
								_currentBackgroundColor = _normalColors[position];
								viewer.backgroundColorChanged(_currentBackgroundColor);
							}
						
						/* Underline ON */		
						} else {
							// TO DO
						}
					}
				break;
				
				/* Blink ON */
				case DIGIT_FIVE:
					// TO DO
				break;
				
				/* Reverse ON */
				case DIGIT_SEVEN:
					if(params[i-1] == SEMICOLON || params[i-1] == LEFT_SQUARE_BRACKET)
						_reverse = true;
				break;
				
				/* Concealed ON */
				case DIGIT_EIGHT:
					// TO DO
				break;
				
				/* Reset to normal? */
				case DIGIT_NINE:
					// TO DO
				break;
			}
		}
	};
	
	this.scrollScreen = function(params) {
		if(params.length==3){
			viewer.scrollScreen();
		} else {
			var lastCharacter = params[params.length-1];
		
			var sArray = [];
			var sStr = "";
			var s = 0;
			
			var eArray = [];
			var eStr = "";
			var e = 0;
			
			var semicolonIndex = params.indexOf(SEMICOLON);

			sArray = params.slice(2, semicolonIndex);
			for( i=0; i<sArray.length; i++ ){
				sStr += (sArray[i] - 48).toString();
			}
			s = parseInt(sStr);

			
			eArray = params.slice(semicolonIndex+1, params.length-1);
			for( i=0; i<eArray.length; i++ ){
				eStr += (eArray[i] - 48).toString();
			}
			e = parseInt(eStr);
				
			viewer.scrollScreen(s, e);
		}
	};
	
	this.scrollUp = function(params) {
		viewer.scrollUp(1);
	};
	
	this.eraseLine = function(params) {
		if( params[2]==DIGIT_ONE ){
			viewer.eraseStartOfLine();
		} else if( params[2]==DIGIT_TWO ) {
			viewer.eraseLine();
		} else {
			viewer.eraseEndOfLine();
		}		
	};
	
	this.eraseDisplay = function(params) {
		if( params[2]==DIGIT_ONE ){
			viewer.eraseUp();
			viewer.reposition(0, 0);
		} else if( params[2]==DIGIT_TWO ) {
			viewer.eraseScreen();
			viewer.reposition(0, 0);
		} else {
			viewer.eraseDown();
		}
	};
	
	// Terminal functions
	this.setMode = function(){
		// TO DO
	};
	
	this.resetMode = function(){
		// TO DO
	};
	
	this.setKeyboardStrings = function(){
		// TO DO
	};
	
	this.init();

};