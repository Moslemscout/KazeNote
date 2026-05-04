import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Interceptor untuk logging
api.interceptors.request.use(
    (config) => {
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`📥 API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error.config?.url);
        } else if (error.response) {
            console.error(`API Error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
            console.error('No response from server:', error.request);
        } else {
            console.error('API Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// ========== SONGS API ==========
export const getSongs = async () => {
    try {
        const response = await api.get('/songs');
        return response.data;
    } catch (error) {
        console.error('getSongs failed:', error);
        return [];
    }
};

export const createSong = async (formData) => {
    const response = await api.post('/songs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const updateSong = async (id, data) => {
    const response = await api.put(`/songs/${id}`, data);
    return response.data;
};

export const deleteSong = async (id) => {
    const response = await api.delete(`/songs/${id}`);
    return response.data;
};

export const getUserPlaylist = async () => {
    try {
        const response = await api.get('/songs/user-playlist');
        return response.data;
    } catch (error) {
        console.error('getUserPlaylist failed:', error);
        return [];
    }
};

export const addToUserPlaylist = async (songId) => {
    const response = await api.post(`/songs/${songId}/add-to-playlist`);
    return response.data;
};

export const removeFromUserPlaylist = async (songId) => {
    const response = await api.delete(`/songs/${songId}/remove-from-playlist`);
    return response.data;
};

export const toggleLike = async (songId) => {
    const response = await api.post(`/songs/${songId}/toggle-like`);
    return response.data;
};

export const recordPlay = async (songId) => {
    try {
        const response = await api.post(`/songs/${songId}/play`);
        return response.data;
    } catch (error) {
        console.error('recordPlay failed:', error);
        return { success: false };
    }
};

export const getMostPlayed = async () => {
    try {
        const response = await api.get('/songs/most-played');
        return response.data;
    } catch (error) {
        console.error('getMostPlayed failed:', error);
        return [];
    }
};

// ========== LYRICS API ==========
export const getLyrics = async (songId) => {
    if (!songId) {
        console.warn('getLyrics called without songId');
        return [];
    }
    try {
        const response = await api.get(`/lyrics/${songId}`);
        return response.data;
    } catch (error) {
        console.error(`getLyrics failed for song ${songId}:`, error);
        return [];
    }
};

export const saveLyrics = async (songId, lyrics) => {
    const response = await api.post(`/lyrics/${songId}`, lyrics);
    return response.data;
};

export const deleteLyrics = async (songId) => {
    const response = await api.delete(`/lyrics/${songId}`);
    return response.data;
};

// ========== CATEGORIES API ==========
export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error('getCategories failed:', error);
        return [];
    }
};

export const createCategory = async (name) => {
    const response = await api.post('/categories', { name });
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};

export const getSongsByCategory = async (categoryId) => {
    try {
        const response = await api.get(`/categories/${categoryId}/songs`);
        return response.data;
    } catch (error) {
        console.error(`getSongsByCategory failed for ${categoryId}:`, error);
        return [];
    }
};

export const addSongToCategory = async (categoryId, songId) => {
    const response = await api.post(`/categories/${categoryId}/songs/${songId}`);
    return response.data;
};

export const removeSongFromCategory = async (categoryId, songId) => {
    const response = await api.delete(`/categories/${categoryId}/songs/${songId}`);
    return response.data;
};

// ========== HEALTH CHECK ==========
export const checkHealth = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error('Server health check failed:', error);
        return { status: 'error', message: 'Server offline' };
    }
};

export default api;