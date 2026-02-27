import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { moviesApi } from "@/services/api" // adjust path if needed
import type { Movie } from "@/types/api"

export default function CommunityPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await moviesApi.getMovies()
        setMovies(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <><div>
      {movies.map((movie) => (
        <div key={movie.id}>
          <h2>{movie.title}</h2>
          <p>{movie.synopsis}</p>
        </div>
      ))}
    </div><div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen px-32 bg-white/70 backdrop-blur-md py-12">
          <Card className="size-full">
            <Card className="max-w-3xl min-h-screen shadow-lg">

            </Card>
          </Card>
        </div>
      </div></>
  )};
