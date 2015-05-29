/**
 * Created by zhangliming on 14-7-16.
 */

var httpServer = require('../src/http_server.js');
var logger=require('../src/logger.js').logger('master').getLogger('aaa');


httpServer.http_server(logger).listen(8000);