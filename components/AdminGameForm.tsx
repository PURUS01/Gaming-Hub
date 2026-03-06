'use client';

import { Game } from '@/types';
import { useState, useEffect } from 'react';
import { addGame, updateGame, getGames } from '@/lib/storage';

interface AdminGameFormProps {
  game?: Game | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function AdminGameForm({ game, onSave, onCancel }: AdminGameFormProps) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    shortDescription: '',
    fullDescription: '',
    thumbnail: '',
    banner: '',
    category: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    tags: '',
    featured: false,
    minPlayers: 2,
    maxPlayers: 2,
    status: 'beta' as 'live' | 'beta' | 'coming-soon',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (game) {
      setFormData({
        id: game.id,
        title: game.title,
        shortDescription: game.shortDescription,
        fullDescription: game.fullDescription,
        thumbnail: game.thumbnail,
        banner: game.banner,
        category: game.category,
        difficulty: game.difficulty,
        tags: game.tags.join(', '),
        featured: game.featured,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        status: game.status,
      });
    } else {
      setFormData({
        id: '',
        title: '',
        shortDescription: '',
        fullDescription: '',
        thumbnail: '',
        banner: '',
        category: '',
        difficulty: 'Easy',
        tags: '',
        featured: false,
        minPlayers: 2,
        maxPlayers: 2,
        status: 'beta',
      });
    }
    setErrors({});
    setSuccess(false);
  }, [game]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.id.trim()) newErrors.id = 'ID is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!formData.fullDescription.trim()) newErrors.fullDescription = 'Full description is required';
    if (!formData.thumbnail.trim()) newErrors.thumbnail = 'Thumbnail URL is required';
    if (!formData.banner.trim()) newErrors.banner = 'Banner URL is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';

    if (!game) {
      const existingGames = getGames();
      if (existingGames.some(g => g.id === formData.id)) {
        newErrors.id = 'ID already exists';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const gameData: Game = {
      id: formData.id,
      title: formData.title,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription,
      thumbnail: formData.thumbnail,
      banner: formData.banner,
      category: formData.category,
      difficulty: formData.difficulty,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      featured: formData.featured,
      multiplayer: true,
      authRequired: true,
      minPlayers: formData.minPlayers,
      maxPlayers: formData.maxPlayers,
      status: formData.status,
      playCount: game?.playCount || 0,
      lastPlayed: game?.lastPlayed,
    };

    if (game) {
      updateGame(gameData);
    } else {
      addGame(gameData);
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onSave();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        {game ? 'Edit Game' : 'Add New Game'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ID <span className="text-red-400">*</span>
            {game?.status === 'live' && (
              <span className="ml-2 px-2 py-0.5 bg-gaming-purple/20 text-gaming-purple text-xs rounded">
                Live
              </span>
            )}
          </label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            disabled={!!game}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple ${
              errors.id ? 'border-red-500' : 'border-gray-700'
            } ${game ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {errors.id && <p className="text-red-400 text-xs mt-1">{errors.id}</p>}
          {game?.status === 'live' && (
            <p className="text-gray-500 text-xs mt-1">Live games cannot have their ID changed</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple ${
              errors.title ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Short Description <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple ${
              errors.shortDescription ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          {errors.shortDescription && <p className="text-red-400 text-xs mt-1">{errors.shortDescription}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple ${
              errors.category ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="action, puzzle, multiplayer"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Thumbnail URL <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple ${
              errors.thumbnail ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          {errors.thumbnail && <p className="text-red-400 text-xs mt-1">{errors.thumbnail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Banner URL <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={formData.banner}
            onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple ${
              errors.banner ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          {errors.banner && <p className="text-red-400 text-xs mt-1">{errors.banner}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Min Players
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={formData.minPlayers}
            onChange={(e) => setFormData({ ...formData, minPlayers: parseInt(e.target.value) || 2 })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Max Players
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={formData.maxPlayers}
            onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 2 })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'live' | 'beta' | 'coming-soon' })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple"
          >
            <option value="live">Live</option>
            <option value="beta">Beta</option>
            <option value="coming-soon">Coming Soon</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="w-4 h-4 text-gaming-purple bg-gray-800 border-gray-700 rounded focus:ring-gaming-purple"
          />
          <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-300">
            Featured
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Full Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.fullDescription}
          onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
          rows={4}
          className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gaming-purple ${
            errors.fullDescription ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.fullDescription && <p className="text-red-400 text-xs mt-1">{errors.fullDescription}</p>}
      </div>

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded-lg">
          {game ? 'Game updated successfully!' : 'Game added successfully!'}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="submit"
          className="flex-1 bg-gaming-purple hover:bg-gaming-purple/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {game ? 'Update Game' : 'Add Game'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
