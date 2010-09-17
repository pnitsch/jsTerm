/**
 * @author Peter Nitsch
 */

TERM.ByteArray = function (bytes){
	
	this.position = 0;
	this.stringdata = bytes;
	
	this.readUnsignedByte = function(){
		var b = this.stringdata.charCodeAt(this.position);
		if(this.position!=this.stringdata.length) this.position++;
		return b;
	};
	
	this.writeByte = function(){
		// TO DO
	};

};

TERM.ByteArray.prototype = {
	
	get bytesAvailable (){
		return this.stringdata.length - this.position;
	},
	get length (){
		return this.stringdata.length;
	}
	
};

