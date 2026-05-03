import React, { useState } from 'react';
import { FaPlay, FaPause, FaEllipsisV, FaHeart, FaRegHeart, FaFolderOpen, FaPlus, FaShareAlt } from 'react-icons/fa';

const SongCard = ({ song, isPlaying, onPlay, onLike, onAddToPlaylist, onMoveCategory, showMenu = true }) => {
    const [showOptions, setShowOptions] = useState(false);

    const handleAddToPlaylist = (e) => {
        e.stopPropagation();
        if (onAddToPlaylist) {
            onAddToPlaylist(song.id);
        }
        setShowOptions(false);
    };

    const handleShare = (e) => {
        e.stopPropagation();
        const shareUrl = song.url || window.location.href;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert(`Link lagu "${song.title}" disalin!`);
        }).catch(() => {
            alert(`Bagikan lagu: ${song.title}`);
        });
        setShowOptions(false);
    };

    const handlePlayNow = (e) => {
        e.stopPropagation();
        onPlay();
        setShowOptions(false);
    };

    return (
        <div className="relative group">
            <div
                className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer ${isPlaying ? 'ring-2 ring-orange-500' : ''}`}
                onClick={onPlay}
            >
                <div className="relative h-48">
                    <img
                        src={song.cover_url || song.coverUrl || 'https://images.unsplash.com/photo-1590796583326-afd3bb20d22d'}
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
                    {isPlaying && (
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

                        {showMenu && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                                className="text-gray-400 hover:text-orange-500 p-2 transition"
                            >
                                <FaEllipsisV />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onPlay(); }}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
                        >
                            {isPlaying ? <FaPause /> : <FaPlay />}
                            {isPlaying ? 'Playing' : 'Play'}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onLike(); }}
                            className={`w-10 rounded-full flex items-center justify-center transition ${song.is_liked ? 'bg-pink-100 text-pink-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                            {song.is_liked ? <FaHeart /> : <FaRegHeart />}
                        </button>

                        {onAddToPlaylist && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onAddToPlaylist(song.id); }}
                                className="w-10 rounded-full bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-500 transition flex items-center justify-center"
                                title="Tambah ke Songlist"
                            >
                                <FaPlus className="text-sm" />
                            </button>
                        )}

                        {onMoveCategory && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMoveCategory(); }}
                                className="px-3 rounded-full bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-500 transition text-sm flex items-center gap-1"
                            >
                                <FaFolderOpen className="text-xs" /> Pindah
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Dropdown Menu Options */}
            {showOptions && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
                    <div className="absolute right-4 top-20 z-50 bg-white rounded-xl shadow-xl w-44 overflow-hidden border py-1">
                        <button
                            onClick={handleShare}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-500 flex items-center gap-2 transition"
                        >
                            <FaShareAlt className="text-xs" /> Bagikan Lagu
                        </button>
                        <button
                            onClick={handlePlayNow}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-500 flex items-center gap-2 transition"
                        >
                            <FaPlay className="text-xs" /> Putar Sekarang
                        </button>
                        {onAddToPlaylist && (
                            <button
                                onClick={handleAddToPlaylist}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-500 flex items-center gap-2 transition border-t border-gray-100"
                            >
                                <FaPlus className="text-xs" /> Tambah ke Songlist
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SongCard;