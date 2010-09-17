/**
 * @author Peter Nitsch
 */

TERM.Session = function (fontMapURL){
	
	var viewer;
	var commands;

	function initKeyboard() {
		document.addEventListener("keydown", function(e) {
			var key = e.keyCode;		
			
			switch (key) {
				case KEYBOARD_LEFT :
					TERM.socket.writeByte(ESCAPE);
					TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
					TERM.socket.writeByte(LATIN_CAPITAL_LETTER_D);
				break;

				case KEYBOARD_RIGHT :
					TERM.socket.writeByte(ESCAPE);
					TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
					TERM.socket.writeByte(LATIN_CAPITAL_LETTER_C);
				break;

				case KEYBOARD_UP :
					TERM.socket.writeByte(ESCAPE);
					TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
					TERM.socket.writeByte(LATIN_CAPITAL_LETTER_A);
				break;

				case KEYBOARD_DOWN :
					TERM.socket.writeByte(ESCAPE);
					TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
					TERM.socket.writeByte(LATIN_CAPITAL_LETTER_B);
				break;

				case KEYBOARD_PAGE_UP :
					TERM.socket.writeByte(ESCAPE);
					TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
					TERM.socket.writeByte(LATIN_CAPITAL_LETTER_M);
				break;

				case KEYBOARD_PAGE_DOWN :
					TERM.socket.writeByte(ESCAPE);
					TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
					TERM.socket.writeByte(LATIN_CAPITAL_LETTER_H);
					TERM.socket.writeByte(SEMICOLON);
					TERM.socket.writeByte(ESCAPE);
					TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
					TERM.socket.writeByte(DIGIT_TWO);
					TERM.socket.writeByte(LATIN_CAPITAL_LETTER_J);
				break;

				case KEYBOARD_HOME :
					TERM.socket.writeByte(ESCAPE);
					TERM.socket.writeByte(LEFT_SQUARE_BRACKET);
					TERM.socket.writeByte(LATIN_CAPITAL_LETTER_H);
				break;

				default:
					TERM.socket.writeByte( key );
				break;
			}
			
		}, false);
	};
	
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