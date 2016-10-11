/**
 * Created by adm_kriv on 12.04.2016.
 */

var socket = io();
var clients = [];
var mac_arr = [];
var interval_gspeed;
var curr_freq = [];
var curr_scale_state = [];
var system_state_history_memory = [];
var system_state_history_cpu = [];

socket.emit("get_clients");
socket.emit("get_templates");
socket.emit("get_scales_avg");
socket.emit("get_system_state_history");
socket.emit("get_3_day_scale_data");

function decimalToHex(d, padding) {
   var hex = Number(d).toString(16);
   padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

   while (hex.length < padding) {
      hex = "0" + hex;
   }
   return hex;
}

function zeroFill(string){
    while(string.length < 4){
        string = '0'+string;
    }
    return string;
}

function convertMac(mac){
    var dec_mac = mac.split(":");
    var hex_mac = [];
    dec_mac.forEach(function(dec){
        hex_mac.push(decimalToHex(dec));
    });
    hex_mac = hex_mac.join(":").toUpperCase();
    return hex_mac;
}

socket.on('main_channel', function(data){

   var obj = JSON.parse(data);

   if(obj.phase == "setup"){
       console.log("setup phase detected: " + data);
       var mac = convertMac(obj.mac);
       obj.mac = mac;
       obj.state = 'on';
       // var mac_arr = [];
       console.log("Clients: " + data);
       console.log("Clients_length: " + clients.length);
       for(var i=0; i < clients.length; i++){
           if($.inArray(clients[i].mac, mac_arr) == -1){
               mac_arr.push(clients[i].mac);
           }
       }
       console.log("MAC arr is: " + mac_arr);
       if($.inArray(mac, mac_arr) == -1){
           clients.push(obj);
           mac_arr.push(mac);
           console.log("====================");
           console.log(clients);
           console.log("====================");
       }else{
           for(var i=0; i < clients.length; i++){
               if(mac == clients[i].mac){
                   clients[i].state = 'on';
                   // clients.splice(i, 1);
                   // clients.push(obj);

               }


           }
           var t_rows = $("#shalabuhen table").find('tr').get();
           $.each(t_rows,  function(){
               if($(this).find(".mac").text() == mac){
                   $(this).find(".state").text("on").css("color", "green");
               }
           });
           console.log("++++++++++++++++++++");
           console.log(clients);
           console.log("++++++++++++++++++++");
           // var t_rows = $("#shalabuhen table").find('tr').get();
           //
           // $.each(t_rows, function(){
           //     var t_mac = $(this).find(".mac").text();
           //     console.log(t_mac == mac);
           //     if(mac == t_mac){
           //         $(this).find(".state").text('on');
           //     }
           // });
       }

       var rows = '<tr>'+
                       '<th>№</th>'+
                       '<th>MAC-адрес</th>'+
                       '<th>IP-адрес</th>'+
                       '<th>№ частотника</th>'+
                       '<th>Версия прошивки</th>'+
                       '<th>Статус</th>'+
                   '</tr>';
       for(var i=0; i < clients.length; i++){
           var color = "red";
           if(clients[i].state == '1'){
               color = "green";
           }
           rows += '<tr>'+
               '<td>'+(i+1)+'</td>'+
               '<td class="mac">'+clients[i].mac+'</td>'+
               '<td>'+clients[i].ip+'</td>'+
               '<td>'+(i+1)+'</td>'+
               '<td>'+clients[i].version+'</td>'+
               '<td class="state" style="color:'+color+'">'+clients[i].state+'</td>'+
               '</tr>';
       }
       console.log(clients);
       var mac_list = '';
       // $.each(mac_arr,  function(k, v){
       //     mac_list += '<option value="'+v+'">'+v+'</option>';
       // });
       // $("#mac_list").empty().html(mac_list);
       $("#shalabuhen table").empty().html(rows);
   }
});

socket.on("iv_info", function(data){
    console.log("RPM: "+data);
    $("#curr_freq").val(data);
    curr_freq[0] = data;
});

