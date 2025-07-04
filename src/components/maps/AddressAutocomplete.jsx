import React, { useEffect, useRef, useState } from 'react';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onPlaceSelect, 
  placeholder = "Enter address...",
  className = "",
  required = false 
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
      setIsLoaded(true);
    } else {
      // Load Google Maps if not already loaded
      loadGoogleMapsScript();
    }

    return () => {
      // Cleanup autocomplete when component unmounts
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const loadGoogleMapsScript = () => {
    // Check if script is already loading or loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Script already exists, wait for it to load
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogle);
          initializeAutocomplete();
          setIsLoaded(true);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found in environment variables');
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initializeAutocomplete();
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };

    document.head.appendChild(script);
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) {
      return;
    }

    try {
      // Create autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: [] }, // Allow all countries
          fields: ['formatted_address', 'geometry', 'name', 'place_id']
        }
      );

      // Add place changed listener
      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  };

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    
    if (!place.geometry) {
      console.warn('Place has no geometry');
      return;
    }

    const addressData = {
      address: place.formatted_address || place.name,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      place_id: place.place_id
    };

    // Update input value
    if (onChange) {
      onChange({
        target: {
          name: 'address',
          value: addressData.address
        }
      });
    }

    // Call onPlaceSelect callback with full address data
    if (onPlaceSelect) {
      onPlaceSelect(addressData);
    }
  };

  const handleInputChange = (e) => {
    // Call onChange for controlled input
    if (onChange) {
      onChange(e);
    }
  };

  const handleKeyDown = (e) => {
    // Prevent form submission on Enter when selecting from dropdown
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="address-autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        required={required}
        autoComplete="off"
      />
      {!isLoaded && (
        <small className="loading-text">Loading address suggestions...</small>
      )}
    </div>
  );
};

export default AddressAutocomplete;
