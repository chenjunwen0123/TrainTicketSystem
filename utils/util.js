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
  console.log("new save sessionid:" + sessionId)
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
  var indexUrl = 'https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&fs='+encodeURI('广州')+',GZQ&ts='+encodeURI('北京')+',BJP&date='+ date + '&flag=N,N,Y'
  wx.request({
    url:indexUrl,
    method:"GET",
    success:function(res){
      var sesid = res.header["Set-Cookie"];
      console.log(sesid);
      saveSession(sesid);
      setInterval(checkSessionOk,30*60*1000);
    },
  });
}
module.exports = {
  formatTime:formatTime,
  requireSession:requestSessionid,
  checkSessionOk:checkSessionOk,
  getDateString:getDateString
}