socket.on("sys_log",  function(data){
    var obj = JSON.parse(data);
    var phase = obj.phase;

    if(phase == "log"){
        var d = new Date(),
            now = ('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+d.getFullYear()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2);
        var row = '<tr><td>'+convertMac(obj.mac)+'</td><td>'+obj.from+'</td><td>'+obj.log_string+'</td><td>'+now+'</td></tr>';
        $("#logs table").append(row);
    }
    console.log(obj);
});

socket.on("change_state",  function(data){
    for(var i=0; i < clients.length; i++){
        if(data == clients[i].mac){
            clients[i].state = 'off';
        }
    }
    console.log(clients);
    console.log("change_state "+data);

    var rows = $("#shalabuhen table").find('tr').get();
    $.each(rows, function(){
        var mac = $(this).find(".mac").text();
        if(mac == data){
            $(this).find(".state").text('off').css("color", "red");
        }
    });
});

socket.on("ws_clients",  function(data){
    // console.log(data);
    clients = data;
    console.log("ws_clients_1");
    console.log(clients);
    var mac_arr = [];
    var rows = '<tr>'+
        '<th>№</th>'+
        '<th>MAC-адрес</th>'+
        '<th>IP-адрес</th>'+
        '<th>№ частотника</th>'+
        '<th>Версия прошивки</th>'+
        '<th>Статус</th>'+
        '</tr>';
    console.log("data.length: " + data.length);
    for(var i=0; i < data.length; i++){

        rows += '<tr>'+
            '<td>'+(i+1)+'</td>'+
            '<td class="mac">'+data[i].mac+'</td>'+
            '<td>'+data[i].ip+'</td>'+
            '<td>'+(i+1)+'</td>'+
            '<td>'+data[i].version+'</td>'+
            '<td class="state">'+data[i].state+'</td>'+
            '</tr>';
        mac_arr.push(data[i].mac);
    }
    var mac_list = '';
    // $.each(mac_arr,  function(k, v){
    //     mac_list += '<option value="'+v+'">'+v+'</option>';
    // });
    // $("#mac_list").empty().html(mac_list);
    $("#shalabuhen table").empty().html(rows);
});


/*-----------------------------*/
// deprecated ///
/*------------------------------*/
socket.on("scale_state",  function(data){
    curr_scale_state = data.scale_data;
    var title = "Весы "+data.scale_mac;
    console.log("scale state", curr_scale_state);

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {
        // console.log(data);
        /* Highcharts.setOptions({
         lang: {
         loading: "Загрузка...",
         months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентярбрь', 'Октрябрь', 'Ноябрь', 'Декабрь'],
         shortMonths: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
         rangeSelectorFrom: "С",
         rangeSelectorTo: "По",
         shortWeekdays: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
         thousandsSep: " ",
         weekdays: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
         }
         });*/
        $('#highstock').highcharts('StockChart', {
            chart: {
                renderTo: 'container',
                events: {
                    load: function () {

                        // set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function () {
                            // console.log("curr_freq[0]: "+ curr_freq[0]);
                            var x = curr_scale_state[0].date, // current time
                                y = curr_scale_state[0].state;
                            series.addPoint([x, y], true, true);
                        }, 1000);
                    }
                }
            },
            rangeSelector: {
                selected: 2,
                inputDateFormat: '%d.%m.%Y',
                inputEditDateFormat: '%d.%m.%Y'
            },

            title: {
                text: title
            },

            series: [{
                name: title,
                data: [(new Date()).getTime(), 0],
                tooltip: {
                    valueDecimals: 2
                }
            }]
        });
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
});
/*-----------------------------*/
// deprecated end ///
/*------------------------------*/

