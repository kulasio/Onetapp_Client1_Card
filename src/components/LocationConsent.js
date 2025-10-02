import React, { useState, useEffect } from 'react';

const LocationConsent = ({ onConsentChange, onLocationData }) => {
  const [showConsent, setShowConsent] = useState(false);
  const [consentLevel, setConsentLevel] = useState('none');
  const [locationData, setLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we've already asked for consent in this session
    const savedConsent = sessionStorage.getItem('locationConsent');
    if (savedConsent) {
      setConsentLevel(savedConsent);
      if (savedConsent !== 'none') {
        getLocationData(savedConsent);
      }
    } else {
      // Show consent modal after a short delay
      setTimeout(() => {
        setShowConsent(true);
      }, 1000);
    }
  }, []);

  const getLocationData = async (consent) => {
    if (consent === 'none') {
      setLocationData(null);
      onLocationData(null);
      return;
    }

    setIsLoading(true);
    let locationResult = {
      consentLevel: consent,
      method: 'unknown'
    };

    try {
      // Try browser geolocation first
      if (navigator.geolocation && (consent === 'full' || consent === 'basic')) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: consent === 'full',
            timeout: 10000,
            maximumAge: 300000
          });
        });

        // Store coordinates temporarily for reverse geocoding only
        const tempLat = position.coords.latitude;
        const tempLng = position.coords.longitude;
        locationResult.method = 'browser_geolocation';
        locationResult.timestamp = new Date();

        // Get detailed location info based on consent level
        if (consent === 'full') {
          // Full consent: get barangay, city, region
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${tempLat}&lon=${tempLng}&addressdetails=1&accept-language=en`);
            const data = await response.json();
            
            if (data && data.address) {
              locationResult.barangay = data.address.suburb || data.address.neighbourhood || data.address.village;
              locationResult.city = data.address.city || data.address.town || data.address.municipality;
              locationResult.region = data.address.state || data.address.region;
              locationResult.province = data.address.state || data.address.region;
            }
          } catch (error) {
            console.log('Reverse geocoding failed:', error);
          }
        } else if (consent === 'basic') {
          // Basic consent: get city and region only
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${tempLat}&lon=${tempLng}&addressdetails=1&accept-language=en`);
            const data = await response.json();
            
            if (data && data.address) {
              locationResult.city = data.address.city || data.address.town || data.address.municipality;
              locationResult.region = data.address.state || data.address.region;
              locationResult.province = data.address.state || data.address.region;
            }
          } catch (error) {
            console.log('Reverse geocoding failed:', error);
          }
        }
      } else {
        // Fallback to IP-based location
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          
          locationResult.method = 'ip_geolocation';
          locationResult.ip = data.ip;
          
          if (consent === 'full') {
            locationResult.barangay = data.district || data.neighbourhood;
            locationResult.city = data.city;
            locationResult.region = data.region;
            locationResult.province = data.region;
          } else if (consent === 'basic') {
            locationResult.city = data.city;
            locationResult.region = data.region;
            locationResult.province = data.region;
          }
        } catch (error) {
          console.log('IP geolocation failed:', error);
        }
      }
    } catch (error) {
      console.log('Location collection failed:', error);
    }

    setLocationData(locationResult);
    onLocationData(locationResult);
    setIsLoading(false);
  };

  const handleConsent = (consent) => {
    setConsentLevel(consent);
    sessionStorage.setItem('locationConsent', consent);
    setShowConsent(false);
    
    if (consent !== 'none') {
      getLocationData(consent);
    } else {
      setLocationData(null);
      onLocationData(null);
    }
    
    onConsentChange(consent);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Location Access
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Help us provide better analytics by sharing your location. Your privacy is protected.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => handleConsent('full')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Allow Precise Location (Barangay + City)
            </button>
            
            <button
              onClick={() => handleConsent('basic')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Allow General Location (City Only)
            </button>
            
            <button
              onClick={() => handleConsent('none')}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Don't Allow Location
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            You can change this setting anytime. No exact coordinates are stored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationConsent;
