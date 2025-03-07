// Event listener pour le bouton parcourir
document.getElementById('browse-btn').addEventListener('click', function() {
    document.getElementById('file-upload').click();
});

// Fonction de recherche (si on veut ajouter un filtre simple)
document.getElementById('search').addEventListener('input', function() {
    let searchQuery = document.getElementById('search').value.toLowerCase();
    let playlists = document.querySelectorAll('.playlists li');

    playlists.forEach(function(playlist) {
        if (playlist.textContent.toLowerCase().includes(searchQuery)) {
            playlist.style.display = 'block';
        } else {
            playlist.style.display = 'none';
        }
    });
});


