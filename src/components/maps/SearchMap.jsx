import React, { useEffect, useRef, useState, useCallback } from 'react';

const SearchMap = ({ 
  markers = [], 
  onBoundsChange, 
  onMarkerClick, 
  hoveredItemId = null,
  userLocation
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLocationReady, setIsLocationReady] = useState(false);

  // Wait for user location or timeout after 5 seconds
  useEffect(() => {
    if (userLocation) {
      setIsLocationReady(true);
    } else {
      // Timeout after 5 seconds if no location
      const timeout = setTimeout(() => {
        setIsLocationReady(true);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [userLocation]);

  useEffect(() => {
    if (isLocationReady && (window.google && window.google.maps)) {
      initializeMap();
      setIsLoaded(true);
    } else if (isLocationReady) {
      loadGoogleMapsScript();
    }

    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [isLocationReady]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;

    // Use user location if available, otherwise fallback to NY
    const center = userLocation || { lat: 40.7128, lng: -74.0060 };

    try {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 12,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      infoWindowRef.current = new window.google.maps.InfoWindow();
      mapInstance.current.addListener('bounds_changed', handleBoundsChange);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [userLocation]);

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          initializeMap();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found');
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => initializeMap();
    script.onerror = () => console.error('Failed to load Google Maps script');
    
    document.head.appendChild(script);
  };

  const handleBoundsChange = useCallback(() => {
    if (!mapInstance.current || !onBoundsChange) return;

    const bounds = mapInstance.current.getBounds();
    if (bounds) {
      const boundsObj = {
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng()
      };
      onBoundsChange(boundsObj);
    }
  }, [onBoundsChange]);

  useEffect(() => {
    if (!isLoaded || !mapInstance.current || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (!markers.length) return;

    // Add new markers
    markers.forEach((markerData, index) => {
      const lat = parseFloat(markerData.latitude);
      const lng = parseFloat(markerData.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        title: markerData.title || markerData.name || 'Item',
        icon: {
          url: markerData.type === 'product' 
            ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }

        const content = `
          <div style="padding: 12px; max-width: 250px;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">
              ${markerData.title || markerData.name || 'Item'}
            </h4>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
              ${markerData.type === 'product' ? 'Product' : 'Service'}
              ${markerData.category ? ` • ${markerData.category}` : ''}
            </p>
            <p style="margin: 0; font-weight: bold; color: #007BFF;">
              ${markerData.currency} ${markerData.price}
            </p>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to markers if we have them
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(markerData => {
        if (markerData.latitude && markerData.longitude) {
          bounds.extend({
            lat: parseFloat(markerData.latitude),
            lng: parseFloat(markerData.longitude)
          });
        }
      });
      
      if (!bounds.isEmpty()) {
        mapInstance.current.fitBounds(bounds);
        const listener = window.google.maps.event.addListener(mapInstance.current, 'bounds_changed', () => {
          if (mapInstance.current.getZoom() > 15) {
            mapInstance.current.setZoom(15);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  }, [markers, isLoaded, onMarkerClick]);

  useEffect(() => {
    if (!hoveredItemId || !markersRef.current.length) return;

    const hoveredMarker = markersRef.current.find((marker, index) => {
      return markers[index]?.id === hoveredItemId;
    });

    if (hoveredMarker) {
      hoveredMarker.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => {
        if (hoveredMarker.getAnimation() !== null) {
          hoveredMarker.setAnimation(null);
        }
      }, 2000);
    }
  }, [hoveredItemId, markers]);

  // Show loading until location is ready
  if (!isLocationReady) {
    return (
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        color: '#6c757d'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <p>Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-map-container" style={{ height: '100%', width: '100%' }}>
      <div 
        ref={mapRef} 
        style={{ height: '100%', width: '100%' }}
        className="search-map"
      />
      {!isLoaded && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 1000
          }}
        >
          Loading map...
        </div>
      )}
    </div>
  );
};

export default SearchMap;
