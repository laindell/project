'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Music, User, Globe } from 'lucide-react';
import fetchClient from '@/other/fetchClient';
import Image from 'next/image';

// Типи для пісень
interface SongStyle {
  id: number;
  name: string;
}

interface SongLyrics {
  id: number;
  title: string;
  content: string;
}

export interface Song {
  id: string;
  task_id: string;
  model_name: string;
  title: string;
  audio_file: string;
  photo_file: string;
  example?: string;
  styles?: SongStyle[];
  created_at: string;
  is_public?: boolean;
  lyrics?: SongLyrics;
}

interface SongsListProps {
  onSelect: (song: Song) => void;
  onClose: () => void;
  initialTab?: 'user' | 'public';
  songs?: Song[]; // Додаємо необов'язковий проп для передачі списку пісень
}

const SongsList: React.FC<SongsListProps> = ({ 
  onSelect, 
  onClose,
  initialTab = 'user',
  songs: propSongs
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'user' | 'public'>(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Функція для завантаження пісень користувача
  const fetchUserSongs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // Очищаємо попередній список при зміні на пісні користувача
    setSongs([]);
    setFilteredSongs([]);
    
    try {
      const response = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/songs/`
      );
      
      if (!response.ok) {
        throw new Error('Не вдалося отримати пісні');
      }
      
      const data = await response.json();
      if (data.success && Array.isArray(data.songs)) {
        setSongs(data.songs);
        setFilteredSongs(data.songs);
      } else {
        setSongs([]);
        setFilteredSongs([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка завантаження пісень');
      setSongs([]);
      setFilteredSongs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Функція для завантаження публічних пісень
  const fetchPublicSongs = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    // Очищаємо попередній список при зміні на публічні пісні
    setSongs([]);
    setFilteredSongs([]);
    
    try {
      const response = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/public/songs/?page=${page}&page_size=10`
      );
      
      if (!response.ok) {
        throw new Error('Не вдалося отримати публічні пісні');
      }
      
      const data = await response.json();
      if (data.success && Array.isArray(data.songs)) {
        setSongs(data.songs);
        setFilteredSongs(data.songs);
        
        // Встановлюємо пагінацію
        if (data.pagination) {
          setCurrentPage(data.pagination.page);
          setTotalPages(data.pagination.total_pages);
        }
      } else {
        setSongs([]);
        setFilteredSongs([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка завантаження публічних пісень');
      setSongs([]);
      setFilteredSongs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ефект для завантаження пісень при першому рендері або зміні вкладки
  useEffect(() => {
    // Якщо передано список пісень напряму і ми на вкладці користувача,
    // використовуємо їх замість завантаження
    if (propSongs && activeTab === 'user') {
      setSongs(propSongs);
      setFilteredSongs(propSongs);
      setIsLoading(false);
      return;
    }
    
    // В іншому випадку, завантажуємо відповідні пісні
    if (activeTab === 'user') {
      if (!propSongs) {
        fetchUserSongs();
      }
    } else {
      // Для публічних пісень завжди робимо окремий запит 
      fetchPublicSongs(1);
    }
  }, [activeTab, fetchUserSongs, fetchPublicSongs, propSongs]);

  // Ефект для фільтрації пісень при зміні рядка пошуку
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = songs.filter(song => 
      song.title.toLowerCase().includes(query) || 
      song.model_name.toLowerCase().includes(query) ||
      (song.styles && Array.isArray(song.styles) && 
        song.styles.some(style => style && style.name && style.name.toLowerCase().includes(query)))
    );
    
    setFilteredSongs(filtered);
  }, [searchQuery, songs]);

  // Обробник зміни сторінки для публічних пісень
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchPublicSongs(newPage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-3xl rounded-xl bg-[#2C2C3C] p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Вибір пісні</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex mb-4 border-b border-gray-700">
          <button 
            className={`px-4 py-2 ${activeTab === 'user' ? 'border-b-2 border-[#6374B6]' : ''}`}
            onClick={() => {
              if (activeTab !== 'user') {
                setActiveTab('user');
                setIsLoading(true);
                setSearchQuery('');
              }
            }}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Мої пісні</span>
            </div>
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'public' ? 'border-b-2 border-[#6374B6]' : ''}`}
            onClick={() => {
              if (activeTab !== 'public') {
                setActiveTab('public');
                setIsLoading(true);
                setSearchQuery('');
              }
            }}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Публічні пісні</span>
            </div>
          </button>
        </div>

        {/* Пошук */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук пісень..."
            className="w-full rounded-lg bg-[#1A1A2E] py-2 pl-10 pr-4 text-white placeholder-gray-400"
          />
        </div>

        {/* Список пісень */}
        <div className="max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6374B6] border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-400">
              {error}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="py-4 text-center text-gray-400">
              {searchQuery ? "Не знайдено пісень, що відповідають запиту" : "Пісень не знайдено"}
            </div>
          ) : (
            <AnimatePresence>
              {filteredSongs.map((song) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-3 cursor-pointer rounded-lg bg-[#1A1A2E] p-3 hover:bg-[#2A2A3E]"
                  onClick={() => onSelect(song)}
                >
                  <div className="flex gap-3">
                    {song.photo_file ? (
                      <Image 
                        src={`${process.env.NEXT_PUBLIC_API_URL}/media/${song.photo_file}`}
                        alt={song.title}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-700">
                        <Music className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{song.title}</h3>
                      <p className="text-sm text-gray-400">{song.model_name}</p>
                      {song.styles && Array.isArray(song.styles) && song.styles.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {song.styles.map((style, idx) => (
                            <span 
                              key={idx}
                              className="rounded-full bg-[#6374B6]/20 px-2 py-0.5 text-xs text-[#6374B6]"
                            >
                              {style.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {song.is_public === true && (
                      <div className="flex items-start">
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                          Публічна
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Пагінація для публічних пісень */}
        {activeTab === 'public' && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md bg-[#1A1A2E] px-3 py-1 disabled:opacity-50"
            >
              &lt;
            </button>
            <span>
              {currentPage} з {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md bg-[#1A1A2E] px-3 py-1 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SongsList;