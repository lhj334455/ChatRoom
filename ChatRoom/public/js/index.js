/**
 * Created by hxsd on 2016/6/18.
 */
$(function () {
    var clientSocket=io();
    //显示提示框选择提醒选择头像
    $('#user').hover(function(){
        $('.tit').show();
    },function(){
        $('.tit').hide();
    });
    //动态添加头像
    var allPic="";
    for(var i=1;i<26;i++){
        allPic+="<div><img src='images/pic"+i+".jpg'></div>";
    }
    $("#checkUser").append(allPic);
    setTimeout(function () {
        $("#checkUser div").on("click", function () {
            var thisPic=$(this);
            $("#user").html(thisPic.html());
        });
    },50);
    $("#user").on("click", function (e) {
        $("#checkUser").slideToggle();
        e.stopPropagation();
    });
    $(document).on("click", function () {
        $("#checkUser").slideUp();
    });
    //移动私聊框
    $(".talkOneByOne").mousedown(function (e) {
        $(".talkOneByOne").css("z-index","3");
        var offset = $(this).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;
        $(document).bind("mousemove",function(ev)
        {
            $(".talkOneByOne").stop();
            var _x = ev.pageX - x;
            var _y = ev.pageY - y;
            $(".talkOneByOne").animate({left:_x+"px",top:_y+"px"},10);
        });
        $(document).mouseup(function()
        {
            $(this).unbind("mousemove");
        });
        e.stopPropagation();
    });
    $(document).mousedown(function () {
        $(".talkOneByOne").css("z-index","-1");
    });
    //关闭私聊窗口
    $(".close").click(function () {
        $(".talkOneByOne").hide();
        $(".talkToSomeOne").find("p").eq(0).remove();
    });

    //私聊发送
    $("#btnsend").click(function ()  {
        if($("#neirong").val().trim()!=""){
             $(".OneByOneMessages").html($("#neirong").val());
            $("#neirong").val("");
        }
        console.log($("#neirong").val())
        $("#neirong").focus();
    });
    $("#neirong").on("keydown",function(e){
        //判断是否按下了回车键
        if(e.keyCode==13){
            $("#btnsend").click();
        }
    });
    //选择性别
    $('.sex').hover(function(){
        $('.titsex').show();
    },function(){
        $('.titsex').hide();
    });
    $(".sex").click(function () {
        $(".sex").removeClass("checked");
        $(this).addClass("checked");
    });
    //选择状态
    $("#status").click(function () {
        $("#status").find("ul").toggle();
    });
    $("#status ul").find("li").click(function () {
        $("#now").html($(this).html());
        var message={
            type:"myState",
            nickname: $("#name").html(),
            state:$(this).html()
        };
        clientSocket.send(message);
    });
    //确定信息后发送信息给服务器
    $("#btn").find("button").click(function () {

        if($("#user").find("span").prop("class")=="fa-user"){
            alert("请选择一个你喜欢的头像");
            return;
        }else if($(".sex").eq(0).prop("class").indexOf("checked")==-1&&$(".sex").eq(1).prop("class").indexOf("checked")==-1){
            alert("请选择性别");
            return;
        }else if($("#login").val().length<=0){
            alert("用户名不能为空");
            return;
        }else if($("#login").val().length>6||$("#login").val().length<2){
            alert("用户名必须在2~6个字符");
            return;
        }else if($("#login").val()=="法轮功"){
            alert("昵称不能涉及到政治、军事等，请重新输入")
            $("#login").val("");
            return;
        }
        $("#sec1").slideUp();
        $("body").css("background-color", "#fff");
        setTimeout(function () {
            $("#sec2").slideDown();
        }, 100);
        var message = {
            type: "myInfo",
            nickname: $("#login").val(),
            pic: $("#user").find("img").prop("src"),
            sex: $(".checked").prop("id")
        };
        clientSocket.send(message);

    });
    //接收别人的信息
    clientSocket.on("showPep", function (data) {
        $("#pepNum").find("b").html(data.length);
        $("#otherState").html("");
        for(var i=0;i<data.length;i++){
            if(data[i].nickname!=$("#name").html()){
                var otherPic="<div><img src="+data[i].pic+"> </div>";
                var otherName="<p class='nickname'>"+data[i].nickname+"</p>";
                var otherSex="<p><span class='"+data[i].sex+"'></span> </p>";
                var otherState="<p class='state'>在线</p>";
                $("#otherState").append("<div>"+otherPic+otherName+"<br>"+otherState+"<br>"+otherSex+"<button class='wantTalkToSomeOne'>私聊</button></div>");
                //私聊
                $(".wantTalkToSomeOne").click(function () {
                    $(".talkOneByOne").css("display","block");
                    $(".talkOneByOne").css("z-index","3");
                    var someone=$(this).parent().find("p").eq(0).html();
                    $(".talkToSomeOne").prepend("<p>正在和"+someone+"私聊中</p>");
                });
            }
        }
    });
    clientSocket.on("message", function (data) {
        var type=data.type;
        switch (type){
            case "myInfo":
                showToMeInfo(data);
                break;
            case "someOneIn":
                showOther(data);
                break;
            case "someState":
                showOtherState(data);
                break;
            case "myMessage":
                showMyMessage(data);
                break;
            case "otherMessage":
                showOtherMessage(data);
                break;
            case "pepLeave":
                showPepLeave(data);
                break;
        }
    });
    //发送消息
    $("#sendBtn").click(function ()  {
        if($("#txtMessage").val().trim()!=""){
            var message={
                type:"myMessage",
                pic:$("#myPic").find("img").prop("src"),
                nickname:$("#name").html(),
                message:$("#txtMessage").val()
            };
            clientSocket.send(message);
            $("#txtMessage").val("");
        }
        $("#txtMessage").focus();
        //alert($("#totalMessage").prop("scrollHeight"))
        scroll();
    });
    //回车发送聊天内容
    $("#txtMessage").on("keydown",function(e){
        //判断是否按下了回车键
        if(e.keyCode==13){
            $("#sendBtn").click();
        }
    });

    //滚动窗口的函数
    function scroll(){
        //有多远滚多远
        $("#totalMessage").scrollTop($("#totalMessage").prop("scrollHeight"))
        console.log($("#totalMessage").prop("scrollHeight"))
    }
});


