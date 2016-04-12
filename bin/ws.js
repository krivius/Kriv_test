/**
 * Created by adm_kriv on 12.04.2016.
 */
var www = require('./www');
var ws = require("nodejs-websocket");

var server = ws.createServer(function(conn){
    console.log("New connection!");
    conn.on("text", function(str){
        www.eventEmitter.emit('ws', str);
        //console.log("Received: " + str);
        //conn.sendText("Ok!");
    });
    conn.on("close", function(code, reason){
        console.log("connection close");
    });
}).listen(81);
