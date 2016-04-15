/**
 * Created by adm_kriv on 12.04.2016.
 */
var PORT = 8888;

var net = require('net');
var dgram = require('dgram');
var udp_server = dgram.createSocket('udp4');

var clients_data = [];

function add_member(ip,mac,func){
    this.ip = ip;
    this.mac = mac;
    this.func = func;
}

function ret_clients_data(){
    return clients_data;
}

udp_server.on('listening', function(){
    var address = udp_server.address();
    console.log('UDP server listening on ' + address.address + ":" + address.port);
});
/*=======================================================================================*/
'use strict';

var os = require('os');
var ifaces = os.networkInterfaces();
var ip_arr = [];
Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }

        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            // console.log(ifname + ':' + alias, iface.address);
            ip_arr.push(iface.address);
        } else {
            // this interface has only one ipv4 adress
            // console.log(ifname, iface.address);
            ip_arr.push(iface.address);
        }
        ++alias;
    });
});

console.log("Current IP: "+ip_arr[0]);
/*=======================================================================================*/
udp_server.on('message', function(message, remote){
    console.log(remote.address + ":" + remote.port + " - " + message);
    var message_to_send = new Buffer(ip_arr[0]);
    udp_server.send(message_to_send, 0, message_to_send.length, remote.port, remote.address, function (err, bytes) {
        if (err) throw err;
        //console.log('Send to:' + remote.host + ":" + remote.port);
    });
});

// udp_server.bind(PORT);

module.exports = add_member;
module.exports = ret_clients_data;
