USE musicDB;

-- Insertion des utilisateurs (y compris l'admin)
INSERT INTO users (mail, lastname, firstname, password, profile_picture) VALUES
('admin@admin.com', 'Admin', 'admin', '$2y$10$ZrzU4mTG7GtqsY8LKKg0.uZfpCgo1X2.SromWlOK8iEvp..2v/OES', '../images/default_user.png'),
('user1@user.com', 'Franky', 'Quentin', '$2y$10$ZrzU4mTG7GtqsY8LKKg0.uZfpCgo1X2.SromWlOK8iEvp..2v/OES', '../images/default_user.png'),
('user2@user.com', 'Esteban', 'Fanjul', '$2y$10$ZrzU4mTG7GtqsY8LKKg0.uZfpCgo1X2.SromWlOK8iEvp..2v/OES', '../images/default_user.png'),
('user3@user.com', 'Jean', 'François', '$2y$10$ZrzU4mTG7GtqsY8LKKg0.uZfpCgo1X2.SromWlOK8iEvp..2v/OES', '../images/default_user.png');

-- Ajout de l'administrateur
INSERT INTO admin (mail) VALUES
('admin@admin.com');

-- Insertion des artistes EDM
INSERT INTO users (mail, lastname, firstname, password, profile_picture) VALUES
('avicii@artist.com', 'Bergling', 'Tim', '$2y$10$ZrzU4mTG7GtqsY8LKKg0.uZfpCgo1X2.SromWlOK8iEvp..2v/OES', '../images/default_artist.png'),
('martingarrix@artist.com', 'Garrix', 'Martin', '$2y$10$ZrzU4mTG7GtqsY8LKKg0.uZfpCgo1X2.SromWlOK8iEvp..2v/OES', '../images/default_artist.png'),
('calvinharris@artist.com', 'Harris', 'Calvin', '$2y$10$ZrzU4mTG7GtqsY8LKKg0.uZfpCgo1X2.SromWlOK8iEvp..2v/OES', '../images/default_artist.png'),
('davidguetta@artist.com', 'Guetta', 'David', '$2y$10$ZrzU4mTG7GtqsY8LKKg0.uZfpCgo1X2.SromWlOK8iEvp..2v/OES', '../images/default_artist.png'),
('kygo@artist.com', 'Kygo', 'Kyrre', '$2y$10$ZrzU4mTG7GtqsY8LKKg0.uZfpCgo1X2.SromWlOK8iEvp..2v/OES', '../images/default_artist.png');

-- Déclaration des artistes
INSERT INTO artist (mail) VALUES
('avicii@artist.com'),
('martingarrix@artist.com'),
('calvinharris@artist.com'),
('davidguetta@artist.com'),
('kygo@artist.com');

-- Insertion des albums
INSERT INTO album (name) VALUES
('EDM Classics'),
('Summer Hits'),
('Festival Anthems');

-- Insertion des chansons
INSERT INTO songs (name, song, picture, id_artist) VALUES
('Wake Me Up', 'avicci_wake_me_up.mp3', '../../images/wake_me_up.jpg', 1),
('Levels', 'avicci_levels.mp3', '../../images/levels.jpg', 1),
('Scared to Be Lonely', 'scared_to_be_lonely.mp3', '../../images/scared_to_be_lonely.jpg', 2),
('Animals', 'animals.mp3', '../../images/animals.jpg', 2),
('Summer', 'summer.mp3', '../../images/summer.png', 3),
('Feel So Close', 'feel_so_close.mp3', '../../images/feel_so_close.jpg', 3),
('Titanium', 'titanium.mp3', '../../images/titanium.jpg', 4),
('Play Hard', 'play_hard.mp3', '../../images/play_hard.jpg', 4),
('Firestone', 'firestone.mp3', '../../images/firestone.jpg', 5),
('Stole the Show', 'stole_the_show.mp3', '../../images/stole_the_show.jpg', 5);

-- Associer des chansons aux albums
INSERT INTO appartient (id_song, id_album) VALUES
(1, 1), (2, 1), (3, 2), (4, 2), (5, 3), (6, 3), (7, 1), (8, 2), (9, 3), (10, 1);

-- Insertion des playlists
INSERT INTO playlist (playlist_name, mail) VALUES
('Best of Avicii', 'user1@user.com'),
('Party Mix', 'user1@user.com'),
('Chill EDM', 'user2@user.com');

-- Associer des chansons aux playlists
INSERT INTO playlist_songs (id_song, id_playlist) VALUES
(1, 1), (2, 1), (3, 2), (5, 2), (7, 3), (9, 3);

-- Ajout de likes pour les utilisateurs
INSERT INTO likes (id_song, mail, notice) VALUES
(1, 'user1@user.com', 'Une pure merveille !'),
(2, 'user1@user.com', 'Énorme classique.'),
(5, 'user2@user.com', 'Parfait pour l été !');

-- Ajout de commentaires
INSERT INTO comment (mail, id_song, comment) VALUES
('user1@user.com', 1, 'Toujours aussi bon, même après des années !'),
('user2@user.com', 5, 'Calvin Harris sait comment faire vibrer !');


