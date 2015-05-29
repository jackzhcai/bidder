/**
 * Created by zhangliming on 14-7-18.
 */
var mode=process.argv[2]||process.env['node_mode']||'daily';

module.exports =require('../config/'+mode);

