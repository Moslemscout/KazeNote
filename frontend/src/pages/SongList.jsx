import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaFolder, FaTimes, FaHeart, FaStepForward, FaPlay } from 'react-icons/fa';
import Header from '../components/Header';
import SongCard from '../components/SongCard';
import { usePlayer } from '../contexts/PlayerContext';
import { getUserPlaylist, removeFromUserPlaylist, toggleLike, getCategories, createCategory, deleteCategory, addSongToCategory, removeSongFromCategory, getLyrics } from '../services/api';

const SongList = () => {
    const [playlist, setPlaylist] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const { currentSong, playSong, addToQueue, setLyrics, loadLyrics } = usePlayer();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [playlistData, categoriesData] = await Promise.all([
                getUserPlaylist(),
                getCategories()
            ]);
            setPlaylist(playlistData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySong = async (song, index, songList) => {
        if (loadLyrics) {
            await loadLyrics(song.id || song.song_id);
        } else {
            try {
                const lyricsData = await getLyrics(song.id || song.song_id);
                setLyrics(lyricsData || []);
            } catch (error) {
                console.error('Error loading lyrics:', error);
                setLyrics([]);
            }
        }
        playSong(song, index, songList);
    };

    const handlePlayNext = (song) => {
        addToQueue(song, 'next');
    };

    const handleRemoveFromPlaylist = async (songId) => {
        if (confirm('Hapus lagu dari playlist?')) {
            try {
                await removeFromUserPlaylist(songId);
                await loadData();
            } catch (error) {
                console.error('Error removing from playlist:', error);
            }
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

    const handleMoveCategory = async (song) => {
        if (categories.length === 0) {
            alert('Belum ada kategori. Buat kategori terlebih dahulu!');
            return;
        }

        let options = 'Pindah ke kategori:\n';
        options += '0. Semua Lagu (hapus dari semua kategori)\n';
        categories.forEach((cat, idx) => {
            options += `${idx + 1}. ${cat.name}\n`;
        });
        options += '\nMasukkan nomor:';

        const choice = prompt(options, song.category_id ? categories.findIndex(c => c.id === song.category_id) + 1 : 0);
        if (choice === null) return;

        const num = parseInt(choice);
        if (isNaN(num)) return;

        const songId = song.id || song.song_id;

        try {
            if (num === 0) {
                for (const cat of categories) {
                    await removeSongFromCategory(cat.id, songId);
                }
            } else if (num >= 1 && num <= categories.length) {
                const selectedCat = categories[num - 1];
                for (const cat of categories) {
                    await removeSongFromCategory(cat.id, songId);
                }
                await addSongToCategory(selectedCat.id, songId);
            } else {
                alert('Pilihan tidak valid');
                return;
            }

            await loadData();
            alert('✅ Kategori berhasil diubah!');
        } catch (error) {
            console.error('Error moving category:', error);
            alert('❌ Gagal mengubah kategori');
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            alert('Nama kategori tidak boleh kosong');
            return;
        }

        try {
            await createCategory(newCategoryName);
            setShowCategoryModal(false);
            setNewCategoryName('');
            await loadData();
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Gagal membuat kategori');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (confirm('Hapus kategori ini? Lagu tidak akan terhapus.')) {
            try {
                await deleteCategory(categoryId);
                if (selectedCategory === categoryId) setSelectedCategory('all');
                await loadData();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const filteredSongs = selectedCategory === 'all'
        ? playlist
        : playlist.filter(song => song.category_id === selectedCategory);

    if (loading) {
        return (
            <>
                <Header />
                <div className="pt-56 pb-8 px-8 max-w-7xl mx-auto">
                    <div className="text-center py-12">Memuat playlist...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="pt-56 pb-8 px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Songlist</h2>
                        <p className="text-gray-500">Nikmati musik favoritmu kapan saja</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                            <span className="font-semibold">{playlist.length}</span> Lagu
                            <span className="mx-2">•</span>
                            <span className="text-pink-500"><FaHeart className="inline mr-1" /> {playlist.filter(s => s.is_liked).length}</span>
                        </div>

                        <button
                            onClick={() => setShowCategoryModal(true)}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:shadow-lg transition"
                            title="Tambah Kategori"
                        >
                            <FaPlus />
                        </button>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-3 mb-8 pb-2 border-b-2 border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-5 py-2 rounded-full font-medium transition flex items-center gap-2 whitespace-nowrap ${selectedCategory === 'all' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-orange-100'}`}
                    >
                        <FaFolder /> Semua Lagu ({playlist.length})
                    </button>

                    {categories.map(cat => {
                        const count = playlist.filter(s => s.category_id === cat.id).length;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2 rounded-full font-medium transition flex items-center gap-2 whitespace-nowrap ${selectedCategory === cat.id ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-orange-100'}`}
                            >
                                <FaFolder /> {cat.name} ({count})
                                <span
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                                    className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/20 cursor-pointer"
                                >
                                    <FaTimes className="text-xs" />
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Song Grid */}
                {filteredSongs.length === 0 ? (
                    <div className="text-center py-16 bg-white/50 rounded-3xl">
                        <i className="fas fa-folder-open text-5xl text-gray-400 mb-3"></i>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak ada lagu</h3>
                        <p className="text-gray-400">Tambahkan lagu dari halaman Home</p>
                        <Link to="/" className="inline-block mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
                            Cari Lagu
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSongs.map((song, idx) => {
                            const songId = song.song_id || song.id;
                            const isCurrentSong = currentSong?.id === songId;

                            return (
                                <div key={songId} className="relative group">
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer">
                                        <div className="relative h-48">
                                            <img
                                                src={song.cover_url || 'https://images.unsplash.com/photo-1590796583326-afd3bb20d22d'}
                                                alt={song.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const parent = e.target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600"><i class="fas fa-music text-white text-5xl"></i></div>';
                                                    }
                                                }}
                                            />
                                            {isCurrentSong && (
                                                <div className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                                    Playing
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-800 truncate">{song.title}</h4>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                        <i className="fas fa-user-circle text-xs"></i> {song.artist}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handlePlaySong(song, idx, filteredSongs)}
                                                    className={`flex-1 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition ${isCurrentSong ? 'bg-orange-500 text-white' : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg'}`}
                                                >
                                                    <FaPlay className="text-xs" /> {isCurrentSong ? 'Playing' : 'Play'}
                                                </button>

                                                <button
                                                    onClick={() => handleToggleLike(songId)}
                                                    className={`w-10 rounded-full flex items-center justify-center transition ${song.is_liked ? 'bg-pink-100 text-pink-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                                >
                                                    <FaHeart />
                                                </button>

                                                <button
                                                    onClick={() => handlePlayNext(song)}
                                                    className="w-10 rounded-full bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-500 transition flex items-center justify-center"
                                                    title="Putar Selanjutnya"
                                                >
                                                    <FaStepForward className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tombol hapus di pojok */}
                                    <button
                                        onClick={() => handleRemoveFromPlaylist(songId)}
                                        className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                                        title="Hapus dari Songlist"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Tambah Kategori */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FaFolder /> Tambah Kategori Baru
                        </h3>
                        <input
                            type="text"
                            placeholder="Nama kategori (contoh: Pop, Rock, Dangdut)"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleCreateCategory}
                                className="flex-1 bg-orange-500 text-white py-2 rounded-full font-semibold hover:bg-orange-600 transition"
                            >
                                Tambah
                            </button>
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-full font-semibold hover:bg-gray-300 transition"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SongList;