module.exports ={
    /**
     * 开关
     */
    nobid:false,
    enableTimers:false,
    useZKredis:true,
    debug:false,
    /**
     *ZK
     */
    zkHosts:'10.1.11.20:2181,10.1.11.21:2181,10.1.11.25:2181',
    chroot:'/bidder-redis-failover',
    Hashchroot:'/',
    readCommands:['sinter', 'mget', 'hgetall', 'ttl', 'get', 'smembers', 'sunion', 'sismember', 'hmget'],
    writeCommands:['set', 'incr', 'incrby', 'decrby', 'expire', 'srem', 'incrbyfloat'],
    /**
     * hosts
     */
    host: 'http://bidder.ymtrack.com',
    adserverhost: 'http://adserving.ymtrack.com',
    cdn:{
        host:'http://dcd21nfn358n3.cloudfront.net/images'
    },
    /**
     * redis
     */
    redis: {
        host: 'dsp.t8cuil.0001.use1.cache.amazonaws.com',
        port: 6379,
        slaves: [
            {'host': 'a.t8cuil.0001.use1.cache.amazonaws.com', 'port': 6379}
        ],
        keyPrefixs: {
            budget_ads: "active_budget_ads", //ads that still has budgets
            category_all_ads: "target_all_category", //ads that target to all category
            country_all_ads: "target_all_country", //ads that target to all category
            target_size_set:"target_size_{size}",

            ad: "adbid_{ad}",
            ad_budget_left: "today_budget_left_{date}_{ad}",
            ad_counter: "ad_counter_{deviceid}_{ad}",

            country_ads: "target_country_{country}", //ads that target to contry
            category_ads: "target_category_{category}", //ads that target to category
            os_ads: "target_os_{os}", //ads that target to os
            devicetype_ads: "target_devicetype_{type}", //ads that target to devicetype

            performance5: "performance_{adid}_{appid}_{width}_{height}_{os}",
            performance4: "performance_{appid}_{width}_{height}_{os}",
            performance3: "performance_{width}_{height}_{os}",

            ad_today_cost: "ad_today_cost_{date}_{ad}",
            ad_today_click: "ad_today_click_{date}_{ad}",
            ad_today_bid: "ad_today_bid_{date}_{ad}",
            ad_today_win: "ad_today_win_{date}_{ad}",
            ad_today_total: "today_budget_total_{date}_{ad}",

            ad_today_cost_partner: "ad_today_cost_{date}_{partner}_{ad}",
            ad_today_win_partner: "ad_today_win_{date}_{partner}_{ad}",

            retargeting_cpm_ratio:'retargeting_cpm_ratio_{deviceId}'

        }
    },
    /**
     * exchange
     */
    partners:['mopub','smaato','nexage','axonix'],
    /**
     * log
     */
    dataFilePath:'/logdata/yeahrtb/worker-',
    logFilePath:'/logdata/yeahrtb_app/worker-',

    /**
     * 每天的budget的限制
     */
    limitDailyCost:true,
    todayMaxCost:200,

    /*
     * only bid for test deviceid   
     */
    useTestDeviceId:false,
    //kelvin's phone,martin's pad,huawei phone
    testDeviceIds:['60a50a4b-c12c-434a-b132-d4ec960d2e05','71af9d91-2c5d-420b-80e8-60f3e0737db3','a8eaf31a-c4e4-4383-b8b6-19b8d0236773','e92ba9551d6011229a706149b1e4a1cd'],

    /*
     * pacing the bid speed,1/50 bid
     */
    useBidPacing:false,
    bidPacingPercent:50,

    targetAppBudgetPerAd:10,

    defaultPrice:{
        '320x50':1,   
        '300x50':1,
        '320x480':2,
        '728x90':2   
    },


    useTestAd:false,
    testAds:[48],

    useRetargeting:false
  
};