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


    clients.push(conn);
    console.log("New connection!");
    global_conn = conn;
    console.log("clients: "+clients[0].id);
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


    conn.on("close", function(code, reason){
        console.log("Connection closed: "+reason);
        conn.close();
    });
}).listen(81);

/*
var event_1 = new events.EventEmitter();
var event_run = function event_run(str){
    console.log("==START==");
    var command = {phase:"command", command:"start"};
    //server.socket.sendText(JSON.stringify(command));
    server.connections.forEach(function(conn){
        conn.sendText(JSON.stringify(command));
    });
};
var event_2 = new events.EventEmitter();
var event_stop = function event_stop(str){
    console.log("==STOP==");
    var command = {phase:"command", command:"stop"};
    //server.socket.sendText(JSON.stringify(command));
    server.connections.forEach(function(conn){
        conn.sendText(JSON.stringify(command));
    });
};

var event_3 = new events.EventEmitter();
var event_gspeed = function event_gspeed(str){
    console.log("==GSPEED==");
    var command = {phase:"command", command:"gspeed"};
    //server.socket.sendText(JSON.stringify(command));
    server.connections.forEach(function(conn){
        conn.sendText(JSON.stringify(command));
    });
};
*/

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


//
// event_2.addListener("ev_2", event_stop);
// exports.event_2 = event_2;
//
// event_3.addListener("ev_3", event_gspeed);
// exports.event_3 = event_3;
//
// event_4.addListener("ev_4", event_setspeed);
// exports.event_4 = event_4;