//显示自己的信息
function showToMeInfo(data){
    $("#myPic").html("<img src="+data.pic+">");
    $("#myState").find("span").eq(0).addClass(data.sex);
    $("#name").html(data.nickname);

}
//显示别人的信息
function showOther(data){
    var otherPic="<div><img src="+data.pic+"> </div>";
    var otherName="<p>"+data.nickname+"</p>";
    var otherSex="<p><span class='"+data.sex+"'></span> </p>";
    var otherState="<p>在线</p>";
    $("#otherState").append("<div>"+otherPic+otherName+"<br>"+otherState+"<br>"+otherSex+"</div>");
    $("#someOneIn").html("<div>[系统消息]:"+data.nickname+"进入聊天室</div>");
    $("#someOneIn").show();
    $("#someOneIn").find("div").animate({"left":"-300px"},20000, function () {
        $("#someOneIn").hide();
    });

}
//显示别人的状态
function showOtherState(data){
    for(var i=0;i<$(".nickname").length;i++){
        if(data.nickname==$(".nickname").eq(i).html()){
            $(".state").eq(i).html(data.state);
        }
    }
}
//显示自己发的消息
function showMyMessage(data){
    var myPic="<div class='messagesPic'><img src='"+data.pic+"'></div>";
    var mynickname="<p class='messagesNick'>"+data.nickname+"</p>";
    var myMessage="<div class='myMessage'>"+data.message+"</div>";
    $("#totalMessage").append("<div class='myMessages'><div class='messages'>"+myPic+mynickname+"</div><div class='clear'></div>"+myMessage+"</div>");

}
//显示别人发的信息
function showOtherMessage(data){
    var otherPic="<div class='otherPic'><img src='"+data.pic+"'></div>";
    var otherNickname="<div class='otherNickname'>"+data.nickname+"</div>";
    var otherMessage="<div class='otherMessage'>"+data.message+"</div>";
    $("#totalMessage").append("<div class='otherMessages'><div class='innerOtherMessage'>"+otherPic+otherNickname+"</div><div class='clear'></div>"+otherMessage+"</div>");

}
//有人走
function showPepLeave(data){
    $("#totalMessage").append("<p class='clear red'>[系统消息]"+data.leaveUser+"离开了聊天室</p>");
}
