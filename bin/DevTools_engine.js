'use strict';

var usage   = require('usage');
var process = require('process');

var pid = process.pid;

function Get_Proc_Stat(){
    usage.lookup(pid, function (err, result) {
        console.log(result);
    });
}

setInterval(Get_Proc_Stat(), 1000);

exports.Get_Proc_Stat = Get_Proc_Stat;