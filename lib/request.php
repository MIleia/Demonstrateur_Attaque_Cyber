<?php
    include 'database.php';

    function load_users_data($conn){

        $sql = "SELECT * FROM users";
        $result = mysqli_query($conn, $sql);

        // Vérifier s'il y a des résultats
        if (mysqli_num_rows($result) > 0) {
            while ($row = mysqli_fetch_assoc($result)) {
                echo "$row[mail] <br>";  // Affiche chaque ligne sous forme de tableau associatif
                echo "$row[lastname] <br>";
                echo "$row[firstname] <br>";
                echo "$row[password] <br>";
                echo "$row[profile_picture] <br><br>";
            }
        } else {
            echo "Il n'y a pas d'utilisateurs !";
        }
    }

    if (isset($_POST['action']) && $_POST['action'] == "load_users_data") {
        load_users_data($conn);
    }


    session_start();


    // Get the user's ID
    function loginUser($conn, $email, $password) {
        $stmt = $conn->prepare("SELECT id, password FROM users WHERE mail = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            
            // Vérifier le mot de passe
            if (password_verify($password, $user["password"])) {
                $_SESSION["user_id"] = $user["id"];
                echo json_encode(["success" => true]);
                return;
            }
        }

        echo json_encode(["success" => false, "message" => "Identifiants incorrects."]);
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["action"])) {
        if ($_POST["action"] === "login" && isset($_POST["email"]) && isset($_POST["password"])) {
            loginUser($conn, $_POST["email"], $_POST["password"]);
        }
    }

?>


