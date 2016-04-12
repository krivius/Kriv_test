/**
 * Created by adm_kriv on 11.04.2016.
 */
$(document).ready(function(){
    $("button, input[type='button']").button();
    $("#menu, #admin_menu > ul").menu();

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
        var state = $(this).attr("state");
        if(state == '0'){
            $(this).attr('state', '1').val('stop');
            $(this).parents(".production_wrapper").find(".arrow").addClass("animated");
        }else{
            $(this).attr('state', '0').val('start');
            $(this).parents(".production_wrapper").find(".arrow").removeClass("animated");
        }

    });
});
