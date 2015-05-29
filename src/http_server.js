/**
 * Created by mor on 14-7-10.
 */
"use strict";
var http = require('http'),
    url = require("url"),
    os = require('os');

var constants = require('./constants.js');

var runtime= require('./runtime.js'),
    winNotify=require('./win_notify.js'),
    redis = constants.useRetargeting ? require('./redis_0.js') : require('./redis.js');

var cluster = require('cluster');

var qs = require('querystring');
var stats = require('./stats.js');
var log4lm =require('./logger.js');
var bid = require('./bid.js');

var timers = require('./timers.js');

var utils = require('./utils.js');
var applog = require('./app_log.js');

var totalRequestNums = 0;

var workerId=0;
var workerProcessId =0;

 
process.on('message', function(msg) {
    var result={};
    switch (msg.type) {
        case 'config/update':
            constants.nobid = true;
            break;
        case 'stats/list':
            result = {
                'workerId':workerId,
                'workerProcessId':workerProcessId,
                'stats':stats
            };
            break;
        case 'constants/list':
            result = {
                'workerId':workerId,
                'workerProcessId':workerProcessId,
                'constants':constants
            };
            break;
    }
    process.send(result);
});


/**
 * rtb bid/win处理接口
 * 
 */
var paths={
    'bid':function(runtimeObj){
        stats.totalAuctions++;

        //not post
        if(runtimeObj.req.method!='POST'){
            res_bid.no_bid(runtimeObj.res);
            return;
        }
        //post
        var post='';
        runtimeObj.req.on('data',function(chunk){
            post+=chunk;
        });

        runtimeObj.req.on('end',function(){

            timers.logTimer(runtimeObj,'on data');

            //开始打印请求的json
            runtimeObj.loggerRequest.info('Recv Bid Req[%s], on[%s] => %s',JSON.parse(post).id, runtimeObj.partner,  post);

            runtimeObj.bidReqJSON=JSON.parse(post);

            bid.bid(runtimeObj,function(runtimeObj){

                timers.logTimer(runtimeObj,'on end');

                timers.showTimers(runtimeObj);

                if(runtimeObj.isLogdisplay){
                    runtimeObj.bidAct = 'log';
                }

                res_bid[runtimeObj.bidAct](runtimeObj);
                //结束响应的json
                var bidResJson = runtimeObj.bidResJSON;

                if(!!bidResJson){
                    runtimeObj.loggerBid.info('Send Bid Res[%s], on[%s] => %s', bidResJson.id, runtimeObj.partner, JSON.stringify(bidResJson));
                }
            });
        });
    },
    'win':function(runtimeObj){
        stats.wonAuctions++;

        winNotify.winNotify(runtimeObj,function(err){

            if(err)
                applog.error(['win_notify error',runtimeObj.req.url,err].join(','));

            applog.win(runtimeObj.req.url);

            runtimeObj.loggerWin.info('win_notify=>',runtimeObj.req.url);

            res_bid['win'](runtimeObj.res);
        });
    }

};

/**
 * http response处理方法
 * 
 */
var res_bid={
    'log':function(runtimeObj){
        var resLog ={
            bidTimers: runtimeObj.bidTimers,
            isTest: runtimeObj.isTest,
            isLogdisplay: runtimeObj.isLogdisplay,
            logs: runtimeObj.logs,
            partner: runtimeObj.partner,
            nobidReason: runtimeObj.nobidReason,
            bidResJSON: runtimeObj.bidResJSON
        };
        var bidResJSON =JSON.stringify(resLog);
        runtimeObj.res.writeHead(200, {'Content-Type': 'application/json',
        'Content-Length':bidResJSON.length,
        'Connection': 'keep-alive'});
        runtimeObj.res.end(bidResJSON);
    },
    //出价的时候的http信息返回
    'bid':function(runtimeObj){

        stats.totalBidPrice+=0.7;
        stats.totalBids++;

        var bidResJSON = JSON.stringify(runtimeObj.bidResJSON);
        runtimeObj.res.writeHead(200, {'Content-Type': 'application/json',
            'Content-Length':bidResJSON.length,
            'Connection': 'keep-alive'});
        runtimeObj.res.end(bidResJSON);

    },
    //不出价的时候的http信息返回
    'no_bid':function(runtimeObj){

        stats.totalNoBids++;

        if (stats.totalAuctions>10000000) {
            stats = {
                totalAuctions:0 ,
                totalBids:0 ,
                totalNoBids:0 ,
                wonAuctions:0 ,
                totalBidPrice:0 ,
                totalWonPrice:0 ,

                nobidReasons:{}
            };
        } else if(!stats.nobidReasons[runtimeObj.nobidReason || 'unknown']){
            stats.nobidReasons[runtimeObj.nobidReason || 'unknown'] = 1;
        } else {
            stats.nobidReasons[runtimeObj.nobidReason || 'unknown']++;
        }

        if(runtimeObj.isTest ){
            var msg ='auctionId:{auctionId} - nobidReason:{nobidReason}';
            msg = msg.replace('{auctionId}',(runtimeObj.bidReqJSON || {}).id||'').replace('{nobidReason}',runtimeObj.nobidReason||'');
            applog.debug(runtimeObj,msg);   
        }

        runtimeObj.res.writeHead(204, {'Content-Length':0,
            'Connection': 'keep-alive'});
        runtimeObj.res.end('');

    },
    'win':function(res){
        res.writeHead(200, {'Content-Length':0,
            'Connection': 'keep-alive'});
        res.end();
    },
    'stats':function(res,content){
        res.writeHead(200, {'Content-Type': 'application/json',
            'Content-Length':content.length});

        res.end(content);
    },
    'err':function(runtimeObj,err){
        applog.error(err || err.message|| '');
        runtimeObj.res.writeHead(204, {'Content-Length':0,
            'Connection': 'keep-alive'});
        runtimeObj.res.end('');
    },
    'adserv':function(res){
        var html='<html><body><a><img src=\'http://www.mobileapptracking.com/img/common/mat-acquires-mdhq.png\' /></a></body></html>';
        res.writeHead(200, {'Content-Length':html.length,
            'Connection': 'keep-alive'});
        res.end(html);
    },
    'ping':function(res){
        var content='pong';
        res.writeHead(200, {'Content-Length':content.length,
            'Connection': 'keep-alive'});
        res.end(content);
    }

};

