"use strict";
/**
 * Created by zhangliming on 14-7-16.
 * 遵循文档里的格式
 * http://adserver.com/mopub/win/${AUCTION_ID}/${AUCTION_BID_ID}/$
 {AUCTION_IMP_ID}/${AUCTION_SEAT_ID}/${AUCTION_AD_ID}/${AUCTION_PRICE}/0.999
 */
var constants =require('./constants.js');
var stats = require('./stats.js');
var utils = require('./utils.js');

/**
 * win notice方法
 */
exports.winNotify=function(runtimeObj,func){
    var notify=runtimeObj.req.url.split('/');

    var bidid = notify[4];
    var adid=notify[7];
    var price=notify[8];
    var deviceid = bidid;
    var perf;
    var bidids =bidid.split('_');
    if(bidids.length==6){
        deviceid = bidids[0];
        perf={
            'appid':bidids[1],
            'adid':bidids[2],
            'width':bidids[3],
            'height':bidids[4],
            'partner':bidids[5]
        }
    }    

    stats.totalWonPrice+=parseFloat(price);

    runtimeObj.redis.addMediaCostAndCounter(runtimeObj,deviceid,adid,price,perf,function(err){
        if(!!func)
            func(err);
    });
};