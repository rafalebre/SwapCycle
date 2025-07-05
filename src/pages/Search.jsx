import React, { useState, useEffect, useCallback } from 'react';
import SearchMap from '../components/maps/SearchMap';
import SearchFilters from '../components/filters/SearchFilters';
import { searchService } from '../services/searchService';
import '../styles/search.css';

const Search = () => {
  const [filters, setFilters] = useState({
    keyword: '',
    type: 'all',
    category_id: '',
    min_price: '',
    max_price: '',
    radius: 10,
    page: 1,
    per_page: 20
  });

  const [searchResults, setSearchResults] = useState([]);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    per_page: 20
  });

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Search when filters change
  useEffect(() => {
    performSearch();
  }, [filters, mapBounds]);

  const getUserLocation = async () => {
    try {
      const location = await searchService.getUserLocation();
      setUserLocation(location);
    } catch (error) {
      console.log('Could not get user location:', error.message);
      // Default to New York if geolocation fails
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
    }
  };

  const performSearch = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const searchParams = searchService.buildSearchParams(filters, userLocation, mapBounds);
      const response = await searchService.search(searchParams);
      
      setSearchResults(response.data.results || []);
      setPagination({
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1,
        per_page: response.data.per_page || 20
      });

      // Get map markers if we have bounds
      if (mapBounds) {
        loadMapMarkers();
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMapMarkers = async () => {
    if (!mapBounds) return;

    try {
      const mapParams = {
        ...searchService.buildSearchParams(filters, userLocation, mapBounds),
        // Remove pagination for map markers
        page: undefined,
        per_page: undefined
      };
      
      const response = await searchService.getMapData(mapParams);
      setMapMarkers(response.data.markers || []);
    } catch (error) {
      console.error('Map markers error:', error);
      setMapMarkers([]);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleBoundsChange = useCallback((bounds) => {
    setMapBounds(bounds);
  }, []);

  const handleMarkerClick = (markerData) => {
    setSelectedItem(markerData);
    // Find full item data from search results
    const fullItem = searchResults.find(item => 
      item.id === markerData.id && item.type === markerData.type
    );
    if (fullItem) {
      setSelectedItem(fullItem);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="search-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Filters */}
      <div style={{ flexShrink: 0, padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ margin: '0 0 20px 0', fontSize: '28px', color: '#333' }}>
          Search Products & Services
        </h1>
        <SearchFilters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchType={filters.type}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Results Panel */}
        <div style={{ width: '400px', flexShrink: 0, backgroundColor: 'white', borderRight: '1px solid #ddd', overflow: 'auto' }}>
          <div style={{ padding: '20px' }}>
            {/* Results Header */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>
                {isLoading ? 'Searching...' : `${pagination.total} Results`}
              </h3>
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    style={{
                      padding: '5px 10px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      background: 'white',
                      cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ‹
                  </button>
                  <span style={{ padding: '5px 10px', fontSize: '14px' }}>
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    style={{
                      padding: '5px 10px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      background: 'white',
                      cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {/* Results List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {searchResults.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    padding: '15px',
                    border: selectedItem?.id === item.id ? '2px solid #007BFF' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: hoveredItemId === item.id ? '#f8f9fa' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#333' }}>
                        {item.name}
                      </h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        {item.type === 'product' ? 'Product' : 'Service'}
                        {item.category?.name && ` • ${item.category.name}`}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#007BFF', fontSize: '16px' }}>
                          {item.currency} {item.estimated_value}
                        </span>
                        {item.distance && (
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {item.distance} km away
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!isLoading && searchResults.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No results found. Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Panel */}
        <div style={{ flex: 1, position: 'relative' }}>
          {userLocation && (
            <SearchMap
              markers={mapMarkers}
              onBoundsChange={handleBoundsChange}
              onMarkerClick={handleMarkerClick}
              hoveredItemId={hoveredItemId}
              center={userLocation}
              zoom={12}
            />
          )}
          
          {selectedItem && (
            <div 
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '300px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000
              }}
            >
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
              
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                {selectedItem.name}
              </h3>
              
              {selectedItem.image_url && (
                <img 
                  src={selectedItem.image_url} 
                  alt={selectedItem.name}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' }}
                />
              )}
              
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                {selectedItem.description}
              </p>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#007BFF', fontSize: '20px' }}>
                  {selectedItem.currency} {selectedItem.estimated_value}
                </strong>
              </div>
              
              <button
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#007BFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  // TODO: Implement trade proposal
                  alert('Trade proposal feature coming in ACTION 8!');
                }}
              >
                Propose Trade
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
