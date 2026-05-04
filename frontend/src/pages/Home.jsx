import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import SongCard from '../components/SongCard';
import { usePlayer } from '../contexts/PlayerContext';
import { getSongs, getMostPlayed, addToUserPlaylist, toggleLike, getLyrics, getCategories, getSongsByCategory } from '../services/api';
import { FaMusic, FaHistory, FaFolder, FaHeadphones } from 'react-icons/fa';

const Home = () => {
    const [searchParams] = useSearchParams();
    const [allSongs, setAllSongs] = useState([]);
    const [mostPlayedSongs, setMostPlayedSongs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categorySongs, setCategorySongs] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentSong, playSong, setLyrics, loadLyrics, addToQueue } = usePlayer();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [songs, mostPlayed, categoriesData] = await Promise.all([
                getSongs(),
                getMostPlayed(),
                getCategories()
            ]);

            setAllSongs(songs);
            setMostPlayedSongs(mostPlayed.length > 0 ? mostPlayed : songs.slice(0, 5));
            setCategories(categoriesData);

            // Load songs per category
            const songsByCat = {};
            for (const cat of categoriesData) {
                try {
                    const catSongs = await getSongsByCategory(cat.id);
                    songsByCat[cat.id] = catSongs;
                } catch (error) {
                    console.error(`Error loading songs for category ${cat.name}:`, error);
                    songsByCat[cat.id] = [];
                }
            }
            setCategorySongs(songsByCat);

        } catch (error) {
            console.error('Error loading songs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySong = async (song, index, songList) => {
        if (loadLyrics) {
            await loadLyrics(song.id);
        } else {
            try {
                const lyricsData = await getLyrics(song.id);
                setLyrics(lyricsData || []);
            } catch (error) {
                console.error('Error loading lyrics:', error);
                setLyrics([]);
            }
        }
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

    const handlePlayNext = (song) => {
        addToQueue(song, 'next');
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
                                        onPlayNext={handlePlayNext}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Most Played Section - You've been playing this a lot lately */}
                        <section className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <FaHistory className="text-orange-500 text-xl" />
                                <h2 className="text-2xl font-bold text-gray-800">You've been playing this a lot lately</h2>
                            </div>
                            {mostPlayedSongs.length === 0 ? (
                                <div className="text-center py-12 bg-white/50 rounded-3xl">
                                    <FaHeadphones className="text-4xl text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">Belum ada riwayat putar</p>
                                    <p className="text-sm text-gray-400 mt-1">Mulai dengarkan musik untuk melihat rekomendasi</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {mostPlayedSongs.map((song, idx) => (
                                        <SongCard
                                            key={song.id}
                                            song={{ ...song, is_liked: song.is_liked || false }}
                                            isPlaying={currentSong?.id === song.id}
                                            onPlay={() => handlePlaySong(song, idx, mostPlayedSongs)}
                                            onLike={() => handleToggleLike(song.id)}
                                            onAddToPlaylist={handleAddToPlaylist}
                                            onPlayNext={handlePlayNext}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Category Sections */}
                        {categories.map(category => {
                            const songsInCategory = categorySongs[category.id] || [];
                            if (songsInCategory.length === 0) return null;

                            return (
                                <section key={category.id} className="mb-12">
                                    <div className="flex items-center gap-2 mb-6">
                                        <FaFolder className="text-orange-500 text-xl" />
                                        <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                                        <span className="text-sm text-gray-400 ml-2">({songsInCategory.length} lagu)</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {songsInCategory.slice(0, 4).map((song, idx) => (
                                            <SongCard
                                                key={song.id}
                                                song={{ ...song, is_liked: song.is_liked || false }}
                                                isPlaying={currentSong?.id === song.id}
                                                onPlay={() => handlePlaySong(song, idx, songsInCategory)}
                                                onLike={() => handleToggleLike(song.id)}
                                                onAddToPlaylist={handleAddToPlaylist}
                                                onPlayNext={handlePlayNext}
                                            />
                                        ))}
                                    </div>
                                    {songsInCategory.length > 4 && (
                                        <button
                                            onClick={() => setSelectedCategory(category)}
                                            className="mt-4 text-orange-500 hover:text-orange-600 text-sm flex items-center gap-1"
                                        >
                                            Lihat semua ({songsInCategory.length - 4} lagu lainnya) →
                                        </button>
                                    )}
                                </section>
                            );
                        })}

                        {/* All Songs Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <FaMusic className="text-orange-500 text-xl" />
                                <h2 className="text-2xl font-bold text-gray-800">Semua Lagu</h2>
                                <span className="text-sm text-gray-400 ml-2">({allSongs.length} lagu)</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {allSongs.slice(0, 8).map((song, idx) => (
                                    <SongCard
                                        key={song.id}
                                        song={{ ...song, is_liked: song.is_liked || false }}
                                        isPlaying={currentSong?.id === song.id}
                                        onPlay={() => handlePlaySong(song, idx, allSongs)}
                                        onLike={() => handleToggleLike(song.id)}
                                        onAddToPlaylist={handleAddToPlaylist}
                                        onPlayNext={handlePlayNext}
                                    />
                                ))}
                            </div>
                            {allSongs.length > 8 && (
                                <div className="text-center mt-6">
                                    <Link to="/songlist" className="inline-block px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
                                        Lihat semua lagu ({allSongs.length} lagu)
                                    </Link>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>

            {/* Modal untuk melihat semua lagu dalam kategori */}
            {selectedCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FaFolder className="text-orange-500" />
                                {selectedCategory.name} ({categorySongs[selectedCategory.id]?.length || 0} lagu)
                            </h3>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(categorySongs[selectedCategory.id] || []).map((song, idx) => (
                                    <SongCard
                                        key={song.id}
                                        song={{ ...song, is_liked: song.is_liked || false }}
                                        isPlaying={currentSong?.id === song.id}
                                        onPlay={() => handlePlaySong(song, idx, categorySongs[selectedCategory.id] || [])}
                                        onLike={() => handleToggleLike(song.id)}
                                        onAddToPlaylist={handleAddToPlaylist}
                                        onPlayNext={handlePlayNext}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Home;
