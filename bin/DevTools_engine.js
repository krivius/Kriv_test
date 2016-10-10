'use strict';

var www     = require('./www');
var db      = require('./db_engine');
var db_conn = db.connection();

var usage   = require('usage');
var process = require('process');

var pid = process.pid;

function Get_Proc_Stat(){
    usage.lookup(pid, function (err, result) {
        db_conn.query('INSERT INTO dt_sys_monitor(dt_memory, dt_cpu, dt_time) VALUES(' + (result.memory/1024) + ', ' + result.cpu + ', unix_timestamp(now()));');
        www.eventEmitter.emit('w_memory', result.memory);
        www.eventEmitter.emit('w_cpu', result.cpu);
    });
}

exports.Get_Proc_Stat = Get_Proc_Stat;