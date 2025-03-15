$(document).ready(function () {
    $("#registerForm").on("submit", function (event) {
        event.preventDefault();

        let username = $("#username").val().trim();
        let email = $("#email").val().trim();
        let password = $("#password").val().trim();
        let errorMessage = $("#error-message");

        // Vérifier si les champs sont vides
        if (username === "" || email === "" || password === "") {
            errorMessage.text("Veuillez remplir tous les champs.").css("color", "red");
            return;
        }

        // Vérifier si l'email est valide
        let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            errorMessage.text("Veuillez entrer un e-mail valide.").css("color", "red");
            return;
        }

        // Vérifier si le mot de passe contient au moins 2 caractères
        if (password.length < 2) {
            errorMessage.text("Le mot de passe doit contenir au moins 2 caractères.").css("color", "red");
            return;
        }

        // Création de l'objet FormData
        let formData = new FormData();
        formData.append("action", "register");
        formData.append("username", username);
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
                console.log("Réponse brute du serveur :", response);
                try {
                    let data = JSON.parse(response);
                    if (data.success) {
                        window.location.href = "login.html";
                    } else {
                        errorMessage.text(data.message).css("color", "red");
                    }
                } catch (e) {
                    errorMessage.text("Réponse invalide du serveur.").css("color", "red");
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


