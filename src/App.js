import React, { useState, useEffect, useCallback } from 'react';
import { Container, Modal, Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import BusinessCard from './components/BusinessCard';

function App() {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);

  const [bookFormData, setBookFormData] = useState({
    name: '',
    email: '',
    phone: '',
    meetingType: '',
    date: '',
    time: '',
    purpose: ''
  });
  const [bookThankYou, setBookThankYou] = useState(false);


  // Get cardUid from URL parameters
  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  // Convert Buffer to base64 string
  const bufferToBase64 = (bufferObj) => {
    if (!bufferObj || !bufferObj.data) return '';
    return btoa(String.fromCharCode(...bufferObj.data));
  };

  // Generate session ID for analytics
  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Persist and reuse a single sessionId per browser session
  const SESSION_STORAGE_KEY = 'nfc_card_session_id';
  const getOrCreateSessionId = () => {
    try {
      let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!sid) {
        sid = generateSessionId();
        sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
      }
      return sid;
    } catch (e) {
      // Fallback if storage is unavailable
      return generateSessionId();
    }
  };

  // Get device and browser info
  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
  };

  // Get location data using hybrid approach
  const getLocationData = async () => {
    let locationData = {
      latitude: null,
      longitude: null,
      accuracy: null,
      city: null,
      country: null,
      region: null,
      timezone: null,
      method: 'unknown'
    };

    // Try browser geolocation first
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          });
        });

        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          method: 'browser_geolocation',
          timestamp: position.timestamp
        };

        // Try to get city/country from coordinates using reverse geocoding
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
          const geoData = await response.json();
          
          locationData.city = geoData.city || geoData.locality;
          locationData.country = geoData.countryName;
          locationData.region = geoData.principalSubdivision;
          locationData.timezone = geoData.timezone;
        } catch (geoError) {
          console.log('Reverse geocoding failed:', geoError);
        }

        return locationData;
      } catch (geoError) {
        console.log('Browser geolocation failed:', geoError);
      }
    }

    // Fallback to IP-based geolocation
    try {
      const response = await fetch('https://api.bigdatacloud.net/data/ip-geolocation-full');
      const ipData = await response.json();
      
      locationData = {
        latitude: ipData.location?.latitude,
        longitude: ipData.location?.longitude,
        city: ipData.location?.city,
        country: ipData.location?.country?.name,
        region: ipData.location?.principalSubdivision,
        timezone: ipData.location?.timeZone?.name,
        method: 'ip_geolocation',
        ip: ipData.ip
      };
    } catch (ipError) {
      console.log('IP geolocation failed:', ipError);
    }

    return locationData;
  };

  // Log tap event to backend
  const logTap = useCallback(async (cardId, eventId = null) => {
    try {
      const deviceInfo = getDeviceInfo();
      
      // Start location tracking in background (non-blocking)
      const locationPromise = getLocationData().catch(err => {
        console.log('Location tracking failed:', err);
        return {
          latitude: null,
          longitude: null,
          accuracy: null,
          city: null,
          country: null,
          region: null,
          timezone: null,
          method: 'unknown'
        };
      });
      
      const tapData = {
        cardId: cardId,
        eventId: eventId,
        timestamp: new Date(),
        ip: '',
        geo: {},
        userAgent: deviceInfo.userAgent,
        sessionId: getOrCreateSessionId(),
        actions: [{
          type: 'business_card_viewed',
          label: 'Business Card Viewed',
          timestamp: new Date()
        }]
      };

      const API_BASE = process.env.REACT_APP_API_BASE || 'https://onetapp-backend-website.onrender.com';
      
      // Send tap data immediately
      await fetch(`${API_BASE}/api/taps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tapData)
      });
      console.log('Tap event logged successfully');
      
      // Update with location data in background
      locationPromise.then(locationData => {
        const updateData = {
          ...tapData,
          ip: locationData.ip || '',
          geo: locationData,
          // Ensure we do not duplicate the initial view action
          actions: [{
            type: 'location_update',
            label: 'Location Updated',
            timestamp: new Date()
          }]
        };

        // Update the existing tap via the action endpoint (prevents duplicate tap records)
        fetch(`${API_BASE}/api/taps/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }).catch(err => console.log('Location update failed:', err));
      });
      
    } catch (error) {
      console.log('Tap logging failed (non-critical):', error);
    }
  }, []);

  // Log user action to backend
  const logUserAction = async (cardId, actionData) => {
    try {
      const deviceInfo = getDeviceInfo();
      const locationData = await getLocationData();
      
      const actionLog = {
        cardId: cardId,
        timestamp: new Date(),
        ip: locationData.ip || '',
        geo: locationData,
        userAgent: deviceInfo.userAgent,
        sessionId: getOrCreateSessionId(),
        actions: [{
          type: actionData.type,
          label: actionData.label,
          url: actionData.url || '',
          timestamp: new Date()
        }]
      };

      console.log('Sending user action to backend:', actionLog);

      const API_BASE = process.env.REACT_APP_API_BASE || 'https://onetapp-backend-website.onrender.com';
      const response = await fetch(`${API_BASE}/api/taps/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(actionLog)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('User action logged successfully:', result);
    } catch (error) {
      console.error('Action logging failed:', error);
    }
  };

  // Fetch card data from backend
  const fetchCardData = async (cardUid) => {
    const API_BASE = process.env.REACT_APP_API_BASE || 'https://onetapp-backend-website.onrender.com';
    const res = await fetch(`${API_BASE}/api/cards/dynamic/${cardUid}`);
    if (!res.ok) throw new Error('Card not found');
    return await res.json();
  };

  // Handle book now form submission
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Booking request:', bookFormData);
    setBookThankYou(true);
    setTimeout(() => {
      setShowBookModal(false);
      setBookThankYou(false);
      setBookFormData({
        name: '',
        email: '',
        phone: '',
        meetingType: '',
        date: '',
        time: '',
        purpose: ''
      });
    }, 2000);
  };



  useEffect(() => {
    const loadCardData = async () => {
      try {
        const cardUid = getQueryParam('cardUid');
        if (!cardUid) {
          // For testing purposes, show a demo card or instruction
          setError('No card UID provided. Please add ?cardUid=YOUR_CARD_UID to the URL');
          setLoading(false);
          return;
        }

        const data = await fetchCardData(cardUid);
        
        // Process profile image
        if (data.profile && data.profile.profileImage) {
          // Handle Cloudinary data
          if (data.profile.profileImage.secureUrl) {
            data.profile.profileImage.url = data.profile.profileImage.secureUrl;
          } else if (data.profile.profileImage.url && data.profile.profileImage.url.startsWith('http://')) {
            // Convert HTTP to HTTPS for Cloudinary URLs
            data.profile.profileImage.url = data.profile.profileImage.url.replace('http://', 'https://');
          } else if (data.profile.profileImage.data && data.profile.profileImage.data.data) {
            // Buffer to base64 (legacy support)
            const base64 = bufferToBase64({ data: data.profile.profileImage.data.data });
            data.profile.profileImage.url = `data:image/jpeg;base64,${base64}`;
          }
        }

        setCardData(data);
        
        // Log tap event
        if (data.card && data.card._id) {
          logTap(data.card._id);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCardData();
  }, [logTap]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading business card...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="warning">
          <Alert.Heading>Demo Mode</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            <strong>To test with real data:</strong><br />
            1. Start your backend server on localhost:5000<br />
            2. Add a cardUid parameter: <code>?cardUid=YOUR_CARD_UID</code><br />
            3. Make sure you have a card in your database
          </p>
          <Button 
            variant="outline-primary" 
            className="mt-3"
            onClick={() => {
              // Demo card data for testing
              setCardData({
                card: { _id: 'demo-card' },
                user: { username: 'Demo User' },
                profile: {
                  fullName: 'John Doe',
                  jobTitle: 'Software Engineer',
                  company: 'Tech Solutions Inc.',
                  location: 'San Francisco, CA',
                  phone: '+1 (555) 123-4567',
                  email: 'john.doe@techsolutions.com',
                  website: 'https://johndoe.dev',
                  bio: 'John Doe is a visionary Chief Executive Officer with over 15 years of executive leadership experience in the technology sector. As the CEO of Tech Solutions Inc., he has successfully transformed the company into a market leader, driving innovation and sustainable growth across multiple business verticals.',
                  socialLinks: {
                    linkedin: 'https://linkedin.com/in/johndoe',
                    twitter: 'https://twitter.com/johndoe',
                    github: 'https://github.com/johndoe',
                    instagram: 'https://instagram.com/johndoe',
                    facebook: 'https://facebook.com/johndoe',
                    youtube: 'https://youtube.com/@johndoe'
                  },
                  featuredLinks: [
                    { label: 'Portfolio', url: 'https://johndoe.dev' },
                    { label: 'Blog', url: 'https://blog.johndoe.dev' },
                    { label: 'Resume', url: 'https://johndoe.dev/resume' },
                    { label: 'Projects', url: 'https://johndoe.dev/projects' }
                  ],
                  gallery: [
                    { url: 'https://via.placeholder.com/120x68/4F46E5/FFFFFF?text=Image+1' },
                    { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                    { url: 'https://vimeo.com/148751763' }
                  ],
                  bookNowEnabled: true,
                  profileImage: {
                    url: 'https://via.placeholder.com/400x600/4F46E5/FFFFFF?text=Demo+Profile'
                  }
                }
              });
              setError(null);
            }}
          >
            View Demo Card
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="App">
      <Container className="d-flex justify-content-center align-items-start min-vh-100">
        <BusinessCard 
          cardData={cardData}
          onShowFeaturedModal={() => setShowFeaturedModal(true)}
          onShowBookModal={() => setShowBookModal(true)}
          onLogAction={logUserAction}
        />
      </Container>

      {/* Featured Links Modal */}
      <Modal show={showFeaturedModal} onHide={() => setShowFeaturedModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>All Featured/Custom Links</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap gap-2" id="profileAllFeaturedLinks">
            {cardData?.profile?.featuredLinks?.map((link, index) => (
              <a 
                key={index}
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => logUserAction(cardData.card._id, {
                  type: 'featured_link_click',
                  label: `Clicked: ${link.label}`,
                  url: link.url
                })}
              >
                {link.label}
              </a>
            ))}
          </div>
        </Modal.Body>
      </Modal>

      {/* Book Now Modal */}
      <Modal show={showBookModal} onHide={() => setShowBookModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request a Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleBookSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={bookFormData.name}
                onChange={(e) => setBookFormData({...bookFormData, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={bookFormData.email}
                onChange={(e) => setBookFormData({...bookFormData, email: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter your phone number"
                value={bookFormData.phone}
                onChange={(e) => setBookFormData({...bookFormData, phone: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preferred Meeting Type</Form.Label>
              <Form.Select
                value={bookFormData.meetingType}
                onChange={(e) => setBookFormData({...bookFormData, meetingType: e.target.value})}
                required
              >
                <option value="">Select meeting type</option>
                <option value="In Person">In Person</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Video Call">Video Call</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preferred Date</Form.Label>
              <Form.Control
                type="date"
                value={bookFormData.date}
                onChange={(e) => setBookFormData({...bookFormData, date: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preferred Time</Form.Label>
              <Form.Select
                value={bookFormData.time}
                onChange={(e) => setBookFormData({...bookFormData, time: e.target.value})}
                required
              >
                <option value="">Select preferred time</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Purpose of Meeting</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Please describe what you'd like to discuss"
                value={bookFormData.purpose}
                onChange={(e) => setBookFormData({...bookFormData, purpose: e.target.value})}
              />
            </Form.Group>
            <Button type="submit" className="w-100">
              Submit Request
            </Button>
          </Form>
          {bookThankYou && (
            <Alert variant="success" className="mt-3">
              Thank you! Your request has been submitted.
            </Alert>
          )}
        </Modal.Body>
      </Modal>


    </div>
  );
}

export default App;
