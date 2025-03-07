document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Empêche le rechargement de la page

        let email = document.getElementById("email").value.trim();
        let password = document.getElementById("password").value.trim();
        let errorMessage = document.getElementById("error-message");

        // Vérifier que les champs ne sont pas vides
        if (email === "" || password === "") {
            errorMessage.innerText = "Veuillez remplir tous les champs.";
            errorMessage.style.color = "red";
            return;
        }

        // Envoyer les données en AJAX
        let formData = new FormData();
        formData.append("action", "login");
        formData.append("email", email);
        formData.append("password", password);

        fetch("../lib/request.php", {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = "dashboard.html";
                } else {
                    errorMessage.innerText = data.message;
                    errorMessage.style.color = "red";
                }
            })
            .catch(error => {
                console.error("Erreur:", error);
                errorMessage.innerText = "Une erreur est survenue. Veuillez réessayer.";
                errorMessage.style.color = "red";
            });
    });
});


