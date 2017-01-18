/**
 * Created by hxsd on 2016/12/9.
 */
// 引入socket.io模块
var socketIO = require("socket.io");    // 黄牛
var userList=[];//全局数组
module.exports = function(httpServer){
    // 让socket.io服务器监听web服务器
    var socketServer = socketIO.listen(httpServer);
    var messageArr=[];
    socketServer.on("connect", function (socket) {
        socket.on("message", function (data) {
            var type=data.type;

            switch (type){
                case "myInfo":
                    showMyInfo(socket,data);
                    break;
                case "myState":
                    showMyState(socket,data);
                    break;
                case "myMessage":
                    sendMyMessage(socket,data);
                    break;
            }
        });
        socket.on("disconnect", function () {
            var leaveUser={
                type:"pepLeave"
            };
            for(var i=0;i<messageArr.length;i++){
                if(messageArr[i].nickname==socket.nickname){
                    leaveUser.leaveUser=messageArr[i].nickname;
                    messageArr.splice(i,1);
                    break;
                }
            }
            socket.broadcast.send(leaveUser);
            socket.broadcast.emit("showPep",messageArr);//showPep 接受别人的消息
        });
    });
//显示自己的信息
    function showMyInfo(socket,data){
        //把我的信息加到数组中
        messageArr.push(data);
        socket.nickname=data.nickname;
        //发给别人的
        var message={
            type:"someOneIn",
            nickname:data.nickname,
            pic:data.pic,
            sex:data.sex
        };
        socket.broadcast.send(message);
        //发给自己的
        message.type="myInfo";
        socket.send(message);
        //把数组发送给所有人
        socket.broadcast.emit("showPep",messageArr);//socket.broadcast.emit是广播给所有在线客户端不包括自己
        socket.emit("showPep",messageArr);
    }
//显示自己的状态
    function showMyState(socket,data){
        var message={
            type:"someState",
            nickname:data.nickname,
            state:data.state
        };
        socket.broadcast.send(message);
    }
//发送消息
    function sendMyMessage(socket,data){
        var message={
            type:"myMessage",
            pic:data.pic,
            nickname:data.nickname,
            message:data.message
        };
        socket.send(message);
        message.type="otherMessage";
        socket.broadcast.send(message);
    }
};
