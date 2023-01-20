const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
  
    return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
  }
  
  const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : `0${n}`
  }
  function saveSession(sessionId){
    console.log("New Cookie(SessionId) saved:" + sessionId)
    wx.setStorageSync('sessionid',sessionId)
    wx.setStorageSync('sessiondate', Date.parse(new Date()))
  }
  function removeLocalSession(){
    wx.removeStorageSync('sessionid')
    wx.removeStorageSync('sessiondate')
    console.log("remove session")
  }
  function checkSessionTimeout(){
    var sessionid = wx.getStorageSync('sessionid')
    if(sessionid == null || sessionid == undefined || sessionid == ""){
      console.log("session is empty")
      return false;
    }
    var sessionTime = wx.getStorageSync('sessiondate')
    var aftertimestamp = Date.parse(new Date())
    if(aftertimestamp - sessionTime >= 0){
      removeLocalSession()
      return false;
    }
    return true
  }
  function checkSessionOk(){
    console.log("check session ....")
    var sessionOk = checkSessionTimeout()
    if(!sessionOk){
      requestsessionid();
    }
  }
  function getDateString(){
    var now = new Date();
    var year = now.getFullYear();
    var mtemp = (now.getMonth() + 1);
    var month = mtemp < 10 ? '0' + mtemp : mtemp;
    var dtemp = now.getDate();
    var day = dtemp < 10 ? '0' + dtemp:dtemp;
    var date = year + '-' + month + '-' + day;
    return date;
  }
  function requestSessionid(){
    var date = getDateString();
    var indexUrl = 'https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&fs='+encodeURI('广州')+',GZQ&ts='+encodeURI('珠海')+',ZHQ&date='+ date + '&flag=N,N,Y'
    wx.request({
      url:indexUrl,
      method:"GET",
      success:function(res){
          console.log("requestSessionIdRes:", res);
          var sesid = res.header["Set-Cookie"];
          console.log(sesid);
          saveSession(sesid);
          setInterval(checkSessionOk,30*60*1000);
      },
    });
  }
  
  function requestUrl(){
      var date = getDateString();
      var url = 'https://kyfw.12306.cn/otn/leftTicket/queryZ?leftTicketDTO.train_date=' + date + '&leftTicketDTO.from_station=GZQ&leftTicketDTO.to_station=ZHQ&purpose_codes=ADULT';
  
      var sesStr = wx.getStorageSync('sessionid');
      var temps = sesStr.split(';');
      var cookie = '';
  
      for(var i=0;i<temps.length-1;++i){
          var idx = temps[i].indexOf(',');
          cookie += temps[i].substring(idx+1) + ";";
      }
      wx.request({
          url: url,
          header:{
              'Content-Type':'application/json;charset=UTF-8',
              'Cookie':cookie
          },
          success:function(e){
              console.log('successful:', e);
              var c_url = 'leftTicket/queryZ';
              if(e.statusCode == 302){
                  c_url = e.data.c_url;
              }
              wx.setStorageSync('c_url', c_url);
          },
      })
  }
  module.exports = {
    formatTime:formatTime,
    requireSession:requestSessionid,
    requireURL:requestUrl,
    checkSessionOk:checkSessionOk,
    getDateString:getDateString
  }