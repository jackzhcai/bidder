/**
 * Created by zhangliming on 14-7-12.
 */
"use strict";
var http = require('http'),
    url = require("url"),
    os = require('os');

var  cluster = require('cluster'),
     fs = require('fs'),
     lockFile = require('lockfile'),
     numCPUs = require('os').cpus().length;

var utils = require('./utils.js');
var applog = require('./app_log.js');
var _ = require("underscore");
var async = require("async");


/**
 * 处理进程级别的异常
 */
process.on('uncaughtException', function(err) {
    exceptions++;
    applog.error('Caught exception: ' + err);
});

var workerPids=[];
var workerCalls =[];
var exitTimes = 0;
var exceptions = 0;

/**
 * 开启master，然后开启多个子进程
 */
if (cluster.isMaster) {

    for (var i = 0; i < numCPUs; i++) {
      var worker=  cluster.fork();
      workerPids.push(worker.process.pid);     
      initWorker(worker);
    }

    cluster.on('exit', function(worker, code, signal) {
        applog.info('cluster: worker with id ' + worker.process.pid + ' exit');
    }).on('listening', function(worker, code, signal) {

        applog.info('cluster: worker with id ' + worker.process.pid + ' listening');
    }).on('online', function(worker, code, signal) {
        applog.info('cluster: worker with id ' + worker.process.pid + ' online');
    }).on('disconnect', function(worker, code, signal) {
        applog.info('cluster: worker with id ' + worker.process.pid + ' disconnect');
    });


    applog.info('system: Master Server started with pid [%d].', process.pid);
    applog.info('system: Worker started with pid [%s].', workerPids.join(','));

    var commands ={
        'stats/list':'list all stats in each node process.',
        'constants/list':'list all constants in each node process.',
        'workers/list':'list each node process.',
        'workers/restart':'restart each node process.',
        'server/status':'list all status in each node process.'
    };
    http.createServer(function (req, res) {
        var controller = req.url.split('/')[1].toLowerCase();
        var action = req.url.split('/')[2].toLowerCase();
        var cmd = [controller,action].join('/');
        if(!commands[cmd]){

            res.writeHead(200, {'Content-Type': 'application/json'});
            var content =JSON.stringify({'content':'CMD {cmd} is invalid.'.replace('{cmd}',cmd)});
            res.end(content);

        } else {
            if(cmd == 'stats/list'){          
                workerCalls.length =0;
                async.map(
                    Object.keys(cluster.workers),
                    function(i,callback){
                        cluster.workers[i].send({message:'hello',type:'stats/list'});
                        callback(null);
                    },
                    function(err, results) {
                        setTimeout(function(){

                            var content =  JSON.stringify(workerCalls);
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(content);

                        }, 1000);                      

                    }
                );

            } else if(cmd == 'constants/list'){          
                workerCalls.length =0;
                async.map(
                    Object.keys(cluster.workers),
                    function(i,callback){
                        cluster.workers[i].send({message:'hello',type:'constants/list'});
                        callback(null);
                    },
                    function(err, results) {
                        setTimeout(function(){

                            var content =  JSON.stringify(workerCalls);
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(content);

                        }, 1000);                      

                    }
                );

            } else if(cmd == 'workers/list'){          
                workerCalls.length =0;

                var workerStats =_.map(Object.keys(cluster.workers),function(i){
                    var worker = cluster.workers[i];
                    return {
                        workid:worker.id,
                        pid:worker.process.pid,
                        memory:process.memoryUsage()
                    };
                });

                var content =  JSON.stringify(workerStats);
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(content);

            } else if(cmd == 'workers/restart'){          
                workerCalls.length =0;

                var workers =_.map(Object.keys(cluster.workers),function(i){
                    var worker = cluster.workers[i];
                    return worker;
                });

                _.each(workers,function(worker){
                    //kill
                    worker.kill();
                });

                setTimeout(function(){

                    var workerStats =_.map(Object.keys(cluster.workers),function(i){
                        var worker = cluster.workers[i];
                        return {
                            workid:worker.id,
                            pid:worker.process.pid,
                            memory:process.memoryUsage()
                        };
                    });

                    var content =  JSON.stringify(workerStats);
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(content);

                }, 1000); 

            } else if(cmd == 'server/status'){         

                workerCalls.length =0;     
                var workersCount=0;
                var workerStats =_.map(Object.keys(cluster.workers),function(i){
                    workersCount++;
                    var worker = cluster.workers[i];
                    return {
                        workid:worker.id,
                        pid:worker.process.pid,
                        memory:process.memoryUsage()
                    };
                });

                var status ={
                    numCPUs:numCPUs,
                    workersCount:workersCount,
                    exceptions:exceptions,
                    exitTimes:exitTimes,
                    workerStats:workerStats
                }

                var content =  JSON.stringify(status);
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(content);              

            } 
        }
    }).listen(8001);    

} else {
 
    require('./http_server.js').http_server(cluster.worker).listen(8000);
}



/**
 * 初始化worker进程退出自动重启方法
 */
function initWorker(worker,maxFork){
    //A default value
    maxFork=maxFork || 1000000;
    worker.on('message', function (msg) {
         workerCalls.push(msg);                    
    }).on('exit', function (code, signal) {
        exitTimes++;
        if( signal ) {
            applog.info('worker: worker $id$ was killed by signal: $signal$.'
                .replace('$id$',worker.process.pid) 
                .replace('$signal$',signal)
                );
        } else if( code !== 0 ) {
            applog.info('worker: worker $id$ exited with error code: $code$.'
                .replace('$id$',worker.process.pid)
                .replace('$code$',code)
                );

        } else {
            applog.info('worker: worker $id$ exited.'
                .replace('$id$',worker.process.pid)
                );
        }

        maxFork = maxFork - 1;
        if (maxFork < 0){
            return;
        }
        var oldPid=worker.process.pid;
        //refork
        worker = cluster.fork();

        var newPid=worker.process.pid;
        workerPids = workerPids.join(',').replace(oldPid,newPid).split(',');

        applog.info('worker: Old worker pid[%d] died and new worker pid[%d] started and still left %d times to be forked.',oldPid,newPid,maxFork);
        applog.info('system: Worker run with pid [%s].', workerPids.join(','));

        initWorker(worker, maxFork);

    }).on('listening', function(address) {
      // Worker is listening
        applog.info('worker: worker $id$ at $address$ listening.'.replace('$id$',worker.process.pid).replace('$address$',address));

    }).on('disconnect', function() {
      // Worker has disconnected
        applog.info('worker: worker $id$ disconnect.'.replace('$id$',worker.process.pid));

    }).on('online', function() {
      // Worker has disconnected
        applog.info('worker: worker $id$ online.'.replace('$id$',worker.process.pid));

    })
}