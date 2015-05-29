"use strict";
var os = require('os');

// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// dateformat(new Date(),"yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// dateformat(new Date(),"yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
var dateformat = function(date,fmt)   
{ //author: meizz   
  var o = {   
    "M+" : date.getMonth()+1,                 //月份   
    "d+" : date.getDate(),                    //日   
    "h+" : date.getHours(),                   //小时   
    "m+" : date.getMinutes(),                 //分   
    "s+" : date.getSeconds(),                 //秒   
    "q+" : Math.floor((date.getMonth()+3)/3), //季度   
    "S"  : date.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}

/** 
 * 获取指定网卡的IP 
 * @param name 网卡名 
 * @param family IP版本 IPv4 or IPv5 
 * @returns ip 
 */  
var getLocalIP = function (name, family) {  
    //所有的网卡  
    var ifaces = os.networkInterfaces();  
  
  
    //移除loopback,没多大意义  
    for (var dev in ifaces) {  
        if (dev.toLowerCase().indexOf('loopback') != -1) {  
            delete  ifaces[dev];  
            continue;  
        }  
    }  
  
  
    var ip = null;  
    family = family.toUpperCase();  
  
  
    var iface = null;  
    if (name == null) {  
        for (var dev in ifaces) {  
            ifaces[dev].forEach(function (details) {  
                if (details.family.toUpperCase() === family) {  
                    ip = details.address;  
                }  
            });  
            break;  
        }  
        return ip;  
    }  
    var nameList = name.split(',');  
    for (var i = 0, j = nameList.length; i < j; i++) {  
        var key = nameList[i];  
  
  
        //指定的链接不存在  
        if (ifaces[key] == null) {  
            continue;  
        }  
  
  
        ifaces[key].forEach(function (details) {  
            if (details.family.toUpperCase() === family) {  
                ip = details.address;  
            }  
        });  
        if (ip != null) {  
            break;  
        }  
    }  
    if (ip == null) {  
        ip = '127.0.0.1';  
        console.error('get ip error, return 127.0.0.1, please check');  
    }    
  
    return ip;  
}  

exports.dateformat=dateformat;
exports.getLocalIP=getLocalIP;

