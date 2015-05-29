"use strict";
var constants = require('./constants.js');
var applog = require('./app_log.js');

/**
 * 记录当前操作的时间点，为后面计算某一部分的时长做准备
 */
var logTimer = function(runtimeObj, message) {
    if (constants.enableTimers && (runtimeObj.isTest || constants.debug)) {
        runtimeObj.bidTimers[runtimeObj.bidTimers.length] = {
            n: message,
            t: new Date().getTime()
        };
    }
}

/**
 * 打出各部分的运行时长
 */
function showTimers(runtimeObj) {
    if (constants.enableTimers && (runtimeObj.isTest || constants.debug)) {
        var results = [];
        var steps =[];
        steps[steps.length] = runtimeObj.bidTimers[0].n;
        for (var i = 1; i < runtimeObj.bidTimers.length; i++) {
            results[results.length] = runtimeObj.bidTimers[i].t - runtimeObj.bidTimers[i - 1].t;
            steps[steps.length] = runtimeObj.bidTimers[i].n;
        }
        results[results.length] = runtimeObj.bidTimers[runtimeObj.bidTimers.length - 1].t - runtimeObj.bidTimers[0].t;

        applog.debug(runtimeObj,'steps:[$steps$]'.replace('$steps$',steps.join('-')));
        applog.debug(runtimeObj,'timers:[$timers$]'.replace('$timers$',results.join('-')));
    }
}

exports.logTimer = logTimer;
exports.showTimers = showTimers;
