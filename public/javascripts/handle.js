/**
 * Created by adm_kriv on 11.04.2016.
 */
$(document).ready(function(){
    $("button, input[type='button']").button();
    $("#menu, #admin_menu > ul").menu();
    $(document).tooltip({
        position: {
            my: "center",
        }
    });

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
            }
        }else{
            $(this).attr('state', '0').val('start');
            wrapper.find(".arrow").removeClass("animated");
            if(num == "1"){
                wrapper.find(".led").removeClass("green_led").addClass("red_led");
            }
        }

    });

    $(".animate_bunker").on("click",  function(){
        var state = $(this).attr("state");
        if(state == '0'){
            $(this).attr('state', '1').val('stop');
            $("#bunker_filler").addClass("fill");
        }else{
            $(this).attr('state', '0').val('start');
            $("#bunker_filler").removeClass("fill");
        }
    });
});
