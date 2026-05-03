import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaBackward, FaForward, FaMicrophoneAlt, FaExclamationTriangle, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { usePlayer } from '../contexts/PlayerContext';

const NowPlaying = () => {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        lyrics,
        error,
        audioRef,
        togglePlayPause,
        nextSong,
        prevSong,
        seekTo,
        formatTime,
    } = usePlayer();

    const [sliderValue, setSliderValue] = useState(0);
    const [isSliderDragging, setIsSliderDragging] = useState(false);
    const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
    const [showLyrics, setShowLyrics] = useState(false); // Default: lirik TIDAK tampil
    const [lyricsHeight, setLyricsHeight] = useState(250);

    const lyricsContainerRef = useRef(null);

    // Update slider value
    useEffect(() => {
        if (duration > 0 && !isSliderDragging) {
            setSliderValue((currentTime / duration) * 100);
        }
    }, [currentTime, duration, isSliderDragging]);

    // Update active lyric based on current time (hanya jika lirik ditampilkan)
    useEffect(() => {
        if (!showLyrics) return;
        if (!lyrics || lyrics.length === 0) {
            setActiveLyricIndex(-1);
            return;
        }

        // Cari lirik yang aktif berdasarkan waktu
        let activeIndex = -1;
        for (let i = 0; i < lyrics.length; i++) {
            if (currentTime >= lyrics[i].time) {
                activeIndex = i;
            } else {
                break;
            }
        }

        if (activeIndex !== activeLyricIndex) {
            setActiveLyricIndex(activeIndex);

            // Auto scroll ke lirik yang aktif
            if (activeIndex !== -1 && lyricsContainerRef.current) {
                const activeElement = document.getElementById(`lyric-${activeIndex}`);
                if (activeElement) {
                    activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }, [currentTime, lyrics, activeLyricIndex, showLyrics]);

    // Slider handlers
    const handleSliderChange = (e) => {
        const value = parseFloat(e.target.value);
        setSliderValue(value);
        if (!isSliderDragging) setIsSliderDragging(true);
    };

    const handleSliderEnd = () => {
        if (duration && !isNaN(duration)) {
            const newTime = (sliderValue / 100) * duration;
            seekTo(newTime);
        }
        setIsSliderDragging(false);
    };

    // Toggle lyrics panel
    const toggleLyricsPanel = () => {
        setShowLyrics(!showLyrics);
    };

    // Klik lirik untuk lompat ke waktu tersebut
    const handleLyricClick = (time) => {
        if (audioRef.current && !isNaN(time)) {
            seekTo(time);
            if (!isPlaying) togglePlayPause();
        }
    };

    if (!currentSong) return null;

    return (
        <div className="sticky bottom-0 left-0 right-0 z-[1001] shadow-2xl">
            {/* MAIN PLAYER BAR */}
            <div className="card-bg bg-cover bg-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40" />

                <div className="relative z-10 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
                    {/* Info Lagu */}
                    <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                            {currentSong.cover_url || currentSong.coverUrl ? (
                                <img
                                    src={currentSong.cover_url || currentSong.coverUrl}
                                    alt={currentSong.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        const parent = e.target.parentElement;
                                        if (parent) {
                                            parent.innerHTML = '<i class="fas fa-music text-white text-xl"></i>';
                                        }
                                    }}
                                />
                            ) : (
                                <i className="fas fa-music text-white text-xl"></i>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-white font-semibold text-sm truncate max-w-[140px]">{currentSong.title}</h4>
                            <p className="text-white/60 text-xs truncate">{currentSong.artist}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={prevSong}
                            className="text-white/80 hover:text-white hover:scale-110 transition text-lg"
                        >
                            <FaBackward />
                        </button>
                        <button
                            onClick={togglePlayPause}
                            className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center text-white hover:scale-110 hover:border-orange-500 transition"
                        >
                            {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
                        </button>
                        <button
                            onClick={nextSong}
                            className="text-white/80 hover:text-white hover:scale-110 transition text-lg"
                        >
                            <FaForward />
                        </button>

                        {/* Timeline */}
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-white/70 text-xs min-w-[35px]">{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                value={sliderValue}
                                onChange={handleSliderChange}
                                onMouseUp={handleSliderEnd}
                                onTouchEnd={handleSliderEnd}
                                className="w-32 lg:w-48 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
                                step="0.01"
                                disabled={!duration || isNaN(duration)}
                            />
                            <span className="text-white/70 text-xs min-w-[35px]">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Tombol Toggle Lyrics */}
                    <button
                        onClick={toggleLyricsPanel}
                        className={`text-sm flex items-center gap-1 px-3 py-1.5 rounded-full transition ${showLyrics
                            ? 'bg-orange-500 text-white'
                            : 'text-white/70 hover:text-white bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        <FaMicrophoneAlt className="text-xs" />
                        <span className="text-xs hidden sm:inline">Lirik</span>
                        {showLyrics ? <FaChevronDown className="text-xs" /> : <FaChevronUp className="text-xs" />}
                    </button>
                </div>

                {/* Timeline untuk mobile (di bawah) */}
                <div className="relative z-10 px-4 pb-3 flex md:hidden items-center gap-2">
                    <span className="text-white/70 text-xs min-w-[35px]">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        onMouseUp={handleSliderEnd}
                        onTouchEnd={handleSliderEnd}
                        className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
                        step="0.01"
                        disabled={!duration || isNaN(duration)}
                    />
                    <span className="text-white/70 text-xs min-w-[35px]">{formatTime(duration)}</span>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="relative z-10 bg-red-500/80 text-white text-xs text-center py-1">
                        <FaExclamationTriangle className="inline mr-1" /> {error}
                    </div>
                )}
            </div>

            {/* LYRICS PANEL - HANYA MUNCUL SAAT TOMBOL LIRIK DI KLIK */}
            {showLyrics && (
                <div
                    className="bg-black/90 backdrop-blur-md border-t border-white/10 transition-all overflow-y-auto"
                    style={{
                        maxHeight: lyricsHeight,
                        height: lyricsHeight,
                        overflowY: 'auto'
                    }}
                >
                    {/* Header Lyrics Panel */}
                    <div className="sticky top-0 bg-black/90 px-4 py-2 border-b border-white/10 z-10">
                        <div className="flex justify-between items-center text-white/70 text-xs">
                            <h4 className="flex items-center gap-2">
                                <FaMicrophoneAlt className="text-orange-500" />
                                <span>Lirik - {currentSong?.title}</span>
                            </h4>
                            <div className="flex items-center gap-3">
                                <span>{lyrics?.length || 0} baris</span>
                                <button
                                    onClick={toggleLyricsPanel}
                                    className="hover:text-orange-400 transition"
                                    title="Tutup"
                                >
                                    <FaChevronDown />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Konten Lirik */}
                    <div className="py-3 pb-6" ref={lyricsContainerRef}>
                        {!lyrics || lyrics.length === 0 ? (
                            <div className="text-center py-10 text-white/50 text-sm">
                                <i className="fas fa-file-alt text-3xl mb-3 block"></i>
                                <p>Belum ada lirik untuk lagu ini</p>
                                <p className="text-xs mt-2">Masuk sebagai Admin untuk menambahkan lirik</p>
                            </div>
                        ) : (
                            lyrics.map((lyric, idx) => {
                                const mins = Math.floor(lyric.time / 60);
                                const secs = Math.floor(lyric.time % 60);
                                const isActive = idx === activeLyricIndex;

                                return (
                                    <div
                                        key={idx}
                                        id={`lyric-${idx}`}
                                        onClick={() => handleLyricClick(lyric.time)}
                                        className={`flex items-center gap-3 px-4 py-2 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-200
                                            ${isActive
                                                ? 'bg-orange-500/30 text-orange-400 border-l-4 border-orange-500 font-medium shadow-lg'
                                                : 'text-white/60 hover:bg-white/10 hover:translate-x-1'
                                            }`}
                                    >
                                        <span className={`font-mono text-xs min-w-[45px] ${isActive ? 'text-orange-400' : 'text-white/40'}`}>
                                            {mins}:{secs < 10 ? '0' : ''}{secs}
                                        </span>
                                        <span className="flex-1 text-sm">{lyric.text}</span>
                                        {isActive && (
                                            <span className="text-xs text-orange-400 animate-pulse ml-2">▶</span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NowPlaying;
