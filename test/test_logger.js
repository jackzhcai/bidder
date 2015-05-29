/**
 * Created by zhangliming on 14-11-3.
 */

var fs = require('fs');
var logger=require('../src/logger.js').getLogger(1);



 fs.readFile('uTorrent_log.json', 'utf8', function (err, data) {
         if (err) throw err;
      for(var i=1;i<10;i++){
          logger.info('%s$$$',data);
      }

   });