socket.on("scale_state",  function(d){
    d.reverse();

    $(function () {
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
        // Create the chart
        $('#line_speed_chart').highcharts('StockChart', {
            chart: {
                events: {
                    load: function () {
                        var series = this.series[0];
                        socket.on('scale_event', function (d) {
                            var x = (new Date()).getTime(),
                                y = d;
                            series.addPoint([x, y], true, true);
                        });

                        /*// set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function () {
                            var x = (new Date()).getTime(), // current time
                                y = Math.round(Math.random() * 100);
                            series.addPoint([x, y], true, true);
                        }, 1000);*/
                    }
                }
            },

            rangeSelector: {
                buttons: [{
                    count: 1,
                    type: 'minute',
                    text: '1M'
                }, {
                    count: 5,
                    type: 'minute',
                    text: '5M'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                inputEnabled: false,
                selected: 0
            },

            title: {
                text: 'Scales'
            },

            exporting: {
                enabled: false
            },

            series: [{
                name: 'Random data',
                data: (function () {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    for (i = -999; i <= 0; i += 1) {
                        data.push([
                            time + i * 1000,
                            Math.round(Math.random() * 100)
                        ]);
                    }
                    return data;
                }())
            }]
        });
    });
});

socket.on("w_console", function(data){
    $("#w_console").append('<p>'+ data + '</p>');
});

socket.on("system_state_history", function (d) {
    d.reverse();
    d.forEach(function (item) {
        system_state_history_memory.push({
            x: item.time,
            y: item.memory
        });
        system_state_history_cpu.push({
            x: item.time,
            y: item.cpu
        });
    });

    $(function() {
        $(document).ready(function () {
            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });
            $('#w_memory').highcharts({
                chart: {
                    type: 'spline',
                    animation: Highcharts.svg,
                    marginRight: 10,
                    events: {
                        load: function () {
                            var chart = this;
                            var series1 = this.series[0];
                            socket.on('w_memory', function (d) {
                                var x = (new Date()).getTime(),
                                    y = d;
                                series1.addPoint([x, y], false, true);
                                chart.redraw();
                            });
                        }
                    }
                },
                title: {
                    text: 'Memory'
                },
                xAxis: {
                    type: 'datetime',
                    tickPixelInterval: 150
                },
                yAxis: {
                    title: {
                        text: 'Bytes'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    formatter: function() {
                        return '<b>'+ this.series.name +'</b><br/>'+
                            Highcharts.dateFormat('%H:%M:%S', this.x) +'<br/>'+
                            Highcharts.numberFormat(this.y, 0);
                    }
                },
                legend: {
                    enabled: false
                },
                series: [{
                    type: 'area',
                    name: 'Mb',
                    data: system_state_history_memory
                }]
            });
        });
    });

    $(function() {
        $('#w_cpu').highcharts({
            chart: {
                type: 'spline',
                animation: Highcharts.svg,
                marginRight: 10,
                events: {
                    load: function () {
                        var chart = this;
                        var series1 = this.series[0];
                        socket.on('w_cpu', function (d) {
                            var x = (new Date()).getTime(),
                                y = d;
                            series1.addPoint([x, y], false, true);
                            chart.redraw();
                        });
                    }
                }
            },
            title: {
                text: 'CPU'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: '%'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.series.name +'</b><br/>'+
                        Highcharts.dateFormat('%H:%M:%S', this.x) +'<br/>'+
                        Highcharts.numberFormat(this.y, 0);
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                type: 'area',
                name: '%',
                data: system_state_history_cpu
            }]
        });
    });
});

$("#run").on("click",  function(){
    console.log("iv_run");
    var obj = {
        command: "start",
        mac: $("#mac_list").val()
    };
    socket.emit("iv_status", JSON.stringify(obj));
    interval_gspeed = setInterval(function(){
        var obj = {
            command: "gspeed",
            mac: $("#mac_list").val()
        };
        socket.emit("iv_status", JSON.stringify(obj));
    }, 1000);
});
$("#stop").on("click",  function(){
    // console.log("iv_stop");
    var obj = {
        command: "stop",
        mac: $("#mac_list").val()
    };
    console.log(JSON.stringify(obj));
    socket.emit("iv_status", JSON.stringify(obj));
    clearInterval(interval_gspeed);
    curr_freq[0] = '0';

    var chart = $("#device_controls_modal").find('#highstock').highcharts();
    // var series = chart.series[0];
    // console.log(series);
    //
    // var x = (new Date()).getTime();
    // series.addPoint([x, 0], true, true);


    $("#curr_freq").val('');
});

$("#get_speed").on("click", function(){
    var obj = {
        command: "gspeed",
        mac: $("#mac_list").val()
    };
    socket.emit("iv_status", JSON.stringify(obj));
});


$("#set_speed").on("click",  function(){
    var speed = $("#speed").val() || '0000';
    if(speed != '0000'){
        speed = decimalToHex(speed);
        speed = zeroFill(speed);
    }
    var obj = {
        command: "sspeed",
        sb1: parseInt(speed[0]+speed[1], 16).toString(),
        sb2: parseInt(speed[2]+speed[3], 16).toString(),
        mac: $("#mac_list").val()
    };
    console.log(speed);
    socket.emit("iv_status", JSON.stringify(obj));
});

