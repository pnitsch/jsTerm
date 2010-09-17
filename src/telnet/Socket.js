/**
 * @author Peter Nitsch
 */

TERM.Socket = function (){
	
	var ws;
	
	this.init = function(host, port, onmessage){
		ws = new WebSocket("ws://"+TERM.SERVER_URL+":"+TERM.SERVER_PORT+"/");
		ws.onmessage = onmessage;
		ws.onclose = function() {};
	    ws.onopen = function() {
			ws.send("telnet|"+host+"|"+port);
	    };
	};
	
	this.writeByte = function(code) {
		ws.send(String.fromCharCode(code));
	};

	this.writeMultiByte = function(string, code) {
		ws.send(string);
	};
	
	this.send = function(packet){
		ws.send(packet);
	};
	
};

TERM.Socket.prototype = {
	get readyState(){
		return ws.readyState;
	}
};