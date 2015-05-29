/**
 * Created by zhangliming on 14-7-12.
 */
var  httpServer = require('./http_server.js'),
    loggerModule = require('./libs/LoggerModule');


var masterLogger = loggerModule.logger('main');loggerModule.configure('master');
httpServer.http_server().listen(8000);
masterLogger.info('Master Server started with pid[%d].', process.pid);
