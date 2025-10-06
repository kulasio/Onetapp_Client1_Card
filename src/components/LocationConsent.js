import React, { useState, useEffect, useCallback } from 'react';

const LocationConsent = ({ onConsentChange, onLocationData }) => {
  const [showConsent, setShowConsent] = useState(false);

  const getLocationData = useCallback(async (consent) => {
    if (consent === 'none') {
      onLocationData(null);
      return;
    }

    let locationResult = {
      consentLevel: consent,
      method: 'unknown',
      timestamp: new Date()
    };

    // Try browser geolocation first
    if (navigator.geolocation && consent === 'basic') {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false, // Changed to false since we don't need precise location
            timeout: 15000,
            maximumAge: 60000 // Only use cached location if less than 1 minute old
          });
        });

        // Store coordinates temporarily for reverse geocoding only
        const tempLat = position.coords.latitude;
        const tempLng = position.coords.longitude;
        locationResult.method = 'browser_geolocation';
        locationResult.timestamp = new Date();

        // Basic consent: get city and province only
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${tempLat}&lon=${tempLng}&addressdetails=1&accept-language=en`);
          const data = await response.json();
          
          if (data && data.address) {
            locationResult.city = data.address.city || data.address.town || data.address.municipality;
            locationResult.province = data.address.state || data.address.region;
          }
        } catch (error) {
          console.log('Reverse geocoding failed:', error);
        }
      } catch (geoError) {
        console.log('Browser geolocation failed:', geoError);
      }
    }

    // Fallback to IP-based location with multiple services
    if (locationResult.method === 'unknown') {
      try {
        // Try multiple IP geolocation services for better accuracy
        const ipServices = [
          'https://ipapi.co/json/',
          'https://ipinfo.io/json',
          'https://api.ipgeolocation.io/ipgeo?apiKey=free'
        ];
        
        let ipData = null;
        for (const service of ipServices) {
          try {
            const response = await fetch(service, { timeout: 5000 });
            if (response.ok) {
              ipData = await response.json();
              break;
            }
          } catch (err) {
            console.log(`IP service ${service} failed:`, err);
            continue;
          }
        }
        
        if (ipData) {
          locationResult.method = 'ip_geolocation';
          locationResult.ip = ipData.ip;
          
          if (consent === 'basic') {
            locationResult.city = ipData.city;
            locationResult.province = ipData.region || ipData.state;
          }
        }
      } catch (error) {
        console.log('All IP geolocation services failed:', error);
      }
    }

    onLocationData(locationResult);
  }, [onLocationData]);


  useEffect(() => {
    // Check if we've already asked for consent in this session
    const savedConsent = sessionStorage.getItem('locationConsent');
    if (savedConsent) {
      if (savedConsent !== 'none') {
        getLocationData(savedConsent);
      }
    } else {
      // Show consent modal after a short delay
      setTimeout(() => {
        setShowConsent(true);
      }, 1000);
    }
  }, [getLocationData]);

  const handleConsent = (consent) => {
    sessionStorage.setItem('locationConsent', consent);
    setShowConsent(false);
    
    if (consent !== 'none') {
      getLocationData(consent);
    } else {
      onLocationData(null);
    }
    
    onConsentChange(consent);
  };

  if (!showConsent) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 999999,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 16,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Location Access</h3>
          <p style={{ fontSize: 14, color: '#4B5563', marginBottom: 16 }}>
            Help us provide better analytics by sharing your location. Your privacy is protected.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={() => handleConsent('basic')}
              className="btn btn-success"
              style={{ width: '100%', padding: '10px 12px' }}
            >
              Allow General Location (City + Province)
            </button>

            <button
              type="button"
              onClick={() => handleConsent('none')}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '10px 12px' }}
            >
              Don't Allow Location
            </button>
          </div>

          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 12 }}>
            You can change this setting anytime. No exact coordinates are stored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationConsent;