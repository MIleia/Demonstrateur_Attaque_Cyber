

$(document).ready(function(){
    $("button").click(function(){
        $.post("request.php", { action: "load_users_data" }, function(response){
            $("#comments").html(response);
        });
    });
});