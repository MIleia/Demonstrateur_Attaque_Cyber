$(document).ready(function () {
    // Récupérer les informations de l'utilisateur depuis les cookies
    let username = getCookie('username');
    let profilePicture = getCookie('profile_picture');
    let usermail = getCookie('mail');

    // Affichage du nom d'utilisateur
    if (username) {
        $('#user-name').text(username);
    } else {
        console.log("Nom d'utilisateur introuvable.");
    }

    // Affichage de la photo de profil
    /*
    if (profilePicture) {
        $('#profile-picture').attr('src', profilePicture);
    }
    */
    
    // Récupération des playlists de l'utilisateur
    if (usermail) {
        $.getJSON('lib/request.php?action=getPlaylists', function (data) {
            if (data.success) {
                let playlistsElement = $('.playlists');
                data.playlists.forEach(playlist => {
                    let playlistElement = $(`
                        <div class="card-playlist">
                            <div class="card-content">
                                <h3 class="card-title">${playlist.playlist_name}</h3>
                            </div>
                        </div>
                    `);
                    playlistElement.click(function () {
                        showPlaylistSongs(playlist.id_playlist, playlist.playlist_name);
                    });
                    playlistsElement.append(playlistElement);
                });
            } else {
                console.error('Erreur lors de la récupération des playlists');
            }
        }).fail(error => console.error("Erreur lors de la récupération des playlists :", error));
    } else {
        console.log("Utilisateur non connecté.");
    }

    // Fonction pour afficher les chansons d'une playlist
    function showPlaylistSongs(id_playlist, playlistName) {
        console.log("Affichage de la playlist :", playlistName, "ID:", id_playlist);

        $.ajax({
            url: `lib/request.php?action=getPlaylistSongs&id_playlist=${id_playlist}`,
            type: 'GET',
            dataType: 'json',
            success: async function (data) {
                if (data.success) {
                    let oldModal = $('.modal');
                    if (oldModal.length) oldModal.remove();

                    let modal = $(`
                        <div class="modal">
                            <div class="modal-content">
                                <span class="close-button">&times;</span>
                                <h2>${playlistName}</h2>
                                <div class="playlist-songs"></div>
                            </div>
                        </div>
                    `);
                    $('body').append(modal);
                    let songsContainer = modal.find('.playlist-songs');

                    if (data.songs.length > 0) {
                        for (let song of data.songs) {
                            if (song.id_artist) {
                                try {
                                    let artistData = await $.getJSON(`lib/request.php?action=getArtistName&id_artist=${song.id_artist}`);
                                    song.artist = artistData.success ? artistData.artistName : "Artiste inconnu";
                                } catch (error) {
                                    console.error("Erreur lors de la récupération de l'artiste :", error);
                                    song.artist = "Artiste inconnu";
                                }
                            } else {
                                song.artist = "Artiste inconnu";
                            }

                            let songDiv = $(`
                                <div class="playlist-song">
                                    <p>${song.name} - <span class="artist-name">${song.artist}</span></p>
                                    <button class="delete-button" data-song-id="${song.id_song}">Supprimer</button>
                                </div>
                            `);
                            songDiv.find('.delete-button').on('click', function () {
                                deleteSongFromPlaylist(song.id_song, id_playlist);
                            });
                            songDiv.on('click', function () {
                                playSong(song.id_song);
                            });
                            songsContainer.append(songDiv);
                        }
                    } else {
                        songsContainer.html("<p>Aucune chanson dans cette playlist.</p>");
                    }

                    modal.find('.close-button').on('click', function () {
                        modal.remove();
                    });
                } else {
                    console.error("Erreur :", data.message);
                }
            },
            error: function (error) {
                console.error("Erreur lors de la récupération des chansons de la playlist :", error);
            }
        });
    }

    // Gestion du lecteur audio
    let musicFooter = $('.music-footer');
    let musicImage = musicFooter.find('img');
    let musicTitle = musicFooter.find('span');
    let playButton = musicFooter.find('button:nth-child(2)');
    let prevButton = musicFooter.find('button:nth-child(1)');
    let nextButton = musicFooter.find('button:nth-child(3)');
    let likeButton = musicFooter.find('.like-button');
    let addToPlaylistButton = musicFooter.find('.add-to-playlist-button');
    let audio = new Audio();
    let currentSongIndex = 0;
    let songsList = [];

    // Récupération des chansons du serveur
    $.getJSON('lib/request.php?action=getSongs', function (data) {
        if (data.success) {
            let songsElement = $('#songs');
            songsList = data.songs;

            songsList.forEach(async (song, index) => {
                song.album = song.id_song
                    ? await $.getJSON(`lib/request.php?action=getAlbumName&id_song=${song.id_song}`)
                        .then(albumData => albumData.success ? albumData.albumName : "Aucun album")
                        .catch(() => "Aucun album")
                    : "Aucun album";

                song.artist = song.id_artist
                    ? await $.getJSON(`lib/request.php?action=getArtistName&id_artist=${song.id_artist}`)
                        .then(artistData => artistData.success ? artistData.artistName : "Artiste inconnu")
                        .catch(() => "Artiste inconnu")
                    : "Artiste inconnu";

                let songElement = $(`
                    <div class="card-musique">
                        <img src="${song.picture}" alt="${song.name}" class="card-img">
                        <h3 class="card-title">${song.name}</h3>
                        <h3 class="card-album">${song.album}</h3>
                        <h3 class="card-singer">${song.artist}</h3>
                        <h3 class="card-play">
                            <button class="play-button" data-index="${index}">▶️</button>
                        </h3>
                    </div>
                `);
                songsElement.append(songElement);

                songElement.find('.play-button').click(() => playSong(index));
            });
        } else {
            console.error(data.message);
        }
    }).fail(error => console.error("Erreur lors de la récupération des chansons :", error));

    // Fonction pour jouer une chanson
    function playSong(index) {
        let song = songsList[index];
        if (audio.src === `songs/${song.song}` && !audio.paused) {
            audio.pause();
            playButton.text('▶️');
        } else {
            audio.src = `songs/${song.song}`;
            audio.play();
            playButton.text('⏸️');
            musicTitle.text(song.name);
            musicImage.attr('src', song.picture);
            currentSongIndex = index;
        }
    }

    // Gestion des boutons précédent/suivant
    prevButton.click(() => {
        currentSongIndex = (currentSongIndex > 0) ? currentSongIndex - 1 : songsList.length - 1;
        playSong(currentSongIndex);
    });

    nextButton.click(() => {
        currentSongIndex = (currentSongIndex < songsList.length - 1) ? currentSongIndex + 1 : 0;
        playSong(currentSongIndex);
    });

    // Ajout aux favoris
    likeButton.click(() => {
        let songId = songsList[currentSongIndex]?.id_song;
        let userMail = getCookie('email');
        if (userMail && songId) {
            $.post('lib/request.php?action=addLike', { song_id: songId, email: userMail }, function (data) {
                if (data.success) {
                    alert('Chanson ajoutée aux favoris !');
                } else {
                    console.error("Erreur lors de l'ajout aux favoris :", data.message);
                }
            });
        }
    });

    // Récupérer les musiques favorites
    if (usermail) {
        $.getJSON(`lib/request.php?action=getLikedSong&mail=${usermail}`, function (data) {
            if (data.success) {
                let favoriteSongsContainer = $('#favorite-songs-container').empty();
                $.each(data.songs, function (index, song) {
                    let songElement = $(`
                        <div class="card-favorite-song">
                            <img src="${song.picture}" alt="${song.name}" class="card-img">
                            <p>${song.name}</p>
                            <img src="images/heart2.png" alt="Retirer des favoris" class="remove-favorite" data-song-id="${song.id_song}">
                        </div>
                    `);
                    favoriteSongsContainer.append(songElement);
                });

                $('.remove-favorite').click(function () {
                    let songId = $(this).data('song-id');
                    $.get(`lib/request.php?action=removeLikedSong&mail=${usermail}&id_song=${songId}`, function () {
                        location.reload();
                    });
                });
            }
        });
    }

    // Fonction pour récupérer un cookie
    function getCookie(name) {
        let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }
});


