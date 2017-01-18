/**
 * Created by hxsd on 2016/6/24.
 */
//引入相应的模块
var http=require("http");
var path=require("path");
var express=require("express");

var app=express();

//处理对静态资源的请求
var publicPath=path.resolve(__dirname,"public");
app.use(express.static(publicPath));//使用中间件
var httpServer=http.createServer(app);
require("./socketServer")(httpServer);
//创建服务器并监听
httpServer.listen(3000,function(){
    console.log("服务器正运行在3000端口")
});

