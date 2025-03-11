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
                setcookie("mail", $result['mail'], time() + 86400, "/");
            
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
            if (isset($_COOKIE['mail'])) {  // Vérifie si le cookie existe
                $result = dbGetUserPlaylists($db, $_COOKIE['mail']);
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
            // On ne se base plus sur la session, mais sur le cookie (ici, user_id)
            if (isset($_COOKIE['mail'])) {
                $result = dbGetLikedSongs($db, $_COOKIE['mail']);
                // Si $result est false ou vide, on renvoie quand même un tableau vide
                if ($result !== false && !empty($result)) {
                    echo json_encode(["success" => true, "likedSongs" => $result]);
                } else {
                    echo json_encode(["success" => true, "likedSongs" => []]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Utilisateur non connecté."]);
            }
            exit;
        }
    }


    // function to print the album's name of the song
    if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["action"])) {
        if ($_GET["action"] === "getAlbumName") {
            if (isset($_GET["id_song"])) {
                $result = dbGetAlbum($db, $_GET["id_song"]);
                if ($result !== false) {
                    // Récupérer le nom de l'album dbGetAlbumName
                    $result = dbGetAlbumName($db, $result['id_album']);
                    if ($result !== false) {
                        echo json_encode(["success" => true, "albumName" => $result['name']]);
                    } else {
                        echo json_encode(["success" => false, "message" => "Erreur lors de la récupération du nom de l'album."]);
                    }
                } else {
                    echo json_encode(["success" => false, "message" => "Erreur lors de la récupération du nom de l'album."]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Identifiant de la chanson non fourni."]);
            }
        }
    }

    // function to print the artiste's name of the song
    if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["action"])) {
        if ($_GET["action"] === "getArtistName") {
            if (isset($_GET["id_song"])) {
                $result = dbGetArtist($db, $_GET["id_artist"]);
                if ($result !== false) {
                    // dbGetUser
                    $result = dbGetUserInfos($db, $result['mail']);
                    echo json_encode(["success" => true, "artistName" => $result['name']]);
                } else {
                    echo json_encode(["success" => false, "message" => "Erreur lors de la récupération du nom de l'artiste."]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Identifiant de la chanson non fourni."]);
            }
        }
    }















    
    if (isset($_POST['action']) && $_POST['action'] == 'addLike') {
        // Récupérer les données envoyées
        $songId = $_POST['songId'];
        $userMail = $_POST['userMail'];
        
        // Vérifier si l'utilisateur a déjà liké cette chanson
        $checkQuery = "SELECT * FROM likes WHERE id_song = ? AND mail = ?";
        $stmt = $pdo->prepare($checkQuery);
        $stmt->execute([$songId, $userMail]);
        
        if ($stmt->rowCount() == 0) {
            // Ajouter la chanson dans la table likes
            $insertQuery = "INSERT INTO likes (id_song, mail) VALUES (?, ?)";
            $stmt = $pdo->prepare($insertQuery);
            $stmt->execute([$songId, $userMail]);
            
            // Répondre avec succès
            echo json_encode(['success' => true]);
        } else {
            // L'utilisateur a déjà liké cette chanson
            echo json_encode(['success' => false, 'message' => 'Vous avez déjà liké cette chanson.']);
        }
    }
    
    
?>


