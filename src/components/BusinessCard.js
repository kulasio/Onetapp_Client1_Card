import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';

const BusinessCard = ({ cardData, onShowFeaturedModal, onShowBookModal, onLogAction }) => {
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
                  // Even numbers (index 1, 3, 5...) should have text on left
                  // Odd numbers (index 0, 2, 4...) should have image on left
                  const layout = index % 2 === 0 ? 'image-left' : 'text-left';
                  const isImageLeft = index % 2 === 0; // Even index = image left, odd index = text left
                  

                  
                  return (
                    <div key={index} className={`gallery-item ${layout}`}>
                      {isImageLeft ? (
                        <>
                          {/* Image First */}
                          <div className="gallery-image-container">
                            {itemUrl ? (
                              <img
                                src={itemUrl}
                                alt={item.title || `Gallery ${index + 1}`}
                                className="gallery-image"
                              />
                            ) : (
                              <div className="gallery-error">
                                <i className="fas fa-exclamation-triangle"></i>
                                <span>No image</span>
                              </div>
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
                            {itemUrl ? (
                              <img
                                src={itemUrl}
                                alt={item.title || `Gallery ${index + 1}`}
                                className="gallery-image"
                              />
                            ) : (
                              <div className="gallery-error">
                                <i className="fas fa-exclamation-triangle"></i>
                                <span>No image</span>
                              </div>
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
          
          {/* Social Links */}
          <div className="card-section-label">Social Media</div>
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
        </Card.Body>
        
        {/* Footer */}
        <div className="text-center mt-4 mb-3" style={{ color: '#888', fontSize: '1rem', letterSpacing: '0.01em' }}>
          powered by onetapp
        </div>
      </Card>
    </>
  );
};

export default BusinessCard; 