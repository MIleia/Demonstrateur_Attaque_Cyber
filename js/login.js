$(document).ready(function () {
    $("#loginForm").on("submit", function (event) {
        event.preventDefault();

        let email = $("#email").val().trim();
        let password = $("#password").val().trim();
        let errorMessage = $("#error-message");

        // Vérifier si les champs sont vides
        if (email === "" || password === "") {
            errorMessage.text("Veuillez remplir tous les champs.").css("color", "red");
            return;
        }

        // Création de l'objet FormData
        let formData = new FormData();
        formData.append("action", "login");
        formData.append("email", email);
        formData.append("password", password);

        // Envoi de la requête AJAX avec jQuery
        $.ajax({
            url: "lib/request.php",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                console.log("Réponse brute :", response);
                try {
                    let data = JSON.parse(response);
                    if (data.success) {
                        window.location.href = "user.html";
                    } else {
                        errorMessage.text(data.message).css("color", "red");
                    }
                } catch (e) {
                    errorMessage.text("Erreur de connexion au serveur.").css("color", "red");
                    console.error("Erreur de parsing JSON:", e);
                }
            },
            error: function (xhr, status, error) {
                errorMessage.text("Erreur de connexion au serveur.").css("color", "red");
                console.error("Erreur AJAX :", error);
            }
        });
    });
});

// If user is already connected, redirect to user page


