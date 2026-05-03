import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaBackward, FaForward, FaMicrophoneAlt, FaExclamationTriangle, FaChevronUp, FaChevronDown, FaRandom, FaList, FaTrash } from 'react-icons/fa';
import { usePlayer } from '../contexts/PlayerContext';

const NowPlaying = () => {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        lyrics,
        queue,
        isShuffle,
        error,
        audioRef,
        togglePlayPause,
        nextSong,
        prevSong,
        seekTo,
        formatTime,
        toggleShuffle,
        clearQueue,
        removeFromQueue
    } = usePlayer();

    const [sliderValue, setSliderValue] = useState(0);
    const [isSliderDragging, setIsSliderDragging] = useState(false);
    const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
    const [showLyrics, setShowLyrics] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [lyricsHeight, setLyricsHeight] = useState(250);

    const lyricsContainerRef = useRef(null);

    useEffect(() => {
        if (duration > 0 && !isSliderDragging) {
            setSliderValue((currentTime / duration) * 100);
        }
    }, [currentTime, duration, isSliderDragging]);

    useEffect(() => {
        if (!showLyrics) return;
        if (!lyrics || lyrics.length === 0) {
            setActiveLyricIndex(-1);
            return;
        }

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
            if (activeIndex !== -1 && lyricsContainerRef.current) {
                const activeElement = document.getElementById(`lyric-${activeIndex}`);
                if (activeElement) {
                    activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }, [currentTime, lyrics, activeLyricIndex, showLyrics]);

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
                        {/* Shuffle Button */}
                        <button
                            onClick={toggleShuffle}
                            className={`transition text-lg ${isShuffle ? 'text-orange-500' : 'text-white/60 hover:text-white'}`}
                            title="Putar Acak"
                        >
                            <FaRandom />
                        </button>

                        <button onClick={prevSong} className="text-white/80 hover:text-white hover:scale-110 transition text-lg">
                            <FaBackward />
                        </button>
                        <button onClick={togglePlayPause} className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center text-white hover:scale-110 hover:border-orange-500 transition">
                            {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
                        </button>
                        <button onClick={nextSong} className="text-white/80 hover:text-white hover:scale-110 transition text-lg">
                            <FaForward />
                        </button>

                        {/* Queue Button */}
                        <button
                            onClick={() => setShowQueue(!showQueue)}
                            className={`transition text-lg relative ${showQueue ? 'text-orange-500' : 'text-white/60 hover:text-white'}`}
                            title="Antrian"
                        >
                            <FaList />
                            {queue.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {queue.length}
                                </span>
                            )}
                        </button>

                        {/* Timeline Desktop */}
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-white/70 text-xs min-w-[35px]">{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                value={sliderValue}
                                onChange={handleSliderChange}
                                onMouseUp={handleSliderEnd}
                                onTouchEnd={handleSliderEnd}
                                className="w-32 lg:w-48 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                                step="0.01"
                                disabled={!duration || isNaN(duration)}
                            />
                            <span className="text-white/70 text-xs min-w-[35px]">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Tombol Toggle Lyrics */}
                    <button
                        onClick={() => setShowLyrics(!showLyrics)}
                        className={`text-sm flex items-center gap-1 px-3 py-1.5 rounded-full transition ${showLyrics ? 'bg-orange-500 text-white' : 'text-white/70 hover:text-white bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        <FaMicrophoneAlt className="text-xs" />
                        <span className="text-xs hidden sm:inline">Lirik</span>
                        {showLyrics ? <FaChevronDown className="text-xs" /> : <FaChevronUp className="text-xs" />}
                    </button>
                </div>

                {/* Timeline Mobile */}
                <div className="relative z-10 px-4 pb-3 flex md:hidden items-center gap-2">
                    <span className="text-white/70 text-xs min-w-[35px]">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        onMouseUp={handleSliderEnd}
                        onTouchEnd={handleSliderEnd}
                        className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                        step="0.01"
                        disabled={!duration || isNaN(duration)}
                    />
                    <span className="text-white/70 text-xs min-w-[35px]">{formatTime(duration)}</span>
                </div>

                {error && (
                    <div className="relative z-10 bg-red-500/80 text-white text-xs text-center py-1">
                        <FaExclamationTriangle className="inline mr-1" /> {error}
                    </div>
                )}
            </div>

            {/* QUEUE PANEL */}
            {showQueue && (
                <div className="bg-black/95 backdrop-blur-md border-t border-white/10 max-h-80 overflow-y-auto">
                    <div className="sticky top-0 bg-black/95 px-4 py-2 border-b border-white/10 flex justify-between items-center">
                        <h4 className="text-white text-sm flex items-center gap-2">
                            <FaList className="text-orange-500" />
                            Antrian ({queue.length} lagu)
                        </h4>
                        {queue.length > 0 && (
                            <button onClick={clearQueue} className="text-red-400 text-xs hover:text-red-300 flex items-center gap-1">
                                <FaTrash className="text-xs" /> Kosongkan
                            </button>
                        )}
                    </div>
                    <div className="py-2">
                        {queue.length === 0 ? (
                            <div className="text-center py-8 text-white/40 text-sm">
                                <FaList className="text-3xl mx-auto mb-2 opacity-50" />
                                Antrian kosong
                                <p className="text-xs mt-1">Klik "Putar Selanjutnya" di lagu mana saja</p>
                            </div>
                        ) : (
                            queue.map((song, idx) => (
                                <div key={idx} className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition group">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-white/40 text-xs w-6">{idx + 1}.</span>
                                        <div className="flex-1">
                                            <p className="text-white text-sm truncate">{song.title}</p>
                                            <p className="text-white/40 text-xs truncate">{song.artist}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromQueue(idx)}
                                        className="text-white/30 hover:text-red-400 transition px-2"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* LYRICS PANEL */}
            {showLyrics && (
                <div className="bg-black/90 backdrop-blur-md border-t border-white/10 transition-all overflow-y-auto" style={{ maxHeight: lyricsHeight }}>
                    <div className="sticky top-0 bg-black/90 px-4 py-2 border-b border-white/10">
                        <div className="flex justify-between items-center text-white/70 text-xs">
                            <h4 className="flex items-center gap-2">
                                <FaMicrophoneAlt className="text-orange-500" />
                                <span>Lirik - {currentSong?.title}</span>
                            </h4>
                            <button onClick={() => setShowLyrics(false)} className="hover:text-white">
                                <FaChevronDown />
                            </button>
                        </div>
                    </div>

                    <div className="py-3 pb-6" ref={lyricsContainerRef}>
                        {!lyrics || lyrics.length === 0 ? (
                            <div className="text-center py-10 text-white/50 text-sm">
                                <i className="fas fa-file-alt text-3xl mb-3 block"></i>
                                <p>Belum ada lirik untuk lagu ini</p>
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
                                        className={`flex items-center gap-3 px-4 py-2 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-200 ${isActive ? 'bg-orange-500/30 text-orange-400 border-l-4 border-orange-500' : 'text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        <span className={`font-mono text-xs min-w-[45px] ${isActive ? 'text-orange-400' : 'text-white/40'}`}>
                                            {mins}:{secs < 10 ? '0' : ''}{secs}
                                        </span>
                                        <span className="flex-1 text-sm">{lyric.text}</span>
                                        {isActive && <span className="text-xs text-orange-400 animate-pulse">▶</span>}
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
