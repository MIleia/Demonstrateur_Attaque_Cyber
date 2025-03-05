$(document).ready(function(){
    $("button").click(function(){
        $.post("../lib/request.php", { action: "load_users_data" }, function(response){
            $("#comments").html(response);
        });
    });
});


