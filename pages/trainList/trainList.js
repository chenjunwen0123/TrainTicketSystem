var util = require('../../utils/util.js')
Page({
    data:{
        date:'',
        trainList:[],   //站到站数据
        mapList:{},     //Key：三字代码  Value：火车站名
        codeList:{},    //Key：火车站名  Value：三字代码
        startStation:"",    //始发站
        endStation:"",      //终点站
        startCode:"",       //始发站的三字代码
        endCode:"",         //终点站的三字代码
        userCode:"",        //乘客类别
        winHeight:600,      
        currentTab:'1',
    },
    onLoad:function(e){
        var startStation = e.startStation;//始发站 
        var endStation = e.endStation;//终点站
        var date = e.date;//日期 
        var if_student = e.if_student; //是否选择学生票
        var userCode = "ADULT";
        console.log("startStation="+startStation+"---endStation="+endStation+"---date="+date + "---userCode =" + userCode); 
        wx.setNavigationBarTitle({
            title: startStation+'→'+endStation 
        });
        this.setData({
            date:date,
            startStation:startStation,
            endStation:endStation,
            userCode:userCode
        })
        this.loadMapList(date,startStation,endStation,userCode); 
    },
    loadMapList:function(date,startStation,endStation,userCode){
        var me = this
        var mapList = new Object();
        var codeList = new Object();
        console.log("step1");
        var header ={
            'Content-Type':'text/javascript;charset=UTF-8'
        }
        var queryUrl = 'https://kyfw.12306.cn/otn/resources/js/framework/station_name.js?station_version=1.9230';
        wx.request({
            url:queryUrl,
            header:header,
            success:function(res){
                var mapData = res.data;
                var idx = mapData.indexOf('station_names =') + 15;
                var dataStr = mapData.substring(idx);
                var parts = dataStr.split('|');
                for(var i = 2;i<parts.length;i+=5){
                    mapList[parts[i]] = parts[i-1];
                    codeList[parts[i-1]] = parts[i];
                }
                me.setData({
                    mapList:mapList,
                    codeList:codeList
                })
                console.log(mapList);
                console.log(me.data.codeList);

                var startCode = codeList[startStation];
                var endCode = codeList[endStation];
                me.setData({
                    startCode:startCode,
                    endCode:endCode
                })
                me.loadTrainsList(date,startStation,startCode,endStation,endCode,userCode);
            }
        });
        
    },
    loadTrainsList:function(startDate,startStation,startCode,endStation,endCode,userCode){ 
        var me = this;
        let startStationCode = startCode?startCode:'GZQ';
        let endStationCode = endCode?endCode:'BJP';
        let startUTF = escape(startStation) + '%2c';
        let endUTF = escape(endStation) + '%2c';
        console.log("date:"+startDate +",startStation:"+startStation+",endStation:"+endStation)
        let queryUrl = 'https://kyfw.12306.cn/otn/leftTicket/query?leftTicketDTO.train_date=' + startDate + '&leftTicketDTO.from_station=' + startStationCode + '&leftTicketDTO.to_station='+endStationCode+'&purpose_codes=' + userCode;
        
        var sesStr = wx.getStorageSync('sessionid');
        var temps = sesStr.split(';');
        var cookie = '';

        for(var i=0;i<temps.length-1;++i){
            var idx = temps[i].indexOf(',');
            cookie += temps[i].substring(idx+1) + ";";
        }
        
        cookie += '_jc_save_fromStation=' + startUTF + startStationCode;
        cookie += '_jc_save_toStation=' + endUTF + endStationCode;
        cookie += '_jc_save_fromDate=' + startDate + ';';
        cookie += '_jc_save_toDate=' + startDate + ';';
        cookie += '_jc_save_wfdc_flag=dc';
        var header = {
            'Content-Type':'application/json;charset=UTF-8',
            'Cookie':cookie,
        };
        wx.request({
            url: queryUrl,
            method: 'GET',
            header:header,
            success: function(res){
                console.log(res.data);
                var tempList =res.data.data.result;
                var trainList = new Array();
                for(var i = 0;i<tempList.length;++i){
                    var idx = tempList[i].indexOf('预订|');
                    if(idx > 0){
                        var tempStr = tempList[i].substring(idx + 4);
                        var infos = tempStr.split('|');
                        var trainInfo={};
                        trainInfo.trainNo = infos[1];
                        trainInfo.start = me.data.mapList[infos[4]];
                        trainInfo.end = me.data.mapList[infos[5]];
                        trainInfo.startTime = infos[6];
                        trainInfo.endTime = infos[7];
                        trainInfo.duration = infos[8];
                        trainList.push(trainInfo);
                    }
                }
                console.log(trainList);
                var size = trainList.length;
                var winHeight = size*100 + 30;
                me.setData({
                    trainList:trainList,
                    winHeight:winHeight
                });
            } 
        });
    },
    loadYesterday:function(){
        var date = this.data.date.split('-');
        var year = Number(date[0]);
        var month = Number(date[1]);
        var day = Number(date[2]);
        if(month == 1 && day == 1){
            year -= 1;
            month = 12;
            day = 31;
        }else{ 
            if(day == 1){
                if(month - 1 == 2){
                    day = (year%4 == 0)?29:28;
                }else if(month-1 > 7){
                    day = ((month-1)%2 == 0)?31:30;
                }else{
                    day = ((month-1)%2 == 0)?30:31;
                }
                month --;
            }else{
                day --;
            }
        }
        if(day < 10){
            day = '0' + day;
        }
        if(month < 10){
            month = '0' + month;
        }
        date = year + '-' + month + '-' + day 
        console.log("switch to yesterday:" + date);
        var data = this.data;
        this.setData({date:date})
        this.loadTrainsList(date,data.startStation,data.startCode,data.endStation,data.endCode,data.userCode);
    },
    loadTomorrow:function(){
        var date = this.data.date.split('-');
        var year = Number(date[0]);
        var month = Number(date[1]);
        var day = Number(date[2]);
        if(month == 12 && day == 31){
            year += 1;
            month = 1;
            day = 1;
        }else{
            if(month == 2){
                if(year % 4 == 0){  //闰年
                    if(day < 29)
                        day++;
                    else{
                        day = 1;
                        month++;
                    }
                }else{          //平年
                    if(day < 28)
                        day++;
                    else{
                        day = 1;
                        month++;
                    }
                }
            }
            else if(month > 7){
                if(month % 2 == 0){
                    if(day < 31){
                        day ++;
                    }
                    else{
                        day = 1;
                        month ++;
                    }
                }else{
                    if(day < 30){
                        day ++;
                    }
                    else{
                        day = 1;
                        month ++;
                    }
                }
            }else{
                if(month % 2 == 0){
                    if(day < 30){
                        day ++;
                    }
                    else{
                        day = 1;
                        month ++;
                    }
                }else{
                    if(day < 31){
                        day ++;
                    }
                    else{
                        day = 1;
                        month ++;
                    }
                }
            }
        }
        if(day < 10){
            day = '0' + day;
        }
        if(month < 10){
            month = '0' + month;
        }
        date = year + '-' + month + '-' + day 
        console.log("switch to tomorrow:" + date);
        var data = this.data;
        this.setData({date:date})
        this.loadTrainsList(date,data.startStation,data.startCode,data.endStation,data.endCode,data.userCode);
    },
    switchNav:function (e) {
        var id = e.currentTarget.id; 
        console.log(id);
        this.setData({ currentTab: id });
    } 
})