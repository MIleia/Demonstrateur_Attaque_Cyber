<?php

$servername = "localhost";
$username = "root"; // Par défaut, l'utilisateur MySQL est "root"
$password = ""; // Pas de mot de passe par défaut en local
$dbname = "musicdb"; // Nom de la base créée dans phpMyAdmin

$conn = mysqli_connect($servername, $username, $password, $dbname);

?>