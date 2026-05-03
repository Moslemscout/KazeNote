import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { recordPlay, getLyrics } from '../services/api';
import NowPlaying from '../components/NowPlaying';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [lyrics, setLyrics] = useState([]);
    const [showPlayer, setShowPlayer] = useState(false);
    const [lyricsHeight, setLyricsHeight] = useState(200); // Default height 200px
    const [error, setError] = useState(null);

    const audioRef = useRef(null);

    // ========== FUNGSI LOAD LIRIK ==========
    const loadLyrics = async (songId) => {
        console.log('Loading lyrics for song:', songId);
        try {
            const lyricsData = await getLyrics(songId);
            console.log('Lyrics data received:', lyricsData);

            if (lyricsData && Array.isArray(lyricsData) && lyricsData.length > 0) {
                console.log('Setting lyrics with', lyricsData.length, 'lines');
                setLyrics(lyricsData);
                // Pastikan panel lirik terbuka
                setLyricsHeight(200);
            } else {
                console.log('No lyrics found for this song');
                setLyrics([]);
            }
            return lyricsData;
        } catch (error) {
            console.error('Error in loadLyrics:', error);
            setLyrics([]);
            return [];
        }
    };

    // ========== PLAY SONG ==========
    const playSong = async (song, index, songList) => {
        if (!song) {
            console.error('No song provided');
            return;
        }

        console.log('playSong called:', song.title, song.id);

        // Pastikan lirik di-load TERLEBIH DAHULU sebelum play
        await loadLyrics(song.id);

        // Dapatkan URL audio
        let audioUrl = song.url || song.audioUrl;

        if (!audioUrl && song.file_name) {
            audioUrl = `/uploads/${song.file_name}`;
        }

        if (!audioUrl) {
            console.warn('No audio URL found, using sample');
            audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        }

        if (audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('/')) {
            audioUrl = `/${audioUrl}`;
        }

        console.log('Playing URL:', audioUrl);

        setCurrentSong(song);
        setPlaylist(songList || []);
        setCurrentIndex(index || 0);
        setShowPlayer(true);
        setError(null);

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = audioUrl;
            audioRef.current.load();

            try {
                await audioRef.current.play();
                setIsPlaying(true);
                recordPlay(song.id).catch(console.error);
            } catch (err) {
                console.error('Play error:', err);
                setError(`Gagal memutar: ${err.message}`);
                setIsPlaying(false);
            }
        }
    };

    // ========== TOGGLE PLAY/PAUSE ==========
    const togglePlayPause = () => {
        if (!audioRef.current.src) {
            if (playlist.length > 0) {
                playSong(playlist[0], 0, playlist);
            }
            return;
        }

        if (audioRef.current.paused) {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.error('Play error:', err);
                setError(`Gagal memutar: ${err.message}`);
            });
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    // ========== NEXT/PREV SONG ==========
    const nextSong = () => {
        if (playlist.length > 0 && currentIndex + 1 < playlist.length) {
            playSong(playlist[currentIndex + 1], currentIndex + 1, playlist);
        }
    };

    const prevSong = () => {
        if (playlist.length > 0 && currentIndex - 1 >= 0) {
            playSong(playlist[currentIndex - 1], currentIndex - 1, playlist);
        }
    };

    // ========== SEEK TO TIME ==========
    const seekTo = (time) => {
        if (audioRef.current && !isNaN(time)) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // ========== FORMAT TIME ==========
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds === Infinity || seconds === undefined) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // ========== UPDATE ACTIVE LYRIC (untuk sinkronisasi waktu) ==========
    const updateActiveLyric = (currentTime) => {
        // Fungsi ini sudah ditangani di NowPlaying component
        // Kita hanya perlu memastikan lyrics state tersedia
    };

    // ========== EVENT LISTENERS ==========
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleDurationChange = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            nextSong();
        };

        const handleError = (e) => {
            console.error('Audio error:', e);
            setError('Gagal memutar audio. Periksa koneksi internet Anda.');
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    const value = {
        currentSong,
        playlist,
        currentIndex,
        isPlaying,
        currentTime,
        duration,
        lyrics,
        showPlayer,
        lyricsHeight,
        error,
        audioRef,
        playSong,
        togglePlayPause,
        nextSong,
        prevSong,
        seekTo,
        formatTime,
        setLyrics,
        setShowPlayer,
        setLyricsHeight,
        setIsPlaying,
        setCurrentTime,
        setDuration,
        loadLyrics,
        updateActiveLyric
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
            {showPlayer && <NowPlaying />}
            <audio ref={audioRef} style={{ display: 'none' }} />
        </PlayerContext.Provider>
    );
};
