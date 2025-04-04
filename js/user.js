// Initialize the user data
let usermail = null;
let username = null;

// Initiliaze the page data
let musicFooter = $('.music-footer');
let likeButton = musicFooter.find('.like-button');
let AddPlaylist = musicFooter.find('.add-to-playlist-button');
let audio = new Audio();
let currentSongIndex = 0;
let songsList = [];


// Main function
$(document).ready(function(){
    $.ajax({
        url: 'lib/session.php',
        type: 'GET',
        dataType: 'json',
        success: function(response){
            if (!response.loggedIn){
                window.location.href = "login.html";
            } else {
                usermail = response.mail;
                username = response.username;
                
                // Update the user's name and email
                $('#user-name').text(username);
                $('#usermail').text(usermail);

                // display the user's profile picture
                if (response.profile_picture){
                    $('#profile-picture').attr('src', response.profile_picture);
                }

                // Call the function to initialize the page data
                initData();
            }
        },
        error: function(){
            alert('Erreur lors de la vérification de la session.');
        }
    });
});


// Display page data
function initData(){
    logout();
    showButton();
    search();
    displayFavoriteSongs();
    displayPlaylists();
    getSongs();
    playPreviousSong();
    playNextSong();
    changeButton();
    ProgressBar();
    addLike();
    addToPlaylist();
}


// ------ -----   ----- -----     Header     ----- -----   ----- ----- //

// Logout
function logout(){
    $('#logout-button').click(function(){
        $.ajax({
            url: 'lib/request.php?action=logout',
            type: 'GET',
            success: function() {
                window.location.href = "login.html";
            }
        });
    });
}

// Display the artist button or admin button
function showButton(){
    $.getJSON("lib/request.php?action=checkUserType&mail=" + usermail, function(data){
        if (data.success){
            if (data.role === "artist"){
                $("#artiste-button").show();
            }
            if (data.role === "admin"){
                $("#admin-button").show();
            }
        }
    });
}

// Search bar
function search(){
    $("#search").keyup(function(){
        var input = $(this).val();
        if (input != "") {
            $.post("lib/request.php", {action: "song_search", search: input}, function(response){
                $("#search-result").html(response);
                $(".card-musique").click(function(){
                    let songId = $(this).data("song-id");
                    let song = songsList.find(s => s.id_song == songId);
                    if (song){
                        let index = songsList.indexOf(song);
                        playSong(index);
                    }
                });
            });
        } else {
            $("#search-result").html("");
        }
    });
}


// ------ -----   ----- -----     Likes     ----- -----   ----- ----- //

// Display the favorite songs
function displayFavoriteSongs(){
    $.getJSON(`lib/request.php?action=getLikedSong&mail=${usermail}`, function(data){
        if (data.success){
            let favoriteSongsContainer = $('#favorite-songs-container').empty();
            $.each(data.songs, function(index, song){
                let songElement = $(`
                    <div class="card-favorite-song" data-song-id="${song.id_song}">
                        <img src="${song.picture}" alt="${song.name}" class="card-img">
                        <p>${song.name}</p>
                        <img src="images/heart2.png" alt="Retirer des favoris" class="remove-favorite" data-song-id="${song.id_song}">
                    </div>
                `);
                favoriteSongsContainer.append(songElement);

                // Check if the song is clicked
                songElement.click(function(){
                    playSongById(song.id_song);
                });

                // Delete the song from the favorites
                songElement.find('.remove-favorite').click(function(event){
                    event.stopPropagation();
                    let songId = $(this).data('song-id');
                    $.get(`lib/request.php?action=removeLikedSong&mail=${usermail}&id_song=${songId}`, function (){
                        $(`.card-favorite-song[data-song-id="${songId}"]`).remove();
                    });
                });

            });
        }
    });
}


// ------ -----   ----- -----     Playlists     ----- -----   ----- ----- //

// Display the playlists
function displayPlaylists(){
    $.getJSON('lib/request.php?action=getPlaylists&mail=' + usermail, function(data){
        if (data.success){
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
                playlistElement.click(function(){
                    showPlaylistSongs(playlist.id_playlist, playlist.playlist_name);
                });

                // Check if the playlist is clicked
                playlistElement.find('.delete-playlist-button').on('click', function (e){
                    e.stopPropagation();
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette playlist ?')){
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
                let playlistName = prompt("Nom de la playlist :");
                if (playlistName){
                    let postData = {action: "createPlaylist", mail: usermail, playlist_name: playlistName};
            
                    $.ajax({
                        url: "lib/request.php",
                        type: "POST",
                        data: postData,
                        dataType: "json",
                        success: function(response){
                            if (response.success){
                                playlistsElement.empty();
                                displayPlaylists();
                            } else {
                                alert("Erreur lors de la création de la playlist: " + response.message);
                            }
                        }
                    });
                }
            });
            playlistsElement.append(createPlaylistElement);
        }
    });
}

