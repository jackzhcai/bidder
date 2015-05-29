"use strict";
var constants = require('./constants.js');
var async = require("async");
var utils = require('./utils.js');
var useZK = constants.useZKredis;
var redis = useZK ? require("redis-client-ch") : require("redis");
var timers = require('./timers.js');
var _ = require("underscore");
var applog = require('./app_log.js');
var stats = require('./stats.js');

var default_port = constants.redis.port,
	default_host = constants.redis.host,

	client = useZK ? redis.getClient({servers:constants.zkHosts,chroot:constants.chroot},['sinter','mget','hgetall','ttl','get','smembers','sunion','sismember','hmget'],['set','incr','incrby','decrby','expire','srem','incrbyfloat'])
			:redis.createClient(default_port, default_host);


client.on("error", function(err) {
	applog.error("Redis Client Error :" + err);
});

var initialized =true;

if (useZK) {
	initialized = false;
	client.on('ok', function() {
		initialized = true;
	});
}


/**
 * 返回zookeeper redis状态，初始化ok后可以调用redis方法
 */
function getStatus(){
	return initialized;
}


/**
 * 获取可以用于投放的广告及其出价
 *  1.获取国家、分类、可投放ad的交集
 *  2.获取备选广告的adsetting
 *  3.根据device来过滤frequece不用投放的ad
 *  4.获取ad+appid+w+h+os的出价
 */
