CREATE DATABASE IF NOT EXISTS musicDB;
USE musicDB;

DROP TABLE IF EXISTS playlist_songs;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS playlist;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS appartient;
DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS artist;
DROP TABLE IF EXISTS album;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS users;


-- Création de la table users (avec username au lieu de firstname/lastname)
CREATE TABLE users (
    mail            VARCHAR(100) NOT NULL,
    username        VARCHAR(50) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    CONSTRAINT users_PK PRIMARY KEY (mail)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table album
CREATE TABLE album (
    id_album INT AUTO_INCREMENT NOT NULL,
    name     VARCHAR(100) NOT NULL,
    CONSTRAINT album_PK PRIMARY KEY (id_album)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table playlist
CREATE TABLE playlist (
    id_playlist   INT AUTO_INCREMENT NOT NULL,
    playlist_name VARCHAR(100) NOT NULL, 
    mail          VARCHAR(100) NOT NULL,
    CONSTRAINT playlist_PK PRIMARY KEY (id_playlist),
    CONSTRAINT playlist_users_FK FOREIGN KEY (mail) REFERENCES users(mail) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table artist
CREATE TABLE artist (
    id_artist INT AUTO_INCREMENT NOT NULL,
    mail      VARCHAR(100) NOT NULL,
    CONSTRAINT artist_PK PRIMARY KEY (id_artist),
    CONSTRAINT artist_users_FK FOREIGN KEY (mail) REFERENCES users(mail) ON DELETE CASCADE,
    CONSTRAINT artist_users_AK UNIQUE (mail)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table songs avec la colonne time
CREATE TABLE songs (
    id_song   INT AUTO_INCREMENT NOT NULL,
    name      VARCHAR(100) NOT NULL,
    song      VARCHAR(255) NOT NULL,
    time      TIME NOT NULL,
    picture   VARCHAR(255) NOT NULL,
    id_artist INT NOT NULL,
    CONSTRAINT songs_PK PRIMARY KEY (id_song),
    CONSTRAINT songs_artist_FK FOREIGN KEY (id_artist) REFERENCES artist(id_artist) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table admin
CREATE TABLE admin (
    id_admin INT AUTO_INCREMENT NOT NULL,
    mail     VARCHAR(100) NOT NULL,
    CONSTRAINT admin_PK PRIMARY KEY (id_admin),
    CONSTRAINT admin_users_FK FOREIGN KEY (mail) REFERENCES users(mail) ON DELETE CASCADE,
    CONSTRAINT admin_users_AK UNIQUE (mail)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table likes
CREATE TABLE likes (
    id_song   INT NOT NULL,
    mail      VARCHAR(100) NOT NULL,
    like_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notice    VARCHAR(200),
    CONSTRAINT likes_PK PRIMARY KEY (id_song, mail),
    CONSTRAINT likes_songs_FK FOREIGN KEY (id_song) REFERENCES songs(id_song) ON DELETE CASCADE,
    CONSTRAINT likes_users0_FK FOREIGN KEY (mail) REFERENCES users(mail) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table comment
CREATE TABLE comment (
    mail         VARCHAR(100) NOT NULL,
    id_song      INT NOT NULL,
    comment      VARCHAR(500) NOT NULL,
    comment_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT comment_PK PRIMARY KEY (mail, id_song),
    CONSTRAINT comment_users_FK FOREIGN KEY (mail) REFERENCES users(mail) ON DELETE CASCADE,
    CONSTRAINT comment_song0_FK FOREIGN KEY (id_song) REFERENCES songs(id_song) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table appartient (associe chansons et albums)
CREATE TABLE appartient (
    id_song  INT NOT NULL,
    id_album INT NOT NULL,
    CONSTRAINT appartient_PK PRIMARY KEY (id_song, id_album),
    CONSTRAINT appartient_songs_FK FOREIGN KEY (id_song) REFERENCES songs(id_song) ON DELETE CASCADE,
    CONSTRAINT appartient_album0_FK FOREIGN KEY (id_album) REFERENCES album(id_album) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Création de la table playlist_songs (associe chansons et playlists)
CREATE TABLE playlist_songs (
    id_song     INT NOT NULL,
    id_playlist INT NOT NULL,
    add_date    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT playlist_songs_PK PRIMARY KEY (id_song, id_playlist),
    CONSTRAINT playlist_songs_songs_FK FOREIGN KEY (id_song) REFERENCES songs(id_song) ON DELETE CASCADE,
    CONSTRAINT playlist_songs_playlist0_FK FOREIGN KEY (id_playlist) REFERENCES playlist(id_playlist) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


