/**
 * Created by adm_korolev on 26.10.2016.
 */
'use strict';

var www     = require('./www');
var db      = require('./db_engine');
var Promise = require('promise');
var _ = require('underscore');
var db_conn = db.connection();

var global_stats = {
    scales_2_4:[],
    scales_3_5:[]
};

function Get_Global_Stats() {
    return global_stats;
}

function Get_global_history(){
    global_stats = {
        scales_2_4:[],
        scales_3_5:[]
    };
    var promiseArr = [];
    for(var i=48; i>1; i--){
        var dbPromise = new Promise(function(resolve, reject){
            var sql =  'SELECT zaslon_id as mac, if(count(*)*20>0, count(*)*20, 0) as total, '+
                'date_format((NOW() - INTERVAL '+i+' HOUR), "%d.%m.%Y %H:%i:%s") as date  FROM scale_log '+
                'WHERE date >= (NOW() - INTERVAL '+i+' HOUR) AND date <= (NOW() - INTERVAL '+(i-1)+' HOUR) '+
                'AND state=0 ';
            db_conn.query(sql,  function(err, rows, fields){
                if(err){
                    reject(err);
                }else if(rows){
                    var result = {
                        scales_2_4:{},
                        scales_3_5:{}
                    };
                    rows.forEach(function (item) {
                        if (item.mac == '5C:CF:7F:19:47:7B') {
                            result.scales_2_4 = {total: item.total, date: item.date};
                        }else if (item.mac == '5C:CF:7F:80:2D:45') {
                            result.scales_3_5 = {total: item.total, date: item.date};
                        }else{
                            result.scales_2_4 = {total: item.total, date: item.date};
                            result.scales_3_5 = {total: item.total, date: item.date};
                        }
                    });
                }
                resolve(result);
            });
        });
        promiseArr.push(dbPromise);
    }
    Promise.all(promiseArr).then(function(results) {
        results.forEach(function(res){
            if(_.keys(res.scales_2_4).length)   global_stats.scales_2_4.push(res.scales_2_4);
            if(_.keys(res.scales_3_5).length)   global_stats.scales_3_5.push(res.scales_3_5);
        });
    });
}

exports.Get_global_history = Get_global_history;
exports.Get_Global_Stats = Get_Global_Stats;