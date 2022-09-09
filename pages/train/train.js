// pages/train/train.js
var util = require("../../utils/util.js")
Page({
    data:{
        indicatorDots:false,
        autoplay:true,
        interval:5000,
        duration:1000,
        imgUrls:[
            '/images/haibao/1.jpg', 
            '/images/haibao/2.jpg', 
            '/images/haibao/3.jpg'
        ],
        currentTab:0,
        if_student:0, //是否查询学生票
        if_highrail:0, //是否查询高铁动车项
        date:""       //查询日期
    },
    onLoad:function(options){
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        if(month < 10)
            month = "0" + month;
        if(day < 10)
            day = "0" + day
        date = year + "-" + month + "-" + day;
        this.setData({
            date:date
        })
    // 页面初始化 options 为页面跳转所带来的参数
    },
    bindDateChange:function(e){
        this.setData({
            date:e.detail.value
        })
    },
    switchNav:function (e) {
        var id = e.currentTarget.id; 
        this.setData({ 
            currentTab: id 
        });
    }, 
    if_student_changed:function(e){
        var status = e.datail.value
        this.setData({
            if_student:status?1:0
        })
    },
    if_highrail_changed:function(e){
        var status = e.datail.value
        this.setData({
            if_highrail:status?1:0
        })
    },
    formSubmit:function(e){
        console.log(e);
        var startStation = e.detail.value.startStation;//始发站 
        var endStation = e.detail.value.endStation;//终点站
        var date = this.data.date; //日期
        var week = date;//星期
        var if_student = this.data.if_student; //是否是学生票
        wx.navigateTo({
            url: '../trainList/trainList?startStation=' + startStation+"&endStation=" + endStation + "&date=" + date + "&week=" + week +"&if_student=" + if_student
        })
    }
})
