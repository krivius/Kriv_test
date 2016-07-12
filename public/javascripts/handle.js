/**
 * Created by adm_kriv on 11.04.2016.
 */

$(document).ready(function(){
    $("#user").find("button, input[type='button']").button();
    $("#save_template, #delete_template").button();
    $("#menu, #admin_menu > ul").menu();
    // $(document).tooltip({
    //     position: {
    //         my: "center",
    //     }
    // });

    $("#logo").on("click", function(){
        $("#menu").slideDown("fast");
    });

    $("#menu").on("mouseleave",  function(){
        $("#menu").slideUp("fast");
    });

    $("#menu").on("click",  "li", function(){
        var mode = $(this).attr("mode");
        $(".workarea").hide();
        $("#"+mode).show();
        $("#menu").slideUp("fast");
    });

    $("#admin_menu").on("click", "li", function(){
        var mode = $(this).attr("mode");
        $(".admin_stuff").hide();
        $("#"+mode).show();
    });

    $(".animate").on("click",  function(){
        var state = $(this).attr("state"),
            num = $(this).attr("num"),
            wrapper = $(this).parents(".production_wrapper");
        
        if(state == '0'){
            $(this).attr('state', '1').val('stop');
            wrapper.find(".arrow").addClass("animated");
            if(num == "1"){
                wrapper.find(".led").removeClass("red_led").addClass("green_led");
            }else{
                wrapper.find(".rotor").addClass("rotate_knives");
                wrapper.find(".screen").addClass("vibrate_screens");
            }
        }else{
            $(this).attr('state', '0').val('start');
            wrapper.find(".arrow").removeClass("animated");
            if(num == "1"){
                wrapper.find(".led").removeClass("green_led").addClass("red_led");
            }else{
                wrapper.find(".rotor").removeClass("rotate_knives");
                wrapper.find(".screen").removeClass("vibrate_screens");
            }
        }
    });

    $(".animate_bunker").on("click",  function(){
        var state = $(this).attr("state");
        if(state == '0'){
            $(this).attr('state', '1').val('stop');
            $("#bunker_filler").addClass("fill");
            $("#main_bunker .led").addClass("blink_led");
        }else{
            $(this).attr('state', '0').val('start');
            $("#bunker_filler").removeClass("fill");
            $("#main_bunker .led").removeClass("blink_led");
        }
    });

    $(".animate_blanshir").on("click",  function(){
        var state = $(this).attr("state");
        if(state == '0'){
            $(this).attr('state', '1').val('stop');
            $(".wheel:nth-child(odd)").addClass("rotate_slow");
            $(".wheel:nth-child(even)").addClass("rotate_fast");
            $("#bunker_vibro").addClass("vibrate");
        }else{
            $(this).attr('state', '0').val('start');
            $(".wheel:nth-child(odd)").removeClass("rotate_slow");
            $(".wheel:nth-child(even)").removeClass("rotate_fast");
            $("#bunker_vibro").removeClass("vibrate");
        }
    });

    $(".scales").on("mousedown", function(){
       $(this).find(".led").removeClass("red_led").addClass("green_led");
    });

    $(".scales").on("mouseup", function(){
        $(this).find(".led").removeClass("green_led").addClass("red_led");
    });





    
    
    $(".informer").on("click",  function(element){
        var state = $(this).attr('state');
        if(state == '0'){
            var controls =  '<div class="controls">' +
                                '<div class="more_info"></div>'+
                                '<button class="decrease">-</button>'+
                                '<button class="increase">+</button>'+
                            '</div>';

            $(this).attr('state', '1');
            $(this).css('height',  '75px');
            $(this).prepend(controls);
        }
    });
});
