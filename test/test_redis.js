
var redis = require("redis"),
	constants = require('../src/constants.js'),
	default_port = constants.redis.port,
	default_host = constants.redis.host,
	client = redis.createClient(default_port,default_host)
	;

var utils = require('../src/utils.js');

client.on("error",function(err){
	console.log("Error " + err);
});

var key ='target_adspace_CHN';
client.hgetall(key,function(err,data){
	console.log(err);
	console.log(data);
	
});



if(false){

client.flushdb();

var keyPrefixs = {
		ad: "adbid_",
		ad_budget_left: "today_budget_left_",
		ad_counter: "ad_counter_",

		country_ads: "target_country_",//ads that target to contry
		category_ads: "target_category_",//ads that target to category
		budget_ads: "active_budget_ads",//ads that still has budgets

		os_ads: "target_os_",//ads that target to category
		devicetype_ads: "target_devicetype_",//ads that target to category

		performance: "performance_",

		ad_today_cost:"ad_today_cost_",
		ad_today_click:"ad_today_click_"
	};

//string

client.set(keyPrefixs.ad_budget_left + utils.dateformat(new Date(),"yyyyMMdd") + "_1000", "999");
client.set(keyPrefixs.ad_budget_left + utils.dateformat(new Date(),"yyyyMMdd") + "_1001", "999");

for(var i=0;i<100000;i++){
	client.set(keyPrefixs.ad_budget_left + utils.dateformat(new Date(),"yyyyMMdd") + (1100+i), "999");
}


/*client.get(keyPrefixs.ad_budget_left + "1000",function (err, replies) {
    console.log(keyPrefixs.ad_budget_left + "1000:" + replies);
    client.quit();
});

client.get(keyPrefixs.ad_budget_left + "1001",function (err, replies) {
    console.log(keyPrefixs.ad_budget_left + "1001:" + replies);
    client.quit();
});
*/
//client.set(keyPrefixs.ad_counter + ['qwer',1000].join("_"), "3");

/*client.get(keyPrefixs.ad_counter + ['qwer',1000].join("_"),function (err, replies) {
    console.log(keyPrefixs.ad_counter + ['qwer',1000].join("_") +":" + replies);
    client.quit();
});*/

/*client.mget(keyPrefixs.ad_budget_left + "1000",
	keyPrefixs.ad_counter + ['qwer', 1000].join("_"),
	function(err, replies) {
		console.log("mget 0:" + replies[0]);
		console.log("mget 1:" + replies[1]);
		client.quit();
	});
*/


//cpa,cpc,counter(divice level),ttl(divice level)
client.set(keyPrefixs.ad + "1000", "5|1|3|600|sampleUrl");

client.set(keyPrefixs.ad + "1001", "4|2|10|600|sampleUrl");
client.set(keyPrefixs.ad + "10", "4|2|10|600|sampleUrl");

for(var i=0;i<100000;i++){
	client.set(keyPrefixs.ad + (1100+i), "4|2|10|600");
}


client.set(keyPrefixs["performance"] + ["1000","agltb3B1Yi1pbmNyDAsSA0FwcBitsL4UDA","320","480","ios"].join("_"), 2.3);
client.set(keyPrefixs["performance"] + ["1001","agltb3B1Yi1pbmNyDAsSA0FwcBitsL4UDA","320","480","ios"].join("_"), 2.7);
/*
client.del(keyPrefixs["performance"] + ["1000","agltb3B1Yi1pbmNyDAsSA0FwcBitsL4UDA","320","480","ios"].join("_"));
client.del(keyPrefixs["performance"] + ["1001","agltb3B1Yi1pbmNyDAsSA0FwcBitsL4UDA","320","480","ios"].join("_"));
*/

/*client.set(keyPrefixs["performance"] + ["1000","others","320","480","ios"].join("_"), 2.3);
client.set(keyPrefixs["performance"] + ["1001","others","320","480","ios"].join("_"), 2.7);
client.del(keyPrefixs["performance"] + ["1000","others","320","480","ios"].join("_"));
client.del(keyPrefixs["performance"] + ["1001","others","320","480","ios"].join("_"));
*/

/*client.set(keyPrefixs["performance"] + ["agltb3B1Yi1pbmNyDAsSA0FwcBitsL4UDA","320","480","ios"].join("_"), 2.3);
client.del(keyPrefixs["performance"] + ["agltb3B1Yi1pbmNyDAsSA0FwcBitsL4UDA","320","480","ios"].join("_"));

client.set(keyPrefixs["performance"] + ["320","480","ios"].join("_"), 2.7);
client.del(keyPrefixs["performance"] + ["320","480","ios"].join("_"));
*/
client.set(keyPrefixs["performance"] + ["320","480","ios"].join("_"), 2.7);
client.set(keyPrefixs["performance"] + ["320","50","ios"].join("_"), 2.7);
/*client.hgetall(keyPrefixs.ad + "1000",function(err,data){

	console.log("getAdbid data :" + data);
	console.log("getAdbid ad_cpa_bid :" + data["cpa"]);
	console.log("getAdbid ad_cpc_bid :" + data["cpc"]);

	client.quit();
});
*/


client.sadd(keyPrefixs.os_ads + "ios", "1000");
client.sadd(keyPrefixs.os_ads + "ios", "1001");
client.sadd(keyPrefixs.os_ads + "ios", "1002");
client.sadd(keyPrefixs.os_ads + "ios", "1003");

client.sadd(keyPrefixs.devicetype_ads + "1", "1000");
client.sadd(keyPrefixs.devicetype_ads + "1", "1001");
client.sadd(keyPrefixs.devicetype_ads + "1", "1002");
client.sadd(keyPrefixs.devicetype_ads + "1", "1003");
//set 

client.sadd(keyPrefixs.country_ads + "USA", "1000");
client.sadd(keyPrefixs.country_ads + "USA", "1001");
client.sadd(keyPrefixs.country_ads + "USA", "1002");
client.sadd(keyPrefixs.country_ads + "USA", "1003");

for(var i=0;i<1000;i++){
client.sadd(keyPrefixs.country_ads + "USA", (1100+i)+'');
}

/*client.smembers(keyPrefixs.country_ads  + "usa",function(err,data){

	console.log("country_ads_usa data :" + data);
 
	client.quit();
});
*/

client.sadd(keyPrefixs.category_ads + "IAB1", "1000");
client.sadd(keyPrefixs.category_ads + "IAB1", "1001");
client.sadd(keyPrefixs.category_ads + "IAB1", "1004");
client.sadd(keyPrefixs.category_ads + "IAB1", "1005");

client.sadd(keyPrefixs.category_ads + "IAB14", "1000");
client.sadd(keyPrefixs.category_ads + "IAB14", "1001");

for(var i=0;i<1000;i++){
client.sadd(keyPrefixs.category_ads + "IAB14", (1100+i)+'');
}


client.sadd(keyPrefixs.budget_ads, "1000");
client.sadd(keyPrefixs.budget_ads, "1001");
client.sadd(keyPrefixs.budget_ads, "1002");
client.sadd(keyPrefixs.budget_ads, "1003");

for(var i=0;i<1000;i++){
client.sadd(keyPrefixs.budget_ads, (1100+i)+'');
}


/*client.smembers(keyPrefixs.category_ads  + "game",function(err,data){

	console.log("category_ads_game data :" + data);
 
	client.quit();
});


client.sinter(
	keyPrefixs.country_ads + "usa",
	keyPrefixs.category_ads + "game",
	function(err, data) {

		console.log("country_ads_usa&category_ads_game data :" + data);

		client.quit();
	});*/




//multi

 // keyPrefixs.ad_budget_left)	 
/*client.multi()
	.sinter(
		keyPrefixs.country_ads + "usa",
		keyPrefixs.category_ads + "game",
		function(err, data) {
			var budgetlefts=[];
			for(var i =0;i<data.length;i++){
 budgetlefts[budgetlefts.length]=keyPrefixs.ad_budget_left +data[i];
			}
console.log(budgetlefts);
			client.get("today_budget_left_1000",function (err,replies) {
				
				console.log(replies);
			})
		




		}
		).exec();*/


/*var 
deviceid='qwer',
country="usa",
category="game",
performance = "qwer_320_150_ios";//diviceid,width,height,os
var keyOfCounter = keyPrefixs.ad_counter + [deviceid, 1000].join("_");

client.get(keyOfCounter,function(err,reply){
	console.log(err);
	console.log(reply);
});


*/
var utils = require('../src/utils.js');
var adid = '1000';
var keyOfAdTodayCost=keyPrefixs.ad_today_cost + utils.dateformat(new Date(),"yyyyMMdd")+'_'+adid;
client.incrby(keyOfAdTodayCost,30,function(err,data){
	console.log(err);
	console.log(data);

	client.get(keyOfAdTodayCost,function(err2,data2){
		console.log(err2);
		console.log(data2);
	})
});

}









