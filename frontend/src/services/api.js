import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Songs API
export const getSongs = () => api.get('/songs').then(res => res.data);
export const createSong = (formData) => api.post('/songs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);
export const updateSong = (id, data) => api.put(`/songs/${id}`, data).then(res => res.data);
export const deleteSong = (id) => api.delete(`/songs/${id}`).then(res => res.data);
export const getUserPlaylist = () => api.get('/songs/user-playlist').then(res => res.data);
export const addToUserPlaylist = (songId) => api.post(`/songs/${songId}/add-to-playlist`).then(res => res.data);
export const removeFromUserPlaylist = (songId) => api.delete(`/songs/${songId}/remove-from-playlist`).then(res => res.data);
export const toggleLike = (songId) => api.post(`/songs/${songId}/toggle-like`).then(res => res.data);
export const recordPlay = (songId) => api.post(`/songs/${songId}/play`).then(res => res.data);
export const getMostPlayed = () => api.get('/songs/most-played').then(res => res.data);

// Lyrics API
export const getLyrics = (songId) => api.get(`/lyrics/${songId}`).then(res => res.data);
export const saveLyrics = (songId, lyrics) => api.post(`/lyrics/${songId}`, lyrics).then(res => res.data);
export const deleteLyrics = (songId) => api.delete(`/lyrics/${songId}`).then(res => res.data);

// Categories API
export const getCategories = () => api.get('/categories').then(res => res.data);
export const createCategory = (name) => api.post('/categories', { name }).then(res => res.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then(res => res.data);
export const getSongsByCategory = (categoryId) => api.get(`/categories/${categoryId}/songs`).then(res => res.data);
export const addSongToCategory = (categoryId, songId) => api.post(`/categories/${categoryId}/songs/${songId}`).then(res => res.data);
export const removeSongFromCategory = (categoryId, songId) => api.delete(`/categories/${categoryId}/songs/${songId}`).then(res => res.data);