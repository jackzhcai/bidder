var fs = require('fs'),
	os = require('os'),
	eol = os.EOL || '\n';

var utils = require('./utils.js');
var constants = require('./constants.js');
var util=require('util');

var writeLog = function(message, level) {
	var ip = utils.getLocalIP(null,'IPv4');
	var todayLogSuffix = [ip, utils.dateformat(new Date(), "yyyyMMdd"), level].join('-');
	var fileName = constants.logFilePath + todayLogSuffix + '.log';
	var msg =[utils.dateformat(new Date(),"yyyy-MM-dd hh:mm:ss.S"), ip, message].join(' - ') + eol;
	fs.appendFileSync(fileName, msg);
}

exports.info = function(message) {
	if(arguments && arguments.length>1){
		message = util.format.apply(null, arguments);
	}
	writeLog(message, 'info');
};

exports.error = function(message) {
	if(arguments && arguments.length>1){
		message = util.format.apply(null, arguments);
	}
	writeLog(message, 'error');
};

exports.debug = function(runtimeObj,message) {
	if(runtimeObj.isTest || !!constants.debug){
		writeLog(message, 'debug');
		runtimeObj.logs.push(message);
	}	
};

exports.win = function(message) {
	if(arguments && arguments.length>1){
		message = util.format.apply(null, arguments);
	}
	writeLog(message, 'win');
};

