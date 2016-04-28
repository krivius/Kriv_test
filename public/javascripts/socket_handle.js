/**
 * Created by adm_kriv on 12.04.2016.
 */

var socket = io();
var clients = [];

socket.emit("get_clients");

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

function convertMac(mac){
    var dec_mac = mac.split(":");
    var hex_mac = [];
    dec_mac.forEach(function(dec){
        hex_mac.push(decimalToHex(dec));
    });
    hex_mac = hex_mac.join(":").toUpperCase();
    return hex_mac;
}

socket.on('shalabuhi', function(data){

   var obj = JSON.parse(data);

   if(obj.phase == "setup"){
       console.log(data);
       var mac = convertMac(obj.mac);
       obj.mac = mac;
       obj.state = 'on';
       var mac_arr = [];
       for(var i=0; i < clients.length; i++){
           mac_arr.push(clients[i].mac);
       }
       if($.inArray(mac, mac_arr) == -1){
           clients.push(obj);
           mac_arr.push(mac);
           console.log("====================");
           console.log(clients);
           console.log("====================");
       }else{
           for(var i=0; i < clients.length; i++){
               if(mac == clients[i].mac){
                   clients[i].state = 'on';
               }
           }
           console.log("++++++++++++++++++++");
           console.log(clients);
           console.log("++++++++++++++++++++");
           var t_rows = $("#shalabuhen table").find('tr').get();
           $.each(t_rows, function(){
               var t_mac = $(this).find('td.mac').text();
               console.log(t_mac == mac);
               if(mac == t_mac){
                   $(this).find('td.state').text('on');
               }
           });
       }

       /*var rows = '<tr>'+
                       '<th>№</th>'+
                       '<th>MAC-адрес</th>'+
                       '<th>IP-адрес</th>'+
                       '<th>№ частотника</th>'+
                       '<th>Версия прошивки</th>'+
                       '<th>Статус</th>'+
                   '</tr>';
       for(var i=0; i < clients.length; i++){
           rows += '<tr>'+
               '<td>'+(i+1)+'</td>'+
               '<td class="mac">'+clients[i].mac+'</td>'+
               '<td>'+clients[i].ip+'</td>'+
               '<td>'+(i+1)+'</td>'+
               '<td>'+clients[i].version+'</td>'+
               '<td class="state">'+clients[i].state+'</td>'+
               '</tr>';
       }
       console.log(clients);
       var mac_list = '';
       $.each(mac_arr,  function(k, v){
           mac_list += '<option value="'+v+'">'+v+'</option>';
       });
       $("#mac_list").empty().html(mac_list);
       $("#shalabuhen table").empty().html(rows);*/
   }
});

var qwe;
$("#run").on("click",  function(){
    console.log("iv_run");
    var obj = {
        command: "start",
        mac: $("#mac_list").val()
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
    // console.log("iv_stop");
    var obj = {
        command: "stop",
        mac: $("#mac_list").val()
    };
    console.log(JSON.stringify(obj))
    socket.emit("iv_status", JSON.stringify(obj));
    clearInterval(qwe);
    $("#curr_freq").text('');
});

$("#get_speed").on("click", function(){
    var obj = {
        command: "gspeed",
        mac: $("#mac_list").val()
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
        sb2: parseInt(speed[2]+speed[3], 16).toString(),
        mac: $("#mac_list").val()
    };
    console.log(speed);
    socket.emit("iv_status", JSON.stringify(obj));
});




socket.on("iv_info", function(data){
    console.log("RPM: "+data);
    $("#curr_freq").text(data);
});

socket.on("sys_log",  function(data){
   var obj = JSON.parse(data);
    var phase = obj.phase;

    if(phase == "log"){
        var d = new Date(),
            now = d.getDate()+'.'+d.getMonth()+'.'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
        var row = '<tr><td>'+convertMac(obj.mac)+'</td><td>'+obj.from+'</td><td>'+obj.log_string+'</td><td>'+now+'</td></tr>';
        $("#logs table").append(row);
    }
    console.log(obj);
});

$("#sys_log").on("click", function(){
    var debug = $("#debug:checked").val() || 'debug_off';
    // console.log(debug);
    var obj ={
        phase: "sys_command",
        command: debug,
        mac: $("#mac_list").val()
    };
    socket.emit('iv_status', JSON.stringify(obj));
});
$("#update_fw").on("click",  function(){
    var obj ={
        phase: "sys_command",
        command: "fw_update",
        mac: $("#mac_list").val()
    };
    socket.emit('iv_status', JSON.stringify(obj));
});

// socket.on("mac_array",  function(data){
//
//     var mac_array = JSON.parse(data),
//         mac_list = '';
//     console.log(mac_array);
//     $.each(mac_array,  function(k, v){
//         mac_list += '<option value="'+v+'">'+v+'</option>';
//     });
//     $("#mac_list").empty().html(mac_list);
// });

socket.on("change_state",  function(data){
    for(var i=0; i < clients.length; i++){
        if(data == clients[i].mac){
            clients[i].state = 'off';
        }
    }
    console.log(clients);
    console.log("change_state "+data);
    var rows = $("#shalabuhen table").find('tr').get();
    $.each(rows, function(){
        var mac = $(this).find('td.mac').text();
        if(mac == data){
            $(this).find('td.state').text('off');
        }
    });
});

$("#restart").on("click",  function(){
    var obj ={
        phase: "sys_command",
        command: "restart",
        mac: $("#mac_list").val()
    };
    socket.emit('iv_status', JSON.stringify(obj));
});


socket.on("ws_clients",  function(data){
   // console.log(data);
    var mac_arr = [];
    var rows = '<tr>'+
        '<th>№</th>'+
        '<th>MAC-адрес</th>'+
        '<th>IP-адрес</th>'+
        '<th>№ частотника</th>'+
        '<th>Версия прошивки</th>'+
        '<th>Статус</th>'+
        '</tr>';
    for(var i=0; i < data.length; i++){
        rows += '<tr>'+
            '<td>'+(i+1)+'</td>'+
            '<td class="mac">'+data[i].mac+'</td>'+
            '<td>'+data[i].ip+'</td>'+
            '<td>'+(i+1)+'</td>'+
            '<td>'+data[i].version+'</td>'+
            '<td class="state">on</td>'+
            '</tr>';
        mac_arr.push(data[i].mac);
    }
    var mac_list = '';
    $.each(mac_arr,  function(k, v){
        mac_list += '<option value="'+v+'">'+v+'</option>';
    });
    $("#mac_list").empty().html(mac_list);
    $("#shalabuhen table").empty().html(rows);
});