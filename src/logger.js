/**
 * Created by zhangliming on 14-8-18.
 */
 "use strict";
var fs=require('fs');
var util=require('util');
var constants = require('./constants.js');

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


function Log(){
    this.logStream;
    this.buffer=new Buffer(40960000);
    this.bufferSize=0;
}

Log.prototype.createStream=function(logSuffix){
    var fileName=constants.dataFilePath+logSuffix+'.log';
    this.logStream = fs.createWriteStream(fileName, {'flags': 'a'});
};

Log.prototype.closeStream=function(){
    this.logStream.close();
};

Log.prototype.info=function(){
      var message=util.format.apply(null, arguments);
      var log=util.format("%s - %s\n",new Date().toISOString(),message);

      var logLen=Buffer.byteLength(log, 'utf8');
      this.buffer.write(log,this.bufferSize,logLen,'utf8');
      this.bufferSize+=logLen;
};

Log.prototype.start=function(){
    var self=this;
    setInterval(function(){
        if(self.bufferSize>0){
            self.logStream.write(self.buffer.slice(0,self.bufferSize));
            self.bufferSize=0;
        }
    },1000);
};

var logs={};

function createNewLog(logSuffix){
 var logger = new Log();
 logger.createStream(logSuffix);
 logger.start();
 return logger;
 }

exports.getLogger=function(workid){
    var nowDateTime=new Date();
    var todayLogSuffix=workid+'-'+nowDateTime.format('yyyyMMdd');
    var logger=logs[todayLogSuffix];
    if(!logger){
        logger=createNewLog(todayLogSuffix);
        logs[todayLogSuffix]=logger;
        var yesterdayLogSuffix=workid+'-'+(new Date(nowDateTime.getTime()-86400000).format('yyyyMMdd'));
        var yesterdayLog= logs[yesterdayLogSuffix];
        if(yesterdayLog){
            yesterdayLog.closeStream();
            delete logs[yesterdayLogSuffix];
        }

    }
    return logger;
};