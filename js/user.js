document.addEventListener('DOMContentLoaded', function() {
    // Ajout du nom et du prenom de l'utilisateur connecté avec cookie
    // Récupération du prénom et du nom à partir des cookies

    
    let firstname = getCookie('firstname');
    let lastname = getCookie('lastname');
    
    //let username = getCookie('username');

    // Affichage du nom et prénom si les cookies existent
    if (firstname && lastname) {
        let userNameElement = document.getElementById('user-name');
        userNameElement.textContent = `${firstname} ${lastname}`;
        //userNameElement.textContent = `${username}`;
    } else {
        console.log("Nom d'utilisateur introuvable.");
    }

    // Récupération des playlists de l'utilisateur
    let usermail = getCookie('mail');
    if (usermail) {
        fetch(`../lib/request.php?action=getPlaylists`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
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
    } else {
        console.log("Utilisateur non connecté.");
    }


    // Récupérer les chansons likées par l'utilisateur
    if (usermail) {
        fetch(`../lib/request.php?action=getLikedSongs`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur du serveur : " + response.status);
            }
            return response.json(); // On tente de parser la réponse en JSON
        })
        .then(data => {
            if (data.success) {
                let likedSongsElement = document.querySelector('.musique');
                data.songs.forEach(song => {
                    let songElement = document.createElement('div');
                    songElement.classList.add('card-playlist');
                    songElement.innerHTML = `
                        <img src="${song.picture.replace('../', '')}" alt="${song.name}" class="card-img">
                        <div class="card-content">
                            <h3 class="card-title">${song.name}</h3>
                            <h3 class="card-singer">${song.artist}</h3>
                        </div>
                    `;
                    likedSongsElement.appendChild(songElement);
                });
            } else {
                console.error('Erreur lors de la récupération des chansons likées');
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des chansons likées :", error);
        });
    } else {
        console.log("Utilisateur non connecté.");
    }


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
    .then(async (data) => { // Utilisation de async pour await
        if (data.success) {
            let songsElement = document.getElementById('songs');
            // Affecter la réponse au tableau global, sans redéclaration locale
            songsList = data.songs;

            for (let song of songsList) {
                // Récupération du nom de l'album
                if (song.id_album) {
                    try {
                        let albumResponse = await fetch(`../lib/request.php?action=getAlbumName&id_album=${song.id_album}`);
                        let albumData = await albumResponse.json();
                        song.album = albumData.success ? albumData.albumName : "Aucun album";
                    } catch (error) {
                        console.error("Erreur lors de la récupération de l'album :", error);
                        song.album = "Aucun album";
                    }
                } else {
                    song.album = "Aucun album";
                }

                // Récupération du nom de l'artiste
                if (song.id_artist) {
                    try {
                        let artistResponse = await fetch(`../lib/request.php?action=getArtistName&id_artist=${song.id_artist}`);
                        let artistData = await artistResponse.json();
                        song.artist = artistData.success ? artistData.artistName : "Artiste inconnu";
                    } catch (error) {
                        console.error("Erreur lors de la récupération de l'artiste :", error);
                        song.artist = "Artiste inconnu";
                    }
                } else {
                    song.artist = "Artiste inconnu";
                }

                // Création et affichage de l'élément une fois toutes les données disponibles
                let songElement = document.createElement('div');
                songElement.classList.add('card-musique');
                songElement.innerHTML = `
                    <img src="${song.picture.replace('../', '')}" alt="${song.name}" class="card-img">
                    <h3 class="card-title">${song.name}</h3>
                    <h3 class="card-album">${song.album}</h3>
                    <h3 class="card-singer">${song.artist}</h3>
                    <h3 class="card-play">
                        <button class="play-button" data-index="${songsList.indexOf(song)}">▶️</button>
                    </h3>
                `;
                songsElement.appendChild(songElement);
            }

            // Ajout d'écouteur d'événements pour chaque bouton de lecture
            document.querySelectorAll('.play-button').forEach(button => {
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
















    
});



function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}


// Contrôle du bouton "Like"
document.addEventListener('DOMContentLoaded', function() {
    let musicFooter = document.querySelector('.music-footer');
    if (!musicFooter) {
        console.error("music-footer introuvable.");
        return;
    }

    let likeButton = musicFooter.querySelector('.like-button');
    if (!likeButton) {
        console.error("like-button introuvable.");
        return;
    }

    likeButton.addEventListener('click', function() {
        let songId = songsList[currentSongIndex]?.id_song; // Vérifier si songsList est défini
        let userMail = getCookie('email');

        if (userMail && songId) {
            fetch('../lib/request.php?action=addLike', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `email=${userMail}&id_song=${songId}`
            })
        } else {
            alert('Veuillez vous connecter pour ajouter une chanson aux favoris.');
        }
    });
});

