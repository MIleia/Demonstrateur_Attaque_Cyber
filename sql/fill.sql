USE musicDB;


-- Insertion des utilisateurs
INSERT INTO users (mail, lastname, firstname, password, profile_picture) VALUES
('user1@example.com', 'Doe', 'John', 'hashed_password1', '../images/default_user.png'),
('user2@example.com', 'Smith', 'Jane', 'hashed_password2', '../images/default_user.png'),
('artist1@example.com', 'Brown', 'Alice', 'hashed_password3', '../images/default_user.png'),
('admin@admin.com', 'Admin', 'Super', 'hashed_password4', '../images/default_user.png');


-- Insertion des administrateurs
INSERT INTO admin (mail) VALUES
('admin@admin.com');


-- Insertion des artistes
INSERT INTO artist (mail) VALUES
('artist1@example.com');


-- Insertion des albums
INSERT INTO album (name) VALUES
('Best Hits 2024'),
('Chill Vibes'),
('Workout Anthems');


-- Insertion des chansons
INSERT INTO songs (name, song, picture, id_artist) VALUES
('Summer Breeze', 'avicci_levels.mp3', '../../images/default_song.png', 1),
('Electro Waves', 'avicci_levels.mp3', '../../images/default_song.png', 1),
('Chill Sunset', 'avicci_levels.mp3', '../../images/default_song.png', 1);


-- Insertion des playlists
INSERT INTO playlist (playlist_name, mail) VALUES
('My Favorite Songs', 'user1@example.com'),
('Workout Mix', 'user2@example.com');


-- Associer des chansons aux albums
INSERT INTO appartient (id_song, id_album) VALUES
(1, 1), (2, 2), (3, 3);


-- Associer des chansons aux playlists
INSERT INTO playlist_songs (id_song, id_playlist) VALUES
(1, 1), (2, 1), (3, 2);


-- Ajout de likes
INSERT INTO likes (id_song, mail, notice) VALUES
(1, 'user1@example.com', 'Love this song!'),
(2, 'user2@example.com', 'Amazing vibes!');


-- Ajout de commentaires
INSERT INTO comment (mail, id_song, comment) VALUES
('user1@example.com', 1, 'Perfect for summer days!'),
('user2@example.com', 2, 'Electro waves are fire!');


