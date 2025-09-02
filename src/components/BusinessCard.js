import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y, EffectCoverflow, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BusinessCard = ({ cardData, onShowFeaturedModal, onShowBookModal, onLogAction }) => {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const { card, user, profile } = cardData || {};

  // Brand color initialization

  useEffect(() => {
    const root = document.documentElement;
    const brandColor = profile?.theme?.brandColor || profile?.brandColor || card?.brandColor || '#0f172a';
    root.style.setProperty('--brand', brandColor);
  }, [profile, card]);

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

        // Create and download vCard file
        const blob = new Blob([vCardData], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${profile?.fullName || user?.username || 'contact'}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

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

  // Featured chip variant by link label
  const getFeaturedVariantClass = (label) => {
    if (!label) return '';
    const key = label.toLowerCase();
    if (key.includes('resume') || key.includes('cv')) return 'chip-neutral';
    if (key.includes('project') || key.includes('portfolio')) return 'chip-accent';
    if (key.includes('shop') || key.includes('store')) return 'chip-success';
    if (key.includes('pricing') || key.includes('quote')) return 'chip-warning';
    if (key.includes('contact') || key.includes('email')) return 'chip-outline';
    return '';
  };

  // Featured icon by label
  const getFeaturedIcon = (label) => {
    if (!label) return 'fas fa-link';
    const key = label.toLowerCase();
    if (key.includes('resume') || key.includes('cv')) return 'fas fa-file-alt';
    if (key.includes('project')) return 'fas fa-folder-open';
    if (key.includes('portfolio')) return 'fas fa-briefcase';
    if (key.includes('blog')) return 'fas fa-blog';
    if (key.includes('website') || key.includes('site')) return 'fas fa-globe';
    if (key.includes('github')) return 'fab fa-github';
    if (key.includes('linkedin')) return 'fab fa-linkedin-in';
    if (key.includes('twitter') || key.includes('x ')) return 'fab fa-twitter';
    if (key.includes('youtube')) return 'fab fa-youtube';
    if (key.includes('download')) return 'fas fa-download';
    if (key.includes('contact') || key.includes('email')) return 'fas fa-envelope';
    if (key.includes('calendar') || key.includes('book')) return 'fas fa-calendar-alt';
    return 'fas fa-external-link-alt';
  };

  // Gallery modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [swiperRef, setSwiperRef] = useState(null);

  // Handle gallery item click
  const handleGalleryItemClick = (item, index) => {
    setSelectedGalleryItem({ ...item, index });
    setShowGalleryModal(true);
    // Pause autoplay while previewing
    try { swiperRef?.autoplay?.stop?.(); } catch (_) {}
    
    // Track gallery item click
    onLogAction(card._id, {
      type: 'gallery_item_click',
      label: `Clicked gallery item: ${item.title || `Item ${index + 1}`}`,
      url: item.secureUrl || item.url || ''
    });
  };

  // Handle profile avatar click to preview large image
  const handleProfileClick = () => {
    const item = {
      url: getProfileImageUrl(),
      title: profile?.fullName || user?.username || 'Profile',
      description: [profile?.jobTitle, profile?.company].filter(Boolean).join(' • ')
    };
    handleGalleryItemClick(item, 0);
  };

  // Swiper handles navigation/pagination; no custom state required







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
        {/* Modern hero header with background image and overlay */}
        <div className="card-hero">
          <img
            src={getProfileImageUrl()}
            alt={profile?.fullName || user?.username || 'Profile'}
            className="card-hero-bg"
          />
          <div className="card-hero-overlay" />
          {/* Quick Actions in hero */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              gap: '8px',
              zIndex: 2
            }}
          >
            <Button
              variant="dark"
              size="sm"
              onClick={() => {
                onLogAction(card._id, { type: 'share_card_click', label: 'Clicked Share Card', url: '' });
                if (navigator.share) {
                  navigator.share({
                    title: isFieldVisible('fullName') ? `${profile?.fullName || user?.username || 'Contact'}'s Business Card` : 'Business Card',
                    text: isFieldVisible('fullName') ? `Check out ${profile?.fullName || user?.username || 'Contact'}'s business card` : 'Check out this business card',
                    url: window.location.href
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href).catch(() => {});
                }
              }}
              className="action-btn pill"
              title="Share Card"
              aria-label="Share Card"
              style={{ width: '40px', height: '40px', padding: 0 }}
            >
              <i className="fas fa-share-alt"></i>
            </Button>

            {isFieldVisible('location') && profile?.contact?.location && (
              <Button
                variant="dark"
                size="sm"
                onClick={() => {
                  onLogAction(card._id, { type: 'get_directions_click', label: 'Clicked Get Directions', url: '' });
                  const encodedLocation = encodeURIComponent(profile.contact.location);
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
                  window.open(mapsUrl, '_blank');
                }}
                className="action-btn pill"
                title="Get Directions"
                aria-label="Get Directions"
                style={{ width: '40px', height: '40px', padding: 0 }}
              >
                <i className="fas fa-map-marker-alt"></i>
              </Button>
            )}

            <Button
              variant="dark"
              size="sm"
              disabled={!isFieldVisible('email') || !profile?.contact?.email}
              title={!isFieldVisible('email') || !profile?.contact?.email ? 'Email not available' : 'Request Quote'}
              aria-label="Request Quote"
              onClick={() => {
                onLogAction(card._id, { type: 'request_quote_click', label: 'Clicked Request Quote', url: '' });
                const subject = encodeURIComponent(`Quote Request from ${isFieldVisible('fullName') ? (profile?.fullName || user?.username || 'Contact') : 'Contact'}`);
                const body = encodeURIComponent(`Hi ${isFieldVisible('fullName') ? (profile?.fullName || user?.username || 'Contact') : 'there'},\n\nI'm interested in your services and would like to request a quote.\n\nPlease provide details about:\n- Project requirements\n- Timeline\n- Budget range\n\nLooking forward to hearing from you!\n\nBest regards`);
                const emailUrl = `mailto:${isFieldVisible('email') ? (profile?.contact?.email || '') : ''}?subject=${subject}&body=${body}`;
                window.open(emailUrl);
              }}
              className="action-btn pill"
              style={{ width: '40px', height: '40px', padding: 0 }}
            >
              <i className="fas fa-file-invoice-dollar"></i>
            </Button>
          </div>
          <div className="card-hero-content">
            <div className="avatar-ring" role="button" onClick={handleProfileClick} title="View profile photo" style={{ cursor: 'pointer' }}>
              <img
                src={getProfileImageUrl()}
                alt={profile?.fullName || user?.username || 'Profile'}
                className="avatar"
              />
            </div>
            <div className="identity">
              {isFieldVisible('fullName') && (
                <h2 className="name">{profile?.fullName || user?.username || ''}</h2>
              )}
              <div className="meta">
                {isFieldVisible('jobTitle') && profile?.jobTitle && (
                  <span className="meta-item">{profile.jobTitle}</span>
                )}
                {isFieldVisible('company') && profile?.company && (
                  <span className="meta-sep">•</span>
                )}
                {isFieldVisible('company') && profile?.company && (
                  <span className="meta-item">{profile.company}</span>
                )}
                {isFieldVisible('location') && profile?.contact?.location && (
                  <>
                    <span className="meta-sep">•</span>
                    <span className="meta-item">{profile.contact.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Card.Body>
          {/* identity moved into hero header */}
          
          {/* Theme toggle removed as per request */}

          {/* Action Buttons */}
          <div className="action-row mb-4">
            {getActionButtons().map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.onClick}
                className="action-btn pill"
              >
                <i className={action.icon} style={{ marginRight: '0.5rem' }}></i>
                {action.label}
              </Button>
            ))}
          </div>
          
          {/* Bio */}
          {isFieldVisible('bio') && profile?.bio && (
            <div className="section-row">
              <div className="card-section-label">Bio</div>
              <div className="section-block">
                <div className={`bio-text ${bioExpanded ? 'expanded' : 'clamped'}`}>
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
            </div>
          )}
          
          {/* Featured Links */}
          {hasVisibleContent('featuredLinks') && (
            <div className="section-row">
              <div className="card-section-label">Featured</div>
              <div className="section-block">
                <div className="featured-grid">
                  {profile?.featuredLinks?.slice(0, 6).map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleFeaturedClick(link)}
                      className={`featured-chip ${getFeaturedVariantClass(link.label)}`}
                    >
                      <i className={getFeaturedIcon(link.label)}></i>
                      <span>{(link.label || '').toUpperCase()}</span>
                    </a>
                  ))}
                </div>
                {profile?.featuredLinks && profile.featuredLinks.length > 6 && (
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
                    className="featured-view-all"
                  >
                    View all
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Gallery using Swiper */}
          {hasVisibleContent('gallery') && (
            <div className="section-row">
              <div className="card-section-label">Gallery</div>
              <div className="section-block">
                <div className="glass-panel gallery-panel">
                <Swiper
                  modules={[Pagination, A11y, EffectCoverflow, Autoplay]}
                  effect="coverflow"
                  coverflowEffect={{ rotate: 16, stretch: 0, depth: 120, modifier: 1, slideShadows: false }}
                  centeredSlides
                  loop
                  autoplay={{ delay: 2800, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  spaceBetween={20}
                  slidesPerView={1}
                  onSlideChange={(swiper) => setSelectedGalleryItem({ ...(profile.gallery[swiper.realIndex] || {}), index: swiper.realIndex })}
                  className="gallery-swiper"
                  onSwiper={(swiper) => setSwiperRef(swiper)}
                >
                {profile.gallery.map((item, index) => {
                  // Get the correct URL for Cloudinary or legacy data
                  const getItemUrl = () => {
                    if (item.secureUrl) {
                      return item.secureUrl; // Always use secure URL if available
                    } else if (item.url && item.url.startsWith('https://')) {
                      return item.url; // Already HTTPS
                    } else if (item.url && item.url.startsWith('http://')) {
                      // Force upgrade to HTTPS for Cloudinary URLs
                      return item.url.replace('http://', 'https://');
                    } else if (item.url && !item.url.startsWith('http')) {
                      // If no protocol specified, assume HTTPS
                      return `https://${item.url}`;
                    } else if (item.url) {
                      return item.url; // Fallback for other cases
                    } else if (item.data) {
                      // Legacy base64 data
                      return `data:image/jpeg;base64,${item.data}`;
                    }
                    return null;
                  };
                  
                  const itemUrl = getItemUrl();
                  

                  
                  return (
                    <SwiperSlide key={index}>
                      <div className="swiper-slide-inner" onClick={() => handleGalleryItemClick(item, index)}>
                        <div className="slider-card">
                          {itemUrl ? (
                            <img src={itemUrl} alt={item.title || `Gallery ${index + 1}`} className="slider-image" />
                          ) : (
                            <div className="gallery-error">
                              <i className="fas fa-exclamation-triangle"></i>
                              <span>No image</span>
                            </div>
                          )}
                          <div className="slider-caption">
                            <div className="slider-title">{item.title || `Gallery Item ${index + 1}`}</div>
                            {item.description && (
                              <div className="slider-desc">{formatDescriptionText(item.description, index)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
                </Swiper>
                {/* Caption moved inside each slide for a cleaner card layout */}
                </div>
              </div>
            </div>
          )}
          
          {/* Social Links - single-row, no slider */}
          {hasVisibleContent('socialLinks') && (
            <div className="section-row">
              <div className="card-section-label">Social Media</div>
              <div className="section-block">
                <div
                  className="mb-2"
                  style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'nowrap' }}
                >
                  {getSocialLinks().map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleSocialClick(link.platform, link.url)}
                      className="action-btn btn-dark pill"
                      style={{ padding: 0, height: '40px', width: '40px', textDecoration: 'none' }}
                      aria-label={link.platform}
                      title={link.platform}
                    >
                      <i className={`fab fa-${link.platform.toLowerCase()}`} style={{ margin: 0, fontSize: '1rem' }}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Actions moved to hero; section removed */}
        </Card.Body>
        
        {/* Gallery Modal */}
        {showGalleryModal && selectedGalleryItem && (
          <div className="gallery-modal-overlay" onClick={() => { setShowGalleryModal(false); try { swiperRef?.autoplay?.start?.(); } catch (_) {} }}>
            <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="gallery-modal-header">
                <h4>{selectedGalleryItem.title || `Gallery Item ${selectedGalleryItem.index + 1}`}</h4>
                <button 
                  className="gallery-modal-close"
                  onClick={() => { setShowGalleryModal(false); try { swiperRef?.autoplay?.start?.(); } catch (_) {} }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="gallery-modal-body">
                <img 
                  src={selectedGalleryItem.secureUrl || selectedGalleryItem.url || ''} 
                  alt={selectedGalleryItem.title || `Gallery ${selectedGalleryItem.index + 1}`}
                  className="gallery-modal-image"
                />
                <div className="gallery-modal-caption">
                  <div className="title">{selectedGalleryItem.title || `Gallery Item ${selectedGalleryItem.index + 1}`}</div>
                  {selectedGalleryItem.description && (
                    <div className="desc">{selectedGalleryItem.description}</div>
                  )}
                </div>
                <div className="gallery-modal-nav">
                  <button
                    className="gallery-nav-button"
                    aria-label="Previous"
                    onClick={(e) => {
                      e.stopPropagation();
                      const count = (profile.gallery || []).length;
                      const nextIndex = ((selectedGalleryItem.index ?? 0) - 1 + count) % count;
                      const next = profile.gallery[nextIndex] || {};
                      setSelectedGalleryItem({ ...next, index: nextIndex });
                    }}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    className="gallery-nav-button"
                    aria-label="Next"
                    onClick={(e) => {
                      e.stopPropagation();
                      const count = (profile.gallery || []).length;
                      const nextIndex = ((selectedGalleryItem.index ?? 0) + 1) % count;
                      const next = profile.gallery[nextIndex] || {};
                      setSelectedGalleryItem({ ...next, index: nextIndex });
                    }}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="business-card-footer">
          <div className="footer-brand">
            <span className="brand-dot" aria-hidden="true"></span>
            <span>
              powered by <a href="https://onetapp.ph" target="_blank" rel="noreferrer">onetapp</a>
            </span>
          </div>
        </div>
      </Card>
    </>
  );
};

export default BusinessCard; 