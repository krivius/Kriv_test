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


socket.on('shalabuhi', function(data){
   console.log(data);
   var obj = JSON.parse(data);
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

});

// $(document).ready(function(){
    $("#run").on("click",  function(){
        var state = $(this).attr("state");

        if(state == '0'){
            $(this).attr("state", "1").val('stop');
            console.log("iv_run");
            socket.emit("iv_status", "iv_run");
        }else{
            $(this).attr("state", "0").val('run');
            console.log("iv_stop");
            socket.emit("iv_status", "iv_stop");
        }
    });
// });
