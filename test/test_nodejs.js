//utc test
/*console.log(Date.parse(new Date().toUTCString()));
var s1 =setInterval(function(){console.log(Date.parse(new Date().toUTCString()));},1000);
setTimeout(function(){clearInterval(s1);}, 10000);
*/
/*
for(var i =0;i<100;i++)
console.log(Math.ceil(Math.random(0,1)*10)-1)*/
/*var url = require("url");
var path ='http://ec2-54-86-9-66.compute-1.amazonaws.com:8000/smaato/bid?testbid=bid';

var req = url.parse(path, true);
var params = req.query;


console.log(req.url);
console.log(req.pathname);
console.log(params.testbid);*/

/*var a = 7;
console.log(a);
a+=7;
console.log(a);
a+=7;
console.log(a);
a+=7;
console.log(a);
a+=7;
console.log(a);
a+=7;
console.log(a);

*/

/*var utils = require('../src/utils.js');

console.log(utils.dateformat(new Date(),"yyyyMMdd"));
console.log(utils.dateformat(new Date(),"yyyy-MM-dd hh:mm:ss.S"));
console.log(utils.dateformat(new Date(),"yyyy-M-d h:m:s.S"));*/

/*var fs = require('fs'),
os = require('os'),
eol = os.EOL || '\n';

var msg = 'data to append'+ eol;
fs.appendFileSync('d:/message.txt', msg);*/


//console.log(['ca','a','c'].indexOf('a'));

/*var a ='$c$';

console.log(a.replace('$c$','a'));
console.log(a.replace('$c$','b'));
console.log(a.replace('$c$','c'));*/

/*var filter = require('../src/filter.js');
var banner = {
	"btype": [
		1,
		2
	],
	"h": 20,
	"mimes": [
		"application/javascript",
		"text/javascript"
	]
}

var btype = banner.btype;
var  mimes = banner.mimes;
console.log(filter.isJsHtmlSupport(btype,mimes));
*/

/*
var appLog = require('../src/app_log.js');
appLog.setworkId(1);
appLog.info('it is a info log');
appLog.info('it is a info log');
appLog.error('it is a error log');
appLog.error('it is a error log');*/

//console.log(0.521973170378592/1000);

/*console.log(+'-1');
console.log(typeof +'-1');*/

/*console.log(10084875*0.03);

console.log(225456086*1.13/1000);

console.log(10084875/225456086);

console.log(215032/10084875);

console.log((0.1 *100*1000)/10000);*/

/*for(var i=0;i<100;i++){
console.log(Math.floor(Math.random()*(10-1)+1)!=1);
}*/


/*var  utils = require('../src/utils.js');

var ip =utils.getLocalIP(null,'IPv4');
console.log(ip);


var a =['1','2','3','4','5','6'];
var b =['3','4','6','7'];
var c = utils.intersect(a,b);
console.log(c);

var date = utils.dateformat(new Date(),"yyyy-MM-dd hh:mm:ss.S");
console.log(date);


utils.log('it is a test!');*/



/*var c =[];
for(var i=0;i<a.length;i++){
	if(b.indexOf(a[i])>-1){
		c.push(a[i]);
	}
}
console.log(c);
 */
/*
 {
 	'æœ¬åœ°è¿žæŽ¥': [{
 		address: 'fe80::fc14:1f96:78a8:33c5',
 		family: 'IPv6',
 		internal: false
 	}, {
 		address: '172.20.0.155',
 		family: 'IPv4',
 		internal: false
 	}],
 	'VMware Network Adapter VMnet1': [{
 		address: 'fe80::e9a7:ac2:cf0e:cac5',
 		family: 'IPv6',
 		internal: false
 	}, {
 		address: '192.168.125.1',
 		family: 'IPv4',
 		internal: false
 	}],
 	'Loopback Pseudo-Interface 1': [{
 		address: '::1',
 		family: 'IPv6',
 		internal: true
 	}, {
 		address: '127.0.0.1',
 		family: 'IPv4',
 		internal: true
 	}]
 }*/


/*var clone = require('git-clone');

var repo ='https://geschichte@bitbucket.org/morningzhang/yeahrtb.git';

var targetPath = 'D:\\git-clone-test\\yeahrtb-lastest'

var cb = function(){
	console.log('clone finish.');
};

clone(repo, targetPath, cb);*/

var s = 'µTorrent® - Android App';
console.log(s.length);

console.log(Buffer.byteLength(s, 'utf8'));