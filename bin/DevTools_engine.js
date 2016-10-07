'use strict';

var www = require('./www');

var usage   = require('usage');
var process = require('process');

var pid = process.pid;

function Get_Proc_Stat(){
    usage.lookup(pid, function (err, result) {
        www.eventEmitter.emit('w_console', JSON.parse(result));
    });
}

exports.Get_Proc_Stat = Get_Proc_Stat;