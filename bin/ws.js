/**
 * Created by adm_kriv on 12.04.2016.
 */
var www = require('./www');
var ws = require("nodejs-websocket");

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}
/*

var server = ws.createServer(function(conn){
    console.log("New connection!");
    conn.on("text", function(str){
        var obj = JSON.parse(str);
        var dec_mac = obj.mac.split(":");
        var mac = [];
        dec_mac.forEach(function(dec){
            mac.push(decimalToHex(dec));
        });
        console.log(mac.join(":").toUpperCase());

        var send = {phase:"setup", iv_id:"146", pin:"1488"};


            www.eventEmitter.emit('ws', str);
            www.shalabuhen.emit('ws2', str);
        //console.log("Received: " + str);
        //conn.sendText("Ok!");
        conn.sendText(JSON.stringify(send));
        
    });
    conn.on("close", function(code, reason){
        console.log("connection close");
    });
}).listen(81);
*/
