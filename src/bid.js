/**
 * Created by zhangliming on 14-7-16.
 */
"use strict";
var constants = require('./constants.js');
var filter = require('./filter.js');
var mapping = require('./mapping.js');
var timers = require('./timers.js');

var stats = require('./stats.js');

/**
 * bid response 需要返回的json对象
 * 
 */
var bid_obj = {
    'id': '',
    'seatbid': [{
        'bid': [{
            'id':'',//required........
            'iurl':'' ,//cdn地址
            'cid': '',//广告id
            'crid': '',//创意id
            'price': 0,
            'adid': '',//广告id
            'adomain': ['http://www.yeahmobi.com'],//广告主的域名
            'attr':[],
            'adm': '',//
            'impid': '1',//
            'nurl':''

        }]
    }],
    'cur': 'USD',
    'bidid':13
};

var bid_obj_smaato = {
    "id": "",
    "seatbid": [{
        "bid": [{
            "id":"1",//required........
            "iurl":"" ,//cdn鍦板潃
            "cid": "1000",//骞垮憡id
            "crid": "100",//鍒涙剰id
            "price": 0.7,
            "adid": "10",//骞垮憡id
            "adomain": ["http://www.ymtrack.com"],//骞垮憡涓荤殑鍩熷悕
            "attr":[],
            "adm": "",//
            "impid": "1",//
            "nurl":constants.host+'/smaato/win/${AUCTION_ID}/${AUCTION_BID_ID}/${AUCTION_IMP_ID}/${AUCTION_SEAT_ID}/${AUCTION_AD_ID}/${AUCTION_PRICE}/'

        }]
    }],
    "cur": "USD"
};

/**
 * iframe广告形式代码模板
 * 
 */
var iframe_adtag = '<iframe src=\'$adserver_host$/CreativeServlet?type=if&ad_id=$ad_id$&h=$h$&w=$w$&device_id=$device_id$'+
'&ip=$ip$&lat=$lat$&lng=$lng$&auction_id=$auction_id$&cb=$cb$&country=$country$&os=$os$&partner=$partner$&hash=$hash$&appid=$appid$&category=$category$\' '+
'width=\'$width$\' height=\'$height$\' marginwidth=\'0\' marginheight=\'0\' hspace=\'0\' vspace=\'0\' '+
'frameborder=\'0\' scrolling=\'no\' bordercolor=\'#000000\'></iframe>';

/**
 * javascript广告形式代码模板
 * 
 */
var javascript_adtag = '<script src=\'$adserver_host$/CreativeServlet?ad_id=$ad_id$&h=$h$&w=$w$&device_id=$device_id$&ip=$ip$&lat=$lat$&lng=$lng$&auction_id=$auction_id$&cb=$cb$&country=$country$&os=$os$&partner=$partner$&hash=$hash$&appid=$appid$&category=$category$\' ></script>';



var iframe_adtag_smaato = '<iframe src=\'$adserver_host$/app/adserv\' '+
'marginwidth=\'0\' marginheight=\'0\' hspace=\'0\' vspace=\'0\' '+
'frameborder=\'0\' scrolling=\'no\' bordercolor=\'#000000\'></iframe>';

/**
 * smaato richmedia xml广告形式模板
 * 
 */
var smaato_richmedia_xml ='<ad xmlns:xsi=\'http://www.w3.org/2001/XMLSchema-instance\' xsi:noNamespaceSchemaLocation=\'http://standards.smaato.com/ad/smaato_ad_v0.9.xsd\' modelVersion=\'0.9\'><richmediaAd><content><![CDATA[ $adtag$ ]]></content><width>$width$</width><height>$height$</height></richmediaAd></ad>';

/**
 * bid方法
 * 
 */
var bid = function(runtimeObj, func) {
    runtimeObj.bidAct = 'bid';
    if (!!func)
        func(runtimeObj);
};

/**
 * no bid方法
 * 
 */
var no_bid = function(runtimeObj, func) {
    runtimeObj.bidAct = 'no_bid';
    if (!!func)
        func(runtimeObj);
};

/**
 * 从bid request josn中获取appid
 * 
 */
var get_appid = function(bid){
    var str = bid.app.bundle || bid.app.domain || (bid.site || {}).domain || ''; 
    return str.replace(/_/g, '-');
};

