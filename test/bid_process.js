no bid :
1.判断配置中是否设为了nobid，如果ture则不bid
2.判断bidjson是否符合要求，bid.app or bid.device or bid.imp not found,bid.imp.length must be 1,则不bid
3.判断是否有deviceid，没有则不bid
4.判断是否有country，没有则不bid
5.对os,type,dimension,appid,country,category进行过滤判断，没有则不bid
6.判断是否支持js/html，不支持则不bid
7.没有选出广告，或没有大于floor price，则不bid
8.发生error则不bid.


bid error:
1.判断url是否合法，格式为{partner}/bid,例如/smaato/bid
2.partner not supported,判断是否为支持的partner
3.判断redis zk client是否可用
4.其他运行错误


bid process:
1.符合基本json格式，且通过过滤判断
2.读取分类定向的广告和不进行分类定向的广告做并集
3.读取国家定向和不进行国家定向的广告做并集
4.redis中取可用广告和Os定向广告交集
5.对2,3,4结果取交集
6.读取redis中的广告信息
7.判断当前设备对每个广告的频次控制
8.读取adid,appid,width,height,os的cpm价格
9.读取最高价格并大于bid floor price

config/dev.js 增加debug:true
nobid日志记录在logFilePath中debug的log中
系统error记录在nohup.out或console.log输出
