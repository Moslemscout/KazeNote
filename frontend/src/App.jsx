import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminSongs from './pages/AdminSongs';
import AdminLyrics from './pages/AdminLyrics';
import SongList from './pages/SongList';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin-songs" element={<AdminSongs />} />
            <Route path="/admin-lyrics" element={<AdminLyrics />} />
            <Route path="/songlist" element={<SongList />} />
        </Routes>
    );
}

export default App;