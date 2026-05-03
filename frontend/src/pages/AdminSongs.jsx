import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaSave, FaTrash, FaUpload, FaEdit, FaMusic, FaArrowLeft } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import { getSongs, createSong, updateSong, deleteSong } from '../services/api';

const AdminSongs = () => {
    const [searchParams] = useSearchParams();
    const [songs, setSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        url: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        loadSongs();
    }, []);

    useEffect(() => {
        // Filter songs berdasarkan search query
        if (searchQuery) {
            const filtered = songs.filter(song =>
                song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.artist.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredSongs(filtered);
        } else {
            setFilteredSongs(songs);
        }
    }, [searchQuery, songs]);

    const loadSongs = async () => {
        try {
            const data = await getSongs();
            setSongs(data);
            setFilteredSongs(data);
        } catch (error) {
            console.error('Error loading songs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.artist) {
            alert('Judul dan artis wajib diisi!');
            return;
        }

        if (editingId) {
            try {
                await updateSong(editingId, formData);
                alert('Lagu berhasil diperbarui!');
                resetForm();
                loadSongs();
            } catch (error) {
                console.error('Error updating song:', error);
                alert('Gagal memperbarui lagu');
            }
        } else {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('artist', formData.artist);
            if (formData.url) submitData.append('url', formData.url);
            if (selectedFile) submitData.append('file', selectedFile);

            try {
                await createSong(submitData);
                alert('Lagu berhasil ditambahkan!');
                resetForm();
                loadSongs();
            } catch (error) {
                console.error('Error creating song:', error);
                alert('Gagal menambahkan lagu');
            }
        }
    };

    const resetForm = () => {
        setFormData({ title: '', artist: '', url: '' });
        setSelectedFile(null);
        setFileName('');
        setEditingId(null);
    };

    const handleEdit = (song) => {
        setFormData({
            title: song.title,
            artist: song.artist,
            url: song.url || ''
        });
        setEditingId(song.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id, title) => {
        if (confirm(`Yakin hapus lagu "${title}"?`)) {
            try {
                await deleteSong(id);
                loadSongs();
                alert('Lagu berhasil dihapus');
            } catch (error) {
                console.error('Error deleting song:', error);
                alert('Gagal menghapus lagu');
            }
        }
    };

    if (loading) {
        return (
            <>
                <AdminHeader />
                <div className="pt-56 pb-8 px-8 max-w-7xl mx-auto">
                    <div className="text-center py-12">Memuat data lagu...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminHeader />
            
            <div className="pt-56 pb-8 px-8 max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Kelola Lagu
                        {searchQuery && (
                            <span className="text-sm font-normal text-gray-500 ml-3">
                                Hasil pencarian: "{searchQuery}" ({filteredSongs.length} lagu)
                            </span>
                        )}
                    </h2>
                    {searchQuery && (
                        <Link to="/admin-songs" className="text-orange-500 hover:text-orange-600 text-sm">
                            Clear search
                        </Link>
                    )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form Tambah/Edit Lagu */}
                    <div className="card-bg rounded-3xl shadow-lg p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/50 rounded-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <FaMusic /> {editingId ? 'Edit Lagu' : 'Tambah Lagu Baru'}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Judul Lagu"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition bg-white"
                                    required
                                />
                                
                                <input
                                    type="text"
                                    name="artist"
                                    placeholder="Nama Artis"
                                    value={formData.artist}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition bg-white"
                                    required
                                />
                                
                                <input
                                    type="url"
                                    name="url"
                                    placeholder="URL Lagu (opsional, .mp3)"
                                    value={formData.url}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition bg-white"
                                />
                                
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="fileUpload"
                                        accept="audio/*,image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="fileUpload"
                                        className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition bg-white"
                                    >
                                        <FaUpload className="text-2xl text-gray-400" />
                                        <span className="text-sm text-gray-500">{fileName || 'Upload file MP3 atau Cover'}</span>
                                    </label>
                                </div>
                                
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
                                >
                                    <FaSave /> {editingId ? 'Update Lagu' : 'Simpan Lagu'}
                                </button>
                                
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition"
                                    >
                                        Batal Edit
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                    
                    {/* Daftar Lagu */}
                    <div className="card-bg rounded-3xl shadow-lg p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/50 rounded-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                Daftar Lagu {filteredSongs.length > 0 && `(${filteredSongs.length})`}
                            </h2>
                            
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {filteredSongs.length === 0 ? (
                                    <div className="text-center text-white/70 py-8">
                                        {searchQuery ? (
                                            <>
                                                <i className="fas fa-search text-3xl mb-2 block"></i>
                                                <p>Tidak ada lagu yang cocok dengan "{searchQuery}"</p>
                                                <Link to="/admin-songs" className="text-orange-400 text-sm mt-2 inline-block">
                                                    Clear search
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-music text-3xl mb-2 block"></i>
                                                <p>Belum ada lagu. Tambahkan lagu baru!</p>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    filteredSongs.map(song => (
                                        <div key={song.id} className="bg-white rounded-xl p-4 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{song.title}</h4>
                                                <p className="text-sm text-gray-500">{song.artist}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(song)}
                                                    className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 hover:bg-orange-500 hover:text-white transition flex items-center justify-center"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(song.id, song.title)}
                                                    className="w-8 h-8 rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminSongs;
