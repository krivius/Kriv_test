'use strict';

var www = require('./www');

var usage   = require('usage');
var process = require('process');

var pid = process.pid;

var w_mem_arr = [];

function Get_Proc_Stat(){
    usage.lookup(pid, function (err, result) {
        //w_mem_arr.push(result.memory);
        // if (w_mem_arr.length > 20) {
        //     w_mem_arr.shift();
        // }
        www.eventEmitter.emit('w_memory', result.memory);
        www.eventEmitter.emit('w_cpu', result.cpu);
    });
}

exports.Get_Proc_Stat = Get_Proc_Stat;