<?php
    //session_start();

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
            $profile_picture = "../images/default_user.png";
            $result = dbInsertNewUser($db, $email, $lastname, $firstname, $password, $profile_picture);
            
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
                // Définition des cookies pour stocker le nom et prénom (valide pour 1 jour)
                setcookie("firstname", $result['firstname'], time() + 86400, "/");
                setcookie("lastname", $result['lastname'], time() + 86400, "/");
            
                echo json_encode(["success" => true, "user" => $result]);
            } else {
                echo json_encode(["success" => false, "message" => "E-mail ou mot de passe incorrect."]);
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

    // function for print all playlists of the user
    if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["action"])) {
        if ($_GET["action"] === "getPlaylists") {
            session_start();
            if (isset($_SESSION['user_id'])) {
                $result = dbGetUserPlaylists($db, $_SESSION['user_id']);
                if ($result !== false) {
                    echo json_encode(["success" => true, "playlists" => $result]);
                } else {
                    echo json_encode(["success" => false, "message" => "Erreur lors de la récupération des playlists."]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Utilisateur non connecté."]);
            }
        }
    }

    // function for print all liked songs of the user
    if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["action"])) {
        if ($_GET["action"] === "getLikedSongs") {
            session_start();
            if (isset($_SESSION['user_id'])) {
                $result = dbGetLikedSongs($db, $_SESSION['user_id']);
                if ($result !== false) {
                    echo json_encode(["success" => true, "likedSongs" => $result]);
                } else {
                    echo json_encode(["success" => false, "message" => "Erreur lors de la récupération des chansons likées."]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Utilisateur non connecté."]);
            }
        }
    }















    

?>


