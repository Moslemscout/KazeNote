import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaSave, FaTrash, FaEye, FaMusic, FaSearch } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import { getSongs, getLyrics, saveLyrics, deleteLyrics } from '../services/api';

const AdminLyrics = () => {
    const [searchParams] = useSearchParams();
    const [songs, setSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [selectedSong, setSelectedSong] = useState(null);
    const [lyricsText, setLyricsText] = useState('');
    const [previewLyrics, setPreviewLyrics] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        loadSongs();
    }, []);

    useEffect(() => {
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

    const handleSongSelect = async (songId) => {
        const song = songs.find(s => s.id === songId);
        setSelectedSong(song);
        
        try {
            const lyrics = await getLyrics(songId);
            if (lyrics && lyrics.length > 0) {
                const text = lyricsToText(lyrics);
                setLyricsText(text);
                setPreviewLyrics(lyrics);
            } else {
                setLyricsText('');
                setPreviewLyrics([]);
            }
        } catch (error) {
            console.error('Error loading lyrics:', error);
        }
    };

    const parseLyricsText = (text) => {
        const lines = text.trim().split('\n');
        const lyrics = [];
        
        for (const line of lines) {
            if (line.trim() === '') continue;
            const match = line.match(/^(\d+):(\d+)\s*-\s*(.+)$/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const time = minutes * 60 + seconds;
                const lyricText = match[3].trim();
                if (lyricText) {
                    lyrics.push({ time, text: lyricText });
                }
            }
        }
        return lyrics;
    };

    const lyricsToText = (lyrics) => {
        if (!lyrics || lyrics.length === 0) return '';
        return lyrics.map(lyric => {
            const mins = Math.floor(lyric.time / 60);
            const secs = lyric.time % 60;
            return `${mins}:${secs < 10 ? '0' : ''}${secs} - ${lyric.text}`;
        }).join('\n');
    };

    const handleSave = async () => {
        if (!selectedSong) {
            alert('Pilih lagu terlebih dahulu!');
            return;
        }
        
        const parsed = parseLyricsText(lyricsText);
        if (parsed.length === 0) {
            alert('Format lirik salah! Gunakan format: MM:SS - lirik');
            return;
        }
        
        try {
            await saveLyrics(selectedSong.id, parsed);
            setPreviewLyrics(parsed);
            alert('Lirik berhasil disimpan!');
        } catch (error) {
            console.error('Error saving lyrics:', error);
            alert('Gagal menyimpan lirik');
        }
    };

    const handleDelete = async () => {
        if (!selectedSong) {
            alert('Pilih lagu terlebih dahulu!');
            return;
        }
        
        if (confirm('Hapus lirik custom? Lagu akan menggunakan lirik default.')) {
            try {
                await deleteLyrics(selectedSong.id);
                setLyricsText('');
                setPreviewLyrics([]);
                alert('Lirik berhasil dihapus');
            } catch (error) {
                console.error('Error deleting lyrics:', error);
                alert('Gagal menghapus lirik');
            }
        }
    };

    if (loading) {
        return (
            <>
                <AdminHeader />
                <div className="pt-56 pb-8 px-8 max-w-7xl mx-auto">
                    <div className="text-center py-12">Memuat data lirik...</div>
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
                        Kelola Lirik
                        {searchQuery && (
                            <span className="text-sm font-normal text-gray-500 ml-3">
                                Hasil pencarian: "{searchQuery}" ({filteredSongs.length} lagu)
                            </span>
                        )}
                    </h2>
                    {searchQuery && (
                        <Link to="/admin-lyrics" className="text-orange-500 hover:text-orange-600 text-sm">
                            Clear search
                        </Link>
                    )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Editor Lirik */}
                    <div className="card-bg rounded-3xl shadow-lg p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/50 rounded-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <FaSave /> Edit Lirik
                            </h2>
                            
                            <select
                                onChange={(e) => handleSongSelect(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition bg-white"
                                defaultValue=""
                            >
                                <option value="">-- Pilih Lagu --</option>
                                {filteredSongs.map(song => (
                                    <option key={song.id} value={song.id}>
                                        {song.title} - {song.artist}
                                    </option>
                                ))}
                            </select>
                            
                            {selectedSong && (
                                <div className="mb-3 p-2 bg-orange-50 rounded-lg text-sm text-orange-600">
                                    <FaMusic className="inline mr-1" /> Mengedit lirik untuk: <strong>{selectedSong.title}</strong> - {selectedSong.artist}
                                </div>
                            )}
                            
                            <textarea
                                value={lyricsText}
                                onChange={(e) => setLyricsText(e.target.value)}
                                placeholder="0:00 - Selamat datang di music player&#10;0:03 - Dengan lirik yang tersinkronisasi&#10;0:06 - Malam ini ku bermimpi"
                                className="w-full h-96 px-4 py-3 rounded-xl border border-gray-300 font-mono text-sm resize-y focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition bg-white"
                            />
                            
                            <div className="text-xs text-white/70 mt-2 p-2 bg-black/30 rounded-lg">
                                <i className="fas fa-info-circle"></i> Format: menit:detik - lirik<br />
                                Contoh: 0:00 - Selamat datang | 1:30 - Reff: Kau begitu sempurna
                            </div>
                            
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
                                >
                                    <FaSave /> Simpan Lirik
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 bg-red-500 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition"
                                >
                                    <FaTrash /> Hapus Lirik
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Preview Lirik */}
                    <div className="card-bg rounded-3xl shadow-lg p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/50 rounded-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <FaEye /> Preview Lirik
                            </h2>
                            
                            <div className="bg-black/40 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                                {selectedSong ? (
                                    previewLyrics.length === 0 ? (
                                        <div className="text-center text-white/50 py-8">
                                            <FaMusic className="text-4xl mx-auto mb-2" />
                                            <p>Belum ada lirik untuk lagu ini</p>
                                            <p className="text-xs mt-2">Gunakan editor di samping untuk menambahkan lirik</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-center text-orange-400 text-sm mb-3 pb-2 border-b border-orange-500/30">
                                                Lirik untuk: {selectedSong.title}
                                            </div>
                                            {previewLyrics.map((lyric, idx) => {
                                                const mins = Math.floor(lyric.time / 60);
                                                const secs = lyric.time % 60;
                                                return (
                                                    <div key={idx} className="py-2 border-b border-white/10 hover:bg-white/5 transition px-2 rounded">
                                                        <span className="text-orange-400 inline-block w-12 font-mono text-sm">
                                                            {mins}:{secs < 10 ? '0' : ''}{secs}
                                                        </span>
                                                        <span className="text-white/80 text-sm">{lyric.text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center text-white/50 py-8">
                                        <FaMusic className="text-4xl mx-auto mb-2" />
                                        <p>Pilih lagu terlebih dahulu</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLyrics;
