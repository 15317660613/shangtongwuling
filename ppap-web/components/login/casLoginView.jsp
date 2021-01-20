<!doctype html>
<%@ page pageEncoding="UTF-8" %>
<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<html>
<head>
    <meta charset="utf-8">
    <title>欢迎登录</title>

    <link href="css/login.css" type="text/css" rel="stylesheet">
    <%--<link rel="stylesheet" href="../../assets/libs/layui/css/layui.css" />--%>
    <%--<script src="../../assets/libs/jquery-1.12.4.min.js"></script>--%>
    <%--<script type="text/javascript" src="../../assets/libs/layui/layui.js"></script>--%>
    <script src="https://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="//res.layui.com/layui/dist/layui.js?t=1542630986934"></script>

    <script>

        function fvh() {
            var vh = $(window).height();
            $(".index_login").height(vh);
        }
        $(function () {
            fvh();
        })
        $(window).resize(function () {
            fvh();
        })

        $(function () {
            $(".re_password .rem_btn").click(function () {

                if ($(this).find("img").css("margin-top") == "0px") {
                    $(this).find("img").css("margin-top", "-30px");
                    $('#rememberMe').val('false')
                }
                else {
                    $(this).find("img").css("margin-top", "0px");
                    $('#rememberMe').val('true')
                }
            })
        })

    </script>
</head>
    <style>
    .login-wrapper{
    overflow: hidden;
    /* 防止图片绝对定位将浏览器横向撑开 */
    overflow-x: hidden;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-image: url('../../assets/images/login_page/login_bg2.png');
    background-repeat: no-repeat;
    background-size: cover;
    background-color: #010042;
    }

    .layui-form-label {
    width: 38px;
    padding: 8px 0;
    text-align: center;
    }

    a {
    cursor:pointer;
    }

    .login h1 {
    text-align: center;
    /*color: #fff;*/
    font-size: 24px;
    margin-bottom: 5px;
    }
    .login h3 {
    text-align: center;
    /*color: #fff;*/
    /*font-size: 24px;*/
    margin-bottom: 25px;
    }
    .form_code {
    position: relative;
    }

    .form_code .code {
    position: absolute;
    right: 2px;
    top: 1px;
    cursor: pointer;
    }

    .login_btn {
    width: 100%;
    background:rgba(34,159,255,1);
    box-shadow:0px 8px 16px 0px rgba(0,142,232,0.31);
    }
    .text-color{
    color: #229FFF;
    font-size: 20px!important;
    margin-top: 19px!important;
    margin-left: -10px!important;
    }
    .layui-tab-title li{
    color: #999;
    }
    .layui-tab-title{
    border-bottom-style: none;
    text-align: center;
    }
    .layui-tab-brief>.layui-tab-title .layui-this{
    color: rgb(10,180,227);
    }
    .layui-tab-brief>.layui-tab-more li.layui-this:after, .layui-tab-brief>.layui-tab-title .layui-this:after{
    border-bottom: 2px solid rgb(10,180,227);
    }
    .input-icon{
    position: absolute;
    top: 0px;
    left: 0px;
    height: 44px;
    line-height: 1.3;
    font-size: 24px;
    color: #999;
    }
    .layui-form-item{
    position: relative;
    }
    .layui-input{
    padding-left: 50px;
    height: 44px;
    }
    .login-icon{
    margin-left: 10px;
    }
    .layui-input:focus, .layui-textarea:focus{
    border-color: #229FFF!important;
    }
    .input-remove{
    position: absolute;
    top: 9px;
    right: 10px;
    height: 38px;
    line-height: 1.3;
    font-size: 22px;
    color: #999;
    cursor: pointer;
    }
    input[type=text]::-ms-clear {
      display: none;
    }
    video {
    height: 100%;
    }
    .login-header{
    margin: 0 auto;
    width:500px;
    height: 15vh;
    color: white;
    text-align:center;
    margin-top: 9%
    }
    .login-header-p1{
    font-size: 30px;
    margin-bottom: 12px;
    font-family:PingFang-SC-Bold;
    font-weight:bold;
    }
    .login-header-p2{
    font-size: 16px;
    }
    .login-content{
    margin: 0 auto;
    width:990px;
    height:370px;
    color: white;
    background-color: white;
    border-radius:3px;
    }
    .login-content-left{
    height: 370px;
    width:660px

    }
    .login-content-right{
    height: 370px;
    width: 330px;
    position: relative;
    top: -370px;
    left: 650px;

    }
    .login-content-right-title{
    text-align: center;
    margin-bottom: 8px

    }

    </style>

