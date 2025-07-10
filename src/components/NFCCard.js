import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  LinkedIn,
  GitHub,
  Twitter,
  Facebook,
  YouTube,
  Instagram,
  Language,
  ContactPage,
  CalendarToday,
  PlayArrow,
  Add
} from '@mui/icons-material';
import { fetchCardData, logTap, logUserAction, getCardUidParam, getQueryParam } from '../services/apiService';

const NFCCard = () => {
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    purpose: ''
  });
  const [showThankYou, setShowThankYou] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch card data on component mount
  useEffect(() => {
    const loadCardData = async () => {
      try {
        const cardUid = getCardUidParam();
        if (!cardUid) {
          setError('No cardUid specified in URL.');
          setLoading(false);
          return;
        }

        const apiData = await fetchCardData(cardUid);
        // Handle both wrapped and unwrapped API responses
        const data = apiData.success ? apiData : apiData;
        // Transform backend data to match component structure
        let profileImage = '';
        if (data.profile && data.profile.profileImage) {
          if (data.profile.profileImage.data && Array.isArray(data.profile.profileImage.data)) {
            // Buffer object, convert to base64
            const base64 = btoa(String.fromCharCode(...data.profile.profileImage.data));
            profileImage = `data:image/jpeg;base64,${base64}`;
          } else if (typeof data.profile.profileImage === 'string') {
            profileImage = data.profile.profileImage;
          }
        }
        const transformedData = {
          profile: {
            ...data.profile,
            profileImage: profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face'
          },
          card: data.card ? data.card : {},
          user: data.user ? data.user : {}
        };
        setCardData(transformedData);
        
        // Log the tap for analytics
        await logTap({
          cardId: apiData.card?._id,
          eventId: getQueryParam('eventId'), // Optional event tracking
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId: getSessionId(), // Generate or get existing session
          actions: [{ type: 'page_view', timestamp: new Date().toISOString() }]
        });

      } catch (err) {
        console.error('Error loading card data:', err);
        setError('Failed to load card data.');
      } finally {
        setLoading(false);
      }
    };

    loadCardData();
  }, []);

  // Generate or get session ID for analytics
  const getSessionId = () => {
    let sessionId = localStorage.getItem('nfc_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('nfc_session_id', sessionId);
    }
    return sessionId;
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setShowThankYou(true);
    setOpenBookingDialog(false);
    setBookingForm({
      name: '',
      email: '',
      date: '',
      time: '',
      purpose: ''
    });
  };

  const handleSaveContact = () => {
    if (!cardData?.profile) return;
    
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:${cardData.profile.fullName}
FN:${cardData.profile.fullName}
TITLE:${cardData.profile.jobTitle}
ORG:${cardData.profile.company}
EMAIL;type=WORK,INTERNET:${cardData.profile.contact.email}
TEL;type=WORK,VOICE:${cardData.profile.contact.phone}
NOTE:Saved from NFC Card
END:VCARD`.trim();

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cardData.profile.fullName}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Log the contact save action
    if (cardData.card?._id) {
      logUserAction(cardData.card._id, {
        type: 'save_contact',
        label: 'Save Contact'
      });
    }
  };

  // Handle link clicks for analytics
  const handleLinkClick = (linkType, label, url) => {
    if (cardData.card?._id) {
      logUserAction(cardData.card._id, {
        type: 'link_click',
        label,
        url
      });
    }
  };

  // Handle media interactions for analytics
  const handleMediaInteraction = (mediaType, mediaId, action) => {
    if (cardData.card?._id) {
      logUserAction(cardData.card._id, {
        type: `${mediaType}_${action}`,
        mediaId,
        action
      });
    }
  };

  const socialIcons = {
    linkedin: LinkedIn,
    github: GitHub,
    twitter: Twitter,
    facebook: Facebook,
    youtube: YouTube,
    instagram: Instagram,
    website: Language
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: '#f4f6fb', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 2
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: '#f4f6fb', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 2
      }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  // Show card data
  if (!cardData?.profile) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: '#f4f6fb', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 2
      }}>
        <Typography variant="h6" color="text.secondary">
          No card data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: '#f4f6fb', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start',
      padding: 2
    }}>
      <Card sx={{ 
        maxWidth: 410, 
        width: '100%', 
        borderRadius: 3, 
        boxShadow: '0 6px 32px rgba(25, 30, 50, 0.10)',
        background: '#fff'
      }}>
        <CardMedia
          component="img"
          height="600"
          image={cardData.profile.profileImage}
          alt={cardData.profile.fullName}
          sx={{ objectFit: 'cover', objectPosition: 'top' }}
        />
        
        <CardContent sx={{ padding: 3 }}>
          {/* Name and Title */}
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700, 
            marginBottom: 0.5,
            fontSize: '1.45rem'
          }}>
            {cardData.profile.fullName}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 0.5 }}>
            {cardData.profile.jobTitle}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
            {cardData.profile.location}
          </Typography>

          {/* Social Links */}
          <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
            {Object.entries(cardData.profile.socialLinks).map(([platform, url]) => {
              const IconComponent = socialIcons[platform];
              return IconComponent ? (
                <IconButton
                  key={platform}
                  href={url}
                  target="_blank"
                  onClick={() => handleLinkClick('social', platform, url)}
                  sx={{ color: '#4a5568', '&:hover': { color: '#1a202c' } }}
                >
                  <IconComponent />
                </IconButton>
              ) : null;
            })}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, marginBottom: 3 }}>
            <Button
              variant="contained"
              startIcon={<ContactPage />}
              onClick={handleSaveContact}
              sx={{ 
                flex: 1, 
                backgroundColor: '#23272f',
                '&:hover': { backgroundColor: '#11131a' },
                borderRadius: 2
              }}
            >
              Save Contact
            </Button>
            <Button
              variant="contained"
              startIcon={<CalendarToday />}
              onClick={() => setOpenBookingDialog(true)}
              sx={{ 
                flex: 1, 
                backgroundColor: '#23272f',
                '&:hover': { backgroundColor: '#11131a' },
                borderRadius: 2
              }}
            >
              Book Now
            </Button>
          </Box>

          {/* Bio */}
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1, color: '#2d3748' }}>
            Bio
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            {cardData.profile.bio}
          </Typography>

          {/* Featured Links */}
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1, color: '#2d3748' }}>
            Featured
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginBottom: 2 }}>
            {cardData.profile.featuredLinks.slice(0, 3).map((link, index) => (
              <Chip
                key={index}
                label={link.label}
                component="a"
                href={link.url}
                target="_blank"
                clickable
                onClick={() => handleLinkClick('featured', link.label, link.url)}
                sx={{ 
                  backgroundColor: '#f7fafc',
                  '&:hover': { backgroundColor: '#e2e8f0' }
                }}
              />
            ))}
            {cardData.profile.featuredLinks.length > 3 && (
              <Chip
                icon={<Add />}
                label={`+${cardData.profile.featuredLinks.length - 3} more`}
                onClick={() => handleLinkClick('featured', 'view_all', 'featured_dialog')}
                clickable
                sx={{ 
                  backgroundColor: '#f7fafc',
                  '&:hover': { backgroundColor: '#e2e8f0' }
                }}
              />
            )}
          </Box>

          {/* Gallery */}
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1, color: '#2d3748' }}>
            Gallery
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', marginBottom: 2, paddingBottom: 1, borderBottom: '1px solid #f0f0f0' }}>
            {cardData.profile.gallery.map((item, index) => {
              // Determine the image or video source
              let imgSrc = '';
              if (item.type === 'image') {
                if (item.data && Array.isArray(item.data)) {
                  // Buffer object, convert to base64
                  const base64 = btoa(String.fromCharCode(...item.data));
                  imgSrc = `data:image/jpeg;base64,${base64}`;
                } else if (typeof item.url === 'string') {
                  imgSrc = item.url;
                }
              } else if (item.type === 'video') {
                imgSrc = item.thumbnail;
              }
              return (
                <Box key={index} sx={{ minWidth: 110, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', marginBottom: 0.5 }}>
                    <a
                      href={item.type === 'video' ? item.url : imgSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => {
                        if (!imgSrc && item.type !== 'video') {
                          e.preventDefault();
                          alert('This media does not have a valid URL.');
                          return;
                        }
                        handleMediaInteraction(item.type, item.title, item.type === 'video' ? 'play' : 'view');
                      }}
                    >
                      <img
                        src={imgSrc}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: 68,
                          objectFit: 'cover',
                          borderRadius: 8,
                          cursor: 'pointer'
                        }}
                      />
                      {item.type === 'video' && (
                        <PlayArrow
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: '50%',
                            padding: 0.5,
                            pointerEvents: 'none'
                          }}
                        />
                      )}
                    </a>
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '0.9rem', color: '#333' }}>
                    {item.title}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Recent Activity */}
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1, color: '#2d3748' }}>
            Recent Activity
          </Typography>
          <Box>
            {cardData.profile.recentActivity.map((activity, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, marginBottom: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>
                  {activity.icon}
                </Typography>
                <Typography variant="body2">
                  {activity.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>

        {/* Footer */}
        <Box sx={{ 
          textAlign: 'center', 
          padding: 2, 
          color: '#888', 
          fontSize: '1rem',
          letterSpacing: '0.01em'
        }}>
          made with <span>💜</span> by Nikko Mission
        </Box>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={openBookingDialog} onClose={() => setOpenBookingDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Book a Meeting</DialogTitle>
        <form onSubmit={handleBookingSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Your Name"
              value={bookingForm.name}
              onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={bookingForm.email}
              onChange={e => setBookingForm({ ...bookingForm, email: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Preferred Date"
              type="date"
              value={bookingForm.date}
              onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth required margin="normal">
              <InputLabel>Preferred Time</InputLabel>
              <Select
                value={bookingForm.time}
                label="Preferred Time"
                onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
              >
                <MenuItem value="Morning">Morning</MenuItem>
                <MenuItem value="Afternoon">Afternoon</MenuItem>
                <MenuItem value="Evening">Evening</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Purpose / Message (optional)"
              multiline
              rows={3}
              value={bookingForm.purpose}
              onChange={e => setBookingForm({ ...bookingForm, purpose: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBookingDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Submit</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Thank You Snackbar */}
      <Snackbar
        open={showThankYou}
        autoHideDuration={3000}
        onClose={() => setShowThankYou(false)}
      >
        <Alert severity="success" onClose={() => setShowThankYou(false)}>
          Thank you! Your meeting request has been submitted.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NFCCard; 