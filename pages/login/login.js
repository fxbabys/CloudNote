var util = require("../../utils/util.js");
const LOGIN_URL = 'https://login.jeremygo.cn';
const UPLOAD_URL = 'https://login.jeremygo.cn/upload';
const getUserInfoPromised = util.wxPromisify(wx.getUserInfo);

Page({
    data: {
        signFlag: 'Sign In',
        userInfo: ''
    },
    signClick: function(e) {
      this.setData({
        signFlag: e.target.dataset.flag
      })
    },
    forgetPass: function() {
        console.log("forget");
    },
    onGotUserInfo: function (e) {
        console.log(e.detail)
        this.setData({
            userInfo: e.detail.userInfo
        })
    },
    loginWechat: function() {
        console.log("loginWechat");
        const _this = this;
        wx.login({
            success: function(res) {
                var code = res.code;
                if (code) {
                    console.log("获取用户登录凭证: " + code);
                    wx.request({
                        url: LOGIN_URL,
                        data: {
                            code: code
                        },
                        success: function(res) {
                            console.log(res.data);
                            // let data = JSON.parse(res.data);
                            let session_id = res.data.session_id;
                            let openid = res.data.openid;
                            if (!session_id || !openid) {
                                util.showBusy('登录失败');
                                return;
                            }
                            wx.setStorageSync("userInfo", _this.userInfo);
                            wx.setStorageSync('session_id', session_id);
                            wx.setStorageSync('openid', openid);
                            console.log(openid);
                            util.showSuccess("登录成功");
                            _this.uploadNote();
                        },
                        fail: function(res) {
                            console.log(res);
                        }
                    });
                } else {
                    console.log("获取用户登录凭证失败： " + res.errMsg);
                }
            }
        });
    },
    uploadNote: function() {
        var txt = wx.getStorageSync('txt');
        var u_openid = wx.getStorageSync('openid');
        if(txt) {
            wx.request({
                url: UPLOAD_URL,
                // method: 'POST',
                data: {
                    txt: txt,
                    u_openid: u_openid
                },
                success: function(res) {
                    console.log(res.data);
                    if (res.data.statusCode === 200) {
                        util.showSuccess("笔记上传成功");
                        setTimeout(function() {   // 笔记上传至数据库后跳转回首页
                            wx.redirectTo({
                                url: '../index/index'
                            });
                        }, 100);
                    } else {
                        util.showBusy("网络繁忙，请重试");
                    }
                },
                fail: function(res) {
                    console.log(res);
                }
            });
        } else {
            wx.redirectTo({
                url: '../index/index'
            });
        }
    },
    forgetPass: function() {
        console.log("forget");
    },
    formsubmit: function(e) {
        const _this = this;
        var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");//验证邮箱
        console.log(e.detail.value);

        if(e.detail.value.email.length==0) {
            wx.showToast({
                title:'输入邮箱',
                icon:'loading',
                duration:1500
            });
            return;
        }
        else if(!reg.test(e.detail.value.email)) {
            wx.showToast({
                title:'邮箱格式错误',
                icon:'loading',
                duration:1500
            });
            return;
        }
        wx.showLoading({
            title: '提交中'
        });
         if("undefined" != typeof e.detail.value.none)
         {
            wx.request({
                url: 'http://39.106.158.118/xk/tp5/public/denglu',
                header: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                method:'POST',
                data:{
                    email:e.detail.value.email,
                    password:e.detail.value.password
                },
                success: function(res){
                    console.log(res);
                    wx.hideLoading();
                    if (res.data.status === 1) {
                        util.showSuccess("登录成功");
                        wx.setStorageSync('email', e.detail.value.email);
                        _this.uploadNote();
                    } else {
                        util.showBusy(res.data.data);
                    }
                },
                fail: function(){
                    wx.showToast({
                        title:'请求失败',
                        icon:'loading',
                        duration:1500
                    })
                }
            })
         }
         if("undefined" != typeof e.detail.value.repassword)//注册
         {
            console.log("注册");
            if(e.detail.value.password.length < 6)
                 wx.showToast({
                    title:'密码长度过短',
                    icon:'loading',
                    duration:1500
                })
             else if(e.detail.value.password != e.detail.value.repassword)
             {
                wx.showToast({
                    title:'输入的密码不一致',
                    icon:'loading',
                    duration:1500
                })
             }
             else
             {
                wx.request({
                    url: 'http://39.106.158.118/xk/tp5/public/sign_email',
                    header: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    },
                    method:'POST',
                    data:{
                        email:e.detail.value.email,
                        password:e.detail.value.password
                    },
                    success: function(res){
                        console.log(res);
                        wx.hideLoading();
                        if (res.data.status === 1) {
                            util.showSuccess("注册成功");
                        } else {
                            util.showBusy(res.data.data);
                        }
                    },
                    fail: function(){
                        wx.showToast({
                            title:'请求失败',
                            icon:'loading',
                            duration:1500
                        })
                    }
                })
             }
         }
    }
})