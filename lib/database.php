<?php
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "musicdb";

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    // Connection to the database
    try {
        $conn = new mysqli($servername, $username, $password, $dbname);
        $conn->set_charset("utf8mb4");
    } catch (Exception $e) {
        die("Erreur de connexion à la base de données : " . $e->getMessage());
    }


    $password = "123"; // À remplacer par le mot de passe voulu
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    echo "Mot de passe haché : " . $hashedPassword;
?>