<body>

<div class="login-wrapper">
    <div class="login-header">
        <p class="login-header-p1">欢迎登陆</p>
        <p class="login-header-p2" style="font-size: 16px;">上汽通用五菱供应商协同管理平台</p>
        <p class="login-header-p2">SAIC GM WuLing Supplier Collaborative Management Platform</p>
    </div>
    <div class="login-content">
        <!--<img style="height: 100%" src="../assets/images/login_page/login_img.png">-->
        <div class="login-content-left">
            <video controls>​
                <source src="../../assets/video/1%20RS-5宣传视频.mp4" type="video/mp4">
            </video>
        </div>
        <!-- 卡片主体 -->
        <div class="login-content-right">
            <div class="login" style="margin-left: 14px">
                <div class="layui-title-name login-content-right-title">
                    <a id="sgmwLogin" onclick="sgmwLogin()" style="margin-right:20px;font-family:PingFang-SC-Bold;font-weight:bold;color:rgba(34,159,255,1);" class="text-colorlayui-inline">SGMW登录</a>
                    <a id="gysLogin" onclick="gysLogin()"
                       style="font-family:PingFang-SC-Bold;font-weight:bold;color:#dddddd;"
                       class="text-color layui-inline">供应商登录</a>
                </div>
                <form:form method="post" id="sgmwForm" class="layui-form" commandName="${commandName}" htmlEscape="true">
                    <div class="layui-form-item">
                        <spring:message code="screen.welcome.label.netid.accesskey" var="userNameAccessKey" />
                        <form:input class="layui-input" placeholder="请输入用户名" id="username" size="25" tabindex="1" accesskey="${userNameAccessKey}" path="username" autocomplete="off" htmlEscape="true" />
                        <img class="input-icon" src="../../assets/images/login_page/login_user.png">
                    </div>
                    <div class="layui-form-item">
                        <spring:message code="screen.welcome.label.password.accesskey" var="passwordAccessKey" />
                        <form:password class="layui-input" placeholder="请输入密码"  id="password" size="25" tabindex="2" path="password"  accesskey="${passwordAccessKey}" htmlEscape="true" autocomplete="off" />
                        <img class="input-icon" src="../../assets/images/login_page/login_pwd.png">

                    </div>
                    <div class="layui-form-item form_code">

                        <spring:message code="screen.welcome.label.captcha.accesskey" var="authcaptchaAccessKey" />
                        <input class="layui-input" style="width: calc(100% - 124px)" type="text" placeholder="请输入验证码" maxlength="10" name="captcha">
                        <input type="hidden" name="showCaptcha" value="true"/>
                        <img class="input-icon" src="../../assets/images/login_page/login_vl.png">

                        <div class="code">
                            <img width="116" height="42" alt="<spring:message code="required.captcha" />"
                            onclick="this.src='captcha.jpg?'+Math.random()" src="captcha.jpg">
                        </div>
                    </div>
                    <div class="layui-form-item">
                        <div class="layui-inline">
                            <input style="display: block" type="checkbox" name="" lay-skin="primary">
                        </div>
                        <span style="color: #A7A7A7;font-size: 14px ">我接受《上汽通用五菱汽车股份公司》数据保密协议</span>
                    </div>
                    <button class="layui-btn login_btn" type="submit" style="margin-top: -8px">登录</button>
                    <form:errors path="*" id="msg" cssClass="alert_tip" element="div" htmlEscape="false"/>
                    <input type="hidden" name="lt" value="${loginTicket}"/>
                    <input type="hidden" name="execution" value="${flowExecutionKey}"/>
                    <input type="hidden" name="_eventId" value="submit"/>
                    <div style="margin-top: 5px">
                        <a style="float: left;color: #A7A7A7">忘记密码</a>
                        <a style="float: right;color: #A7A7A7">重置</a>
                    </div>
                </form:form>
            </div>
        </div>

    </div>

</div>
</body>
</html>
