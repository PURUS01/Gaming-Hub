'use client';

import { useState, useEffect, useMemo } from 'react';
import { getGames, initializeGames } from '@/lib/storage';
import { Game } from '@/types';
import SearchAndFilterBar from '@/components/SearchAndFilterBar';
import GameGrid from '@/components/GameGrid';

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    initializeGames();
    setGames(getGames());
  }, [refreshKey]);

  const filteredGames = useMemo(() => {
    let filtered = games;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(query) ||
        game.category.toLowerCase().includes(query) ||
        game.tags.some(tag => tag.toLowerCase().includes(query)) ||
        game.shortDescription.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(game => game.category === selectedCategory);
    }

    return filtered;
  }, [games, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(games.map(game => game.category));
    return Array.from(cats).sort();
  }, [games]);

  const handleFavoriteToggle = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gaming-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Multiplayer Games</h1>
          <p className="text-sm sm:text-base text-gray-400">Choose a game to create or join a room</p>
        </div>

        <div className="mb-6">
          <SearchAndFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
          />
        </div>

        {filteredGames.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-gray-400">No games found matching your search.</p>
          </div>
        ) : (
          <GameGrid games={filteredGames} onFavoriteToggle={handleFavoriteToggle} />
        )}
      </div>
    </div>
  );
}
