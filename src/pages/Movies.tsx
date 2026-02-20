"use client"
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  release_date: string;
}

function Movies() {
  const [activeTab, setActiveTab] = useState<'now' | 'coming'>('now');
  const [movies] = useState<Movie[]>([
    {
      id: 1,
      title: 'Inception',
      poster_url: 'https://via.placeholder.com/270x400?text=Inception',
      release_date: '2024-02-15'
    },
    {
      id: 2,
      title: 'The Matrix',
      poster_url: 'https://via.placeholder.com/270x400?text=Matrix',
      release_date: '2024-03-01'
    },
    {
      id: 3,
      title: 'Interstellar',
      poster_url: 'https://via.placeholder.com/270x400?text=Interstellar',
      release_date: '2024-02-20'
    },
    {
      id: 4,
      title: 'Dune',
      poster_url: 'https://via.placeholder.com/270x400?text=Dune',
      release_date: '2024-02-25'
    },
    {
      id: 5,
      title: 'Avatar The Way Of Water',
      poster_url: 'https://via.placeholder.com/270x400?text=Avatar',
      release_date: '2024-03-10'
    },
    {
      id: 6,
      title: 'Oppenheimer',
      poster_url: 'https://via.placeholder.com/270x400?text=Oppenheimer',
      release_date: '2024-03-15'
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-[url('/public/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
        {/* Tab Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('now')}
            className={cn(
              "text-4xl font-medium transition-colors",
              activeTab === 'now'
                ? 'text-primary underline'
                : 'text-primary/30 hover:text-primary/50'
            )}
          >
            Now Showing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coming')}
            className={cn(
              "text-4xl font-medium transition-colors",
              activeTab === 'coming'
                ? 'text-primary underline'
                : 'text-primary/30 hover:text-primary/50'
            )}
          >
            Coming Soon
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="flex flex-col cursor-pointer group">
              {/* Poster */}
              <div className="relative overflow-hidden rounded-lg shadow-lg mb-3 aspect-[27/40] bg-gray-200">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Title and Date */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-xl text-foreground flex-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {movie.title}
                </h3>
                <p className="text-md text-muted-foreground whitespace-nowrap shrink-0">
                  {formatDate(movie.release_date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Movies;
