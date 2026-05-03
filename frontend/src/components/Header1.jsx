import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeadphones, FaHome, FaMusic, FaList, FaSearch } from 'react-icons/fa';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-48 bg-cover bg-center rounded-b-[40px] shadow-2xl z-50 card-bg">
            <div className="absolute inset-0 bg-gradient-to-br from-black/45 to-black/20 rounded-b-[40px]" />

            <div className="relative h-full flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <FaHeadphones className="text-3xl drop-shadow-lg" />
                        <span className="text-3xl font-bold tracking-tight">KazeNote</span>
                    </div>
                </div>

                <h1 className="text-white text-center text-lg font-light">
                    Enjoy to listen the songs, hope your day feel better
                </h1>

                <div className="flex items-center justify-center gap-8">
                    <Link to="/" className="bg-white text-black px-6 py-2 rounded-full font-medium hover:shadow-lg transition">
                        <FaHome className="inline mr-2" /> Home
                    </Link>

                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/20 backdrop-blur-md border border-white/20 text-white placeholder-white/70 px-5 py-2 rounded-full w-72 focus:w-80 transition-all outline-none"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
                            <FaSearch />
                        </button>
                    </form>

                    <Link to="/songlist" className="bg-white text-black px-6 py-2 rounded-full font-medium hover:shadow-lg transition">
                        <FaList className="inline mr-2" /> Song List
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;