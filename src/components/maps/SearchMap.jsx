import React, { useEffect, useRef, useState, useCallback } from 'react';

const SearchMap = ({ 
  markers = [], 
  onBoundsChange, 
  onMarkerClick, 
  hoveredItemId = null,
  center = { lat: 40.7128, lng: -74.0060 }, 
  zoom = 12 
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeMap();
      setIsLoaded(true);
    } else {
      loadGoogleMapsScript();
    }

    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;

    try {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
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
  }, [center, zoom]);

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

    // Removed geometry library to fix IntersectionObserver error
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
      const boundsData = {
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng()
      };
      onBoundsChange(boundsData);
    }
  }, [onBoundsChange]);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  useEffect(() => {
    if (!isLoaded || !mapInstance.current) return;

    clearMarkers();

    markers.forEach((markerData, index) => {
      if (!markerData.latitude || !markerData.longitude) return;

      const marker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(markerData.latitude),
          lng: parseFloat(markerData.longitude)
        },
        map: mapInstance.current,
        title: markerData.name,
        icon: {
          url: markerData.type === 'product' 
            ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#007BFF" stroke="white" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">P</text>
              </svg>
            `)
            : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#28A745" stroke="white" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">S</text>
              </svg>
            `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      });

      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }

        const content = `
          <div style="padding: 8px; max-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #333;">${markerData.name}</h4>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">
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