/**
 * 从bid request josn中获取deviceid
 * 
 */
var get_deviceid = function(partner, bid) {
    if (partner == 'nexage') {
        return (bid.device.ext || {}).nex_ifa || bid.device.dpidsha1 || bid.device.dpidmd5 ;
    } else {
        return ((bid.ext || {}).udi || {}).googleadid || ((bid.ext || {}).udi || {}).idfa || bid.device.dpidsha1 || bid.device.dpidmd5 || ((bid.ext || {}).udi || {}).udidmd5 ;
    }
};

var get_devicetype = function(devicetype) {
    if (devicetype == 4) {
        return 'phone';
    } else if (devicetype == 5) {
        return 'tablet';
    } else {
        return 'none';
    }
};
/**
 * 从bid request josn中获取deviceid加密方式
 * 
 */
var get_crypttype = function(partner, bid) {
    if (partner == 'nexage') {

        if ((bid.device.ext || {}).nex_ifa)
            return 'plain';
        else if (bid.device.dpidsha1)
            return 'sha1';
        else if (bid.device.dpidmd5)
            return 'md5';
        else
            return 'plain';

    } else {

        if (((bid.ext || {}).udi || {}).idfa)
            return 'plain';
        else if (bid.device.dpidsha1)
            return 'sha1';
        else if (bid.device.dpidmd5)
            return 'md5';
        else if (((bid.ext || {}).udi || {}).udidmd5)
            return 'md5';
        else
            return 'plain';
    }
};

/**
 * 获取广告代码
 * 
 */
var get_adm = function(partner,banner,adtag){
    var adm = adtag;
    if(partner=='smaato'){
       adm= smaato_richmedia_xml
            .replace('$width$', banner.w)
            .replace('$height$', banner.h)
            .replace('$adtag$', adtag);
    }

    return adm;
};

/**
 * bid方法，主要bid逻辑在这里
 * 首先获取参数，做基本的过滤判断
 * 访问redis获取可用来投放的广告参数
 * 计算出最大的出价返回
 */
