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


var server = ws.createServer(function(conn){
    console.log("New connection!");
    global_conn = conn;
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

        }else if(obj.phase == "setup_done"){

            // var command = {phase:"command", command:"start"};
            // conn.sendText(JSON.stringify(command));

        }
        www.eventEmitter.emit('ws', str);
        www.shalabuhen.emit('ws2', str);
    });


    conn.on("close", function(code, reason){
        console.log("connection close");
    });
}).listen(81);

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

event_1.addListener("ev_1", event_run);
exports.event_1 = event_1;

event_2.addListener("ev_2", event_stop);
exports.event_1 = event_2;