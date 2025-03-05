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
?>


