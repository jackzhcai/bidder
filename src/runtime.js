/**
 * Created by zhangliming on 14-7-16.
 */

module.exports=function(){
    /**
     *  
     */
    this.logger;

        /**
     *  
     */
    this.loggerWin;
    this.loggerRequest;
    this.loggerBid;

    /**
     *
     */
    this.req;

    /**
     *
     */
    this.res;

    /**
     *
     */
    this.bidReqJSON;

    /**
     *
     */
    this.bidAct;
    /**
     *
     */
    this.bidResJSON;
    /**
     *
     */
    this.redis;

    this.partner;


    this.bidTimers=[];

    this.nobidReason;

};
