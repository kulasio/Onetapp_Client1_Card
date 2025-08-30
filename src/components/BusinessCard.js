import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';

const BusinessCard = ({ cardData, onShowFeaturedModal, onShowBookModal, onLogAction }) => {
  const [imageLoadStates, setImageLoadStates] = useState({});
  const [bioExpanded, setBioExpanded] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const { card, user, profile } = cardData || {};

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
      label: 'Save Contact',
      variant: 'outline-dark',
      onClick: () => {
        // Log the action first
        onLogAction(card._id, {
          type: 'save_contact_click',
          label: 'Clicked Save Contact',
          url: ''
        });

        // Create vCard data
        const vCardData = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${profile?.fullName || user?.username || 'Contact'}`,
          `TITLE:${profile?.jobTitle || ''}`,
          `ORG:${profile?.company || ''}`,
          `TEL:${profile?.contact?.phone || ''}`,
          `EMAIL:${profile?.contact?.email || ''}`,
          `URL:${profile?.website || ''}`,
          `ADR:;;${profile?.contact?.location || ''}`,
          `NOTE:${profile?.bio || ''}`,
          'END:VCARD'
        ].join('\r\n');

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

  // Check if URL is a video (Cloudinary only)
  const isVideoUrl = (url) => {
    if (!url) return false;
    
    // Detect Cloudinary video URLs
    if (url.includes('cloudinary.com') && url.includes('/video/')) {
      return true;
    }
    
    // Detect YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return true;
    }
    
    // Detect Vimeo URLs
    if (url.includes('vimeo.com')) {
      return true;
    }
    
    // Check for video file extensions
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    return hasVideoExtension;
  };

  // Get video URL for preview
  const getVideoUrl = (item) => {
    if (!item) return null;
    
    // For Cloudinary videos using secureUrl
    if (item.secureUrl && item.secureUrl.includes('cloudinary.com')) {
      let secureUrl = item.secureUrl;
      if (secureUrl.startsWith('http://')) {
        secureUrl = secureUrl.replace('http://', 'https://');
      }
      return secureUrl;
    }
    
    // For Cloudinary videos using url field
    if (item.url && item.url.includes('cloudinary.com')) {
      let secureUrl = item.url;
      if (secureUrl.startsWith('http://')) {
        secureUrl = secureUrl.replace('http://', 'https://');
      }
      return secureUrl;
    }
    
    // For external video URLs (YouTube, Vimeo, etc.)
    if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
      return item.url;
    }
    
    return null;
  };



  // Handle image load
  const handleImageLoad = (index) => {
    console.log(`Image loaded successfully for gallery item ${index}`);
    setImageLoadStates(prev => ({ ...prev, [index]: 'loaded' }));
  };

  // Handle image error
  const handleImageError = (index) => {
    console.log(`Image error for gallery item ${index}`);
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

  // Get layout for gallery item (alternating pattern starting with image-left)
  const getItemLayout = (index) => {
    return index % 2 === 0 ? 'image-left' : 'text-left';
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
          
          {/* Action Buttons */}
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
              <div className="gallery-grid mb-3">
                {profile.gallery.map((item, index) => {
                  // Get the correct URL for Cloudinary or legacy data
                  const getItemUrl = () => {
                    if (item.secureUrl) {
                      return item.secureUrl;
                    } else if (item.url && item.url.startsWith('https://')) {
                      return item.url;
                    } else if (item.url && item.url.startsWith('http://')) {
                      // Convert HTTP to HTTPS for Cloudinary URLs
                      return item.url.replace('http://', 'https://');
                    } else if (item.url) {
                      return item.url;
                    } else if (item.data) {
                      // Legacy base64 data
                      return `data:image/jpeg;base64,${item.data}`;
                    }
                    return null;
                  };
                  
                  const itemUrl = getItemUrl();
                  const isVideo = item.type === 'video' || isVideoUrl(itemUrl);
                  const videoUrl = isVideo ? getVideoUrl(item) : null;
                  const loadState = imageLoadStates[index];
                  const layout = getItemLayout(index);
                  const isImageLeft = layout === 'image-left';
                  

                  
                  return (
                    <div key={index} className={`gallery-item ${layout}`}>
                      {isImageLeft ? (
                        <>
                          {/* Image First */}
                          <div className="gallery-image-container">
                            {loadState === 'error' ? (
                              <div className="gallery-error">
                                <i className="fas fa-exclamation-triangle"></i>
                                <span>Failed to load</span>
                              </div>
                            ) : (
                              <>
                                {isVideo ? (
                                  <>
                                    {videoUrl ? (
                                      <video 
                                        src={videoUrl} 
                                        className="gallery-image"
                                        muted
                                        preload="metadata"
                                        onLoadedMetadata={(e) => {
                                          e.target.currentTime = 1;
                                        }}
                                      />
                                    ) : (
                                      <div className="gallery-video-placeholder">
                                        <i className="fas fa-play-circle"></i>
                                        <span>Video</span>
                                      </div>
                                    )}
                                    <div className="video-overlay">
                                      <i className="fas fa-play-circle"></i>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {itemUrl ? (
                                      <img
                                        src={itemUrl}
                                        alt={item.title || `Gallery ${index + 1}`}
                                        className="gallery-image"
                                        onLoad={() => handleImageLoad(index)}
                                        onError={() => handleImageError(index)}
                                      />
                                    ) : (
                                      <div className="gallery-error">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        <span>No image URL</span>
                                      </div>
                                    )}
                                    {!loadState && itemUrl && (
                                      <div className="gallery-loading">
                                        <i className="fas fa-spinner fa-spin"></i>
                                      </div>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                          {/* Text Content Second */}
                          <div className="gallery-content">
                            <h4 className="gallery-title">
                              {item.title || `Gallery Item ${index + 1}`}
                            </h4>
                            <div className="gallery-description">
                              <span>
                                {formatDescriptionText(
                                  item.description || 'No description available for this gallery item.', 
                                  index
                                )}
                              </span>
                              {(item.description || 'No description available for this gallery item.').length > 120 && (
                                <button
                                  className="view-more-btn"
                                  onClick={() => toggleDescription(index)}
                                >
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
                        </>
                      ) : (
                        <>
                          {/* Text Content First */}
                          <div className="gallery-content">
                            <h4 className="gallery-title">
                              {item.title || `Gallery Item ${index + 1}`}
                            </h4>
                            <div className="gallery-description">
                              <span>
                                {formatDescriptionText(
                                  item.description || 'No description available for this gallery item.', 
                                  index
                                )}
                              </span>
                              {(item.description || 'No description available for this gallery item.').length > 120 && (
                                <button
                                  className="view-more-btn"
                                  onClick={() => toggleDescription(index)}
                                >
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
                          {/* Image Second */}
                          <div className="gallery-image-container">
                            {loadState === 'error' ? (
                              <div className="gallery-error">
                                <i className="fas fa-exclamation-triangle"></i>
                                <span>Failed to load</span>
                              </div>
                            ) : (
                              <>
                                {isVideo ? (
                                  <>
                                    {videoUrl ? (
                                      <video 
                                        src={videoUrl} 
                                        className="gallery-image"
                                        muted
                                        preload="metadata"
                                        onLoadedMetadata={(e) => {
                                          e.target.currentTime = 1;
                                        }}
                                      />
                                    ) : (
                                      <div className="gallery-video-placeholder">
                                        <i className="fas fa-play-circle"></i>
                                        <span>Video</span>
                                      </div>
                                    )}
                                    <div className="video-overlay">
                                      <i className="fas fa-play-circle"></i>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {itemUrl ? (
                                      <img
                                        src={itemUrl}
                                        alt={item.title || `Gallery ${index + 1}`}
                                        className="gallery-image"
                                        onLoad={() => handleImageLoad(index)}
                                        onError={() => handleImageError(index)}
                                      />
                                    ) : (
                                      <div className="gallery-error">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        <span>No image URL</span>
                                      </div>
                                    )}
                                    {!loadState && itemUrl && (
                                      <div className="gallery-loading">
                                        <i className="fas fa-spinner fa-spin"></i>
                                      </div>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      )}
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
    </>
  );
};

export default BusinessCard; 