/**
 * smaato tool test
 * 
 */
var gettestbid = function(request){
    var getQuery = url.parse(request.url).query;
    var getData = qs.parse(getQuery); //getData数据 
    return getData["testbid"];
}

var getparam = function(request,name){
    var getQuery = url.parse(request.url).query;
    var getData = qs.parse(getQuery); //getData数据 
    return getData[name];
}

/**
 * http server启动方法
 * 
 */
exports.http_server = function(worker){
    workerId = worker.id;
    workerProcessId = worker.process.pid;

    var loggerRequest=log4lm.getLogger('req-' + worker.id);
    var loggerBid=log4lm.getLogger('bid-' + worker.id);
    var loggerWin=log4lm.getLogger('win-' + worker.id);

    function onRequest(req, res) {     

        var isTest = getparam(req,'test')=='1' || !!constants.debug;
        var isLogdisplay = getparam(req,'log')=='1';

        loggerRequest=log4lm.getLogger('req-' + worker.id);
        loggerBid=log4lm.getLogger('bid-' + worker.id);
        loggerWin=log4lm.getLogger('win-' + worker.id);

        var runtimeObj=new runtime();

        runtimeObj.loggerWin = loggerWin;
        runtimeObj.loggerRequest = loggerRequest;
        runtimeObj.loggerBid = loggerBid;
        runtimeObj.req=req;
        runtimeObj.res=res;
        runtimeObj.redis=redis;
        runtimeObj.bidTimers =[];
        runtimeObj.isTest =isTest;
        runtimeObj.isLogdisplay =isLogdisplay;
        runtimeObj.logs =[];

        if(runtimeObj.isTest){
            applog.debug(runtimeObj,'---------------------------');
            applog.debug(runtimeObj,'request begin......');
            applog.debug(runtimeObj,'req.url:' + req.url);
        }

        if(req.url.split('/').length<3){
            res_bid.err(runtimeObj,req.url);
            return;
        }
        var partner = req.url.split('/')[1].toLowerCase();
        var pathname = req.url.split('/')[2].toLowerCase();
  
        runtimeObj.partner = partner;

        totalRequestNums++;
/*        logger.info('worker [%d]', process.pid);      
        logger.info('pathname -> ' + pathname);*/

        if(pathname=='ping'){
            res_bid.ping(res);
        }
        else if(pathname=='adserv'){
            res_bid.adserv(res);
        }
        else if(constants.partners.indexOf(partner)==-1){//判断是否为支持的exchange
            res_bid.err(runtimeObj,'{partner} not supported.'.replace('{partner}',partner));
        }         
        else if(pathname=='stats'){//smaato tool test
            res_bid.stats(res,JSON.stringify(stats));
        }
        else if(partner == 'smaato' && gettestbid(req)=='nobid'){//smaato tool test
            res_bid.err(runtimeObj,'smaato tool no bid test');
        }
        else if(!redis.getStatus()){//判断redis client是否准备好了
            res_bid.err(runtimeObj,'redis zk client not ready.');
        } else {
            timers.logTimer(runtimeObj,'on reuqest');

            if(pathname.indexOf('?')>-1)
                pathname = pathname.split('?')[0];
            
            if(paths[pathname]){
                try{
                    paths[pathname].apply(this, [runtimeObj]);
                }catch(err) {

                    //todo:err
                    res_bid.err(runtimeObj,err);
                }
            } else {
                res_bid.err(runtimeObj,'ERR: pathname:{pathname},url:{url}.'.replace('{pathname}',pathname).replace('{pathname}',req.url));
            }
        }

    }

    if(!!worker)
        applog.info('worker: Server[%d], with pid[%d], has started.', worker.id,  worker.process.pid);

    return http.createServer(onRequest);
};
