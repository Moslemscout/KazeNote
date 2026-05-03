import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeadphones, FaHome, FaMusic, FaList, FaSearch, FaArrowLeft } from 'react-icons/fa';

const AdminHeader = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Tetap di halaman yang sama, hanya update query param
            navigate(`${location.pathname}?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const isAdminSongs = location.pathname === '/admin-songs';
    const isAdminLyrics = location.pathname === '/admin-lyrics';
    const pageTitle = isAdminSongs ? 'Admin - Kelola Lagu' : 'Admin - Kelola Lirik';

    return (
        <header className="fixed top-0 left-0 right-0 h-48 bg-cover bg-center rounded-b-[40px] shadow-2xl z-50 card-bg">
            <div className="absolute inset-0 bg-gradient-to-br from-black/45 to-black/20 rounded-b-[40px]" />

            <div className="relative h-full flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <FaHeadphones className="text-3xl drop-shadow-lg" />
                        <span className="text-3xl font-bold tracking-tight"> Admin KazeNote</span>
                        <span className="text-sm bg-orange-500/80 px-3 py-1 rounded-full ml-2">{pageTitle}</span>
                    </div>

                    <div className="flex gap-3">
                        <Link to="/admin-songs" className={`px-4 py-2 rounded-full text-sm transition ${isAdminSongs ? 'bg-orange-500 text-white' : 'bg-black/50 text-white hover:bg-orange-500'}`}>
                            <FaMusic className="inline mr-2" /> Kelola Lagu
                        </Link>
                        <Link to="/admin-lyrics" className={`px-4 py-2 rounded-full text-sm transition ${isAdminLyrics ? 'bg-orange-500 text-white' : 'bg-black/50 text-white hover:bg-orange-500'}`}>
                            <FaMusic className="inline mr-2" /> Kelola Lirik
                        </Link>
                        <Link to="/" className="bg-white text-black px-4 py-2 rounded-full text-sm hover:shadow-lg transition">
                            <FaHome className="inline mr-2" /> Home
                        </Link>
                    </div>
                </div>

                <h1 className="text-white text-center text-lg font-poppins-regular ">
                    {isAdminSongs ? 'Enjoy to listen the songs, hope your day feel better' : 'Enjoy to listen the songs, hope your day feel better'}
                </h1>

                <div className="flex items-center justify-center gap-8">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder={`Cari ${isAdminSongs ? 'lagu' : 'lirik'}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/20 backdrop-blur-md border border-white/20 text-white placeholder-white/70 px-5 py-2 rounded-full w-80 focus:w-96 transition-all outline-none"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
                            <FaSearch />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
