module.exports = {
    /**
     * 开关
     */
    nobid: false,
    enableTimers: true,
    useZKredis: true,
    debug:true,
    /**
     *ZK
     */
    zkHosts: '172.20.0.47:2181',
    chroot: '/qa-test1',
    Hashchroot:'/qa-test',
    readCommands:['sinter', 'mget', 'hgetall', 'ttl', 'get', 'smembers', 'sunion', 'sismember', 'hmget'],
    writeCommands:['set', 'incr', 'incrby', 'decrby', 'expire', 'srem', 'incrbyfloat'],
    /**
     * hostsa
     */
    host: 'http://bidder.ymtrack.com',
    adserverhost: 'http://adserving.ymtrack.com',
    cdn: {
        host: 'http://dcd21nfn358n3.cloudfront.net/images'
    },
    /**
     * redis
     */
    redis: {
        host: '172.20.0.107',
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
    partners: ['mopub', 'smaato', 'nexage','axonix'],
    /**
     * log
     */
    dataFilePath: '../logs/worker-',
    logFilePath: '../logs/worker-app-',
    /**
     * 每天的budget的限制
     */
    limitDailyCost: true,
    todayMaxCost: 200,

    /*
     * only bid for test deviceid   
     */
    useTestDeviceId:false,
    testDeviceIds:['60a50a4b-c12c-434a-b132-d4ec960d2e05',''],

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
    testAds:[114],

    useRetargeting:true

};