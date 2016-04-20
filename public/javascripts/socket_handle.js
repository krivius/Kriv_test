/**
 * Created by adm_kriv on 12.04.2016.
 */

var socket = io();

function decimalToHex(d, padding) {
   var hex = Number(d).toString(16);
   padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

   while (hex.length < padding) {
      hex = "0" + hex;
   }
   return hex;
}

function zeroFill(string){
    while(string.length < 4){
        string = '0'+string;
    }
    return string;
}


socket.on('shalabuhi', function(data){
   console.log(data);
   var obj = JSON.parse(data);
   if(obj.phase == "setup"){
       var num = $("#shalabuhen table").find("tr:last-child").find("td:first-child").text();
       var dec_mac = obj.mac.split(":");
       var mac = [];
       dec_mac.forEach(function(dec){
           mac.push(decimalToHex(dec));
       });
       mac = mac.join(":").toUpperCase();

       var row =   '<tr>'+
           '<td>'+(+num+1)+'</td>'+
           '<td>'+mac+'</td>'+
           '<td>'+obj.ip+'</td>'+
           '<td>'+(+num+1)+'</td>'+
           '<td>'+obj.version+'</td>'+
           '<td>on</td>'+
           '</tr>';
       $("#shalabuhen table").append(row);
   }
});

var qwe;
$("#run").on("click",  function(){
    console.log("iv_run");
    var obj = {
        command: "start"
    };
    socket.emit("iv_status", JSON.stringify(obj));
    qwe = setInterval(function(){
        var obj = {
            command: "gspeed"
        };
        socket.emit("iv_status", JSON.stringify(obj));
    }, 1000);
});
$("#stop").on("click",  function(){
    console.log("iv_stop");
    var obj = {
        command: "stop"
    };
    socket.emit("iv_status", JSON.stringify(obj));
    clearInterval(qwe);
    $("#curr_freq").text('');
});

$("#get_speed").on("click", function(){
    var obj = {
        command: "gspeed"
    };
    socket.emit("iv_status", JSON.stringify(obj));
});

$("#set_speed").on("click",  function(){
    var speed = $("#speed").val() || '0000';
    if(speed != '0000'){
        speed = decimalToHex(speed);
        speed = zeroFill(speed);
    }
    var obj = {
        command: "sspeed",
        sb1: parseInt(speed[0]+speed[1], 16).toString(),
        sb2: parseInt(speed[2]+speed[3], 16).toString()
    };
    console.log(speed);
    socket.emit("iv_status", JSON.stringify(obj));
});



socket.on("iv_info", function(data){
    console.log("RPM: "+data);
    $("#curr_freq").text(data);
});