// Delete a song from the playlist
function deleteSongFromPlaylist(songId, playlistId, songElement){
    $.ajax({
        url: "lib/request.php",
        type: "POST",
        data: {
            action: "deleteSongFromPlaylist",
            id_song: songId,
            id_playlist: playlistId
        },
        dataType: "json",
        success: function(response){
            if (response.success){
                songElement.remove();
            } else {
                alert("Erreur : " + response.message);
            }
        }
    });
}

// Display the songs of a playlist
function showPlaylistSongs(id_playlist, playlistName){
    $.ajax({
        url: `lib/request.php?action=getPlaylistSongs&id_playlist=${id_playlist}`,
        type: 'GET',
        dataType: 'json',
        success: async function(data){
            if (data.success){
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
                    for (let song of data.songs){
                        
                        // Get the artist name
                        if (song.id_artist){
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
                        songDiv.find('.delete-button').on('click', function(){
                            deleteSongFromPlaylist(song.id_song, id_playlist, songDiv);
                        });

                        // Play the song when clicked
                        songDiv.on('click', function(){
                            if (!$(event.target).hasClass('delete-button')){
                                playSongById(song.id_song);
                            }
                        });
                        songsContainer.append(songDiv);
                    }
                } else {
                    songsContainer.html("<p>Aucune chanson dans cette playlist.</p>");
                }

                modal.find('.close-button').on('click', function(){
                    modal.remove();
                });
            }
        },
    });
}

// Delete a playlist
function deletePlaylist(id_playlist, playlistElement){
    $.get(`lib/request.php?action=deletePlaylist&id_playlist=${id_playlist}`, function(){
        playlistElement.remove();
    });
}


// ------ -----   ----- -----     Songs     ----- -----   ----- ----- //

