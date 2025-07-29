import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';

const BusinessCard = ({ cardData, onShowFeaturedModal, onShowBookModal, onLogAction }) => {
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const [bioExpanded, setBioExpanded] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  const { card, user, profile } = cardData || {};

  // Helper function to validate and format contact data
  const getContactData = () => {
    const contactData = {
      name: profile?.fullName || user?.username || 'Contact',
      jobTitle: profile?.jobTitle || '',
      company: profile?.company || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
      website: profile?.website || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
      socialLinks: profile?.socialLinks || {}
    };

    // Clean and validate phone number
    if (contactData.phone) {
      contactData.phone = contactData.phone.replace(/[^\d+\-\(\)\s]/g, '');
    }

    // Clean and validate email
    if (contactData.email && !contactData.email.includes('@')) {
      contactData.email = '';
    }

    // Clean and validate website
    if (contactData.website && !contactData.website.startsWith('http')) {
      contactData.website = `https://${contactData.website}`;
    }

    return contactData;
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (profile?.profileImage) {
      if (profile.profileImage.url) {
        return profile.profileImage.url;
      } else if (profile.profileImage.data) {
        return `data:image/jpeg;base64,${profile.profileImage.data}`;
      }
    }
    return 'https://via.placeholder.com/180x200?text=No+Image';
  };

  // Get social links
  const getSocialLinks = () => {
    const links = [];
    if (profile?.socialLinks) {
      Object.entries(profile.socialLinks).forEach(([platform, url]) => {
        if (url) {
          links.push({ platform, url });
        }
      });
    }
    return links;
  };

  // Get action buttons
  const getActionButtons = () => {
    const actions = [];
    
    // Book Now button - always show
    actions.push({
      label: 'Book Now',
      variant: 'dark',
      onClick: () => {
        onShowBookModal();
        onLogAction(card._id, {
          type: 'book_now_click',
          label: 'Clicked Book Now',
          url: ''
        });
      },
      icon: 'fas fa-calendar-check'
    });

    // Save Contact button - always show
    actions.push({
      label: savingContact ? 'Saving...' : 'Save Contact',
      variant: 'outline-dark',
      disabled: savingContact,
      onClick: async () => {
        if (savingContact) return;
        
        setSavingContact(true);
        
        // Log the action first
        onLogAction(card._id, {
          type: 'save_contact_click',
          label: 'Clicked Save Contact',
          url: ''
        });

        try {
          // Get validated contact details
          const contact = getContactData();

          // Create comprehensive vCard data
          const vCardLines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${contact.name}`,
            `N:${contact.name.split(' ').reverse().join(';')};;;`,
            `TITLE:${contact.jobTitle}`,
            `ORG:${contact.company}`,
            `TEL;TYPE=WORK,VOICE:${contact.phone}`,
            `EMAIL;TYPE=WORK,INTERNET:${contact.email}`,
            `URL:${contact.website}`,
            `ADR;TYPE=WORK:;;${contact.location}`,
            `NOTE:${contact.bio.replace(/\n/g, '\\n')}`,
            `REV:${new Date().toISOString()}`,
            'END:VCARD'
          ];

          // Filter out empty lines and join
          const vCardData = vCardLines
            .filter(line => !line.includes(':') || line.split(':')[1]?.trim())
            .join('\r\n');

          // Create and download vCard file
          const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${contact.name.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Log the successful download
          onLogAction(card._id, {
            type: 'contact_downloaded',
            label: 'Contact Downloaded Successfully',
            url: ''
          });

          // Show success feedback
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Contact saved successfully!', 'success');
          }
        } catch (error) {
          console.error('Error saving contact:', error);
          
          // Log the error
          onLogAction(card._id, {
            type: 'contact_download_error',
            label: 'Contact Download Failed',
            url: ''
          });

          // Show error feedback
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Failed to save contact. Please try again.', 'error');
          }
        } finally {
          setSavingContact(false);
        }
      },
      icon: savingContact ? 'fas fa-spinner fa-spin' : 'fas fa-user-plus'
    });

    return actions;
  };

  // Debug logging
  console.log('BusinessCard render:', { card, user, profile });
  console.log('Action buttons:', getActionButtons());

  // Handle social link click
  const handleSocialClick = (platform, url) => {
    onLogAction(card._id, {
      type: 'social_link_click',
      label: `Clicked: ${platform}`,
      url: url
    });
  };

  // Handle featured link click
  const handleFeaturedClick = (link) => {
    onLogAction(card._id, {
      type: 'featured_link_click',
      label: `Clicked: ${link.label}`,
      url: link.url
    });
  };

  // Check if URL is a video
  const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const videoDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
    
    // Check for video file extensions
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Check for video domains
    const isVideoDomain = videoDomains.some(domain => url.toLowerCase().includes(domain));
    
    return hasVideoExtension || isVideoDomain;
  };

  // Get video thumbnail URL
  const getVideoThumbnail = (url) => {
    if (!url) return null;
    
    // YouTube thumbnail
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    }
    
    // Vimeo thumbnail
    if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      if (videoId) {
        return `https://vumbnail.com/${videoId}.jpg`;
      }
    }
    
    // For other video URLs, return a video icon placeholder
    return null;
  };

  // Handle gallery item click
  const handleGalleryClick = (index) => {
    setGalleryIndex(index);
    setShowGalleryModal(true);
    onLogAction(card._id, {
      type: 'gallery_item_click',
      label: `Viewed gallery item ${index + 1}`,
      url: profile?.gallery?.[index]?.url || ''
    });
  };

  // Handle image load
  const handleImageLoad = (index) => {
    setImageLoadStates(prev => ({ ...prev, [index]: 'loaded' }));
  };

  // Handle image error
  const handleImageError = (index) => {
    setImageLoadStates(prev => ({ ...prev, [index]: 'error' }));
  };

  // Handle bio expand/collapse
  const handleBioToggle = () => {
    setBioExpanded(!bioExpanded);
    onLogAction(card._id, {
      type: bioExpanded ? 'bio_collapsed' : 'bio_expanded',
      label: bioExpanded ? 'Collapsed bio' : 'Expanded bio',
      url: ''
    });
  };

  // Format bio text with truncation
  const formatBioText = (text) => {
    if (!text) return '';
    
    const maxLength = 150; // Characters to show before truncation
    const shouldTruncate = text.length > maxLength;
    
    if (!shouldTruncate) return text;
    
    if (bioExpanded) {
      return text;
    } else {
      // Find the last complete word within the limit
      const truncated = text.substring(0, maxLength);
      const lastSpaceIndex = truncated.lastIndexOf(' ');
      const finalText = lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated;
      return finalText + '...';
    }
  };

  return (
    <>
      <Card className="w-100 business-card">
        {/* Profile Image */}
        <Card.Img
          variant="top"
          src={getProfileImageUrl()}
          alt={profile?.fullName || user?.username || 'Profile'}
          className="profile-img-top"
        />
        
        <Card.Body>
          {/* Name */}
          <Card.Title className="mb-1 fw-bold">
            {profile?.fullName || user?.username || ''}
          </Card.Title>
          
          {/* Title */}
          <div className="mb-1 text-secondary">
            {profile?.jobTitle || ''}
          </div>
          
          {/* Location */}
          <div className="mb-3 text-muted">
            {profile?.location || ''}
          </div>
          
          {/* Social Links */}
          <div className="card-social mb-3">
            {getSocialLinks().slice(0, 3).map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSocialClick(link.platform, link.url)}
                className="social-link"
              >
                <i className={`fab fa-${link.platform.toLowerCase()}`}></i>
              </a>
            ))}
            {getSocialLinks().length > 3 && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  // Show all social links in a modal or expand the section
                  const allLinks = getSocialLinks();
                  allLinks.forEach(link => {
                    window.open(link.url, '_blank');
                  });
                  onLogAction(card._id, {
                    type: 'view_all_social',
                    label: 'Viewed all social links',
                    url: ''
                  });
                }}
                className="social-view-all-btn"
              >
                +{getSocialLinks().length - 3} more
              </Button>
            )}
          </div>
          
          {/* Contact Information */}
          <div className="card-section-label">Contact Info</div>
          <div className="contact-info mb-3">
            {(() => {
              const contact = getContactData();
              const contactItems = [];
              
              if (contact.phone) {
                contactItems.push(
                  <div key="phone" className="contact-item">
                    <i className="fas fa-phone text-muted me-2"></i>
                    <a href={`tel:${contact.phone}`} className="contact-link">
                      {contact.phone}
                    </a>
                  </div>
                );
              }
              
              if (contact.email) {
                contactItems.push(
                  <div key="email" className="contact-item">
                    <i className="fas fa-envelope text-muted me-2"></i>
                    <a href={`mailto:${contact.email}`} className="contact-link">
                      {contact.email}
                    </a>
                  </div>
                );
              }
              
              if (contact.website) {
                contactItems.push(
                  <div key="website" className="contact-item">
                    <i className="fas fa-globe text-muted me-2"></i>
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="contact-link">
                      {contact.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                );
              }
              
              if (contact.location) {
                contactItems.push(
                  <div key="location" className="contact-item">
                    <i className="fas fa-map-marker-alt text-muted me-2"></i>
                    <span>{contact.location}</span>
                  </div>
                );
              }
              
              return contactItems.length > 0 ? contactItems : (
                <div className="text-muted">No contact information available</div>
              );
            })()}
          </div>
          
          {/* Action Buttons */}
          <div className="d-flex gap-3 mb-4">
            {getActionButtons().map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.onClick}
                className="action-btn flex-fill"
                disabled={action.disabled}
              >
                <i className={action.icon} style={{ marginRight: '0.5rem' }}></i>
                {action.label}
              </Button>
            ))}
          </div>
          
          {/* Bio */}
          <div className="card-section-label">Bio</div>
          <div className="mb-3">
            <div className="bio-text">
              {formatBioText(profile?.bio || '')}
            </div>
            {profile?.bio && profile.bio.length > 150 && (
              <button
                className="bio-toggle-btn"
                onClick={handleBioToggle}
              >
                {bioExpanded ? (
                  <>
                    <i className="fas fa-chevron-up"></i>
                    Show Less
                  </>
                ) : (
                  <>
                    <i className="fas fa-chevron-down"></i>
                    Read More
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Featured Links */}
          <div className="card-section-label">Featured</div>
          <div className="d-flex gap-2 flex-wrap align-items-center card-featured">
            {profile?.featuredLinks?.slice(0, 3).map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleFeaturedClick(link)}
                className="featured-link"
              >
                {link.label}
              </a>
            ))}
            {profile?.featuredLinks && profile.featuredLinks.length > 3 && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  onShowFeaturedModal();
                  onLogAction(card._id, {
                    type: 'view_all_featured_click',
                    label: 'Clicked View All Featured',
                    url: ''
                  });
                }}
              >
                +{profile.featuredLinks.length - 3} more
              </Button>
            )}
          </div>
          
          {/* Gallery */}
          {profile?.gallery && profile.gallery.length > 0 && (
            <>
              <div className="card-section-label">Gallery</div>
              <div className="card-gallery mb-3">
                {profile.gallery.map((item, index) => {
                  const isVideo = isVideoUrl(item.url);
                  const thumbnailUrl = isVideo ? getVideoThumbnail(item.url) : (item.url || `data:image/jpeg;base64,${item.data}`);
                  const loadState = imageLoadStates[index];
                  
                  return (
                    <div key={index} className="gallery-item">
                      <div className="gallery-media-container" onClick={() => handleGalleryClick(index)}>
                        {loadState === 'error' ? (
                          <div className="gallery-error">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>Failed to load</span>
                          </div>
                        ) : (
                          <>
                            {isVideo ? (
                              <>
                                <img
                                  src={thumbnailUrl || 'https://via.placeholder.com/120x68/4F46E5/FFFFFF?text=Video'}
                                  alt={`Gallery ${index + 1}`}
                                  className="gallery-image"
                                  onLoad={() => handleImageLoad(index)}
                                  onError={() => handleImageError(index)}
                                />
                                <div className="video-overlay">
                                  <i className="fas fa-play-circle"></i>
                                </div>
                              </>
                            ) : (
                              <>
                                <img
                                  src={thumbnailUrl}
                                  alt={`Gallery ${index + 1}`}
                                  className="gallery-image"
                                  onLoad={() => handleImageLoad(index)}
                                  onError={() => handleImageError(index)}
                                />
                                {!loadState && (
                                  <div className="gallery-loading">
                                    <i className="fas fa-spinner fa-spin"></i>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card.Body>
        
        {/* Footer */}
        <div className="text-center mt-4 mb-3" style={{ color: '#888', fontSize: '1rem', letterSpacing: '0.01em' }}>
          made with <span>💜</span> by Nikko Mission
        </div>
      </Card>

      {/* Gallery Modal */}
      {showGalleryModal && profile?.gallery && (
        <div className="gallery-modal-overlay" onClick={() => {
          setShowGalleryModal(false);
          onLogAction(card._id, {
            type: 'gallery_modal_close_overlay',
            label: 'Closed gallery modal (overlay)',
            url: ''
          });
        }}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="gallery-modal-close"
              onClick={() => {
                setShowGalleryModal(false);
                onLogAction(card._id, {
                  type: 'gallery_modal_close_button',
                  label: 'Closed gallery modal (X button)',
                  url: ''
                });
              }}
            >
              ×
            </button>
            {(() => {
              const currentItem = profile.gallery[galleryIndex];
              const isVideo = isVideoUrl(currentItem?.url);
              
              return isVideo ? (
                <div className="gallery-modal-video">
                  <iframe
                    src={currentItem?.url}
                    title={`Gallery ${galleryIndex + 1}`}
                    className="gallery-modal-video-frame"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <img
                  src={currentItem?.url || `data:image/jpeg;base64,${currentItem?.data}`}
                  alt={`Gallery ${galleryIndex + 1}`}
                  className="gallery-modal-image"
                />
              );
            })()}
            <div className="gallery-modal-nav">
              <button
                onClick={() => {
                  const newIndex = Math.max(0, galleryIndex - 1);
                  setGalleryIndex(newIndex);
                  onLogAction(card._id, {
                    type: 'gallery_navigation',
                    label: `Navigated to gallery item ${newIndex + 1}`,
                    url: profile?.gallery?.[newIndex]?.url || ''
                  });
                }}
                disabled={galleryIndex === 0}
              >
                ‹
              </button>
              <span>{galleryIndex + 1} / {profile.gallery.length}</span>
              <button
                onClick={() => {
                  const newIndex = Math.min(profile.gallery.length - 1, galleryIndex + 1);
                  setGalleryIndex(newIndex);
                  onLogAction(card._id, {
                    type: 'gallery_navigation',
                    label: `Navigated to gallery item ${newIndex + 1}`,
                    url: profile?.gallery?.[newIndex]?.url || ''
                  });
                }}
                disabled={galleryIndex === profile.gallery.length - 1}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessCard; 