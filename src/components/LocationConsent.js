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

    // Removed browser geolocation to avoid native permission prompt

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