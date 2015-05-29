/**
 * Created by zhangliming on 14-8-20.
 */
var post=new Buffer(8);
post.write('aa',0,2);
post.write('cc',2,2);

console.log(post.length);
console.log(post.toString('utf-8',0,4));