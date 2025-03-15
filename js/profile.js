$(document).ready(function () {
    // Soumission du formulaire de mise à jour du profil
    $("#updateProfileForm").on("submit", function (event) {
        event.preventDefault();

        let username = $("#username").val();
        let password = $("#password").val();
        let confirmPassword = $("#confirmPassword").val();
        let profilePicture = $("#profile_picture")[0].files[0];
        let responseMessage = $("#responseMessage");

        if (password !== confirmPassword) {
            responseMessage.text("Les mots de passe ne correspondent pas.");
            return;
        }

        let formData = new FormData();
        formData.append("action", "updateProfile");
        formData.append("username", username);
        formData.append("password", password);
        if (profilePicture) {
            formData.append("profile_picture", profilePicture);
        }

        $.ajax({
            url: "lib/request.php",
            type: "POST",
            data: formData,
            processData: false, 
            contentType: false,
            success: function (data) {
                responseMessage.text(data.message);
            },
            error: function () {
                responseMessage.text("Une erreur est survenue.");
            }
        });
    });

    // Suppression du compte
    $("#deleteAccountBtn").on("click", function () {
        if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            $.ajax({
                url: "lib/request.php",
                type: "POST",
                data: JSON.stringify({ action: "deleteAccount" }),
                contentType: "application/json",
                success: function (data) {
                    alert(data.message);
                    if (data.success) {
                        window.location.href = "login.html";
                    }
                },
                error: function () {
                    alert("Une erreur est survenue.");
                }
            });
        }
    });

    // Récupération des informations utilisateur à partir des cookies
    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([.$?*|{}\(\)\[\]\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    let username = getCookie("username");
    let profilePicture = getCookie("profile_picture");

    $("#usernameInput").val(username);
    $("#username").text(username);
    
    if (profilePicture) {
        $("#profilePicture").attr("src", profilePicture);
    }
});


