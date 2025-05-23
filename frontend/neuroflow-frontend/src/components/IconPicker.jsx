import React, { useState } from 'react';
import axios from 'axios';

const IconPicker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [icons, setIcons] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Unified function to fetch icons from multiple sources
  const fetchIcons = async (query) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try Iconify API (public CDN)
      const iconifyResponse = await axios.get(
        `https://api.iconify.design/search?query=${query}&limit=20`
      );
      
      if (iconifyResponse.data.icons?.length > 0) {
        const formattedIcons = iconifyResponse.data.icons.map(icon => ({
          name: icon,
          url: `https://api.iconify.design/${icon}.svg`
        }));
        setIcons(formattedIcons);
        return;
      }
      
      // If Iconify fails, try OpenMoji
      const openmojiResponse = await axios.get(
        `https://openmoji-api.vercel.app/search?q=${query}`
      );
      
      if (openmojiResponse.data?.length > 0) {
        const formattedIcons = openmojiResponse.data.map(icon => ({
          name: icon.emoji,
          url: `https://openmoji.org/data/color/svg/${icon.hexcode}.svg`
        }));
        setIcons(formattedIcons);
        return;
      }
      
      // If no results from either API
      setIcons([]);
      setError('No icons found. Try a different search term.');
      
    } catch (err) {
      console.error('Icon search error:', err);
      setError('Failed to fetch icons. Please try again.');
      setIcons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchIcons(searchTerm);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center' }}>Icon Picker</h1>
      
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for any icon..."
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          padding: '10px',
          background: '#ffebee',
          color: '#d32f2f',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '15px'
      }}>
        {icons.map((icon, index) => (
          <div
            key={index}
            onClick={() => setSelectedIcon(icon)}
            style={{
              padding: '10px',
              border: selectedIcon?.url === icon.url 
                ? '2px solid #4CAF50' 
                : '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              background: 'white',
              transition: 'all 0.2s',
              ':hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }
            }}
          >
            <img
              src={icon.url}
              alt={icon.name}
              width="60"
              height="60"
              style={{ display: 'block', margin: '0 auto' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/60?text=Icon+Missing';
              }}
            />
            <p style={{
              marginTop: '8px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {icon.name}
            </p>
          </div>
        ))}
      </div>

      {selectedIcon && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          border: '1px solid #4CAF50',
          borderRadius: '8px',
          background: '#f8fff8',
          textAlign: 'center'
        }}>
          <h3>Selected Icon</h3>
          <img
            src={selectedIcon.url}
            alt={selectedIcon.name}
            width="80"
            height="80"
            style={{ margin: '15px auto' }}
          />
          <p style={{ fontFamily: 'monospace' }}>
            {selectedIcon.name}
          </p>
        </div>
      )}

      {!isLoading && icons.length === 0 && searchTerm && !error && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
          No icons found. Try searching for "music", "animal", "food", etc.
        </p>
      )}
    </div>
  );
};

export default IconPicker;