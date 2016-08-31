#!/usr/bin/env node
/**
 * Created by adm_kriv on 10.05.2016.
 */


var mysql       = require('mysql');
var connection  = mysql.createConnection({
    // host        :   '127.0.0.1',
    host        :   '192.168.19.2',
    user        :   'zaslon',
    password    :   'zaslonPa$$',
    database    :   'zaslon',
    port        :   '3306'
});



var singleton = function singleton(){
    //defining a var instead of this (works for variable & function) will create a private definition
    this.connection = function(){
        return connection;
    };
    this.query = function(text) {
        var query = connection.query(text, function(err, rows, fields){
            if (err)
                console.log("DB query error: " + err);
            else
                console.log("DB query: " + rows);
            return rows;
        });
    };
    this.sys_log_query = function(zaslon_id, sys_name, level, message) {
        connection.query('INSERT INTO sys_log (zaslon_id, sys_name, level, message) VALUES("' + zaslon_id +'","' + sys_name + '","' + level + '","' + message + '")');
    };

    if(singleton.caller != singleton.getInstance){
        throw new Error("DB cannot be instanciated");
    }
};

singleton.instance = null;

/**
 * Singleton getInstance definition
 * @return logs class
 */
singleton.getInstance = function(){
    if(this.instance === null){
        this.instance = new singleton();
    }
    return this.instance;
};

module.exports = singleton.getInstance();
