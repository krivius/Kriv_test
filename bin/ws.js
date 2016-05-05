/**
 * Created by adm_kriv on 12.04.2016.
 */

'use strict'

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
var mac_array = [];
var server = ws.createServer(function(conn){



    conn.on('connect', function(){
        console.log("New connection!");
        var client_obj = {};
        client_obj.conn = conn;

        clients.push(client_obj);

        global_conn = conn;
        //console.log("clients_array: "+clients);
    });

    conn.on("text", function(str){

        var obj = JSON.parse(str);
        if(obj.command != "pong") {
            console.log("Phase: " + obj.phase + " " + str);

        }

        if(obj.phase == "setup"){

            var dec_mac = obj.mac.split(":");
            var mac = [];
            dec_mac.forEach(function(dec){
                mac.push(decimalToHex(dec));
            });
            mac = mac.join(":").toUpperCase();
            mac_array.push(mac);
            // console.log("MAC ADDR: "+mac);
            var setup = {phase:"setup", iv_id:"1", pin:"2"};
            conn.sendText(JSON.stringify(setup));

            var send_clients = [];
            for(var i = 0; i < clients.length; i++){
                var tmp={};
               if(clients[i].conn == conn){
                   clients[i].mac = mac;
                   clients[i].ip = obj.ip;
                   clients[i].version = obj.version;
               }
                tmp.mac = mac;
                tmp.ip = obj.ip;
                tmp.version = obj.version;
                tmp.state = 'on';
                send_clients.push(tmp);
            }
            console.log(clients);
            www.eventEmitter.emit('mac_array', JSON.stringify(send_clients));
            console.log(mac_array);

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
        }else if(obj.phase == 'sys_command' && obj.command != "pong"){
            console.log("sys_command: "+str);
        }

        www.eventEmitter.emit('ws', str);
        www.shalabuhen.emit('ws2', str);
    });

    conn.on("error", function(){
        for(var i = 0; i < clients.length; i++) {
            if(clients[i].conn.key === conn.key){
                var mac = clients[i].mac;

                // var send_clients = [];
                // clients.forEach(function(client){
                //     var obj = {};
                //     obj.mac = client.mac;
                //     obj.ip = client.ip;
                //     obj.version = client.version;
                //     obj.state = 'on';
                //     send_clients.push(obj);
                // });
                // www.eventEmitter.emit('change_state', send_clients);
                clients.splice(i,1);
                www.eventEmitter.emit('change_state', mac);
                break;
            }
        }
        console.log("----------------------------------------------------------------------------");
        console.log(clients);

    });


    // conn.on("close", function(code, reason){
    //
    //     for(var i = 0; i < clients.length; i++) {
    //         // # Remove from our connections list so we don't send
    //         // # to a dead socket
    //         if(clients[i].conn == conn) {
    //             clients.splice(i);
    //             console.log("Connection closed: "+reason);
    //             clients[i].conn.close();
    //             console.log("Total connections: "+clients.length);
    //             break;
    //         }
    //     }
    //
    //
    // });
}).listen(81);

setInterval(function(){
    // for(var i = 0; i < clients.length; i++) {
        var command = {
            phase:"sys_command",
            command:"ping"
        };
        server.connections.forEach(function(conn){
            conn.sendText(JSON.stringify(command));
        });
    // }
}, 1000);


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
    }/*else if(obj.command = 'restart'){
        command = {phase:"sys_command", command:"restart"};
    }*/
    for(var i = 0; i < clients.length; i++){
        if(clients[i].mac == obj.mac){
            clients[i].conn.sendText(JSON.stringify(command));
        }
    }
    // server.connections.forEach(function(conn){
    //     conn.sendText(JSON.stringify(command));
    // });
};

event_command.addListener("ev_command", my_command);
exports.event_command = event_command;

exports.clients = clients;