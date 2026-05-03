import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { recordPlay, getLyrics } from '../services/api';
import NowPlaying from '../components/NowPlaying';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [queue, setQueue] = useState([]); // Antrian lagu
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [lyrics, setLyrics] = useState([]);
    const [showPlayer, setShowPlayer] = useState(false);
    const [lyricsHeight, setLyricsHeight] = useState(0);
    const [error, setError] = useState(null);
    const [isShuffle, setIsShuffle] = useState(false); // Mode acak
    const [shuffleHistory, setShuffleHistory] = useState([]); // Riwayat putar acak

    const audioRef = useRef(null);

    // Load lyrics
    const loadLyrics = async (songId) => {
        try {
            const lyricsData = await getLyrics(songId);
            setLyrics(lyricsData || []);
            return lyricsData;
        } catch (error) {
            console.error('Error loading lyrics:', error);
            setLyrics([]);
            return [];
        }
    };

    // Acak array (Fisher-Yates shuffle)
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Tambah lagu ke antrian "Putar Selanjutnya"
    const addToQueue = (song, position = 'next') => {
        if (!song) return;

        const newQueue = [...queue];
        if (position === 'next') {
            // Tambah di urutan pertama (setelah lagu yang sedang diputar)
            newQueue.unshift(song);
        } else {
            // Tambah di akhir antrian
            newQueue.push(song);
        }
        setQueue(newQueue);

        // Tampilkan notifikasi
        showToast(`🎵 "${song.title}" ditambahkan ke antrian`, 'success');
    };

    // Hapus dari antrian
    const removeFromQueue = (index) => {
        const newQueue = queue.filter((_, i) => i !== index);
        setQueue(newQueue);
        showToast('Lagu dihapus dari antrian', 'info');
    };

    // Pindah urutan dalam antrian (drag & drop)
    const reorderQueue = (fromIndex, toIndex) => {
        const newQueue = [...queue];
        const [movedItem] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, movedItem);
        setQueue(newQueue);
    };

    // Kosongkan antrian
    const clearQueue = () => {
        setQueue([]);
        showToast('Antrian dikosongkan', 'info');
    };

    // Toggle shuffle mode
    const toggleShuffle = () => {
        setIsShuffle(!isShuffle);
        if (!isShuffle) {
            showToast('🔀 Mode Acak Aktif', 'success');
        } else {
            showToast('🔀 Mode Acak Nonaktif', 'info');
        }
    };

    // Play song dengan queue support
    const playSong = async (song, index, songList, addToHistory = true) => {
        if (!song) return;

        let audioUrl = song.url || song.audioUrl;
        if (!audioUrl && song.file_name) {
            audioUrl = `/uploads/${song.file_name}`;
        }
        if (!audioUrl) {
            audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        }
        if (audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('/')) {
            audioUrl = `/${audioUrl}`;
        }

        // Load lyrics
        await loadLyrics(song.id);

        setCurrentSong(song);
        setPlaylist(songList || []);
        setCurrentIndex(index || 0);
        setShowPlayer(true);
        setError(null);

        // Catat ke riwayat shuffle jika mode acak aktif
        if (isShuffle && addToHistory) {
            setShuffleHistory(prev => [...prev, song.id]);
        }

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

    // Next song dengan queue priority
    const nextSong = async () => {
        // Prioritaskan antrian (queue) terlebih dahulu
        if (queue.length > 0) {
            const nextQueueSong = queue[0];
            const newQueue = queue.slice(1);
            setQueue(newQueue);
            await playSong(nextQueueSong, 0, [...playlist, ...newQueue], true);
            return;
        }

        // Jika mode acak aktif
        if (isShuffle && playlist.length > 0) {
            // Pilih lagu random yang belum diputar di sesi ini
            const playedIds = shuffleHistory;
            const unplayedSongs = playlist.filter(song => !playedIds.includes(song.id));

            if (unplayedSongs.length > 0) {
                const randomIndex = Math.floor(Math.random() * unplayedSongs.length);
                const randomSong = unplayedSongs[randomIndex];
                const originalIndex = playlist.findIndex(s => s.id === randomSong.id);
                await playSong(randomSong, originalIndex, playlist, true);
                return;
            } else {
                // Semua lagu sudah diputar, reset riwayat
                setShuffleHistory([]);
                const randomIndex = Math.floor(Math.random() * playlist.length);
                await playSong(playlist[randomIndex], randomIndex, playlist, true);
                return;
            }
        }

        // Normal playlist
        if (playlist.length > 0 && currentIndex + 1 < playlist.length) {
            await playSong(playlist[currentIndex + 1], currentIndex + 1, playlist, true);
        } else if (playlist.length > 0) {
            // Ulang dari awal
            await playSong(playlist[0], 0, playlist, true);
        }
    };

    // Prev song
    const prevSong = async () => {
        if (isShuffle) {
            // Mode acak: random previous
            const randomIndex = Math.floor(Math.random() * playlist.length);
            await playSong(playlist[randomIndex], randomIndex, playlist, true);
        } else if (currentIndex - 1 >= 0) {
            await playSong(playlist[currentIndex - 1], currentIndex - 1, playlist, true);
        }
    };

    const togglePlayPause = () => {
        if (!audioRef.current.src) {
            if (playlist.length > 0) {
                playSong(playlist[0], 0, playlist);
            }
            return;
        }

        if (audioRef.current.paused) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const seekTo = (time) => {
        if (audioRef.current && !isNaN(time)) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds === Infinity) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Toast notification
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-300 ${type === 'success' ? 'bg-green-500 text-white' :
                type === 'error' ? 'bg-red-500 text-white' :
                    'bg-gray-800 text-white'
            }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    };

    // Event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => nextSong();
        const handleError = () => setError('Gagal memutar audio');

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
    }, [nextSong]);

    const value = {
        currentSong,
        playlist,
        queue,
        currentIndex,
        isPlaying,
        currentTime,
        duration,
        lyrics,
        showPlayer,
        lyricsHeight,
        error,
        isShuffle,
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
        addToQueue,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        toggleShuffle,
        loadLyrics
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
            {showPlayer && <NowPlaying />}
            <audio ref={audioRef} style={{ display: 'none' }} />
        </PlayerContext.Provider>
    );
};
