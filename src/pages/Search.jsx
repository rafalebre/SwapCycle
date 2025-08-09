import React, { useState, useEffect, useCallback } from 'react';
import SearchFilters from '../components/filters/SearchFilters';
import SearchMap from '../components/maps/SearchMap';
import ProductCard from '../components/cards/ProductCard';
import ServiceCard from '../components/cards/ServiceCard';
import { searchService } from '../services/searchService';

const Search = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    type: 'all',
    category_id: '',
    subcategory_id: '',
    min_price: '',
    max_price: '',
    radius: 50,
    page: 1
  });
  const [mapMarkers, setMapMarkers] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    per_page: 20
  });

  // Get user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 300000
      }
    );
  }, []);

  // Perform search when filters change
  useEffect(() => {
    performSearch();
  }, [filters]);

  // Load map markers when bounds change
  useEffect(() => {
    if (mapBounds) {
      loadMapMarkers();
    }
  }, [mapBounds, filters]);

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

  const renderResultItem = (item) => {
    if (item.type === 'service') {
      return (
        <ServiceCard
          key={`service-${item.id}`}
          service={item}
          onSelect={() => setSelectedItem(item)}
        />
      );
    } else {
      return (
        <ProductCard
          key={`product-${item.id}`}
          product={item}
          onSelect={() => setSelectedItem(item)}
        />
      );
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Products & Services</h1>
        <SearchFilters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchType={filters.type}
          isLoading={isLoading}
        />
      </div>

      <div className="search-content">
        <div className="results-panel">
          <div className="results-header">
            <h3>
              {isLoading ? 'Searching...' : `${pagination.total} Results`}
            </h3>
            {pagination.pages > 1 && (
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="page-btn"
                >
                  Previous
                </button>
                <span className="page-info">
                  {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="results-list">
            {searchResults.map(renderResultItem)}
          </div>
        </div>

        <div className="map-panel">
          <SearchMap
            markers={mapMarkers}
            onBoundsChange={handleBoundsChange}
            onMarkerClick={handleMarkerClick}
            userLocation={userLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