exports.bid = function(runtimeObj,func) {

    timers.logTimer(runtimeObj,'begin bid');

    var bidreq = runtimeObj.bidReqJSON;

    if(!((bidreq || {}).app || {}).id){
        stats.noadspaceId++;
    }

    if(constants.nobid){
       runtimeObj.nobidReason = 'constants.nobid=true';
       no_bid(runtimeObj,func);
    }
    else if(false){//smaato工具测试

        bid_obj_smaato.id = bidreq.id;

        var imp =bidreq.imp[0];
        var banner = imp.banner || imp; 
        var w = banner.w;
        var h = banner.h;

        var btype = banner.btype || [];
        var mimes = banner.mimes || [];
    
        if (filter.isJsHtmlSupport(btype,mimes)) {

            var adtag = iframe_adtag_smaato.replace("$adserver_host$", constants.adserverhost);

            var adm = smaato_richmedia_xml
                .replace("$width$", banner.w)
                .replace("$height$", banner.h)
                .replace("$adtag$", adtag);
            bid_obj_smaato.seatbid[0].bid[0].adm = adm;

            runtimeObj.bidResJSON = bid_obj_smaato;
            runtimeObj.bidAct = "bid";
        } else {
             runtimeObj.bidAct = "no_bid";
        }

        if(!!func)
        func(runtimeObj);

    }
   //对bidjson属性基本判断
    else if (!bidreq.app || !bidreq.device || !bidreq.imp ||  bidreq.imp.length === 0 || bidreq.imp.length>1) {
        runtimeObj.nobidReason = 'bid.app or bid.device or bid.imp not found,bid.imp.length must be 1';

        no_bid(runtimeObj,func);
    } else {

        //解析bidjson数据

        var partner =runtimeObj.partner;

        var cats = bidreq.app.cat && bidreq.app.cat.length>0 && [bidreq.app.cat[0]] || [];//todo:mopub itunes mapping
        var appid = get_appid(bidreq);


        var country =(bidreq.device.geo || bidreq.device).country;
        country = mapping.countrymap(country||'') || country;

        var devicetype = get_devicetype(bidreq.device.devicetype);

        var deviceid = get_deviceid(partner,bidreq);
        var crypttype = get_crypttype(partner,bidreq);
        
        var ip = bidreq.device.ip;
        var lat = (bidreq.device.geo || {} ).lat || 0;
        var lng = (bidreq.device.geo || {} ).lon || 0;

        var make = bidreq.device.make;
        var model = bidreq.device.model;
        var os =(bidreq.device.os || "").trim().toLowerCase();        
        os = mapping.osmap(os) || os;
        if(!os){
            var ua =(bidreq.device.ua || "").trim().toLowerCase();
            if(ua.indexOf('iphone os')>-1 || ua.indexOf('ios')>-1){
                os = 'ios';
            }
        }
        var jsenabled = (bidreq.device.js || 0)>0;

        var imp =bidreq.imp[0];
        var banner = imp.banner || imp; //todo:处理多个imp，处理非banner情况
        var w = banner.w;
        var h = banner.h;
        var dimension = w + 'x' + h;
        var impid =imp.id || '1';//这里必须为字符串类型
        var bidfloor = imp.bidfloor || 0;

        var btype = banner.btype || [];
        var mimes = banner.mimes || [];

        var appid_exchange = bidreq.app.id || ''; 


        var filterCondition = {
                    'deviceid':deviceid,
                    'dimension':dimension,
                    'appid': appid,
                    'w': banner.w,
                    'h': banner.h,
                    'os': os,
                    'country':country,
                    'category':cats,
                    'devicetype':devicetype,
                    'appid_exchange':appid_exchange
                };
 
        //如果没有国家、无法通过filter、不支持js/html则不bid
        if(cats.length==0){
            runtimeObj.nobidReason = 'no category ';
            no_bid(runtimeObj, func);
        } else if(!deviceid){
            runtimeObj.nobidReason = 'no deviceid ';
            no_bid(runtimeObj, func);
        } else if (!!constants.useTestDeviceId && constants.testDeviceIds.indexOf(deviceid)==-1){
            runtimeObj.nobidReason = 'useTestDeviceId opened';
            no_bid(runtimeObj, func);
        } else if (!country){
            runtimeObj.nobidReason = 'no country ';
            no_bid(runtimeObj, func);
        } else if (false && !appid){
            runtimeObj.nobidReason = 'no appid ';
            no_bid(runtimeObj, func);
        } else if (!os){
            runtimeObj.nobidReason = 'no os ';
            no_bid(runtimeObj, func);
        } else if (filter.isBlock(runtimeObj,filterCondition)) {
            no_bid(runtimeObj, func);
        } else if(!filter.isJsHtmlSupport(btype,mimes)){
            runtimeObj.nobidReason = 'JsHtml not supported. ';
            no_bid(runtimeObj, func);
        } else if(!!constants.useBidPacing && Math.floor(Math.random()*(+constants.bidPacingPercent-1)+1)!=1){
            runtimeObj.nobidReason = 'useBidPacing opened and bidPacingPercent is 1/' + constants.bidPacingPercent;
            no_bid(runtimeObj, func);
        } else {

            appid = appid_exchange;

            timers.logTimer(runtimeObj,'on fetch redis');

            runtimeObj.redis.getAllAds(runtimeObj, {
                    'deviceid':deviceid,
                    'appid': appid,
                    'w': banner.w,
                    'h': banner.h,
                    'os': os,
                    'country':country,
                    'category':cats,
                    'devicetype':devicetype,
                    'appid_exchange':appid_exchange,
                    'dimension':dimension
                }, 
                function(err, adids, ads, perf, priceAtApp, cpmRatio) {

                    //发生错误，查询不到数据，不bid    
                    if (err || !adids || !ads || !perf || adids.length == 0 || ads.length == 0 || perf.length == 0) {
                        runtimeObj.nobidReason =err;
                        no_bid(runtimeObj, func);

                    } else {

                        var maxbidcpm = 0;
                        var bidadid = 0;
                        var ad;
                       
                        if(constants.testDeviceIds.indexOf(deviceid)>=0){
                            maxbidcpm =20;
                        }

                        if(priceAtApp){
                            for(var i=0;i<perf.length;i++){
                                perf[i] =priceAtApp; 
                            }  
                        }       
                    
                        timers.logTimer(runtimeObj,'on calculate');

                        var appcpmindex = adids.length * 2;
                        var sizecpmindex = adids.length * 2 + 1;
                      
                        for (var i = 0; i < adids.length; i++) {

                            var ad_app_cpm = perf[i * 2];
                            var ad_other_cpm = perf[i * 2 + 1];

                            var bidcpm = ad_app_cpm || ad_other_cpm || perf[appcpmindex] || perf[sizecpmindex];

                            if(cpmRatio){
                                bidcpm = +bidcpm * +(cpmRatio[adids[i]] || 0);
                            }

                            if (bidcpm && +bidcpm > maxbidcpm) {

                                bidadid = adids[i];
                                maxbidcpm = +bidcpm;
                                ad = ads[i];
                            }
                        }


                        //获取到ad_id，bidcpm且大于底价，bid
                        if (bidadid > 0 && maxbidcpm > 0 && maxbidcpm >= bidfloor && !!ad) {
                            //Pvar hackAuctionId =[partner, bidreq.id].join('_');
                            var adtagtpl =true? javascript_adtag : iframe_adtag;
                            var adtag = adtagtpl.replace('$adserver_host$', constants.adserverhost)
                                .replace('$ad_id$', bidadid)
                                .replace('$device_id$', deviceid)
                                .replace('$ip$', ip)
                                .replace('$lat$', lat)
                                .replace('$lng$', lng)
                                .replace('$auction_id$',bidreq.id)
                                .replace('$cb$', Math.random(0, 1))
                                .replace('$country$', country)
                                .replace('$os$', os)
                                .replace('$partner$', partner)
                                .replace('$w$', banner.w)
                                .replace('$h$', banner.h)
                                .replace('$width$', banner.w)
                                .replace('$height$', banner.h)
                                .replace('$hash$', crypttype)
                                .replace('$appid$', appid)
                                .replace('$category$', cats.length>0?cats[0]:'')
                                ;

                            var adm = get_adm(partner, banner, adtag);

                            var iurl = '',adomain;
                            if(ad){
                                var infos =ad.split('|');
                                if(infos.length>4){
                                    iurl = infos[4];
                                }

                                if(infos.length>5){
                                    adomain = infos[5];
                                }
                            }
        
                            bid_obj.id = bidreq.id;

                            var bidid ='{deviceid}_{appid}_{adid}_{width}_{height}_{partner}'
                                    .replace('{deviceid}',deviceid)
                                    .replace('{appid}',appid_exchange)
                                    .replace('{adid}',bidadid)
                                    .replace('{width}',w)
                                    .replace('{height}',h)
                                    .replace('{partner}',partner);

                            bid_obj.bidid = bidid;

                            bid_obj.seatbid[0].bid[0].id =  '1';

                            bid_obj.seatbid[0].bid[0].cid = bidadid;
                            bid_obj.seatbid[0].bid[0].crid = bidadid;
                            bid_obj.seatbid[0].bid[0].adid = bidadid;

                            bid_obj.seatbid[0].bid[0].price = maxbidcpm;
                            bid_obj.seatbid[0].bid[0].adm = adm;
                            bid_obj.seatbid[0].bid[0].impid = impid;

                            bid_obj.seatbid[0].bid[0].iurl = iurl;
                            if(adomain){
                                bid_obj.seatbid[0].bid[0].adomain[0] = adomain;  
                            }      

                            var noticeUrl =constants.host+'/$PARTNER$/win/${AUCTION_ID}/${AUCTION_BID_ID}/${AUCTION_IMP_ID}/${AUCTION_SEAT_ID}/${AUCTION_AD_ID}/${AUCTION_PRICE}/';
                            bid_obj.seatbid[0].bid[0].nurl = noticeUrl.replace('$PARTNER$',partner);

                            timers.logTimer(runtimeObj,'on bidresjson');

                            runtimeObj.bidResJSON = bid_obj;

                            bid(runtimeObj, func);

                        } else {
                            runtimeObj.nobidReason = 'no ad. bidadid:{bidadid},maxbidcpm:{maxbidcpm},bidfloor:{bidfloor},ad:{ad}'
                                                    .replace('{bidadid}',bidadid)
                                                    .replace('{maxbidcpm}',maxbidcpm)
                                                    .replace('{bidfloor}',bidfloor)
                                                    .replace('{ad}',!!ad);

                            no_bid(runtimeObj, func);

                        }
                    }

            });
        }
    }
     
};