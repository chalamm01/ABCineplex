import { useEffect } from "react";

const base_url = import.meta.env.VITE_BASE_URL;

function Movies() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${base_url}/api/movies`);
        const result = await response.json();
        console.log(response);
        console.log(result[0].director);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  return <div className="mt-20">hello</div>;
}

export default Movies;
