import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const BusinessCard = ({ cardData, onShowFeaturedModal, onShowBookModal, onLogAction }) => {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [galleryIndex, setGalleryIndex] = useState(0);

  const { card, user, profile } = cardData || {};

  // Helper function to check if a field should be visible
  const isFieldVisible = (fieldName) => {
    if (!profile?.visibilitySettings) return true; // Default to visible if no settings
    return profile.visibilitySettings[fieldName] !== false;
  };

  // Helper function to check if a social media platform should be visible
  const isSocialMediaVisible = (platform) => {
    if (!profile?.visibilitySettings?.socialLinks) return true; // Default to visible if no settings
    return profile.visibilitySettings.socialLinks[platform] !== false;
  };

  // Helper function to check if a section should be visible
  const isSectionVisible = (sectionName) => {
    if (!profile?.visibilitySettings) return true; // Default to visible if no settings
    return profile.visibilitySettings[sectionName] !== false;
  };

  // Helper function to check if a section has any visible content
  const hasVisibleContent = (sectionName) => {
    if (!isSectionVisible(sectionName)) return false;
    
    switch (sectionName) {
      case 'featuredLinks':
        return profile?.featuredLinks && profile.featuredLinks.length > 0;
      case 'gallery':
        return profile?.gallery && profile.gallery.length > 0;
      case 'socialLinks':
        return getSocialLinks().length > 0;
      default:
        return true;
    }
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (profile?.profileImage) {
      if (profile.profileImage.secureUrl) {
        return profile.profileImage.secureUrl;
      } else if (profile.profileImage.url) {
        // Convert HTTP to HTTPS for Cloudinary URLs
        if (profile.profileImage.url.startsWith('http://')) {
          return profile.profileImage.url.replace('http://', 'https://');
        }
        return profile.profileImage.url;
      } else if (profile.profileImage.data) {
        return `data:image/jpeg;base64,${profile.profileImage.data}`;
      }
    }
    return 'https://via.placeholder.com/180x200?text=No+Image';
  };

  // Avatar image (fallbacks to profile image)
  const getAvatarUrl = () => {
    return getProfileImageUrl();
  };

  // Get social links
  const getSocialLinks = () => {
    const links = [];
    if (profile?.socialLinks) {
      Object.entries(profile.socialLinks).forEach(([platform, url]) => {
        if (url && isSocialMediaVisible(platform)) {
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
      label: 'Save Contact',
      variant: 'outline-dark',
      onClick: () => {
        // Log the action first
        onLogAction(card._id, {
          type: 'save_contact_click',
          label: 'Clicked Save Contact',
          url: ''
        });

        // Create vCard data with visibility respect
        const vCardFields = [
          'BEGIN:VCARD',
          'VERSION:3.0'
        ];

        // Add visible fields only
        if (isFieldVisible('fullName') && (profile?.fullName || user?.username)) {
          vCardFields.push(`FN:${profile?.fullName || user?.username || 'Contact'}`);
        }

        if (isFieldVisible('jobTitle') && profile?.jobTitle) {
          vCardFields.push(`TITLE:${profile.jobTitle}`);
        }

        if (isFieldVisible('company') && profile?.company) {
          vCardFields.push(`ORG:${profile.company}`);
        }

        if (isFieldVisible('phone') && profile?.contact?.phone) {
          vCardFields.push(`TEL:${profile.contact.phone}`);
        }

        if (isFieldVisible('email') && profile?.contact?.email) {
          vCardFields.push(`EMAIL:${profile.contact.email}`);
        }

        if (profile?.website) {
          vCardFields.push(`URL:${profile.website}`);
        }

        if (isFieldVisible('location') && profile?.contact?.location) {
          vCardFields.push(`ADR:;;${profile.contact.location}`);
        }

        if (isFieldVisible('bio') && profile?.bio) {
          vCardFields.push(`NOTE:${profile.bio}`);
        }

        vCardFields.push('END:VCARD');
        const vCardData = vCardFields.join('\r\n');

        // Prefer opening the Contacts app via backend public vCard URL on mobile (prevents Safari blocking)
        const fileName = `${profile?.fullName || user?.username || 'contact'}.vcf`;
        const ua = (navigator.userAgent || '').toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(ua);
        const isAndroid = /android/.test(ua);
        const backendBase = 'https://onetapp-backend-website.onrender.com';
        const hasProfileId = !!profile?._id;

        if ((isIOS || isAndroid) && hasProfileId) {
          // Use inline-served vCard from backend to trigger native Add to Contacts UI
          const publicVcardUrl = `${backendBase}/api/profiles/public/${profile._id}/vcard`;
          window.location.href = publicVcardUrl;
        } else {
          // Fallbacks: data URL for mobile without id, Blob download for desktop
          const vcardDataUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardData)}`;
          if (isIOS || isAndroid) {
            const a = document.createElement('a');
            a.href = vcardDataUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
            link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
          }
        }

        // Log the successful download
        onLogAction(card._id, {
          type: 'contact_downloaded',
          label: 'Contact Downloaded',
          url: ''
        });
      },
      icon: 'fas fa-user-plus'
    });





    return actions;
  };

  // Debug logging
  console.log('BusinessCard render:', { card, user, profile });
  console.log('Action buttons:', getActionButtons());
  console.log('Gallery items:', profile?.gallery);
  if (profile?.gallery) {
    profile.gallery.forEach((item, index) => {
      console.log(`Gallery item ${index}:`, {
        url: item.url,
        secureUrl: item.secureUrl,
        publicId: item.publicId,
        type: item.type,
        duration: item.duration
      });
    });
  }

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

  // Gallery modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);

  // Handle gallery item click
  const handleGalleryItemClick = (item, index) => {
    setSelectedGalleryItem({ ...item, index });
    setShowGalleryModal(true);
    
    // Track gallery item click
    onLogAction(card._id, {
      type: 'gallery_item_click',
      label: `Clicked gallery item: ${item.title || `Item ${index + 1}`}`,
      url: item.secureUrl || item.url || ''
    });
  };

  // Gallery navigation
  const goPrev = () => {
    if (!profile?.gallery || profile.gallery.length === 0) return;
    setGalleryIndex((prev) => (prev - 1 + profile.gallery.length) % profile.gallery.length);
  };

  const goNext = () => {
    if (!profile?.gallery || profile.gallery.length === 0) return;
    setGalleryIndex((prev) => (prev + 1) % profile.gallery.length);
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

  // Handle description expansion
  const toggleDescription = (itemIndex) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex]
    }));
    onLogAction(card._id, {
      type: expandedDescriptions[itemIndex] ? 'gallery_description_collapsed' : 'gallery_description_expanded',
      label: expandedDescriptions[itemIndex] ? 'Collapsed gallery description' : 'Expanded gallery description',
      url: ''
    });
  };

  // Format description text with truncation
  const formatDescriptionText = (text, itemIndex) => {
    if (!text) return '';
    
    const maxLength = 120; // Characters to show before truncation
    const shouldTruncate = text.length > maxLength;
    
    if (!shouldTruncate) return text;
    
    if (expandedDescriptions[itemIndex]) {
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
        {/* Header with overlay design */}
        <div className="header-hero">
          <img
            src={getProfileImageUrl()}
            alt={profile?.fullName || user?.username || 'Profile'}
            className="profile-img-top"
          />
          <div className="header-gradient"></div>

          <div className="header-content">
            <div className="avatar-wrap">
              <img src={getAvatarUrl()} alt="avatar" className="avatar-img" />
            </div>
            {isFieldVisible('fullName') && (
              <div className="header-name">{profile?.fullName || user?.username || ''}</div>
            )}
            <div className="badge-row">
              {isFieldVisible('jobTitle') && profile?.jobTitle && (
                <span className="badge-chip"><i className="fas fa-briefcase"></i> {profile.jobTitle}</span>
              )}
              {isFieldVisible('company') && profile?.company && (
                <span className="badge-chip"><i className="fas fa-building"></i> {profile.company}</span>
              )}
              {isFieldVisible('location') && profile?.contact?.location && (
                <span className="badge-chip"><i className="fas fa-map-marker-alt"></i> {profile.contact.location}</span>
              )}
            </div>

            <div className="header-quick-actions">
              {/* Share */}
              <button
                className="quick-icon"
                title="Share Card"
                onClick={() => {
                  onLogAction(card._id, { type: 'share_card_click', label: 'Clicked Share Card', url: '' });
                  if (navigator.share) {
                    navigator.share({
                      title: isFieldVisible('fullName') ? `${profile?.fullName || user?.username || 'Contact'}'s Business Card` : 'Business Card',
                      text: isFieldVisible('fullName') ? `Check out ${profile?.fullName || user?.username || 'Contact'}'s business card` : 'Check out this business card',
                      url: window.location.href
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href).catch(() => {});
                  }
                }}
              >
                <i className="fas fa-share-alt"></i>
              </button>
              {/* Directions */}
              {isFieldVisible('location') && profile?.contact?.location && (
                <button
                  className="quick-icon"
                  title="Get Directions"
                  onClick={() => {
                    onLogAction(card._id, { type: 'get_directions_click', label: 'Clicked Get Directions', url: '' });
                    const encodedLocation = encodeURIComponent(profile.contact.location);
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
                    window.open(mapsUrl, '_blank');
                  }}
                >
                  <i className="fas fa-map-marker-alt"></i>
                </button>
              )}
              {/* Quote */}
              <button
                className="quick-icon"
                title="Request Quote"
                disabled={!isFieldVisible('email') || !profile?.contact?.email}
                onClick={() => {
                  onLogAction(card._id, { type: 'request_quote_click', label: 'Clicked Request Quote', url: '' });
                  const subject = encodeURIComponent(`Quote Request from ${isFieldVisible('fullName') ? (profile?.fullName || user?.username || 'Contact') : 'Contact'}`);
                  const body = encodeURIComponent(`Hi ${isFieldVisible('fullName') ? (profile?.fullName || user?.username || 'Contact') : 'there'},\n\nI'm interested in your services and would like to request a quote.\n\nPlease provide details about:\n- Project requirements\n- Timeline\n- Budget range\n\nLooking forward to hearing from you!\n\nBest regards`);
                  const emailUrl = `mailto:${isFieldVisible('email') ? (profile?.contact?.email || '') : ''}?subject=${subject}&body=${body}`;
                  window.open(emailUrl);
                }}
              >
                <i className="fas fa-file-invoice-dollar"></i>
              </button>
            </div>
          </div>
        </div>
        
        <Card.Body>
          {/* Connect section under header */}
          {hasVisibleContent('socialLinks') && (
            <div className="connect-inline mb-3">
              <div className="connect-inline-title">CONNECT WITH ME</div>
              <div className="connect-inline-icons">
                {getSocialLinks().slice(0, 3).map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="connect-btn"
                    onClick={() => handleSocialClick(link.platform, link.url)}
                  >
                    <i className={`fab fa-${link.platform.toLowerCase()}`}></i>
                  </a>
                ))}
              </div>
            </div>
          )}
          {/* Primary CTAs - keep only Book & Save */}
          <div className="d-flex gap-3 mb-4">
            {getActionButtons().map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.onClick}
                className="action-btn flex-fill"
              >
                <i className={action.icon} style={{ marginRight: '0.5rem' }}></i>
                {action.label}
              </Button>
            ))}
          </div>
          
          {/* Bio */}
          {isFieldVisible('bio') && profile?.bio && (
            <>
          <div className="card-section-label section-centered">BIO</div>
          <div className="mb-3">
            <div className="bio-text">
                  {formatBioText(profile.bio)}
            </div>
                {profile.bio.length > 150 && (
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
            </>
          )}
          
          {/* Featured Links */}
          {hasVisibleContent('featuredLinks') && (
            <>
          <div className="card-section-label section-centered">FEATURED</div>
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
            </>
          )}
          
          {/* Gallery (Swiper - dots only) */}
          {hasVisibleContent('gallery') && (
            <>
              <div className="card-section-label section-centered">GALLERY</div>
              <Swiper
                modules={[Pagination]}
                pagination={{ clickable: true }}
                className="gallery-swiper"
                onSlideChange={(s) => setGalleryIndex(s.activeIndex)}
              >
                {profile.gallery.map((item, index) => {
                  const getItemUrl = () => {
                    if (item.secureUrl) return item.secureUrl;
                    if (item.url && item.url.startsWith('https://')) return item.url;
                    if (item.url && item.url.startsWith('http://')) return item.url.replace('http://', 'https://');
                    if (item.url && !item.url.startsWith('http')) return `https://${item.url}`;
                    if (item.url) return item.url;
                    if (item.data) return `data:image/jpeg;base64,${item.data}`;
                    return null;
                  };
                  const itemUrl = getItemUrl();
                  return (
                    <SwiperSlide key={index}>
                      <div className="gallery-item image-left">
                        <div className="gallery-image-container">
                          {itemUrl ? (
                            <img
                              src={itemUrl}
                              alt={item.title || `Gallery ${index + 1}`}
                              className="gallery-image"
                              onClick={() => handleGalleryItemClick(item, index)}
                              style={{ cursor: 'pointer' }}
                            />
                          ) : (
                            <div className="gallery-error">
                              <i className="fas fa-exclamation-triangle"></i>
                              <span>No image</span>
                            </div>
                          )}
                        </div>
                        <div className="gallery-content">
                          <h4 className="gallery-title">{item.title || `Gallery Item ${index + 1}`}</h4>
                          <div className="gallery-description">
                            <span>
                              {formatDescriptionText(item.description || 'No description available for this gallery item.', index)}
                            </span>
                            {(item.description || 'No description available for this gallery item.').length > 120 && (
                              <button className="view-more-btn" onClick={() => toggleDescription(index)}>
                                {expandedDescriptions[index] ? (
                                  <>
                                    view less <i className="fas fa-chevron-up"></i>
                                  </>
                                ) : (
                                  <>
                                    view more <i className="fas fa-chevron-down"></i>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </>
          )}
          
          {/* Social Links */}
          {hasVisibleContent('socialLinks') && (
            <>
              <div className="card-section-label section-centered">CONNECT WITH ME</div>
              <div className="card-social mb-3">
            {getSocialLinks().slice(0, 5).map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSocialClick(link.platform, link.url)}
                className="social-link"
              >
                <i className={`fab fa-${link.platform.toLowerCase()}`}></i>
                <span className="platform-name">{link.platform}</span>
              </a>
            ))}
            {getSocialLinks().length > 5 && (
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
                +{getSocialLinks().length - 5} more
              </Button>
            )}
              </div>
            </>
          )}
          
          {/* Bottom Quick Actions removed (moved to header overlay) */}
        </Card.Body>
        
        {/* Gallery Modal */}
        {showGalleryModal && selectedGalleryItem && (
          <div className="gallery-modal-overlay" onClick={() => setShowGalleryModal(false)}>
            <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="gallery-modal-header">
                <h4>{selectedGalleryItem.title || `Gallery Item ${selectedGalleryItem.index + 1}`}</h4>
                <button 
                  className="gallery-modal-close"
                  onClick={() => setShowGalleryModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="gallery-modal-body" style={{ position: 'relative' }}>
                <button className="carousel-nav left" onClick={() => setSelectedGalleryItem((prev) => {
                  const nextIndex = (prev.index - 1 + profile.gallery.length) % profile.gallery.length;
                  return { ...profile.gallery[nextIndex], index: nextIndex };
                })} aria-label="Previous">
                  <i className="fas fa-chevron-left"></i>
                </button>
                <img 
                  src={selectedGalleryItem.secureUrl || selectedGalleryItem.url || ''} 
                  alt={selectedGalleryItem.title || `Gallery ${selectedGalleryItem.index + 1}`}
                  className="gallery-modal-image"
                />
                <button className="carousel-nav right" onClick={() => setSelectedGalleryItem((prev) => {
                  const nextIndex = (prev.index + 1) % profile.gallery.length;
                  return { ...profile.gallery[nextIndex], index: nextIndex };
                })} aria-label="Next">
                  <i className="fas fa-chevron-right"></i>
                </button>
                {selectedGalleryItem.description && (
                  <div className="gallery-modal-description">
                    {selectedGalleryItem.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center mt-4 mb-3" style={{ color: '#888', fontSize: '1rem', letterSpacing: '0.01em' }}>
          powered by onetapp
        </div>
      </Card>
    </>
  );
};

export default BusinessCard; 