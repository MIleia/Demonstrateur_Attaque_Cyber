$(document).ready(function(){
    $("#loginForm").on("submit", function (event){
        event.preventDefault();

        let email = $("#email").val().trim();
        let password = $("#password").val().trim();
        let errorMessage = $("#error-message");

        // Check if email and password are not empty
        if (email === "" || password === ""){
            errorMessage.text("Veuillez remplir tous les champs.").css("color", "red");
            return;
        }

        // Create a FormData object
        let formData = new FormData();
        formData.append("action", "login");
        formData.append("email", email);
        formData.append("password", password);

        // Send AJAX request
        $.ajax({
            url: "lib/request.php",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response){
                if (response.success){
                    window.location.href = "user.html";
                } else {
                    errorMessage.text(response.message).css("color", "red");
                }
            }
        });
    });
});
            

