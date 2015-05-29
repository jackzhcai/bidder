var fs = require('fs');
var bid = require('../src/bid.js');
var runtime = require('../src/runtime.js');
var redis = require('../src/redis.js');

var letbid = function(){
fs.readFile('./bid_mopub2.json', {
  "encoding": "utf-8"
}, function(err, data) {
  if (err) throw err;

 
  //console.log(data);

  var runtimeObj = new runtime();
  runtimeObj.redis = redis;
  runtimeObj.bidReqJSON = JSON.parse(data);
  runtimeObj.bidAct="";

  bid.bid(runtimeObj, function(res) {

    console.log("res:" + res.bidAct);
    console.log("content:|" + res.bidResJSON);
  });


});

}

/*setTimeout(function(){

letbid()

setTimeout(function(){

letbid()
}, 2000);

}, 2000);

*/

