/**
 * @author Peter Nitsch
 */

TERM.Telnet = function (viewer){
	
	var parser = viewer.parser;
	var _actionCharacterLib = [];

	var bytes;
	
	this.init = function() {
		_actionCharacterLib[ IAC ] = interpretCommand;
		parser.writeException(IAC, interpretCommand);
	};
	
	function interpretCommand(code, b) { 
		bytes = b;
		var command = bytes.readUnsignedByte();
		handleC(command);
	};

	function read16int () {
		var c = 0;
		try {
			c = bytes.readUnsignedByte();
			return c;
		} catch (e) {
			console.log(e);
		}
		
		return c;
	};
	
	function IamHere() {
		try {
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(DO);
			TERM.socket.writeByte(AYT);
		} catch (error) {
			console.log("IamHere() Error "+ error);
		}
	};

	function nvtBreak() {
		// TO DO
	};
	
	function setTerminalGeometry (width, height) {
		// TO DO
	};
	
	function setEcho(b) {
		// TO DO
	};
			
	var buffer = [0,0];
	
	var DO_ECHO = false;
	var DO_SUPGA = false;
	var DO_NAWS = false;
	var DO_TTYPE = false;
	var DO_LINEMODE = false;
	var DO_NEWENV = false;
	
	var WAIT_DO_REPLY_SUPGA = false;
	var WAIT_DO_REPLY_ECHO = false;
	var WAIT_DO_REPLY_NAWS = false;
	var WAIT_DO_REPLY_TTYPE = false;
	var WAIT_DO_REPLY_LINEMODE = false;
	var WAIT_LM_MODE_ACK = false;
	var WAIT_LM_DO_REPLY_FORWARDMASK = false;
	var WAIT_DO_REPLY_NEWENV = false;
	var WAIT_NE_SEND_REPLY = false;
	
	var WAIT_WILL_REPLY_SUPGA = false;
	var WAIT_WILL_REPLY_ECHO = false;
	var WAIT_WILL_REPLY_NAWS = false;
	var WAIT_WILL_REPLY_TTYPE = false;
	
	function doCharacterModeInit() {
		sendCommand(WILL, ECHO, true);
		sendCommand(DONT, ECHO, true);
		sendCommand(DO, NAWS, true);
		sendCommand(WILL, SUPGA, true);
		sendCommand(DO, SUPGA, true);
		sendCommand(DO, TTYPE, true);
		sendCommand(DO, NEWENV, true);
	};
	
	function doLineModeInit() {
		sendCommand(DO, NAWS, true);
		sendCommand(WILL, SUPGA, true);
		sendCommand(DO, SUPGA, true);
		sendCommand(DO, TTYPE, true);
		sendCommand(DO, LINEMODE, true);
		sendCommand(DO, NEWENV, true);
	};
	
	function handleC(i) {
		buffer[0] = i;
		if (!parseTWO(buffer)) {
			try {
				buffer[1] = bytes.readUnsignedByte();
				parse(buffer);
			} catch(e) {
				console.log(e);
			}
		}
		
		buffer[0] = 0;
		buffer[1] = 0;
	};
	
	function parseTWO(buf) {
		switch (buf[0]) {
			case IAC:
			break;
			case AYT:
				IamHere();
			break;
			case AO:
			case IP:
			case EL:
			case EC:
			case NOP:
			break;
			case BRK:
				nvtBreak();
			break;
			default:
				return false;
		}
		return true;
	};
	
	function parse(buf) {
		switch (buf[0]) {
			case WILL:
				if (supported(buf[1]) && isEnabled(buf[1])) {
					;
				} else {
					if (waitDOreply(buf[1]) && supported(buf[1])) {
						enable(buf[1]);
						setWait(DO, buf[1], false);
					} else {
						if (supported(buf[1])) {                            
							sendCommand(DO, buf[1], false);
							enable(buf[1]);
						} else {
							sendCommand(DONT, buf[1], false);
						}
					}
				}
			break;
			case WONT:
				if (waitDOreply(buf[1]) && supported(buf[1])) {
					setWait(DO, buf[1], false);
				} else {
					if (supported(buf[1]) && isEnabled(buf[1])) {
						enable(buf[1]);
					}
				}
			break;
			case DO:
				if (supported(buf[1]) && isEnabled(buf[1])) {
				} else {
					if (waitWILLreply(buf[1]) && supported(buf[1])) {
						enable(buf[1]);
						setWait(WILL, buf[1], false);
					} else {
						if (supported(buf[1])) {
							sendCommand(WILL, buf[1], false);
							enable(buf[1]);
						} else {
							sendCommand(WONT, buf[1], false);
						}
					}
				}
			break;
			case DONT:
				if (waitWILLreply(buf[1]) && supported(buf[1])) {
					setWait(WILL, buf[1], false);
				} else {
					if (supported(buf[1]) && isEnabled(buf[1])) {
						enable(buf[1]);
					}
				}
			break;
			
			case DM:	
			break;
			case SB: 
				if ((supported(buf[1])) && (isEnabled(buf[1]))) {
					switch (buf[1]) {
						case NAWS:
							handleNAWS();
						break;
						case TTYPE:
							handleTTYPE();
						break;
						case LINEMODE:
							handleLINEMODE();
						break;
						case NEWENV:
							handleNEWENV();
						break;
						default:
							;
					}
				} else {
			
				}
			break;
			default:
				;
		}
	};
	
	
	function handleNAWS() {
		var width = read16int();
		if (width == 255) {
			width = read16int(); 
		}
		var height = read16int();
		if (height == 255) {
			height = read16int(); 
		}
		skipToSE();
		setTerminalGeometry(width, height);
	};
	
	function handleTTYPE() {
		var tmpstr = "";
		var b = bytes.readUnsignedByte();
		 
		switch(b) {
			case SEND:
				var cont = true;
				do {
					var i;
					i = bytes.readUnsignedByte();
					if (i == SE) {
						cont = false;
					}
		  
				} while (cont);
				
				_session.flush();
				  	
				TERM.socket.writeByte(IAC);
				TERM.socket.writeByte(SB);
				TERM.socket.writeByte(TTYPE);
				TERM.socket.writeByte(IS);
				writeMultiByte("ansi", "us-ascii");
				TERM.socket.writeByte(IAC);
				TERM.socket.writeByte(SE);
			break;
		  
			case IS:
				tmpstr = readIACSETerminatedString(40);
			break;
		}
	};
	
	function handleLINEMODE() {
		var c = bytes.readUnsignedByte();
		switch (c) {
			case LM_MODE:
				handleLMMode();
			break;
			case LM_SLC:
				handleLMSLC();
			break;
			case WONT:
			case WILL:
				handleLMForwardMask(c);
			break;
			default:
				skipToSE();
		}
	};
	
	function handleLMMode() {
		if (WAIT_LM_MODE_ACK) {
			var mask = bytes.readUnsignedByte();
			if (mask != (LM_EDIT | LM_TRAPSIG | LM_MODEACK)) {
			}
			WAIT_LM_MODE_ACK = false;
		}
		skipToSE();
	};
	
	function handleLMSLC() {
		var triple = [0,0,0];
		if (!readTriple(triple)) return;
		
		if ((triple[0] == 0) && (triple[1] == LM_SLC_DEFAULT) && (triple[2] == 0)) {
			skipToSE();
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(SB);
			TERM.socket.writeByte(LINEMODE);
			TERM.socket.writeByte(LM_SLC);
		
			for (var i = 1; i < 12; i++) {
				TERM.socket.writeByte(i);
				TERM.socket.writeByte(LM_SLC_DEFAULT);
				TERM.socket.writeByte(0);
			}
		
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(SE);
		} else {
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(SB);
			TERM.socket.writeByte(LINEMODE);
			TERM.socket.writeByte(LM_SLC);
			TERM.socket.writeByte(triple[0]);
			TERM.socket.writeByte(triple[1] | LM_SLC_ACK);
			TERM.socket.writeByte(triple[2]);
			while (readTriple(triple)) {
				TERM.socket.writeByte(triple[0]);
				TERM.socket.writeByte(triple[1] | LM_SLC_ACK);
				TERM.socket.writeByte(triple[2]);
			}
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(SE);
		}
	};
	
	function handleLMForwardMask(WHAT) {
		switch (WHAT) {
			case WONT:
				if (WAIT_LM_DO_REPLY_FORWARDMASK) {
					WAIT_LM_DO_REPLY_FORWARDMASK = false;
				}
			break;
		}
		skipToSE();
	};
	
	function handleNEWENV() {
		var c = bytes.readUnsignedByte();
		switch (c) {
			case IS:
				handleNEIs();
			break;
			case NE_INFO:
				handleNEInfo();
			break;
			default:
				skipToSE();
		}
	};
	
	function readNEVariableName(sbuf) {
		var i = -1;
		do {
			i = bytes.readUnsignedByte();
			if (i == -1) {
				return NE_IN_ERROR;
			} else if (i == IAC) {
				i = bytes.readUnsignedByte();
				if (i == IAC) {
					sbuf.concat(i);
				} else if (i == SE) {
					return NE_IN_END;
				} else {
					return NE_IN_ERROR;
				}
			} else if (i == NE_ESC) {
				i = bytes.readUnsignedByte();
				if (i == NE_ESC || i == NE_VAR || i == NE_USERVAR || i == NE_VALUE) {
					sbuf.concat(i);
				} else {
					return NE_IN_ERROR;
				}
			} else if (i == NE_VAR || i == NE_USERVAR) {
				return NE_VAR_UNDEFINED;
			} else if (i == NE_VALUE) {
				return NE_VAR_DEFINED;
			} else {
				if (sbuf.length >= NE_VAR_NAME_MAXLENGTH) {
					return NE_IN_ERROR;
				} else {
					sbuf.concat(i);
				}
			}
		} while (true);
		  
		return i;
	};
	
	function readNEVariableValue(sbuf) {
		var i = bytes.readUnsignedByte();
		if (i == -1) {
			return NE_IN_ERROR;
		} else if (i == IAC) {
			i = bytes.readUnsignedByte();
			if (i == IAC) {
				return NE_VAR_DEFINED_EMPTY;
			} else if (i == SE) {
				return NE_IN_END;
			} else {
				return NE_IN_ERROR;
			}
		} else if (i == NE_VAR || i == NE_USERVAR) {
			return NE_VAR_DEFINED_EMPTY;
		} else if (i == NE_ESC) {
			i = bytes.readUnsignedByte();
			if (i == NE_ESC || i == NE_VAR || i == NE_USERVAR || i == NE_VALUE) {
				sbuf.concat(i);
			} else {
				return NE_IN_ERROR;
			}
		} else {
			sbuf.concat(i);
		}
		  
		do {
			i = bytes.readUnsignedByte();
			if (i == -1) {
				return NE_IN_ERROR;
			} else if (i == IAC) {
				i = bytes.readUnsignedByte();
				if (i == IAC) {
					sbuf.concat(i);
				} else if (i == SE) {
					return NE_IN_END;
				} else {
					return NE_IN_ERROR;
				}
			} else if (i == NE_ESC) {
				i = bytes.readUnsignedByte();
				if (i == NE_ESC || i == NE_VAR || i == NE_USERVAR || i == NE_VALUE) {
					sbuf.concat(i);
				} else {
					return NE_IN_ERROR;
				}
			} else if (i == NE_VAR || i == NE_USERVAR) {
				return NE_VAR_OK;
			} else {
				if (sbuf.length > NE_VAR_VALUE_MAXLENGTH) {
					return NE_IN_ERROR;
				} else {
					sbuf.concat(i);
				}
			}
		} while (true);
		  
		return i;
	};
	
	
	function readNEVariables() {
		var sbuf = "";
		var i = bytes.readUnsignedByte();
		if (i == IAC) {
			skipToSE();
			console.log("readNEVariables()::INVALID VARIABLE");
			return;
		}
		var cont = true;
		if (i == NE_VAR || i == NE_USERVAR) {
			do {
				switch (readNEVariableName(sbuf)) {
					case NE_IN_ERROR:
						console.log("readNEVariables()::NE_IN_ERROR");
					return;
					case NE_IN_END:
						console.log("readNEVariables()::NE_IN_END");
					return;
					case NE_VAR_DEFINED:
						console.log("readNEVariables()::NE_VAR_DEFINED");
						var str = sbuf;
						sbuf = "";
						switch (readNEVariableValue(sbuf)) {
							case NE_IN_ERROR:
								console.log("readNEVariables()::NE_IN_ERROR");
								return;
							case NE_IN_END:
								console.log("readNEVariables()::NE_IN_END");
								return;
							case NE_VAR_DEFINED_EMPTY:
								console.log("readNEVariables()::NE_VAR_DEFINED_EMPTY");
							break;
							case NE_VAR_OK:
								console.log("readNEVariables()::NE_VAR_OK:VAR=" + str + " VAL=" + sbuf.toString());
								sbuf = "";
							break;
						}
					break;
					case NE_VAR_UNDEFINED:
						console.log("readNEVariables()::NE_VAR_UNDEFINED");
					break;
				}
			} while (cont);
		}
	};
	
	function handleNEIs() {
		if (isEnabled(NEWENV)) {
			readNEVariables();
		}
	};
	
	function handleNEInfo() {
		if (isEnabled(NEWENV)) {
			readNEVariables();
		}
	};
	
	function getTTYPE() {
		if (isEnabled(TTYPE)) {
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(SB);
			TERM.socket.writeByte(TTYPE);
			TERM.socket.writeByte(SEND);
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(SE);
		}
	};
	
	function negotiateLineMode() {
		if (isEnabled(LINEMODE)) {
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(SB);
			TERM.socket.writeByte(LINEMODE);
			TERM.socket.writeByte(LM_MODE);
			TERM.socket.writeByte(LM_EDIT | LM_TRAPSIG);
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(SE);
			WAIT_LM_MODE_ACK = true;
			
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(SB);
			TERM.socket.writeByte(LINEMODE);
			TERM.socket.writeByte(DONT);
			TERM.socket.writeByte(LM_FORWARDMASK);
			TERM.socket.writeByte(IAC);
			TERM.socket.writeByte(SE);
			WAIT_LM_DO_REPLY_FORWARDMASK = true;
		}
	};
	
	function negotiateEnvironment() {
		if (isEnabled(NEWENV)) {
			ba.TERM.socket.writeByte(IAC);
			ba.TERM.socket.writeByte(SB);
			ba.TERM.socket.writeByte(NEWENV);
			ba.TERM.socket.writeByte(SEND);
			ba.TERM.socket.writeByte(NE_VAR);
			ba.TERM.socket.writeByte(NE_USERVAR);
			ba.TERM.socket.writeByte(IAC);
			ba.TERM.socket.writeByte(SE);
			WAIT_NE_SEND_REPLY = true;
		}
	};
	
	function skipToSE() {
		while (bytes.readUnsignedByte() != SE) ;
	};
	
	function readTriple(triple) {
		triple[0] = bytes.readUnsignedByte();
		triple[1] = bytes.readUnsignedByte();
		if ((triple[0] == IAC) && (triple[1] == SE)) {
			return false;
		} else {
			triple[2] = bytes.readUnsignedByte();
			return true;
		}
		  
		return false;
	};
	
	
	function readIACSETerminatedString(maxlength) {
		var where = 0;
		var cbuf = [];
		var b = ' ';
		var cont = true;
		
		do {
			var i;
			i = bytes.readUnsignedByte();
			switch (i) {
				case IAC:
					i = bytes.readUnsignedByte();
					if (i == SE) {
					cont = false;
					}
				break;
				case -1:
					return ("default");
				default:
			}
			if (cont) {
				b = i.toString();
				if (b == '\n' || b == '\r' || where == maxlength) {
					cont = false;
				} else {
					cbuf[where++] = b;
				}
			}
		} while (cont);
		
		var str = "";
		for(var j=0; j<where; j++) {
			str.concat(cbuf[i]);
		}
		
		return (str);
	};
	
	function supported(i) {
		switch (i) {
			case SUPGA:
			case ECHO:
			case NAWS:
			case TTYPE:
				return true;
			case LINEMODE:
				return false;
			default:
				return false;
		}
	};
	
	function sendCommand(i, j, westarted) {
		TERM.socket.writeByte(IAC);
		TERM.socket.writeByte(i);
		TERM.socket.writeByte(j);
		  
		if ((i == DO) && westarted) setWait(DO, j, true);
		if ((i == WILL) && westarted) setWait(WILL, j, true);
	};
	
	function enable(i) {
		switch (i) {
			case SUPGA:
				if (DO_SUPGA) {
					DO_SUPGA = false;
				} else {
					DO_SUPGA = true;
				}
			break;
			case ECHO:
				if (DO_ECHO) {
					DO_ECHO = false;
				} else {
					DO_ECHO = true;
				}
			break;
			case NAWS:
				if (DO_NAWS) {
					DO_NAWS = false;
				} else {
					DO_NAWS = true;
				}
			break;
			case TTYPE:
			if (DO_TTYPE) {
					DO_TTYPE = false;
				} else {
					DO_TTYPE = true;
					getTTYPE();
				}
			break;
			case LINEMODE:
				if (DO_LINEMODE) {
					DO_LINEMODE = false;
				} else {
					DO_LINEMODE = true;
					negotiateLineMode();
				}
			break;
			case NEWENV:
				if (DO_NEWENV) {
					DO_NEWENV = false;
				} else {
					DO_NEWENV = true;
					negotiateEnvironment();
				}
			break;
		}
	};
	
	function isEnabled(i) {
		switch (i) {
			case SUPGA:
				return DO_SUPGA;
			case ECHO:
				return DO_ECHO;
			case NAWS:
				return DO_NAWS;
			case TTYPE:
				return DO_TTYPE;
			case LINEMODE:
				return DO_LINEMODE;
			case NEWENV:
				return DO_NEWENV;
			default:
				return false;
		}
		  
		return false;
	};
	
	function waitWILLreply(i) {
		switch (i) {
			case SUPGA:
				return WAIT_WILL_REPLY_SUPGA;
			case ECHO:
				return WAIT_WILL_REPLY_ECHO;
			case NAWS:
				return WAIT_WILL_REPLY_NAWS;
			case TTYPE:
				return WAIT_WILL_REPLY_TTYPE;
			default:
				return false;
		}
	  
		return false;
	};
	
	function waitDOreply(i) {
		switch (i) {
			case SUPGA:
				return WAIT_DO_REPLY_SUPGA;
			case ECHO:
				return WAIT_DO_REPLY_ECHO;
			case NAWS:
				return WAIT_DO_REPLY_NAWS;
			case TTYPE:
				return WAIT_DO_REPLY_TTYPE;
			case LINEMODE:
				return WAIT_DO_REPLY_LINEMODE;
			case NEWENV:
				return WAIT_DO_REPLY_NEWENV;
			default:
				return false;
		}
		  
		return false;
	};
	
	function setWait(WHAT, OPTION, WAIT) {
		switch (WHAT) {
			case DO:
			switch (OPTION) {
				case SUPGA:
					WAIT_DO_REPLY_SUPGA = WAIT;
				break;
				case ECHO:
					WAIT_DO_REPLY_ECHO = WAIT;
				break;
				case NAWS:
					WAIT_DO_REPLY_NAWS = WAIT;
				break;
				case TTYPE:
					WAIT_DO_REPLY_TTYPE = WAIT;
				break;
				case LINEMODE:
					WAIT_DO_REPLY_LINEMODE = WAIT;
				break;
				case NEWENV:
					WAIT_DO_REPLY_NEWENV = WAIT;
				break;
			}
			break;
			case WILL:
				switch (OPTION) {
				case SUPGA:
					WAIT_WILL_REPLY_SUPGA = WAIT;
				break;
				case ECHO:
					WAIT_WILL_REPLY_ECHO = WAIT;
				break;
				case NAWS:
					WAIT_WILL_REPLY_NAWS = WAIT;
				break;
				case TTYPE:
					WAIT_WILL_REPLY_TTYPE = WAIT;
				break;
			}
			break;
		}
		  
		return false;
	};

	this.init();
	
};