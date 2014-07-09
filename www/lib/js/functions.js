var Util = {}

Util.timeStamp2Date = function(timestamp){
    var data = new Date(timestamp * 1000);
    var year = data.getFullYear();
    var month = (data.getMonth() < 10) ? "0" + data.getMonth() : data.getMonth();
    var day = (data.getDate() < 10) ? "0" + data.getDate() : data.getDate();
    console.log(year, month, day);
    return day + '-' + month + '-' + year;

}