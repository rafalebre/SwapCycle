import React, { useState, useEffect, useRef } from 'react';

const AddressAutocomplete = ({ 
  value, 
  onAddressSelect, 
  placeholder = "Enter address...", 
  className = "",
  disabled = false 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Initialize Google Places services when component mounts
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      
      // Create a hidden div for PlacesService (required by Google Maps API)
      const hiddenDiv = document.createElement('div');
      hiddenDiv.style.display = 'none';
      document.body.appendChild(hiddenDiv);
      
      placesService.current = new window.google.maps.places.PlacesService(hiddenDiv);
    } else {
      console.error('Google Maps API not loaded. Please check your API key and script inclusion.');
    }

    return () => {
      // Cleanup
      const hiddenDivs = document.querySelectorAll('div[style*="display: none"]');
      hiddenDivs.forEach(div => {
        if (div.parentNode === document.body) {
          document.body.removeChild(div);
        }
      });
    };
  }, []);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    if (newValue.length > 2 && autocompleteService.current) {
      setIsLoading(true);
      
      const request = {
        input: newValue,
        types: ['address'],
        componentRestrictions: { country: [] } // Allow all countries
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.slice(0, 5)); // Limit to 5 suggestions
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const getPlaceDetails = (placeId, description) => {
    if (!placesService.current) {
      console.error('Places service not initialized');
      return;
    }

    const request = {
      placeId: placeId,
      fields: ['geometry', 'formatted_address', 'address_components']
    };

    placesService.current.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const addressData = {
          address: place.formatted_address || description,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          placeId: placeId
        };
        
        setInputValue(addressData.address);
        setShowSuggestions(false);
        setSuggestions([]);
        
        if (onAddressSelect) {
          onAddressSelect(addressData);
        }
      } else {
        console.error('Error getting place details:', status);
        // Fallback: use the description as address (less reliable)
        setInputValue(description);
        setShowSuggestions(false);
        setSuggestions([]);
        
        if (onAddressSelect) {
          onAddressSelect({
            address: description,
            latitude: null,
            longitude: null,
            placeId: placeId
          });
        }
      }
    });
  };

  const handleSuggestionClick = (suggestion) => {
    getPlaceDetails(suggestion.place_id, suggestion.description);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`address-autocomplete ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={`address-input ${className}`}
      />
      
      {isLoading && (
        <div className="autocomplete-loading">
          <span>Searching addresses...</span>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="autocomplete-suggestions" ref={suggestionsRef}>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="suggestion-main">
                {suggestion.structured_formatting?.main_text || suggestion.description}
              </div>
              {suggestion.structured_formatting?.secondary_text && (
                <div className="suggestion-secondary">
                  {suggestion.structured_formatting.secondary_text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && !isLoading && inputValue.length > 2 && (
        <div className="autocomplete-no-results">
          <span>No addresses found</span>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
