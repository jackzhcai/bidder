var redis_client = require('../src/redis.js');

/*redis_client.getAdbid("1000",function(err,data){
	console.log("getAdbid data :" + data);
	console.log("getAdbid ad_cpa_bid :" + data["cpa"]);
	console.log("getAdbid ad_cpc_bid :" + data["cpc"]);
});

redis_client.getAdbudgetLeft("1000",function(err,data){
	console.log("getAdbudgetLeft data :" + data); 
});

redis_client.getAdcounter("qwer","1000",function(err,data){
	console.log("getAdcounter data :" + data); 
});

redis_client.getCountryads("usa",function(err,data){
	console.log("getCountryads data :" + data); 
});
*/

var 
deviceid='qwer',
country="usa",
category=["game"],
performance = "123_320_150_ios";//diviceid,width,height,os


//appid,width,height,os


//err:
//adids:1000,1001
//ads:5|1|3,4|2|10 //cpa|cpc|counter,cpa|cpc|counter
//perf:hash[ctr,cvr]


/*redis_client.getAllAds(deviceid,performance,country,category,function(err,adids,ads,perf){
	console.log("err:" + err);
	console.log("adids:" + adids);
	console.log("ads:" + ads);
	console.log("perf:" + perf);
});

redis_client.incrCounter(deviceid,1000,function(err){

	console.log("err2:" + err);

});

*/
/*redis_client.getAllAds(deviceid,performance,country,category,function(){

});*/


var deviceid ='afdfdfsfd';
var adid='1001';
var price=0.9;
var func = function(){
	console.log('aaaaa');



}
redis_client.addMediaCostAndCounter(deviceid,adid,price,function(err){
        if(!!func)
            func(err);
    });



 


