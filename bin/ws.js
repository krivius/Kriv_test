/**
 * Created by adm_kriv on 12.04.2016.
 */
var www = require('./www');
var ws = require("nodejs-websocket");
var events = require('events');

var global_conn;



function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

var clients = [];

var server = ws.createServer(function(conn){


    console.log("New connection!");
    clients.push(conn);
    global_conn = conn;
    console.log("clients_array: "+clients);

    var heartBeat = setInterval(function(){
        console.log("Total connections: "+clients.length);
        for(var i = 0; i < clients.length; i++) {
            try{
                console.log("heartbeat try");
                clients[i].sendPing();
            }catch(err){
                console.log("heartbeat catch");
                console.log(err);
                clients[i].close();
                clients.splice(i, 1);
                break;
            }
            // # Remove from our connections list so we don't send
            // # to a dead socket
            // if(clients[i] == conn) {
            //     clients.splice(i);
            //     break;
            // }
        }
    }, 5000);


    conn.on("text", function(str){

        var obj = JSON.parse(str);
        console.log("Phase: "+obj.phase);

        if(obj.phase == "setup"){

            var dec_mac = obj.mac.split(":");
            var mac = [];
            dec_mac.forEach(function(dec){
                mac.push(decimalToHex(dec));
            });
            var setup = {phase:"setup", iv_id:"1", pin:"2"};
            conn.sendText(JSON.stringify(setup));

        }else if(obj.phase == "iv_reply"){
            console.log(str);
            var reply = JSON.parse(str);

            var reply_hex = decimalToHex(reply.msg_b0)+' '+
                decimalToHex(reply.msg_b1)+' '+
                decimalToHex(reply.msg_b2)+' '+
                decimalToHex(reply.msg_b3)+' '+
                decimalToHex(reply.msg_b4)+' '+
                decimalToHex(reply.msg_b5)+' '+
                decimalToHex(reply.msg_b6)+' '+
                decimalToHex(reply.msg_b7);
            console.log("REPLY: "+reply_hex.toUpperCase());
            if(reply.command == "gspeed"){
                var rpm = parseInt(decimalToHex(reply.msg_b3) + decimalToHex(reply.msg_b4), 16);
                www.eventEmitter.emit('info', rpm);
            }
        }else if(obj.phase == "log"){
            console.log("log: "+str);
            www.eventEmitter.emit('sys_log', str);
        }else if(obj.phase == "command"){
            console.log("freq.reply: "+str);
        }else if(obj.phase == "debug"){
            console.log("debug "+str);
        }

        www.eventEmitter.emit('ws', str);
        www.shalabuhen.emit('ws2', str);
    });


   /* conn.on("close", function(code, reason){

        for(var i = 0; i < clients.length; i++) {
            // # Remove from our connections list so we don't send
            // # to a dead socket
            if(clients[i] == conn) {
                clients.splice(i);
                break;
            }
        }

        console.log("Connection closed: "+reason);
        conn.close();
        console.log("Total connections: "+clients.length);
    });*/
}).addListener("close",  function(){
    console.log("===CLOSED===");
}).listen(81);


var event_command = new events.EventEmitter();
var my_command = function my_command(str){
    console.log("ws: "+str);
    var obj = JSON.parse(str);
    var command;
    console.log("=="+obj.command+"==");
    if(obj.sb1) {
        command = {phase: "command", command: obj.command, sb1: obj.sb1, sb2: obj.sb2};
    }else if(obj.phase == "sys_command") {
        command = {phase: "sys_command", command: obj.command};
       }else{
        command = {phase:"command", command:obj.command};
        // command = {phase:"sys_command", command:"restart"};
    }
    server.connections.forEach(function(conn){
        conn.sendText(JSON.stringify(command));
    });
};

event_command.addListener("ev_command", my_command);
exports.event_command = event_command;

