var async = require("async");
var utils = require('../src/utils.js');
var redis = require("redis"),
	default_port = 6379,
	default_host ='10.1.1.40',
	client = redis.createClient(default_port,default_host);

var maxCost =1;
var isStop = false;
setInterval(function(){
if(!isStop)
checkCost();

},1000);

var showLog = function(message){
		console.log([ utils.dateformat(new Date(),"yyyy-MM-dd hh:mm:ss") ,message].join(' | '));
		
}

var checkCost = function(){

	async.waterfall([
	function(callback) {
		var keyMatch = "ad_today_cost_" + utils.dateformat(new Date(),"yyyyMMdd") + "*";
		client.keys(keyMatch,function(err,data){
			callback(err,data);
		});	
	},
	function(keys,callback) {

		client.mget(keys,function(err,data){

			callback(err,data);
		});
	},
	function(values,callback) {
 		var sum =0;
 		for(var i=0;i<values.length;i++){
 			sum+=parseFloat(values[i] || 0);
 		}
		showLog('cost:' + sum);
		callback(null,sum);
	}
	],

	function(err,sum) {
		if(sum>= maxCost){
			isStop=true;
			showLog('STOP BID!!!!!!!');
			showLog('TOTAL COST:' + sum);
			client.del('active_budget_ads',function(err){
				if(err)
					showLog('ERR:' + err);
				showLog('DELETE KEY:' + 'active_budget_ads');
			});
		}
	}
	);
};