function getAllAds(runtimeObj,perf,func) {
	var deviceid = perf.deviceid;
	var country = perf.country;
	var category = perf.category;  
	var devicetype = perf.devicetype;
	var os = perf.os;
	var appid_exchange = perf.appid_exchange;
	var appid = perf.appid;
    var wh = perf.w+'x'+perf.h;
    var dimension = perf.dimension;
    var priceAtApp = constants.defaultPrice[dimension] || 1;

	async.waterfall([
		function(callback){

			var keyOfTargetAppid = 'target_adspace_{country}'.replace('{country}',country);
			var target='target';
			client.hmget(keyOfTargetAppid,target,appid_exchange,function(err, data){
				if(!err){
					if(data[0]=='1' || data[0]==1){
						if(+data[1]>0){
							priceAtApp = +data[1];
							callback(null);
						} else {
							callback('key:{countryKey} not contains adspace:{adspace}'.replace('{countryKey}',keyOfTargetAppid).replace('{adspace}',appid_exchange));
						}
					} else {
						callback(null);
					}
				} else {
					callback(err);
				}
			});

		},		
		function(callback) {//
			var setKeys = [];
			//setKeys[setKeys.length] = constants.redis.keyPrefixs.category_ads.replace('{category}',category[0]);
			setKeys[setKeys.length] = constants.redis.keyPrefixs.country_ads.replace('{country}',country);
			setKeys[setKeys.length] = constants.redis.keyPrefixs.budget_ads;
			setKeys[setKeys.length] = constants.redis.keyPrefixs.os_ads.replace('{os}',os);
            setKeys[setKeys.length] = constants.redis.keyPrefixs.target_size_set.replace('{size}',wh);

			applog.debug(runtimeObj,"intersectKeys:" + setKeys);

			client.sinter(
				setKeys,
				function(err, data) {

					if(constants.useTestAd){
						data=constants.testAds;
					}

					timers.logTimer(runtimeObj,'on category&country&budget&os&size');
					applog.debug(runtimeObj,'on category&country&budget&os&size:'+data);
		
					
					if(!err && data.length>0){
						callback(null, data);
					} else {
						callback(err || "intersect empty:" + setKeys.join(','));
					}
				});
		},		
		function(adids,callback) {//

			var setKeys = [];
			for (var i = 0; i < adids.length; i++) {
				setKeys[setKeys.length] = 'compare_cost_{appid}_{adid}_{width}_{height}'
							.replace('{appid}',appid_exchange)
							.replace('{adid}',adids[i])
							.replace('{width}',perf.w)
							.replace('{height}',perf.h);
			}
			applog.debug(runtimeObj,'compare keys:'+setKeys);
			client.mget(
				setKeys,
				function(err, data) {

					timers.logTimer(runtimeObj,'on app&ad');
					applog.debug(runtimeObj,'on filter app&ad:'+data);

					if(!err && data.length>0){
						var budgets = constants.targetAppBudgetPerAd;

						var resultads = [];
						for (var i = 0; i < data.length; i++) {
							if(!data[i] || +data[i]<budgets){
								resultads[resultads.length] = adids[i];
							} 
						}

						if(resultads.length>0){
							callback(null, deviceid, perf, resultads);
						} else {
							callback("app&ad empty");
						}						
					} else {
						callback(err || "intersect empty");
					}
				});
		
		},
		function(deviceid, perf, adids, callback) {//

			var adbidKeys = [];
			for (var i = 0; i < adids.length; i++) {
				adbidKeys[adbidKeys.length] = constants.redis.keyPrefixs.ad.replace('{ad}',adids[i]);
			}
			client.mget(adbidKeys, function(err, replies) {
				timers.logTimer(runtimeObj,'on ad_settings');

				if(!err && replies.length>0){
					callback(null, deviceid, perf, adids, replies);
				} else {
					callback(err || "adinfos empty");
				}
			});
		},
		function(deviceid, perf, adids, ads, callback) {//
			var counterKeys = []
			for (var i = 0; i < adids.length; i++) {
				counterKeys[counterKeys.length] =
					constants.redis.keyPrefixs.ad_counter.replace('{deviceid}',deviceid).replace('{ad}',adids[i]);
			}

			client.mget(counterKeys, function(err, replies) {
				timers.logTimer(runtimeObj,'on counter');

				if(!err){

					var adkeys = [];
					var resultads = [];
					for (var i = 0; i < replies.length; i++) {
						if(!ads[i])continue;
						var counter = ads[i].split('|')[2];
						if (!replies[i] || +replies[i] < +counter) {
							adkeys[adkeys.length] = adids[i];
							resultads[resultads.length] = ads[i];
						}
					}


					if(constants.useTestAd){
						adkeys=constants.testAds;
						resultads=ads;
					}

					if(adkeys.length>0 && resultads.length>0){

						applog.debug(runtimeObj,'ad counter ads:'+adkeys);

						callback(null, perf, adkeys, resultads);
					} else {
						callback('no ads on ad_counter');
					}

				} else {
					callback(err);
				}
			});
		},
		function(perf, adids, ads, callback) {//
			var perfKeys = [];
			for (var i = 0; i < adids.length; i++) {
				perfKeys[perfKeys.length] =
					constants.redis.keyPrefixs["performance5"]
						.replace('{adid}',adids[i])
						.replace('{appid}',perf.appid)
						.replace('{width}',perf.w)
						.replace('{height}',perf.h)
						.replace('{os}',perf.os);

				perfKeys[perfKeys.length] =
					constants.redis.keyPrefixs["performance5"]
						.replace('{adid}',adids[i])
						.replace('{appid}','others')
						.replace('{width}',perf.w)
						.replace('{height}',perf.h)
						.replace('{os}',perf.os);
			}
			perfKeys[perfKeys.length] =
					constants.redis.keyPrefixs["performance4"]
						.replace('{appid}',perf.appid)
						.replace('{width}',perf.w)
						.replace('{height}',perf.h)
						.replace('{os}',perf.os);
			perfKeys[perfKeys.length] =
					constants.redis.keyPrefixs["performance3"]
						.replace('{width}',perf.w)
						.replace('{height}',perf.h)
						.replace('{os}',perf.os);

			applog.debug(runtimeObj,"perfKeys:" + perfKeys);

			client.mget(perfKeys, function(err, perf) {
				timers.logTimer(runtimeObj,'on performance');

				if(!err && perf.length>0){
					callback(null, adids, ads, perf,priceAtApp);
				} else {
					callback(err || 'no performance cpm');
				}
			});
		}
	], function(err, adids, ads, perf, priceAtApp) {

		applog.debug(runtimeObj,"end err:" + err);
		applog.debug(runtimeObj,"end adids:" + adids);
		applog.debug(runtimeObj,"end ads:" + ads);
		applog.debug(runtimeObj,"end performace:" + perf);
		applog.debug(runtimeObj,"end priceAtApp:" + priceAtApp);

		if (!!func) {
			func(err, adids, ads, perf, priceAtApp);
		}

	});
}


