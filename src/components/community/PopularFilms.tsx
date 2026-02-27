// src/components/community/PopularFilms.tsx
import { ChevronRight } from "lucide-react"

interface Film {
  id: string
  title: string
  poster: string
}

interface PopularFilmsProps {
  films: Film[]
}

export function PopularFilms({ films }: PopularFilmsProps) {
  return (
    <section>
      <h2 className="text-xl font-black tracking-widest uppercase mb-4">Popular Films</h2>
      <div className="flex items-center gap-2">
        {films.map((film) => (
          <div
            key={film.id}
            className="cursor-pointer group overflow-hidden rounded shadow-md hover:shadow-xl transition-shadow"
          >
            <img
              src={film.poster}
              alt={film.title}
              className="w-[90px] h-[130px] object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        ))}
        <button className="ml-1 p-1 rounded-full hover:bg-gray-200 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </section>
  )
}
