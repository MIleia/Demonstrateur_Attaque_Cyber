document.addEventListener('DOMContentLoaded', function() {
    // Ajout du nom et du prenom de l'utilisateur connecté avec cookie
    // Récupération du prénom et du nom à partir des cookies
    let firstname = getCookie('firstname');
    let lastname = getCookie('lastname');

    // Affichage du nom et prénom si les cookies existent
    if (firstname && lastname) {
        let userNameElement = document.getElementById('user-name');
        userNameElement.textContent = `${firstname} ${lastname}`;
    } else {
        console.log("Nom et prénom non disponibles.");
    }



    // Récupération des playlists de l'utilisateur
    // Récupération des playlists de l'utilisateur
    fetch('../lib/request.php?action=getPlaylists')
    .then(response => response.text())
    .then(text => {
        console.log('Réponse brute des playlists :', text);
        return JSON.parse(text);
    })
    .then(data => {
        if (data.success) {
            let playlistsElement = document.querySelector('.playlists');
            data.playlists.forEach(playlist => {
                let playlistElement = document.createElement('div');
                playlistElement.classList.add('card-playlist');
                playlistElement.innerHTML = `
                    <img src="${playlist.image}" alt=" " class="card-img">
                    <div class="card-content">
                        <h3 class="card-title">${playlist.name}</h3>
                    </div>
                `;
                playlistsElement.appendChild(playlistElement);
            });
        } else {
            console.error('Erreur lors de la récupération des playlists');
        }
    })
    .catch(error => console.error("Erreur lors de la récupération des playlists :", error));

    // Récupérer les chansons likées par l'utilisateur
    fetch('../lib/request.php?action=getLikedSongs')
    .then(response => response.text())
    .then(text => {
        console.log('Réponse brute des chansons likées :', text);
        return JSON.parse(text);
    })
    .then(data => {
        if (data.success) {
            let likedSongsElement = document.querySelector('.musique');
            data.likedSongs.forEach(song => {
                let songElement = document.createElement('div');
                songElement.classList.add('card-playlist'); // Utilisation de card-playlist pour la même structure
                songElement.innerHTML = `
                    <img src="${song.picture.replace('../', '')}" alt="${song.name}" class="card-img">
                    <div class="card-content">
                        <h3 class="card-title">${song.name}</h3>
                        <h3 class="card-singer">Artiste : ${song.artist}</h3>
                    </div>
                `;
                likedSongsElement.appendChild(songElement);
            });
        } else {
            console.error('Erreur lors de la récupération des chansons likées');
        }
    })
    .catch(error => console.error("Erreur lors de la récupération des chansons likées :", error));


    // Récupération des chansons de la BDD

    let songsElement = document.getElementById('songs');
    let musicFooter = document.querySelector('.music-footer');
    let musicImage = musicFooter.querySelector('img');
    let musicTitle = musicFooter.querySelector('span');
    let playButton = musicFooter.querySelector('button:nth-child(2)'); // Le bouton de lecture
    let prevButton = musicFooter.querySelector('button:nth-child(1)');
    let nextButton = musicFooter.querySelector('button:nth-child(3)');
    let likeButton = musicFooter.querySelector('.like-button');
    let addToPlaylistButton = musicFooter.querySelector('.add-to-playlist-button'); // Nouveau bouton pour ajouter à la playlist
    let audio = new Audio();
    let currentSongIndex = 0;
    let songsList = [];

    // Récupérer toutes les chansons depuis la BDD
    fetch('../lib/request.php?action=getSongs')
    .then(response => response.text())
    .then(text => {
        console.log('Réponse brute du serveur :', text);
        return JSON.parse(text);
    })
    .then(data => {
        if (data.success) {
            songsList = data.songs;
            songsList.forEach((song, index) => {
                let songElement = document.createElement('div');
                songElement.classList.add('card-musique');
                songElement.innerHTML = `
                    <img src="${song.picture.replace('../', '')}" alt="${song.name}" class="card-img">
                    <h3 class="card-title">${song.name}</h3>
                    <h3 class="card-album">Album inconnu</h3>
                    <h3 class="card-singer">Artiste ID: ${song.id_artist}</h3>
                    <h3 class="card-play">
                        <button class="play-button" data-index="${index}">▶️</button>
                    </h3>
                `;
                songsElement.appendChild(songElement);
            });

            // Ajout d'écouteur d'événements pour chaque bouton de lecture
            let playButtons = document.querySelectorAll('.play-button');
            playButtons.forEach(button => {
                button.addEventListener('click', function() {
                    let index = button.getAttribute('data-index');
                    playSong(index);
                });
            });

        } else {
            console.error(data.message);
        }
    })
    .catch(error => console.error("Erreur lors de la récupération des chansons :", error));

    // Fonction pour jouer une chanson
    function playSong(index) {
        if (audio.src === songsList[index].song && !audio.paused) {
            // Si la chanson est déjà en cours, mettez-la en pause
            audio.pause();
            playButton.textContent = '▶️'; // Change le symbole pour Play
        } else {
            // Si une autre chanson est en cours, chargez la nouvelle chanson
            audio.src = `../songs/${songsList[index].song.replace('../', '')}`;
            audio.play();
            playButton.textContent = '⏸️'; // Change le symbole pour Pause
            musicTitle.textContent = songsList[index].name;
            musicImage.src = songsList[index].picture.replace('../', '');
            currentSongIndex = index;
        }
    }

    // Contrôle du bouton "Précédent"
    prevButton.addEventListener('click', function() {
        if (currentSongIndex > 0) {
            currentSongIndex--;
            playSong(currentSongIndex);
        } else {
            currentSongIndex = songsList.length - 1;
            playSong(currentSongIndex);
        }
    });

    // Contrôle du bouton "Suivant"
    nextButton.addEventListener('click', function() {
        if (currentSongIndex < songsList.length - 1) {
            currentSongIndex++;
            playSong(currentSongIndex);
        } else {
            currentSongIndex = 0;
            playSong(currentSongIndex);
        }
    });

    // Contrôle du bouton "Like"
    likeButton.addEventListener('click', function() {
        alert('Chanson ajoutée aux favoris !');
    });

    // Ajout de la chanson à une playlist (avec menu déroulant)
    addToPlaylistButton.addEventListener('click', function() {
        // Crée un menu déroulant ou formulaire de création de playlist
        let playlistMenu = document.createElement('select');
        playlistMenu.innerHTML = `
            <option value="new">Créer une nouvelle playlist</option>
            <option value="1">Playlist 1</option>
            <option value="2">Playlist 2</option>
        `;
        document.body.appendChild(playlistMenu);

        let submitButton = document.createElement('button');
        submitButton.textContent = 'Ajouter à la Playlist';
        document.body.appendChild(submitButton);

        submitButton.addEventListener('click', function() {
            let selectedPlaylist = playlistMenu.value;
            if (selectedPlaylist === 'new') {
                let newPlaylistName = prompt('Nom de la nouvelle playlist :');
                console.log(`Playlist ${newPlaylistName} créée et ajoutée.`);
            } else {
                console.log(`Chanson ajoutée à la playlist ${selectedPlaylist}.`);
            }
            // Vous pouvez ici envoyer la sélection à votre serveur pour enregistrer dans la base de données.
            playlistMenu.remove();
            submitButton.remove();
        });
    });






















    //c-------------------------------

    // Contrôle du bouton "Like"
    likeButton.addEventListener('click', function() {
        let currentSong = songsList[currentSongIndex];
        let userId = getCookie('user_id'); // L'ID de l'utilisateur depuis le cookie

        // Vérification que l'utilisateur est connecté
        if (userId) {
            fetch('../lib/request.php?action=addToFavorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    song_id: currentSong.id // ID de la chanson courante
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Chanson ajoutée aux favoris !');
                } else {
                    alert('Erreur lors de l\'ajout aux favoris.');
                }
            })
            .catch(error => console.error("Erreur lors de l'ajout aux favoris :", error));
        } else {
            alert('Veuillez vous connecter pour ajouter cette chanson aux favoris.');
        }
    });

    // Ajout de la chanson à une playlist (avec menu déroulant)
    addToPlaylistButton.addEventListener('click', function() {
        let currentSong = songsList[currentSongIndex];
        let userId = getCookie('user_id'); // L'ID de l'utilisateur depuis le cookie

        // Vérification que l'utilisateur est connecté
        if (userId) {
            fetch('../lib/request.php?action=getUserPlaylists', {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    let playlistMenu = document.createElement('select');
                    playlistMenu.innerHTML = `<option value="new">Créer une nouvelle playlist</option>`;
                    data.playlists.forEach(playlist => {
                        playlistMenu.innerHTML += `<option value="${playlist.id}">${playlist.name}</option>`;
                    });

                    let submitButton = document.createElement('button');
                    submitButton.textContent = 'Ajouter à la Playlist';
                    document.body.appendChild(playlistMenu);
                    document.body.appendChild(submitButton);

                    submitButton.addEventListener('click', function() {
                        let selectedPlaylist = playlistMenu.value;
                        if (selectedPlaylist === 'new') {
                            let newPlaylistName = prompt('Nom de la nouvelle playlist :');
                            createNewPlaylist(newPlaylistName, currentSong.id, userId);
                        } else {
                            addToExistingPlaylist(selectedPlaylist, currentSong.id, userId);
                        }

                        playlistMenu.remove();
                        submitButton.remove();
                    });
                } else {
                    alert('Erreur lors de la récupération des playlists.');
                }
            })
            .catch(error => console.error("Erreur lors de la récupération des playlists :", error));
        } else {
            alert('Veuillez vous connecter pour ajouter cette chanson à une playlist.');
        }
    });

    // Fonction pour créer une nouvelle playlist
    function createNewPlaylist(name, songId, userId) {
        fetch('../lib/request.php?action=createPlaylist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                playlist_name: name,
                song_id: songId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Playlist "${name}" créée et chanson ajoutée !`);
            } else {
                alert('Erreur lors de la création de la playlist.');
            }
        })
        .catch(error => console.error("Erreur lors de la création de la playlist :", error));
    }

    // Fonction pour ajouter une chanson à une playlist existante
    function addToExistingPlaylist(playlistId, songId, userId) {
        fetch('../lib/request.php?action=addToPlaylist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                playlist_id: playlistId,
                song_id: songId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Chanson ajoutée à la playlist !');
            } else {
                alert('Erreur lors de l\'ajout à la playlist.');
            }
        })
        .catch(error => console.error("Erreur lors de l'ajout à la playlist :", error));
    }
});


function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}