/**
 * 对每天每个广告的bid花费计数
 * 如果bid超过20块并且今天的点击数为0则停止投放该广告
 * 对device级别累计counter
 * 对每天每个广告的win次数进行计数
 */
function addMediaCostAndCounter(runtimeObj,deviceid,adid,price,perf, func) {
	var partner =(perf || {}).partner;
	async.waterfall([
		function(callback) {//累计mediaCost
			if(perf){
			    var keyOfAdAppCost=	'compare_cost_{appid}_{adid}_{width}_{height}'
								.replace('{appid}',perf.appid)
								.replace('{adid}',perf.adid)
								.replace('{width}',perf.width)
								.replace('{height}',perf.height);
				applog.debug(runtimeObj,'keyOfAdAppCost key is:' + keyOfAdAppCost);
				client.incrbyfloat(
					keyOfAdAppCost,price/1000,
					function(err, cost) {
						applog.debug(runtimeObj,'keyOfAdAppCost:' + cost);

						if(!err){
							callback(null);
						} else {
							callback(err);
						}
					});
			} else {
				callback(null);
			}
		},
		function(callback) {//累计mediaCost
		    var keyOfAdTodayCostPartner=constants.redis.keyPrefixs.ad_today_cost_partner
		    		.replace('{date}',utils.dateformat(new Date(),"yyyyMMdd"))
		    		.replace('{ad}',adid)
		    		.replace('{partner}',partner);

			client.incrbyfloat(
				keyOfAdTodayCostPartner,price/1000,
				function(err, cost) {
					applog.debug(runtimeObj,'keyOfAdTodayCostPartner:' + cost);

					if(!err){
						callback(null);
					} else {
						callback(err);
					}
				});
		},
		function(callback) {//累计mediaCost
		    var keyOfAdTodayCost=constants.redis.keyPrefixs.ad_today_cost
		    		.replace('{date}',utils.dateformat(new Date(),"yyyyMMdd"))
		    		.replace('{ad}',adid);

			client.incrbyfloat(
				keyOfAdTodayCost,price/1000,
				function(err, cost) {
					applog.debug(runtimeObj,'keyOfAdTodayCost:' + cost);

					if(!err){	
						callback(null, cost);
					} else {	
						callback(err);
					}
				});
		},
		function(cost,callback) {//获取点击数

			var keyOfAdTodayClick=constants.redis.keyPrefixs.ad_today_click
					.replace('{date}',utils.dateformat(new Date(),"yyyyMMdd"))
		    		.replace('{ad}',adid);

			client.get(keyOfAdTodayClick, function(err, click) {
				applog.debug(runtimeObj,'keyOfAdTodayClick:'+click);

				if(!err){
					callback(null,cost,click||0);
				} else {
					callback(err);
				}
			});

		},
		function(cost,click,callback){
			var keyOfAdTodayTotal=constants.redis.keyPrefixs.ad_today_total
					.replace('{date}',utils.dateformat(new Date(),"yyyyMMdd"))
		    		.replace('{ad}',adid);

    		client.get(keyOfAdTodayTotal, function(err, total) {
				applog.debug(runtimeObj,'keyOfAdTodayTotal:'+total);

				if(!err){
					callback(null,cost,click,total);
				} else {
					callback(err);
				}
			});

		},
		function(cost,click,total,callback) {//判断是否移除ad
			applog.debug(runtimeObj,'cost:{cost},click:{click},total:{total}'.replace('{cost}',cost).replace('{click}',click).replace('{total}',total));
			if( (+cost>=+total || +click==0 &&  +cost>=20)){//+cost>=+total ||
				client.srem(constants.redis.keyPrefixs.budget_ads,adid, function(err, replies) {
					//把budget_left置为0
					var keyOfAdBudgetLeft=constants.redis.keyPrefixs.ad_budget_left
						.replace('{date}',utils.dateformat(new Date(),"yyyyMMdd"))
						.replace('{ad}',adid);

					client.set(keyOfAdBudgetLeft,0,function(err,reply){
						callback(err);
					});
				});
			}else {
				callback(null);
			} 
		},
		function(callback){//累计deviceid的counter
 			var keyOfCounter = constants.redis.keyPrefixs.ad_counter
				.replace('{deviceid}',deviceid)
				.replace('{ad}',adid);

			client.incr(keyOfCounter,function(err,data){
				applog.debug(runtimeObj,'keyOfCounter incr:' + data);
				callback(err);
			});
		},
		function(callback){//自增win数
			var keyOfAdTodayWinPartner = constants.redis.keyPrefixs.ad_today_win_partner
				.replace('{date}', utils.dateformat(new Date(), "yyyyMMdd"))
				.replace('{ad}', adid)
				.replace('{partner}',partner);

			client.incr(keyOfAdTodayWinPartner, function(err) {
				callback(err);
			});
		},
		function(callback){//自增win数
			var keyOfAdTodayWin = constants.redis.keyPrefixs.ad_today_win
				.replace('{date}', utils.dateformat(new Date(), "yyyyMMdd"))
				.replace('{ad}', adid);

			client.incr(keyOfAdTodayWin, function(err) {
				callback(err);
			});
		},
		function(callback){//判断是否需要设置过期时间
			var keyOfAdid = constants.redis.keyPrefixs.ad.replace('{ad}',adid);
			var keyOfCounter = constants.redis.keyPrefixs.ad_counter
				.replace('{deviceid}',deviceid)
				.replace('{ad}',adid);
			
			client.ttl(keyOfCounter, function(err, reply) {
					applog.debug(runtimeObj,'verify ttl:' +reply);
			//如果未设置过期时间
			if (reply == -1) {
				//查询ad中的时间间隔及次数
				client.get(keyOfAdid,function(err,data){
					if(!err){
						applog.debug(runtimeObj,'get adbid:' +data);

						if(data && data.split('|').length>4){
							var ttl =+data.split('|')[3];
							//设置过期时间
							if(ttl>0){
								client.expire(keyOfCounter, ttl,function(err,reply){
									applog.debug(runtimeObj,'set expire result:' +reply);

									callback(err);				
								});	
							}
						} else {
							applog.debug(runtimeObj,'adid： {adid} not found.'.replace('{adid}',adid));

							callback('err');	
						}
					} else {
						callback(err);	
					}
				});							
			} else {			
				callback(err);			
			}			
		});		

		}
	], function(err) {
		if(err)
			applog.error(err);
		applog.debug(runtimeObj,'redis finished.begin callback.');


		if (!!func) {
			func(err);
		}

	});
}

/**
 * 对每天每个广告的bid次数进行计数
 * 对redis压力过大暂时不用
 */
function incrAdbid(adid,func){
	var keyOfAdTodayBid = constants.redis.keyPrefixs.ad_today_bid
		.replace('{date}', utils.dateformat(new Date(), "yyyyMMdd"))
		.replace('{ad}', adid);

	client.incr(keyOfAdTodayBid, function(err) {

		if(!!func)
			func();
	});
}


exports.getAllAds = getAllAds;
exports.addMediaCostAndCounter = addMediaCostAndCounter;

exports.getStatus = getStatus;



