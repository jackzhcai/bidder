"use strict";
var constants = require('./constants.js');
/**
 * bid filter字典.
 *
 *'device':device blocked
 *'type':device type blocked,refer to iab 6.16 Device Type
 *'dimension':dimension not blocked,refer to http://www.iab.net/guidelines/508676/508767/mobileguidelines
 *'app':app blocked
 *'geo':geo blocked，refer to http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
 *'category':category blocked
 *
 */
var filterchains = {
	'device': ['b602d594afd2b0b327e07a06f36ca6a7e42546d0', '9f89c84a559f573636a47ff8daed0d33', '00000000-0000-0000-0000-000000000000'],
	'type': [2, 3, 6, 7], 
	'dimension': ['320x50'], //'300x50', '320x50', '320x480', '728x90'
	'app': ['{}', 'null', 'com.appspot.swisscodemonkeys.livechat', 'com.appspot.swisscodemonkeys.video', 'com.com2us.homerunbattle2.normal.freefull.google.global.android.common',
		'com.firsttouchgames.dlsa', 'com.gameresort.sz2google', 'com.pinger.ppa',
		'com.scannerradio', 'com.textmeinc.android', 'com.theberry', 'com.tmsoft.whitenoise.lite', 'com.zynga.scramble&feature',
		'se.feomedia.quizkampen.de.lite',
		'284973016', '290051590', '292987597',
		'314498713', '332510494', '337113451', '346194763', '358612216', '375242617', '376098160', '387301602', '387675255', '387816411', '388168910', '394961415',
		'412443566', '418987775', '422326080', '442894329', '429590524', '462678375', '472315002', '478687481',
		'517668804', '517956762', '552248120', '557285579', '559788663', '570050053',
		'632522670', '638794165', '661624671', '691093067',
		'786344734'
	],
	'geo': [], 
	'category': [
		'IAB25-3',
		'IAB25-4'
	] //Pornography,Profane Content
}




/**
 * 执行对bid的基本过滤. 
 * device、type、app、geo、category 为黑名单，dimension为白名单
 * deviceId, type, dimension, app, geo,category,appid_exchange
 */
function isBlock(runtimeObj,filterCondition) {

	var deviceId = filterCondition.deviceid, 
		type = filterCondition.devicetype, 
		dimension = filterCondition.dimension, 
		app = filterCondition.appid, 
		geo = filterCondition.country,
		category = filterCondition.category,
		appid_exchange = filterCondition.appid_exchange,
		os = filterCondition.os,
		w = filterCondition.w,
		h = filterCondition.h;
	//对某些deviceId,deviceType,appid,geo不竞价
	if (filterchains['device'].indexOf(deviceId) > -1 ){
		runtimeObj.nobidReason='deviceId: {deviceId} blocked.'.replace('{deviceId}',deviceId);
		return true;
	} else if(filterchains['type'].indexOf(type) > -1){
		runtimeObj.nobidReason='type: {type} blocked.'.replace('{type}',type);
		return true;
	} else if(filterchains['app'].indexOf(app) > -1 ){
		runtimeObj.nobidReason='app: {app} blocked.'.replace('{app}',app);
		return true;
	} else if( filterchains['geo'].indexOf(geo) > -1){
		runtimeObj.nobidReason='geo: {geo} blocked.'.replace('{geo}',geo);
		return true;
	} else if(filterchains['dimension'].indexOf(dimension) == -1 ){
		runtimeObj.nobidReason='dimension: {dimension} blocked.'.replace('{dimension}',dimension);
		return true;
	} 

	//对某些category不竞价,暂时不使用
	if(false){
		for(var i=0;i<category.length;i++){
			if(filterchains['category'].indexOf(category[i])>-1){
				return true;
			}
		}
	}

	return false;
}

/**
 * 根据btype，mimes判断app是否支持js/html，如果支持则投js/html广告
 * mimes为空也认为支持javascript
 */
function isJsHtmlSupport(btype, mimes) {
	return (btype.indexOf(3) == -1  )
	&& ( mimes.length==0 || (mimes.indexOf('application/javascript') > -1 ||	mimes.indexOf('text/javascript') > -1 ||  mimes.indexOf('text/html') > -1));
}

function isJsHtmlSupport2(btype, mimes) {
	return (btype.indexOf(2) == -1 || btype.indexOf(3) == -1  || btype.indexOf(4) == -1 )
	&& (mimes.indexOf('application/javascript') > -1 ||	mimes.indexOf('text/javascript') > -1 ||  mimes.indexOf('text/html') > -1);
}


exports.isBlock=isBlock;
exports.isJsHtmlSupport=isJsHtmlSupport;
