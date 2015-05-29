/**
 * Created by zhangliming on 14-7-17.
 */
var winNotify= require('../src/win_notify.js');

var http = require('http');
var runtime= require('../src/runtime.js');
var logger=require('../src/logger.js').logger('master').getLogger('aaa');

var redis = require("redis"),
    default_port = 6379,
    default_host = "172.20.0.20",
    client = redis.createClient(default_port,default_host);



 http.createServer(function (req, res) {


    var pathname=req.url.split('/')[2];
    logger.info('pathname=>'+pathname);

    var runtimeObj=new runtime();
    runtimeObj.logger=logger;
    runtimeObj.req=req;
    runtimeObj.res=res;
    runtimeObj.redis=client;

    winNotify.winNotify(runtimeObj);

}).listen(8000);
