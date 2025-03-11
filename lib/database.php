<?php
    include 'config.php';

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);


    // Connection to the mysql database
    class database{
        static $db = null;
        static function connexionBD() {
            if (self::$db != null) {
                return self::$db;
            }
            require_once ("config.php");
            try {
                self::$db = new PDO('mysql:host='.DB_SERVER.';dbname='.DB_NAME, DB_USER, DB_PASSWORD);
                self::$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            }
            catch (PDOException $exception) {
                die("Erreur de connexion à la base de données : " . $e->getMessage());
            }
            return self::$db;
        }
    }


    // Get user from the database
    function dbGetUser($db, $mail, $pwd) {
        try {
            $request = 'SELECT * FROM users WHERE mail=:mail';
            $statement = $db->prepare($request);
            $statement->bindParam(':mail', $mail);
            $statement->execute();
            $result = $statement->fetch(PDO::FETCH_ASSOC);
            
            if (!empty($result) && password_verify($pwd, $result['password'])) {
                return $result; // Retourne bien l'utilisateur
            } else {
                return "error"; // Si le mot de passe ne correspond pas ou si l'utilisateur n'existe pas
            }
        } catch (PDOException $exception) {
            error_log('Request error: ' . $exception->getMessage());
            return false;
        }
    }
    
    
    // Check if the email is already taken
    function AlreadyUser($db, $mail) {
        try {
            $request = 'SELECT * FROM users where mail=:mail';
            $statement = $db->prepare($request);
            $statement->bindParam(':mail', $mail);
            $statement->execute();
            $user = $statement->fetch(PDO::FETCH_ASSOC);
            if (empty($user)) {
                return false;
            } else {
                return true;
            }
        } catch (PDOException $exception) {
            error_log('Request error: ' . $exception->getMessage());
            return false;
        }
    }
    
    // Insert a new user in the database
    function dbInsertNewUser($db, $mail, $lastname, $firstname, $pwd, $profile_picture) {
        try {
            // Check if the email is already taken
            if (AlreadyUser($db, $mail)) {
                return "Already";
            }
            
            $hash = password_hash($pwd, PASSWORD_DEFAULT);
            $stmt = $db->prepare("INSERT INTO users (mail, lastname, firstname, password, profile_picture) VALUES (:mail, :lastname, :firstname, :password, :profile_picture)");
            $stmt->bindParam(':mail', $mail);
            $stmt->bindParam(':lastname', $lastname);
            $stmt->bindParam(':firstname', $firstname);
            $stmt->bindParam(':password', $hash);
            $stmt->bindParam(':profile_picture', $profile_picture);
            $stmt->execute();
            return true;
        } catch (PDOException $exception) {
            error_log('Request error: ' . $exception->getMessage());
            return "Error: " . $exception->getMessage();
        }
    }

    // Get the user's lastname and firstname
    function dbGetUserInfos($db, $mail) {
        try {
            $request = 'SELECT lastname, firstname FROM users WHERE mail=:mail';
            $statement = $db->prepare($request);
            $statement->bindParam(':mail', $mail);
            $statement->execute();
            $result = $statement->fetch(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $exception) {
            error_log('Request error: ' . $exception->getMessage());
            return false;
        }
    }

    // Get all the songs from the database
    function dbGetSongs($db) {
        try {
            $request = 'SELECT * FROM songs';
            $statement = $db->prepare($request);
            $statement->execute();
            $result = $statement->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $exception) {
            error_log('Request error: ' . $exception->getMessage());
            return "Error: " . $exception->getMessage();
        }
    }
    
    // Get all playlists of the user
    function dbGetUserPlaylists($db, $mail) {
        try {
            $request = 'SELECT * FROM playlist WHERE mail=:mail';
            $statement = $db->prepare($request);
            $statement->bindParam(':mail', $mail);
            $statement->execute();
            $result = $statement->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $exception) {
            error_log('Request error: ' . $exception->getMessage());
            return "Error: " . $exception->getMessage();
        }
    }

    // Get all songs liked by the user
    function dbGetLikedSongs($db, $mail) {
        try {
            $request = 'SELECT * FROM likes WHERE mail=:mail';
            $statement = $db->prepare($request);
            $statement->bindParam(':mail', $mail);
            $statement->execute();
            $result = $statement->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $exception) {
            error_log('Request error: ' . $exception->getMessage());
            return "Error: " . $exception->getMessage();
        }
    }

    // Get album's name via song id
    function dbGetAlbum($db, $id_song) {
        try {
            $request = 'SELECT id_album FROM appartient WHERE id=:id_song';
            $statement = $db->prepare($request);
            $statement->bindParam(':id_song', $id_song);
            $statement->execute();
            $result = $statement->fetch(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $exception) {
            error_log('Request error: ' . $exception->getMessage());
            return "Error: " . $exception->getMessage();
        }
    }

    function dbGetAlbumName($db, $id_album) {
        try {
            $request = 'SELECT name FROM album WHERE id=:id_album';
            $statement = $db->prepare($request);
            $statement->bindParam(':id_album', $id_album);
            $statement->execute();
            $result = $statement->fetch(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $exception) {
            error_log('Request error: ' . $exception->getMessage());
            return "Error: " . $exception->getMessage();
        }
    }

    // Get the artist's name via song id_artiste, passer par la table artiste pour recuper le mail, puis table user pour avoir son nom
    function dbGetArtist($db, $id_song) {
        try {
            $request = 'SELECT id_artiste FROM artiste WHERE id=:id_artiste';
            $statement = $db->prepare($request);
            $statement->bindParam(':id_artiste', $id_artiste);
            $statement->execute();
            $result = $statement->fetch(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $exception) {
            error_log('Request error: ' . $exception->getMessage());
            return "Error: " . $exception->getMessage();
        }
    }

?>


