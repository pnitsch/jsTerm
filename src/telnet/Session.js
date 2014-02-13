/**
 * @author Peter Nitsch
 */

TERM.Session = function (fontMapURL){
	
	var viewer;
	var commands;

	function initKeyboard() {
		document.addEventListener("keypress", function(event) {
			var char = null;
			if (event.which == null)
				char = event.keyCode; // old IE
			else if (event.which != 0 && event.charCode != 0)
				char = event.which; // All others

			if (char === KEYBOARD_ENTER) {
				return; // do not process keyboard enter here, its being done in
				// keydown. (ff doesnt enter in here, but chrome does)
			}
			if (char != null) {
				TERM.socket.writeByte( char );
			}
			event.preventDefault();

		}, false);

		
		document.addEventListener("keydown", function(e) {
			var key = e.keyCode;
			Util.Debug("keycode : " + key);
			var handled= false;
			switch (key) {
			case KEYBOARD_ENTER:
				TERM.socket.writeByte(KEYBOARD_ENTER);
				handled = true;
				break;
			case KEYBOARD_LEFT:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_O);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_D);
				handled = true;
				break;
			case KEYBOARD_RIGHT:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_O);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_C);
				handled = true;
				break;
			case KEYBOARD_UP:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_O);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_A);
				handled = true;
				break;
			case KEYBOARD_DOWN:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_O);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_B);
				handled = true;
				break;
			case KEYBOARD_TAB:
				TERM.socket.writeByte(KEYBOARD_TAB);
				handled=true;
				break;

			case KEYBOARD_PAGE_UP:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_M);
				handled = true;
				break;

			case KEYBOARD_PAGE_DOWN:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_H);
				TERM.socket.writeByte(SEMICOLON);
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_TWO);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_J);
				handled = true;
				break;

			case KEYBOARD_HOME:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(LATIN_CAPITAL_LETTER_H);
				handled = true;
				break;
			case BACKSPACE:
				TERM.socket.writeByte(DELETE);
				handled = true;
				break;
			case LATIN_CAPITAL_LETTER_C:
				if (e.ctrlKey) {
					// Ctrl-C pressed
					TERM.socket.writeByte(ESCAPE);
					TERM.socket.writeByte(LM_SLC_IP);
					handled = true;
				}
				break;
			case KEYBOARD_ESC:
				TERM.socket.writeByte(KEYBOARD_ESC);
				TERM.socket.writeByte(KEYBOARD_ESC);
				handled = true;
				break;
			case KEYBOARD_F1:
				//^[[11~				
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_ONE);
				TERM.socket.writeByte(DIGIT_ONE);
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F2:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_ONE);
				TERM.socket.writeByte(DIGIT_TWO);
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F3:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_ONE);
				TERM.socket.writeByte(DIGIT_THREE);
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F4:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_ONE);
				TERM.socket.writeByte(DIGIT_FOUR);
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F5:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_ONE);
				TERM.socket.writeByte(DIGIT_FIVE);
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F6:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_ONE);
				TERM.socket.writeByte(DIGIT_SEVEN); //Not a mistake
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F7:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_ONE);
				TERM.socket.writeByte(DIGIT_EIGHT);
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F8:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_ONE);
				TERM.socket.writeByte(DIGIT_NINE);
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F9:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_TWO);
				TERM.socket.writeByte(DIGIT_ZERO);
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F10:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_TWO);
				TERM.socket.writeByte(DIGIT_ONE);
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F11:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_TWO);
				TERM.socket.writeByte(DIGIT_THREE); //not a mistake
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			case KEYBOARD_F12:
				TERM.socket.writeByte(ESCAPE);
				TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
				TERM.socket.writeByte(DIGIT_TWO);
				TERM.socket.writeByte(DIGIT_FOUR);
				TERM.socket.writeByte(TILDE);
				handled = true;
				break;
			default:
				break;
			}
			if (handled) {
				if (event.preventDefault !== undefined )
					event.preventDefault();
				if (event.stopPropagation !== undefined )
					event.stopPropagation();
			}
		}, false);
	}
	;

	
	var fontmap = new Image();
	fontmap.onload = function (){
		viewer = new TERM.AnsiViewer(this);
		commands = new TERM.Telnet(viewer);
		
		if(!("WebSocket" in window)) {
	    	alert("Sorry, the build of your browser does not support HTML5 WebSockets.");
	      	return;
	    }

		initKeyboard();
	};
	fontmap.src = fontMapURL;
	
	this.connect = function(host, port) {
		if(TERM.socket != undefined && TERM.socket.readyState == 1) {
			viewer.displayCleared();
			viewer.reposition(0, 0);
			TERM.socket.send("telnet|"+host+"|"+port);
		} else if(TERM.socket == undefined ){
			TERM.socket = new TERM.Socket();
			TERM.socket.init(host, port, function(e){
				viewer.readBytes(e.data.toString());
			});
		}
	};
	
}