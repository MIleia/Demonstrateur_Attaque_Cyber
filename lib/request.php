<?php
    include 'database.php';

    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    $db = database::connexionBD();

    if (!isset($db) || $db === null) {
        die(json_encode(["success" => false, "message" => "Connexion à la base de données échouée."]));
    }


    // function to insert a new user
    if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["action"])) {
        if ($_POST["action"] === "register" && isset($_POST["email"]) && isset($_POST["password"]) && isset($_POST["lastname"]) && isset($_POST["firstname"])) {
            $email = $_POST["email"];
            $password = $_POST["password"];
            $lastname = $_POST["lastname"];
            $firstname = $_POST["firstname"];
            $result = dbInsertNewUser($db, $email, $lastname, $firstname, $password);
            
            // Check if the email is already taken
            if ($result === "Already") {
                echo json_encode(["success" => false, "message" => "L'email est déjà pris."]);
            } elseif ($result === true) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "message" => "Erreur lors de l'inscription."]);
            }
        }
    }
    
    // function to login
    if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["action"])) {
        if ($_POST["action"] === "login" && isset($_POST["email"]) && isset($_POST["password"])) {
            $email = $_POST["email"];
            $password = $_POST["password"];
            $result = dbGetUser($db, $email, $password);
            if ($result !== "error") {
                echo json_encode(["success" => true, "user" => $result]);
            } else {
                echo json_encode(["success" => false, "message" => "E-mail ou mot de passe incorrect."]);
            }
        }
    }

    // function to get lastname and firstname of the user
    if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["action"])) {
        if ($_GET["action"] === "getUser") {
            session_start();
            if (isset($_SESSION['user_id'])) {
                $result = dbGetUserInfos($db, $_SESSION['user_id']);
                if ($result !== false) {
                    echo json_encode(["success" => true, "user" => $result]);
                } else {
                    echo json_encode(["success" => false, "message" => "Erreur lors de la récupération des informations de l'utilisateur."]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Vous n'êtes pas connecté."]);
            }
        }
    }

    // function for print all songs
    if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["action"])) {
        if ($_GET["action"] === "getSongs") {
            $result = dbGetSongs($db);
            if ($result !== false) {
                echo json_encode(["success" => true, "songs" => $result]);
            } else {
                echo json_encode(["success" => false, "message" => "Erreur lors de la récupération des chansons."]);
            }
        }
    }

    

?>


