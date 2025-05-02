import { Button } from '@mui/material';
import { GridSearchIcon } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react'


interface SearchProps {
    onSearch: (query: string) => void;
}

const Search: React.FC<SearchProps> = ({onSearch}) => {

    const [query, setQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const handler = setTimeout(() => {

            setDebouncedQuery(query.trim());
        }, 500);

       return () => clearTimeout(handler);
    }, [query]);

    useEffect(() => {
        onSearch(debouncedQuery);
    }, [debouncedQuery]);


  return (
    <div className="relative transition-all duration-300 ease-in-out">
    {showSearch ? (
      <input
        autoFocus
        type="text"
        placeholder="Search drivers..."
        className="px-3 py-1 rounded border bg-white dark:bg-gray-600 dark:text-slate-200 w-64"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => {
          if (!query) setShowSearch(false);
        }}
      />
    ) : (
      <Button
        size="medium"
        className='rounded-full'
        variant="contained"
        onClick={() => setShowSearch(true)}
        startIcon={<GridSearchIcon />}
      />
    )}
  </div>
  )
}

export default Search
