import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [locationData, setLocationData] = useState(null);
  const [geoResolved, setGeoResolved] = useState(false);

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
  const bookNameInputRef = useRef(null);
  const meetingTypeRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const purposeRef = useRef(null);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1); // 1..4
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const MAX_PURPOSE_LEN = 500;


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
  const getOrCreateSessionId = useCallback(() => {
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
  }, []);

  // Get device and browser info
  const getDeviceInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
  }, []);

  // Native geolocation on mount (single prompt). Reverse geocode to city/province/country.
  useEffect(() => {
    let cancelled = false;
    const attemptKey = 'geo_attempted';
    try {
      if (sessionStorage.getItem(attemptKey) === '1') {
        setGeoResolved(true);
        return;
      }
      sessionStorage.setItem(attemptKey, '1');
    } catch {}

    if (!('geolocation' in navigator)) {
      setGeoResolved(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      if (cancelled) return;
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      try {
        const API_BASE = process.env.REACT_APP_API_BASE || 'https://onetapp-backend-website.onrender.com';
        const resp = await fetch(`${API_BASE}/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
        const json = await resp.json();
        const data = json && json.success ? json.data : null;
        const address = data || {};
        setLocationData({
          consentLevel: 'basic',
          method: 'browser_geolocation',
          timestamp: new Date(),
          city: address.city || undefined,
          province: address.province || undefined,
          country: address.country || undefined
        });
      } catch {
        // If reverse geocoding fails, still resolve without geo
        setLocationData(null);
      } finally {
        setGeoResolved(true);
      }
    }, () => {
      // User denied or error: resolve and explicitly mark no consent
      setLocationData({ consentLevel: 'none', method: 'browser_geolocation', timestamp: new Date() });
      setGeoResolved(true);
    }, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    });

    return () => { cancelled = true; };
  }, []);

  // Log tap event to backend once geolocation has resolved (success or denial)
  const logTap = useCallback(async (cardId, eventId = null) => {
    try {
      // once-per-session guard per card to avoid duplicate view logs
      const onceKey = `viewed_${cardId}`;
      if (sessionStorage.getItem(onceKey) === '1') {
        return;
      }
      const deviceInfo = getDeviceInfo();
      
      const params = new URLSearchParams(window.location.search);
      const isPreview = params.get('preview') === '1';

      const tapData = {
        cardId: cardId,
        eventId: eventId,
        timestamp: new Date(),
        ip: '',
        geo: locationData || null,
        userAgent: deviceInfo.userAgent,
        sessionId: getOrCreateSessionId(),
        preview: isPreview,
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
      sessionStorage.setItem(onceKey, '1');
      
      
    } catch (error) {
      console.log('Tap logging failed (non-critical):', error);
    }
  }, [getOrCreateSessionId, getDeviceInfo, locationData]);

  // Trigger logging after card is loaded and geoResolved
  useEffect(() => {
    if (!cardData || !cardData.card || !cardData.card._id) return;
    if (!geoResolved) return;
    const id = cardData.card._id;
    logTap(id);
  }, [cardData, geoResolved, logTap]);

  // Log user action to backend
  const logUserAction = useCallback(async (cardId, actionData) => {
    try {
      const deviceInfo = getDeviceInfo();
      
      const actionLog = {
        cardId: cardId,
        timestamp: new Date(),
        ip: '',
        geo: locationData || null,
        userAgent: deviceInfo.userAgent,
        sessionId: getOrCreateSessionId(),
        actions: [{
          type: actionData.type,
          label: actionData.label,
          url: actionData.url || '',
          timestamp: new Date()
        }]
      };

      // debounce rapid-fire identical actions within 1s on the client
      const actKey = `last_action_${cardId}_${actionLog.actions[0].type}_${actionLog.actions[0].url || ''}`;
      const lastAt = parseInt(sessionStorage.getItem(actKey) || '0', 10);
      const now = Date.now();
      if (now - lastAt < 1000) {
        return;
      }
      sessionStorage.setItem(actKey, String(now));

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
  }, [getDeviceInfo, locationData, getOrCreateSessionId]);

  // Fetch card data from backend
  const fetchCardData = async (cardUid) => {
    const API_BASE = process.env.REACT_APP_API_BASE || 'https://onetapp-backend-website.onrender.com';
    const res = await fetch(`${API_BASE}/api/cards/dynamic/${cardUid}`);
    if (!res.ok) throw new Error('Card not found');
    return await res.json();
  };

  const cardId = cardData?.card?._id;

  const isDirty = () => {
    return (
      currentStep > 1 ||
      bookFormData.meetingType ||
      bookFormData.name ||
      bookFormData.email ||
      bookFormData.phone ||
      bookFormData.date ||
      bookFormData.time ||
      bookFormData.purpose
    );
  };

  const resetBookingState = () => {
    setBookFormData({
      name: '',
      email: '',
      phone: '',
      meetingType: '',
      date: '',
      time: '',
      purpose: ''
    });
    setCurrentStep(1);
    setErrors({});
    setSubmitting(false);
    setBookThankYou(false);
  };

  const handleRequestClose = () => {
    if (isDirty()) {
      const ok = window.confirm('Discard your current booking request?');
      if (!ok) return;
    }
    setShowBookModal(false);
    resetBookingState();
  };

  // Handle book now form submission
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || 'https://onetapp-backend-website.onrender.com';
      const payload = {
        cardUid: getQueryParam('cardUid') || cardData?.card?.cardUid || '',
        requester: {
          name: bookFormData.name,
          email: bookFormData.email,
          phone: bookFormData.phone,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        meeting: {
          type: bookFormData.meetingType,
          date: bookFormData.date,
          timePreference: bookFormData.time,
          purpose: bookFormData.purpose
        },
        meta: {
          sessionId: getOrCreateSessionId(),
          userAgent: navigator.userAgent
        }
      };
      await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('Booking request submitted to backend');
    } catch (err) {
      console.error('Booking submit failed:', err);
    }
    
    setSubmitting(true);
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
      setCurrentStep(1);
      setSubmitting(false);
    }, 2000);
  };

  // Autofocus the first input when the Book Now modal opens
  useEffect(() => {
    if (showBookModal) {
      setTimeout(() => {
        try {
          // Focus first control of current step
          if (currentStep === 1) {
            meetingTypeRef.current && meetingTypeRef.current.focus();
          } else if (currentStep === 2) {
            bookNameInputRef.current && bookNameInputRef.current.focus();
          } else if (currentStep === 3) {
            dateRef.current && dateRef.current.focus();
          } else if (currentStep === 4) {
            purposeRef.current && purposeRef.current.focus();
          }
        } catch (e) {}
      }, 100);
    } else {
      // Reset thank you on close to avoid stale UI next open
      setBookThankYou(false);
    }
  }, [showBookModal, currentStep]);

  // Log step view changes
  useEffect(() => {
    if (!showBookModal || !cardId) return;
    const labels = { 1: 'meeting_type', 2: 'contact_details', 3: 'date_time', 4: 'purpose_summary' };
    logUserAction(cardId, {
      type: 'book_step_view',
      label: labels[currentStep] || `step_${currentStep}`,
      url: ''
    });
  }, [currentStep, showBookModal, cardId, logUserAction]);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!bookFormData.meetingType) newErrors.meetingType = 'Please select a meeting type';
    }
    if (step === 2) {
      if (!bookFormData.name || bookFormData.name.trim().length < 2) newErrors.name = 'Please enter your full name';
      const email = (bookFormData.email || '').trim();
      const emailValid = /.+@.+\..+/.test(email);
      if (!email || !emailValid) newErrors.email = 'Enter a valid email address';
    }
    if (step === 3) {
      if (!bookFormData.date) newErrors.date = 'Please choose a date';
      if (!bookFormData.time) newErrors.time = 'Please choose a preferred time';
    }
    // Step 4 has optional purpose; enforce max length
    if (step === 4) {
      if ((bookFormData.purpose || '').length > 500) newErrors.purpose = 'Please keep it under 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      // Focus first invalid field
      setTimeout(() => {
        if (errors.meetingType) meetingTypeRef.current && meetingTypeRef.current.focus();
        else if (errors.name) bookNameInputRef.current && bookNameInputRef.current.focus();
        else if (errors.email) bookNameInputRef.current && bookNameInputRef.current.focus();
        else if (errors.date) dateRef.current && dateRef.current.focus();
        else if (errors.time) timeRef.current && timeRef.current.focus();
        else if (errors.purpose) purposeRef.current && purposeRef.current.focus();
      }, 50);
      return;
    }
    setCurrentStep((s) => Math.min(4, s + 1));
    if (cardId) {
      logUserAction(cardId, { type: 'book_step_next', label: `from_${currentStep}`, url: '' });
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
    if (cardId) {
      logUserAction(cardId, { type: 'book_step_back', label: `from_${currentStep}`, url: '' });
    }
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
        
        // Do not log here; wait for geolocation resolution in a separate effect
        
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
      <Modal
        show={showBookModal}
        onHide={handleRequestClose}
        centered
        scrollable
        fullscreen="sm-down"
        className="book-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Request a Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-subtitle">Answer a few quick questions to send your request.</div>
          {/* Progress indicator */}
          <div className="book-stepper mb-3">
            {[1,2,3,4].map((s) => (
              <div key={s} className={`book-step ${s < currentStep ? 'completed' : ''} ${s === currentStep ? 'active' : ''}`}>
                <span className="dot">{s}</span>
                <span className="bar"></span>
              </div>
            ))}
          </div>

          <Form onSubmit={handleBookSubmit}>
            {currentStep === 1 && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>Preferred Meeting Type</Form.Label>
                  <div className="meeting-type-grid" role="radiogroup" aria-label="Meeting Type">
                    {[
                      { value: 'In Person', icon: 'fa-user-friends', label: 'In Person' },
                      { value: 'Phone Call', icon: 'fa-phone-alt', label: 'Phone Call' },
                      { value: 'Video Call', icon: 'fa-video', label: 'Video Call' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        ref={bookFormData.meetingType === '' ? meetingTypeRef : undefined}
                        className={`meeting-type-card ${bookFormData.meetingType === opt.value ? 'active' : ''}`}
                        onClick={() => setBookFormData({ ...bookFormData, meetingType: opt.value })}
                        aria-pressed={bookFormData.meetingType === opt.value}
                      >
                        <i className={`fas ${opt.icon}`}></i>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.meetingType && <div className="invalid-hint">{errors.meetingType}</div>}
                </Form.Group>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label>Your Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your full name"
                        value={bookFormData.name}
                        onChange={(e) => setBookFormData({...bookFormData, name: e.target.value})}
                        inputMode="text"
                        autoComplete="name"
                        ref={bookNameInputRef}
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && <div className="invalid-hint">{errors.name}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-12 col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={bookFormData.email}
                        onChange={(e) => setBookFormData({...bookFormData, email: e.target.value})}
                        inputMode="email"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && <div className="invalid-hint">{errors.email}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-12">
                    <Form.Group className="mb-2">
                      <Form.Label>Phone Number (optional)</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Enter your phone number"
                        value={bookFormData.phone}
                        onChange={(e) => setBookFormData({...bookFormData, phone: e.target.value})}
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </Form.Group>
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label>Preferred Date</Form.Label>
                      <Form.Control
                        ref={dateRef}
                        type="date"
                        value={bookFormData.date}
                        onChange={(e) => setBookFormData({...bookFormData, date: e.target.value})}
                        aria-invalid={!!errors.date}
                      />
                      {errors.date && <div className="invalid-hint">{errors.date}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-12 col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label>Preferred Time</Form.Label>
                      <Form.Select
                        ref={timeRef}
                        value={bookFormData.time}
                        onChange={(e) => setBookFormData({...bookFormData, time: e.target.value})}
                        aria-invalid={!!errors.time}
                      >
                        <option value="">Select preferred time</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                      </Form.Select>
                      {errors.time && <div className="invalid-hint">{errors.time}</div>}
                      <div className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>We’ll confirm the exact time by email.</div>
                    </Form.Group>
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <div className="summary mb-3">
                  <div><strong>Type:</strong> {bookFormData.meetingType || '-'}</div>
                  <div><strong>Name:</strong> {bookFormData.name || '-'}</div>
                  <div><strong>Email:</strong> {bookFormData.email || '-'}</div>
                  {bookFormData.phone && <div><strong>Phone:</strong> {bookFormData.phone}</div>}
                  <div><strong>Date:</strong> {bookFormData.date || '-'}</div>
                  <div><strong>Time:</strong> {bookFormData.time || '-'}</div>
                </div>
                <Form.Group className="mb-2">
                  <Form.Label>Purpose (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Briefly describe what you'd like to discuss"
                    value={bookFormData.purpose}
                    onChange={(e) => setBookFormData({...bookFormData, purpose: e.target.value})}
                    ref={purposeRef}
                    aria-invalid={!!errors.purpose}
                  />
                  <div className="char-counter">{(bookFormData.purpose || '').length}/{MAX_PURPOSE_LEN}</div>
                  {errors.purpose && <div className="invalid-hint">{errors.purpose}</div>}
                </Form.Group>
              </>
            )}

            {bookThankYou && (
              <Alert variant="success" className="mt-3">
                Thank you! Your request has been submitted.
              </Alert>
            )}

            {/* Navigation */}
            <div className="book-actions book-actions-sticky mt-3">
              <Button variant="secondary" onClick={handleBack} disabled={currentStep === 1 || submitting}>
                Back
              </Button>
              {currentStep < 4 && (
                <Button variant="primary" onClick={handleNext} disabled={submitting}>
                  Next
                </Button>
              )}
              {currentStep === 4 && (
                <Button type="submit" className="btn-dark" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>


    </div>
  );
}

export default App;
