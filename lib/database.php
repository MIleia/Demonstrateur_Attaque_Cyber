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
                // Start a session
                session_start();
                $_SESSION['user_id'] = $result['mail'];
                return array($result['mail'], $result['lastname'], $result['firstname']);
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
    function dbInsertNewUser($db, $mail, $lastname, $firstname, $pwd) {
        try {
            // Check if the email is already taken
            if (AlreadyUser($db, $mail)) {
                return "Already";
            }
            
            $hash = password_hash($pwd, PASSWORD_DEFAULT);
            $stmt = $db->prepare("INSERT INTO users (mail, lastname, firstname, password) VALUES (:mail, :lastname, :firstname, :password)");
            $stmt->bindParam(':mail', $mail);
            $stmt->bindParam(':lastname', $lastname);
            $stmt->bindParam(':firstname', $firstname);
            $stmt->bindParam(':password', $hash);
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
    
    
?>


