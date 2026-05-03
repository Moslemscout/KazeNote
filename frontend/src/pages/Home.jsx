import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header1';
import SongCard from '../components/SongCard';
import { usePlayer } from '../contexts/PlayerContext';
import { getSongs, getMostPlayed, addToUserPlaylist, toggleLike, getLyrics } from '../services/api';

const Home = () => {
    const [searchParams] = useSearchParams();
    const [allSongs, setAllSongs] = useState([]);
    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentSong, playSong, setLyrics, loadLyrics } = usePlayer();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [songs, mostPlayed] = await Promise.all([
                getSongs(),
                getMostPlayed()
            ]);
            setAllSongs(songs);
            setRecommendedSongs(mostPlayed.length > 0 ? mostPlayed : songs.slice(0, 5));
            console.log('Songs loaded:', songs.length);
        } catch (error) {
            console.error('Error loading songs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySong = async (song, index, songList) => {
        console.log('Playing song:', song.title, 'ID:', song.id);

        // Load lyrics untuk lagu yang dipilih
        if (loadLyrics) {
            await loadLyrics(song.id);
        } else {
            try {
                const lyricsData = await getLyrics(song.id);
                console.log('Lyrics loaded:', lyricsData?.length || 0, 'lines');
                setLyrics(lyricsData || []);
            } catch (error) {
                console.error('Error loading lyrics:', error);
                setLyrics([]);
            }
        }

        // Play lagu
        playSong(song, index, songList);
    };

    const handleAddToPlaylist = async (songId) => {
        try {
            await addToUserPlaylist(songId);
            alert('✅ Lagu ditambahkan ke Songlist!');
        } catch (error) {
            console.error('Error adding to playlist:', error);
            alert('❌ Gagal menambahkan ke Songlist');
        }
    };

    const handleToggleLike = async (songId) => {
        try {
            await toggleLike(songId);
            await loadData();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const searchQuery = searchParams.get('search') || '';
    const filteredSongs = searchQuery
        ? allSongs.filter(song =>
            song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    if (loading) {
        return (
            <>
                <Header />
                <div className="pt-56 pb-8 px-8 max-w-7xl mx-auto">
                    <div className="text-center py-12">Memuat lagu...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="pt-56 pb-8 px-8 max-w-7xl mx-auto">
                {searchQuery ? (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Hasil pencarian: "{searchQuery}"
                        </h2>
                        {filteredSongs.length === 0 ? (
                            <div className="text-center py-12 bg-white/50 rounded-3xl">
                                <i className="fas fa-search text-4xl text-gray-400 mb-3"></i>
                                <p className="text-gray-500">Tidak ada lagu yang ditemukan</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredSongs.map((song, idx) => (
                                    <SongCard
                                        key={song.id}
                                        song={{ ...song, is_liked: song.is_liked || false }}
                                        isPlaying={currentSong?.id === song.id}
                                        onPlay={() => handlePlaySong(song, idx, filteredSongs)}
                                        onLike={() => handleToggleLike(song.id)}
                                        onAddToPlaylist={handleAddToPlaylist}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommended for today</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                            {recommendedSongs.map((song, idx) => (
                                <SongCard
                                    key={song.id}
                                    song={{ ...song, is_liked: song.is_liked || false }}
                                    isPlaying={currentSong?.id === song.id}
                                    onPlay={() => handlePlaySong(song, idx, recommendedSongs)}
                                    onLike={() => handleToggleLike(song.id)}
                                    onAddToPlaylist={handleAddToPlaylist}
                                />
                            ))}
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Semua Lagu</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {allSongs.map((song, idx) => (
                                <SongCard
                                    key={song.id}
                                    song={{ ...song, is_liked: song.is_liked || false }}
                                    isPlaying={currentSong?.id === song.id}
                                    onPlay={() => handlePlaySong(song, idx, allSongs)}
                                    onLike={() => handleToggleLike(song.id)}
                                    onAddToPlaylist={handleAddToPlaylist}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Home;
