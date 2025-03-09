document.addEventListener('DOMContentLoaded', function() {
    // Faire une requête pour afficher tous les songs de la bdd
    fetch('../lib/request.php?action=getSongs')
    .then(response => response.text())
    .then(text => {
        console.log('Réponse brute du serveur :', text);
        return JSON.parse(text);
    })
    .then(data => {
        if (data.success) {
            let songList = document.getElementById('song-list');
            data.songs.forEach(song => {
                let songElement = document.createElement('li');
                songElement.innerText = song.title;
                songList.appendChild(songElement);
            });
        } else {
            console.error(data.message);
        }
    })

    // Faire une requête pour afficher les infos de l'utilisateur
    fetch('../lib/request.php?action=getUser')
    .then(response => response.text())
    .then(text => {
        console.log('Réponse brute du serveur :', text);
        return JSON.parse(text);
    })
    .then(data => {
        if (data.success) {
            let userElement = document.getElementById('user');
            userElement.innerText = data.user.firstname + ' ' + data.user.lastname;
        } else {
            console.error(data.message);
        }
    })
});


