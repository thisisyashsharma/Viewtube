import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  // Debounced search function
  const searchVideos = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await axios.get(`/api/v1/videos/search`, {
        params: { query: query.trim(), limit: 50 },
        withCredentials: true
      });

      const { videos, total } = response.data.data;
      setSearchResults(videos || []);
      setTotalResults(total || 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search videos');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Quick search for instant suggestions (fewer results)
  const quickSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return [];

    try {
      const response = await axios.get(`/api/v1/videos/search`, {
        params: { query: query.trim(), limit: 8 },
        withCredentials: true
      });
      return response.data.data.videos || [];
    } catch (error) {
      console.error('Quick search error:', error);
      return [];
    }
  }, []);

  const clearSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
    setTotalResults(0);
    setSearchError(null);
  };

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        searchQuery,
        setSearchQuery,
        searchVideos,
        quickSearch,
        isSearching,
        searchError,
        totalResults,
        clearSearch
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// ADD THIS LINE - Default export
export default SearchProvider;