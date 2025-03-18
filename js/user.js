$(document).ready(function () {
    // Funcion to get the cookie
    function getCookie(name) {
        let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    let username = getCookie('username');
    let profilePicture = getCookie('profile_picture');
    let usermail = getCookie('mail');

    // Check if the user is connected
    if (!usermail) {
        window.location.href = "login.html";
    }

    // Display the user name
    if (username) {
        $('#user-name').text(username);
    } else {
        console.log("Nom d'utilisateur introuvable.");
    }

    // Display the user's linked songs
    if (usermail) {
        $.getJSON(`lib/request.php?action=getLikedSong&mail=${usermail}`, function (data) {
            if (data.success) {
                let favoriteSongsContainer = $('#favorite-songs-container').empty();
                $.each(data.songs, function (index, song) {
                    let songElement = $(`
                        <div class="card-favorite-song" data-song-id="${song.id_song}">
                            <img src="${song.picture}" alt="${song.name}" class="card-img">
                            <p>${song.name}</p>
                            <img src="images/heart2.png" alt="Retirer des favoris" class="remove-favorite" data-song-id="${song.id_song}">
                        </div>
                    `);
                    favoriteSongsContainer.append(songElement);

                    // Check if the song is clicked
                    songElement.click(function () {
                        playSongById(song.id_song);
                    });

                    // Delete the song from the favorites
                    songElement.find('.remove-favorite').click(function (event) {
                        event.stopPropagation();
                        let songId = $(this).data('song-id');
                        $.get(`lib/request.php?action=removeLikedSong&mail=${usermail}&id_song=${songId}`, function () {
                            $(`.card-favorite-song[data-song-id="${songId}"]`).remove();
                        });
                    });

                });
            }
        });
    }

    // Display the user's playlists
    if (usermail) {
        $.getJSON('lib/request.php?action=getPlaylists', function (data) {
            if (data.success) {
                let playlistsElement = $('.playlists');
                data.playlists.forEach(playlist => {
                    let playlistElement = $(`
                        <div class="card-playlist">
                            <div class="card-content">
                                <h3 class="card-title">${playlist.playlist_name}</h3>
                                <div class="delete-container">
                                    <button class="delete-playlist-button"></button>
                                </div>
                            </div>
                        </div>
                    `);
                    playlistElement.click(function () {
                        showPlaylistSongs(playlist.id_playlist, playlist.playlist_name);
                    });

                    // Check if the playlist is clicked
                    playlistElement.find('.delete-playlist-button').on('click', function (e) {
                        e.stopPropagation();
                        if (confirm('Êtes-vous sûr de vouloir supprimer cette playlist ?')) {
                            deletePlaylist(playlist.id_playlist, playlistElement);
                        }
                    });

                    playlistsElement.append(playlistElement);
                });

                // card to create a new playlist
                let createPlaylistElement = $(`
                    <div class="card-playlist">
                        <div class="card-content">
                            <h3 class="card-title">➕</h3>
                        </div>
                    </div>
                `);

                // Creation of a new playlist
                createPlaylistElement.click(() => {
                    let playlistName = prompt('Nom de la playlist :');
                    if (playlistName) {
                        $.post('lib/request.php?action=createPlaylist', { mail: usermail, playlist_name: playlistName }, function (response) {
                            try {
                                let data = JSON.parse(response);
                                if (data.success) {
                                    let newPlaylistElement = $(`
                                        <div class="card-playlist">
                                            <div class="card-content">
                                                <h3 class="card-title">${playlistName}</h3>
                                                <div class="delete-container">
                                                    <button class="delete-playlist-button"></button>
                                                </div>
                                            </div>
                                        </div>
                                    `);
                                    playlistsElement.append(newPlaylistElement);
                                } else {
                                    alert('Erreur lors de la création de la playlist: ' + data.message);
                                }
                            } catch (e) {
                                console.error("Erreur JSON :", e, response);
                            }
                        }).fail((xhr, status, error) => {
                            console.error("Erreur AJAX :", status, error);
                        });
                    }
                });

                playlistsElement.append(createPlaylistElement);
            } else {
                console.error('Erreur lors de la récupération des playlists');
            }
        }).fail(error => console.error("Erreur lors de la récupération des playlists :", error));
    }

    // Function to delete a playlist
    function deletePlaylist(id_playlist, playlistElement) {
        $.get(`lib/request.php?action=deletePlaylist&id_playlist=${id_playlist}`, function (data) {
            playlistElement.remove();
        });
    }

    // Function to show the playlist songs
    function showPlaylistSongs(id_playlist, playlistName) {
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
                            
                            // Get the artist name
                            if (song.id_artist) {
                                let artistData = await $.getJSON(`lib/request.php?action=getArtistName&id_artist=${song.id_artist}`);
                                song.artist = artistData.success ? artistData.artistName : "Artiste inconnu";
                            } else {
                                song.artist = "Artiste inconnu";
                            }

                            let songDiv = $(`
                                <div class="playlist-song">
                                    <p>${song.name} - <span class="artist-name">${song.artist}</span></p>
                                    <button class="delete-button" data-song-id="${song.id_song}">Supprimer</button>
                                </div>
                            `);

                            // Delete the song from the playlist
                            songDiv.find('.delete-button').on('click', function () {
                                deleteSongFromPlaylist(song.id_song, id_playlist, songDiv);
                            });

                            // Play the song when clicked
                            songDiv.on('click', function () {
                                if (!$(event.target).hasClass('delete-button')) {
                                    playSongById(song.id_song);
                                }
                            });
                            songsContainer.append(songDiv);
                        }
                    } else {
                        songsContainer.html("<p>Aucune chanson dans cette playlist.</p>");
                    }

                    modal.find('.close-button').on('click', function () {
                        modal.remove();
                    });
                }
            },
            error: function (error) {
                console.error("Erreur lors de la récupération des chansons de la playlist :", error);
            }
        });
    }

    // function to play a song by id
    function playSongById(songId) {
        let song = songsList.find(s => s.id_song === songId);
        if (song) {
            playSong(songsList.indexOf(song));
        }
    }

   // Get all songs
    $.getJSON('lib/request.php?action=getSongs', function (data) {
        if (data.success) {
            let songsElement = $('#songs');
            songsList = data.songs;
            
            // Display each song
            songsList.forEach(async (song, index) => {
                // Get the album name
                if (song.id_song) {
                    let albumData = await $.getJSON(`lib/request.php?action=getAlbumName&id_song=${song.id_song}`);
                    song.album = albumData.success ? albumData.albumName : "Aucun album";
                } else {
                    song.album = "Aucun album";
                }

                // Get the artist name
                if (song.id_artist) {
                    let artistData = await $.getJSON(`lib/request.php?action=getArtistName&id_artist=${song.id_artist}`);
                    song.artist = artistData.success ? artistData.artistName : "Artiste inconnu";
                } else {
                    song.artist = "Artiste inconnu";
                }

                // Create the song element
                let songElement = $(`
                    <div class="card-musique" data-song-id="${song.id_song}">
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

                // Play the song when clicked
                songElement.find('.play-button').click(function() {
                    let songIndex = $(this).data('index');
                    playSong(songIndex);
                });

                // Show the song details when clicked
                songElement.click(function (e) {
                    if (!$(e.target).hasClass('play-button')) {
                        showSongDetails(song.id_song);
                    }
                });
            });
        }
    });

    // Function to show the song details
    function showSongDetails(songId) {
        $.getJSON(`lib/request.php?action=getComments&id_song=${songId}`, function (data) {
            if (data.success) {
                let song = songsList.find(s => s.id_song === songId);
                let comments = data.comments;

                let modal = $(`
                    <div class="modal">
                        <div class="modal-content">
                            <span class="close-button">&times;</span>
                            <h2>${song.name}</h2>
                            <p><strong>Artiste:</strong> ${song.artist}</p>
                            <p><strong>Album:</strong> ${song.album}</p>
                            <p><strong>Durée:</strong> ${song.time}</p>
                            <h3>Commentaires :</h3>
                            <div class="comments-container"></div>
                            <textarea class="comment-input" placeholder="Ajouter un commentaire"></textarea>
                            <button class="comment-button">Ajouter</button>
                        </div>
                    </div>
                `);
                $('body').append(modal);

                let commentsContainer = modal.find('.comments');
                comments.forEach(comment => {
                    let commentElement = $(`
                        <div class="comment">
                            <h4>${comment.username}</h4>
                            <p>${comment.comment}</p>
                        </div>
                    `);
                    commentsContainer.append(commentElement);
                });

                modal.find('.close-button').on('click', function () {
                    modal.remove();
                });

                modal.find('.comment-button').on('click', function () {
                    let commentInput = modal.find('.comment-input');
                    let commentText = commentInput.val();
                    if (commentText) {
                        $comment_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
                        $.post('lib/request.php?action=addComment', { mail: usermail, id_song: songId, comment: commentText, comment_date: $comment_date }, function (data) {
                            if (data.success) {
                                /*
                                commentInput.val('');
                                let commentElement = $(`
                                    <div class="comment">
                                        <h4>${username}</h4>
                                        <p>${commentText}</p>
                                    </div>
                                `);
                                commentsContainer.append(commentElement);
                                */
                            } else {
                                alert('Erreur lors de l\'ajout du commentaire');
                            }
                        });
                    }
                });
            } else {
                console.error("Erreur : Impossible de récupérer les détails du son.");
            }
        }).fail(error => {
            console.error("Erreur AJAX lors de la récupération des détails du son :", error);
        });
    }

    
    // ------ -----   ----- -----     Music player     ----- -----   ----- ----- //

    let musicFooter = $('.music-footer');
    let likeButton = musicFooter.find('.like-button');
    let audio = new Audio();
    let currentSongIndex = 0;
    let songsList = [];

   // Function to play a song by index
   function playSong(index) {
        let song = songsList[index];
        let musicFooter = $('.music-footer');
        let musicImage = musicFooter.find('img');
        let musicTitle = musicFooter.find('span');
        let playButton = musicFooter.find('button:nth-child(2)');

        // Check if the song is already playing or not
        if (audio.src === `songs/${song.song}` && !audio.paused) {
            audio.pause();
            playButton.text('▶️');
        } else {
            audio.src = `songs/${song.song}`;
            audio.play();
            playButton.text('⏸️');
            musicTitle.text(song.name);
            musicImage.attr('src', song.picture);
        }

        // Update the current song index
        currentSongIndex = index;

        // Play the next song when the current song ends
        audio.onended = function () {
            nextSong();
        };
    }

    // Function to play the previous song
    $(document).on('click', '.prev-button', function () {
        prevSong();
    });
    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songsList.length) % songsList.length;
        playSong(currentSongIndex);
    }

    // Function to play the next song
    $(document).on('click', '.next-button', function () {
        nextSong();
    });
    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songsList.length;
        playSong(currentSongIndex);
    }

    // Change the play button or pause button
    let playButton = $('.music-footer').find('button:nth-child(2)');
    playButton.click(function () {
        let song = songsList[currentSongIndex];
        if (audio.paused) {
            audio.play();
            playButton.text('⏸️');
        } else {
            audio.pause();
            playButton.text('▶️');
        }
    });

    // Update the progress bar
    audio.addEventListener('timeupdate', function () {
        let progress = (audio.currentTime / audio.duration) * 100;
        $('.progress-fill').css('width', progress + '%');
    });    

    // Add a like to the song
    likeButton.click(() => {
        let songId = songsList[currentSongIndex]?.id_song;
        if (usermail && songId) {
            let like_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
            $.post('lib/request.php?action=addLike', { mail: usermail, id_song: songId, like_date: like_date }, function (data) {
                if (data.success) {
                    alert('Ajouté aux favoris');
                } else {
                    alert('Erreur, essai plus tard');
                }
            });
        }
    });

    // Function to delete a song from the playlist
    function deleteSongFromPlaylist(songId, playlistId, songElement) {
        $.get(`lib/request.php?action=deleteSongFromPlaylist&id_song=${songId}&id_playlist=${playlistId}`, function () {
            songElement.remove();
        });
    }
});

// function to show the artist button or admin button
$(document).ready(function () {
    $.getJSON("lib/request.php?action=checkUserType", function (data) {
        if (data.success) {
            if (data.role === "artist") {
                $("#artiste-button").show();
            }
            if (data.role === "admin") {
                $("#admin-button").show();
            }
        }
    });
});


