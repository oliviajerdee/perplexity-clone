"use client";
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/search', { query });
      setSummary(response.data.summary);
      setResults(response.data.results);
    } catch (err) {
      setError('An error occurred while fetching results. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Perplexity Clone</h1>
      <form onSubmit={handleSubmit} className="mb-4 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          className="border p-2 w-full mb-2"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 text-gray-500"
          >
            &#x2715;
          </button>
        )}
        <button type="submit" className="bg-blue-500 text-white p-2 ml-2">
          Search
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {summary && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">Summary</h2>
          <p>{summary}</p>
        </div>
      )}
      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Sources</h2>
          <ul>
            {results.map((result, index) => (
              <li key={index} className="border-b p-2 flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">
                  {result.number}
                </span>
                <div>
                  <h2 className="font-bold">
                    <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      {result.title}
                    </a>
                  </h2>
                  <p>{result.snippet}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}