// Display the songs
function getSongs(){
    $.getJSON('lib/request.php?action=getSongs', function(data){
        if (data.success){
            let songsElement = $('#songs');
            songsList = data.songs;
            
            // Display each song
            songsList.forEach(async(song, index) => {
                // Get the album name
                if (song.id_song){
                    let albumData = await $.getJSON(`lib/request.php?action=getAlbumName&id_song=${song.id_song}`);
                    song.album = albumData.success ? albumData.albumName : "Aucun album";
                } else {
                    song.album = "Aucun album";
                }

                // Get the artist name
                if (song.id_artist){
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
                songElement.find('.play-button').click(function(){
                    let songIndex = $(this).data('index');
                    playSong(songIndex);
                });

                // Show the song comments when clicked
                songElement.click(function(e){
                    if (!$(e.target).hasClass('.play-button')){
                        showSongComments(song.id_song);
                    }
                });
            });
        }
    });
}

// Display the comments of a song
function showSongComments(id_song){
    let existingModal = $("#commentModal");

    if (existingModal.length){
        existingModal.remove();
    }

    // Create the modal
    const modal = $('<div id="commentModal" class="modal"></div>');
    const modalContent = $('<div class="modal-content"></div>');
    const closeBtn = $('<span class="close-button">&times;</span>');
    const title = $('<h2>Commentaires</h2>');
    const commentsList = $('<div id="commentsList"></div>');
    const commentForm = $(`
        <div id="commentForm">
            <textarea id="commentText" placeholder="Ajouter un commentaire" rows="4" cols="50"></textarea>
            <button id="submitComment">Ajouter</button>
        </div>
    `);

    // Add the elements to the modal
    modalContent.append(closeBtn, title, commentsList, commentForm);
    modal.append(modalContent);
    $('body').append(modal);

    // Close the modal
    closeBtn.on('click', function(){
        modal.remove();
    });

    // Get the username from the email
    function getUsername(mail){
        return new Promise((resolve, reject) => {
            $.getJSON(`lib/request.php?action=getUsername&mail=${mail}`, function(data){
                if (data.success){
                    resolve(data.username);
                } else {
                    resolve("Utilisateur inconnu");
                }
            });
        });
    }
    
    // Get the comments
    $.getJSON(`lib/request.php?action=getComments&id_song=${id_song}`, async function(data){
        commentsList.empty();
        if (data.success && data.comments.length > 0) {
            for (const comment of data.comments) {
                if (comment.mail) {
                    comment.username = await getUsername(comment.mail);
                }
    
                let commentElement = $(`
                    <div class="comment">
                        <strong>${comment.username} :</strong> ${comment.comment}
                        <br><span style="font-size: 12px; color: gray;">Posté le ${comment.comment_date}</span>
                    </div>
                    <hr>
                `);
                commentsList.append(commentElement);
            }
        } else {
            commentsList.append("<p>Aucun commentaire pour ce son.</p>");
        }
        modal.show();
    });

    // Add a comment
    modal.find('#submitComment').on('click', function(){
        const commentText = modal.find('#commentText').val().trim();

        if (commentText !== ""){
            $.post('lib/request.php', {
                action: 'addComment',
                id_song: id_song,
                mail: usermail,
                comment: commentText
            }, function(){
                if (commentsList.children().length === 1 && commentsList.children().text().includes("Aucun commentaire pour ce son.")){
                    commentsList.empty();
                }
                
                $date = new Date().toISOString().slice(0, 19).replace('T', ' ');
                let commentElement = $(`
                    <div class="comment">
                        <strong>${username} :</strong> ${commentText}
                        <br><span style="font-size: 12px; color: gray;">Posté le ${$date}</span>
                    </div>
                    <hr>
                `);
                commentsList.append(commentElement);
                modal.find('#commentText').val('');
            });
        } else {
            alert("Le commentaire ne peut pas être vide.");
        }
    });
}


// ------ -----   ----- -----     Music player     ----- -----   ----- ----- //

// Play a song by id
function playSongById(songId){
    let song = songsList.find(s => s.id_song === songId);
    if (song){
        playSong(songsList.indexOf(song));
    }
}

// Play a song
function playSong(index){
    let song = songsList[index];
    let musicFooter = $('.music-footer');
    let musicImage = musicFooter.find('img');
    let musicTitle = musicFooter.find('span');
    let playButton = musicFooter.find('.play-button');

    // If the song is already playing, pause it
    if (audio.src.includes(song.song) && !audio.paused){
        audio.pause();
        playButton.text('▶️');
        return;
    }

    // Play the song
    audio.src = `songs/${song.song}`;
    audio.play();
    playButton.text('⏸️');
    musicTitle.text(song.name);
    musicImage.attr('src', song.picture);

    currentSongIndex = index;

    // Play the next song when the current song ends
    audio.onended = function (){
        currentSongIndex = (currentSongIndex + 1) % songsList.length;
        playSong(currentSongIndex);
    };
}

// Play the previous song
function playPreviousSong(){
    $(document).on('click', '.prev-button', function(){
        currentSongIndex = (currentSongIndex - 1 + songsList.length) % songsList.length;
        playSong(currentSongIndex);
    });
}

// Play the next song
function playNextSong(){
    $(document).on('click', '.next-button', function(){
        currentSongIndex = (currentSongIndex + 1) % songsList.length;
        playSong(currentSongIndex);
    });
}

// Change the play button
function changeButton(){
    let playButton = $('.music-footer').find('.play-button');
    playButton.click(function(){
        if (audio.paused){
            audio.play();
            playButton.text('⏸️');
        } else {
            audio.pause();
            playButton.text('▶️');
        }
    });
}

// Progress bar
function ProgressBar(){
    audio.addEventListener('timeupdate', function(){
        let progress = (audio.currentTime / audio.duration) * 100;
        $('.progress-fill').css('width', progress + '%');
    });
}

// Add a like to the song
function addLike(){
    likeButton.click(() => {
        let songId = songsList[currentSongIndex]?.id_song;
        if (songId){
            $.post('lib/request.php', {
                action: 'addLike',
                id_song: songId,
                mail: usermail
            }, function(){
                likeButton.css('color', 'red');
                alert('Chanson ajoutée aux favoris');
                
                // Update the favorite songs
                displayFavoriteSongs();
            });
        }
    });
}

// Add a song to a playlist
function addToPlaylist(){
    AddPlaylist.click(() => {
        let songId = songsList[currentSongIndex]?.id_song;
        if (songId){
            $.getJSON('lib/request.php?action=getPlaylists&mail=' + usermail, function(data){
                if (data.success){
                    let playlists = data.playlists;
                    let select = $('<select>');
                    playlists.forEach(playlist => {
                        select.append(`<option value="${playlist.id_playlist}">${playlist.playlist_name}</option>`);
                    });
                    select.prepend('<option value="" selected>Choisir une playlist</option>');
                    let modal2 = $('<div class="modal"></div>');
                    let modalContent = $('<div class="modal-content"></div>');
                    let closeButton = $('<span class="close-button">&times;</span>');
                    let title = $('<h2>Ajouter à une playlist</h2>');
                    modalContent.append(closeButton, title, select);
                    modal2.append(modalContent);
                    $('body').append(modal2);
                    closeButton.click(function(){
                        modal2.remove();
                    });

                    // Add the song to the selected playlist
                    select.change(function(){
                        let playlistId = select.val();
                        $.post('lib/request.php', {
                            action: 'addSongToPlaylist',
                            id_song: songId,
                            id_playlist: playlistId
                        }, function(){
                            alert('Chanson ajoutée à la playlist');
                            modal2.remove();
                        });
                    });
                }
            });
        }
    });
}


