var EventEmitter = require('events').EventEmitter;
var util=require('util');

function A(){
	var self =this;
	this.do = function(){
		try{
			self.m.m=1;
			self.emit('ok','a','b');
		} catch(err){
			self.emit('error',err);
		}
	}

	//EventEmitter.call(this);
}
util.inherits(A, EventEmitter);

function B(){
	var a = new A();
	a.on('ok',function(a,b){
		console.log('ok');
		console.log(a + b);
	}).on('error',function(err){
		console.log('ERROR:'+err);
	});
	a.do();
}


var b = new B();