$("#sys_log").on("click", function(){
    var debug = $("#debug:checked").val() || 'debug_off';
    // console.log(debug);
    var obj ={
        phase: "sys_command",
        command: debug,
        mac: $("#mac_list").val()
    };
    socket.emit('iv_status', JSON.stringify(obj));
});
$("#update_fw").on("click",  function(){
    var obj ={
        phase: "sys_command",
        command: "fw_update",
        mac: $("#mac_list").val()
    };
    socket.emit('iv_status', JSON.stringify(obj));
});

$("#restart").on("click",  function(){
    var obj ={
        phase: "sys_command",
        command: "restart",
        mac: $("#mac_list").val()
    };
    socket.emit('iv_status', JSON.stringify(obj));
});


$("#shalabuhen table").on("click", "tr", function(){
    var mac = $(this).find(".mac").text() || 'no_mac';
    console.log(mac);
    if(mac != 'no_mac'){
        socket.emit("get_device_info", mac);
    }

});

$("#device_controls_modal").dialog({
    modal:true,
    autoOpen:false,
    resizable:false,
    width:900,
    height:600,
    buttons:[
        {
            text:"Обновить логи",
            click:function(){
                var device_mac =$(this).parents(".ui-dialog").find("#ui-id-1").text();
                socket.emit("refresh_logs", device_mac);
            }
        },
        {
            text:"Сохранить",
            click: function(){
                var role = $("#device_role").val(),
                    mac = $(this).find(".info_mac").text();
                socket.emit("save_device_role", {mac:mac, role:role});
                $(this).dialog("close");
            }
        }

    ]
});


socket.on("show_fresh_logs",  function(data){
    var rows = '<tr>'+
                    '<th>Тип</th>'+
                    '<th>Сообщение</th>'+
                    '<th>Дата / время</th>'+
                '</tr>';
    $.each(data,  function(key, log){
        rows += '<tr>'+
                '<td>'+log.system+'</td>'+
                '<td>'+log.message+'</td>'+
                '<td>'+log.time+'</td>'+
            '</tr>';
    });
    $("#device_logs table").empty().html(rows);
});


socket.on("show_device_controls",  function(data){
    console.log(data);
    var rows = '<tr>'+
                    '<th>Тип</th>'+
                    '<th>Сообщение</th>'+
                    '<th>Дата / время</th>'+
                '</tr>';
    $.each(data.logs,  function(key, log){
        rows += '<tr>'+
                    '<td>'+log.system+'</td>'+
                    '<td>'+log.message+'</td>'+
                    '<td>'+log.time+'</td>'+
                '</tr>';
    });
    var roles = '<option value="0"></option>';
    $.each(data.roles, function(key, value){
            if(value.id == data.curr_role){
                roles += '<option value="'+value.id+'" selected="selected">'+value.name+'</option>';
            }else{
                roles += '<option value="'+value.id+'">'+value.name+'</option>';
            }
    });

    $("#device_logs table").empty().html(rows);
    $("#device_role").empty().html(roles);
    $("#device_info .info_ip").text(data.ip);
    $("#device_info .info_mac").text(data.mac);
    $("#device_info .info_login").text(data.last_login);
    $("#mac_list").val(data.mac);
    if(data.state == '1'){
        $("#device_info").find(".led").removeClass('red_led').addClass('green_led');
    }else{
        $("#device_info").find(".led").removeClass('green_led').addClass('red_led');
    }

    $("#device_controls_modal").dialog("option", "title", data.mac).dialog("open");
});


socket.on("template_list",  function(data){
    console.log(data);
    var t_list = '<option value="new">==Новый шаблон==</option>';
    $.each(data, function(key, value){
       if(value.current == '1'){
            t_list += '<option value="'+value.id+'" selected="selected">'+value.name+'</option>';
       }else{
           t_list += '<option value="'+value.id+'">'+value.name+'</option>';
       }
    });
    $("#template_list").empty().html(t_list);
});


socket.on("show_scale_avg",  function(data){
   console.log(data);
    $.each(data,  function(key, item){
       $(".informer[mac='"+item.mac+"']").empty().text(item.total);
        // $(".speed_informer[mac='"+item.mac+"']").empty().text(item.speed);
    });
});

/*
socket.on("realtime_scale_avg",  function(data){
   console.log(data);
});*/



