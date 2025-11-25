import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchInput);
      setSearchInput(''); // Clear the input after search
    }
  };

  return (
    <input
    className='search-box'
      type="text"
      value={searchInput}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder="Search City..."
    />
  );
};

export default SearchBar;
