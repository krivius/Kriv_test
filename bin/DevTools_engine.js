'use strict';

var www = require('./www');

var usage   = require('usage');
var process = require('process');

var pid = process.pid;

var w_mem_arr = [];

function Get_Proc_Stat(){
    usage.lookup(pid, function (err, result) {
        w_mem_arr.push(result.memory);
        www.eventEmitter.emit('w_memory', w_mem_arr);
        www.eventEmitter.emit('w_cpu', result.cpu);
    });
}

exports.Get_Proc_Stat = Get_Proc_Stat;