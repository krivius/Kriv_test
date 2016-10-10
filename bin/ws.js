/**
 * Created by adm_kriv on 12.04.2016.
 */

'use strict';

var www = require('./www');
var ws = require("nodejs-websocket");
var events = require('events');

var db  = require('./db_engine');
var db_conn = db.connection();


var global_conn     = "";
var clients         = [];
var send_clients    = [];
var mac_array       = [];
var client_in_array = false;
var state_changed   = false;


function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
}

var server = ws.createServer(function(conn){
    console.log("New connection!");
    var client_obj = {};
    client_obj.conn = conn;
    clients.push(client_obj);
    global_conn = conn;
    //console.log("clients_array: "+clients);
    conn.on("text", function(str){
        var obj = JSON.parse(str);
        //=============COMMAND============
        if(obj.command != "pong") {
            console.log("Phase: " + obj.phase + " " + str);
        }
        if(obj.command == "pong") {
            for(var i = 0; i < send_clients.length; i++) {
                if(send_clients[i].raw_mac == obj.mac && send_clients[i].state == 'off') {
                    send_clients[i].state = 'on';
                    state_changed = true;
                }
            }
            if(state_changed) {
                www.eventEmitter.emit('ws_clients', send_clients);
                state_changed = false;
            }
        }
        //=============SETUP==============
        if(obj.phase == "setup"){

            var raw_mac = obj.mac;

            var dec_mac = obj.mac.split(":");
            var mac = [];

            dec_mac.forEach(function(dec){
                mac.push(decimalToHex(dec));
            });
            mac = mac.join(":").toUpperCase();


            db_conn.query("SELECT mac FROM hw_table",  function(err, rows,  fields){
                var hw_mac_array = [];
                rows.forEach(function(item){
                   hw_mac_array.push(item.mac);
                });
                console.log(hw_mac_array);
                var sql = '';
                if(hw_mac_array.indexOf(mac) == -1){
                    sql = 'INSERT INTO hw_table SET mac="'+mac+'", raw_mac="'+raw_mac+'", ip="'+obj.ip+'", state="1", fw_version="'+obj.version+'", type="'+obj.type+'"';
                }else{
                    sql = 'UPDATE hw_table SET  ip="'+obj.ip+'", state="1", fw_version="'+obj.version+'" WHERE raw_mac = "'+obj.mac+'"';
                }
                db_conn.query(sql);
            });


            mac_array.push(mac);
            // console.log("MAC ADDR: "+mac);
            var setup = {phase:"setup", iv_id:"1", pin:"4"};
            conn.sendText(JSON.stringify(setup));

            client_in_array = false;

            for(var i = 0; i < clients.length; i++){
                var tmp={};
                if(clients[i].conn == conn) {
                    clients[i].mac = mac;
                    clients[i].ip = obj.ip;
                    clients[i].state = 'on';
                    clients[i].version = obj.version;
                    for (var i = 0; i < send_clients.length; i++) {
                        if(send_clients[i].mac == mac) {
                            send_clients[i].state = 'on';
                            client_in_array = true;
                        }
                    }
                    console.log("->send_clients: " + JSON.stringify(send_clients));
                    if(client_in_array == false) {
                        tmp.mac = mac;
                        tmp.raw_mac = obj.mac;
                        tmp.ip = obj.ip;
                        tmp.version = obj.version;
                        tmp.state = 'on';
                        send_clients.push(tmp);
                    }
                }
            }
            //console.log(clients);
            //www.eventEmitter.emit('ws_clients', JSON.stringify(send_clients));
            www.eventEmitter.emit('ws_clients', send_clients);
            console.log("Send clients: " + JSON.stringify(send_clients));
            //console.log(mac_array);

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
            var dec_mac = obj.mac.split(":");
            var mac = [];

            dec_mac.forEach(function(dec){
                mac.push(decimalToHex(dec));
            });
            mac = mac.join(":").toUpperCase();
            db_conn.query('INSERT INTO hw_log_table SET mac="'+mac+'", message="'+obj.log_string+'", system="'+obj.from+'" ');
            www.eventEmitter.emit('sys_log', str);
        }else if(obj.phase == "command"){
            console.log("freq.reply: "+str);
        }else if(obj.phase == "debug"){
            console.log("debug "+str);
        }else if(obj.phase == 'sys_command' && obj.command != "pong"){
            console.log("sys_command: "+str);
        }else if(obj.phase == 'scale_state'){


             var raw_mac = obj.mac;

             var dec_mac = obj.mac.split(":");
             var scale_mac = [];

             dec_mac.forEach(function(dec){
                 scale_mac.push(decimalToHex(dec));
             });
            scale_mac = scale_mac.join(":").toUpperCase();

            console.log("SCALE MAC: "+scale_mac);
            try{
                db_conn.query('INSERT INTO scale_log SET zaslon_id = "'+scale_mac+'", state = "'+obj.state+'"');
                db_conn.query('INSERT INTO hw_log_table SET mac="'+scale_mac+'", message="change scale state: '+obj.state+'", system="'+obj.from+'" ');
                var state = {mac:scale_mac, state:obj.state};
                console.log(state);
                www.eventEmitter.emit("scale_state", state);
            }catch(e){
                console.log("Error: "+e);
            }


        }

        //www.eventEmitter.emit('main_channel', str);
    });

    conn.on("error", function(){
        for(var i = 0; i < clients.length; i++) {
            if(clients[i].conn.key === conn.key){
                var mac = clients[i].mac;
                for(var j = 0; j < send_clients.length; j++) {
                    if(send_clients[j].mac == mac) {
                        //send_clients.splice(i,1);
                        send_clients[j].state = 'off';
                    }
                }
                db_conn.query('UPDATE hw_table SET state="0" WHERE mac="'+mac+'"');

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
                www.eventEmitter.emit('ws_clients', send_clients);
                console.log("On error clients: " + clients);
                break;
            }
        }
        console.log("----------------WS_ON_ERROR------------------");
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