$("#save_template").on("click",  function(){
   var tmp = $(".informer").get(),
       id = $("#template_list").val(),
       template = [];

    $.each(tmp,  function(){
        template.push($(this).text());
    });
    template = template.join("_");
    if(id != "new") {
        socket.emit("save_template", {id: id, template: template});
    }else{
        var dialog_settings = {
            modal:true,
            autoOpen:true,
            resizable:false,
            title:"Новый щаблон",
            buttons:[
                {
                    text:"Сохранить",
                    click: function(){
                        $(this).dialog("close");
                        var name = $(this).find("#new_template_name").val();
                        socket.emit("save_template", {id: id, template: template, name:name});
                    }
                },
                {
                    text:"Отмена",
                    click: function(){
                        $(this).dialog("close");
                    }
                }
            ],
            close:function(){
                $(this).dialog("destroy");
                $(this).remove();
            }
        };
        var content = '<div id="new_template_modal">' +
            'Название: <input type="text" id="new_template_name">' +
            '</div>';
        $(content).appendTo('body').dialog(dialog_settings);
    }
});

$("#delete_template").on("click",  function(){
    var id = $("#template_list").val(),
        name = $("#template_list").find("option:selected").text();
    if(id != "new"){
        var dialog_settings = {
            modal:true,
            autoOpen:true,
            resizable:false,
            title:"Удаление шаблона",
            buttons:[
                {
                    text:"Удалить",
                    click: function(){
                        $(this).dialog("close");
                        socket.emit("delete_template", {id: id});
                    }
                },
                {
                    text:"Отмена",
                    click: function(){
                        $(this).dialog("close");
                    }
                }
            ],
            close:function(){
                $(this).dialog("destroy");
                $(this).remove();
            }
        };
        var content = '<div id="del_template_modal">Удалить шаблон "'+name+'"?</div>';
        $(content).appendTo('body').dialog(dialog_settings);
    }


});


$("#user").on("click",  ".more_info", function() {
    $(this).parents('.informer').attr('state', '0').css('height', '25px');
    var title = $(this).parents(".informer").attr("title");
    var mac = $(this).parents(".informer").attr("mac");
    var type = $(this).parents(".informer").attr("type") || 'no_type';
    $(this).parents('.informer').find('.controls').remove();
    var dialog_settings = {
        modal: true,
        resizable: false,
        title: title + "  " + mac,
        width: 900,
        height: 600,
        buttons: [
            {
                text: "Закрыть",
                click: function () {
                    $(this).dialog("close");
                }
            }
        ],
        close: function () {
            $(this).dialog("destroy");
            $(this).remove();
        }
    };

    $('<div><div id="highstock"></div></div>').appendTo('body').dialog(dialog_settings);
    if (type != "scales") {
        $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {
            console.log(data);
            /* Highcharts.setOptions({
             lang: {
             loading: "Загрузка...",
             months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентярбрь', 'Октрябрь', 'Ноябрь', 'Декабрь'],
             shortMonths: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
             rangeSelectorFrom: "С",
             rangeSelectorTo: "По",
             shortWeekdays: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
             thousandsSep: " ",
             weekdays: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
             }
             });*/
            $('#highstock').highcharts('StockChart', {
                chart: {
                    renderTo: 'container',
                    events: {
                        load: function () {

                            // set up the updating of the chart each second
                            var series = this.series[0];
                            setInterval(function () {
                                // console.log("curr_freq[0]: "+ curr_freq[0]);
                                var x = (new Date()).getTime(), // current time
                                    y = curr_freq[0] || 0;
                                series.addPoint([x, y], true, true);
                            }, 1000);
                        }
                    }
                },
                rangeSelector: {
                    selected: 2,
                    inputDateFormat: '%d.%m.%Y',
                    inputEditDateFormat: '%d.%m.%Y'
                },

                title: {
                    text: title
                },

                series: [{
                    name: title,
                    data: [(new Date()).getTime(), 0],
                    tooltip: {
                        valueDecimals: 2
                    }
                }]
            });
        });
    }else {
        // $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {
        socket.emit("get_scale_data", mac);
    }

});

$.datepicker.setDefaults({
    dateFormat: 'dd.mm.yy',
    onSelect: function(dateText) {
        this.onchange();
        this.onblur();
    }
});