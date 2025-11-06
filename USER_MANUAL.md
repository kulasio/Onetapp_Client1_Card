# NFC Business Card Viewer - User Manual

## Table of Contents
1. [Overview](#overview)
2. [Accessing the Business Card](#accessing-the-business-card)
3. [Card Interface Overview](#card-interface-overview)
4. [Profile Section](#profile-section)
5. [Getting in Touch](#getting-in-touch)
6. [Bio Section](#bio-section)
7. [Featured Links](#featured-links)
8. [Gallery](#gallery)
9. [Social Media Links](#social-media-links)
10. [Quick Actions](#quick-actions)
11. [Meeting Requests (Book Now)](#meeting-requests-book-now)
12. [Privacy & Location](#privacy--location)
13. [Troubleshooting](#troubleshooting)

---

## Overview

The NFC Business Card Viewer is a digital business card interface that displays when someone taps your NFC card with their smartphone or accesses your card via a web link. This interactive card allows visitors to:

- View your professional profile and contact information
- Connect with you on social media
- Request meetings
- Save your contact information
- View your portfolio/gallery
- Access featured links

**No app installation required** - The card works directly in any modern web browser.

---

## Accessing the Business Card

### Via NFC Tap
1. Ensure your NFC card is activated
2. Unlock your smartphone
3. Tap the NFC card on the back of your phone (usually near the top)
4. The business card will automatically open in your browser

### Via Web Link
1. Open the link provided by the card owner
2. The business card will load automatically
3. The URL format is: `https://your-domain.com?cardUid=YOUR_CARD_UID`

### Via QR Code
1. Scan the QR code printed on the physical card
2. The business card will open in your browser

---

## Card Interface Overview

The business card interface consists of several sections:

1. **Header Section**: Profile image, name, title, company, location
2. **Quick Actions**: Share, Directions, Request Quote buttons
3. **Get in Touch**: Primary action buttons
4. **Bio**: Professional biography
5. **Featured Links**: Custom links (up to 3 visible, more available)
6. **Gallery**: Image/media gallery
7. **Social Media Links**: Connect on various platforms
8. **Footer**: Powered by OneTapp

---

## Profile Section

### Header Information

The top section displays:

- **Profile Image**: Large header image with overlay design
- **Avatar**: Circular profile picture
- **Full Name**: The card owner's name
- **Job Title**: Professional title (e.g., "CEO", "Software Engineer")
- **Company**: Company name
- **Location**: Geographic location (city, province/state)

**Note**: Not all fields may be visible depending on the card owner's privacy settings.

### Quick Action Icons

In the header, you'll find three quick action buttons:

#### 1. Share Card
- **Icon**: Share symbol (📤)
- **Function**: Share the business card
- **Mobile**: Opens native share dialog
- **Desktop**: Copies the card URL to clipboard

**How to Use:**
1. Click the share icon
2. Choose sharing method (mobile) or copy link (desktop)

#### 2. Get Directions
- **Icon**: Map marker (📍)
- **Function**: Opens Google Maps with the card owner's location
- **Requirement**: Location must be visible on the card

**How to Use:**
1. Click the directions icon
2. Google Maps opens in a new tab
3. Follow directions to the location

#### 3. Request Quote
- **Icon**: Invoice/Quote symbol (💰)
- **Function**: Opens email client with pre-filled quote request
- **Requirement**: Email must be visible on the card

**How to Use:**
1. Click the request quote icon
2. Your email client opens with a pre-filled message
3. Review and send the email

---

## Getting in Touch

### Primary Action Buttons

Two primary action buttons are prominently displayed:

#### 1. Book Now
- **Purpose**: Request a meeting with the card owner
- **Color**: Dark button
- **Icon**: Calendar check mark

**How to Use:**
- Click "Book Now" to open the meeting request form
- See the [Meeting Requests](#meeting-requests-book-now) section for detailed instructions

#### 2. Save Contact
- **Purpose**: Save the card owner's contact information to your phone
- **Color**: Light button with border
- **Icon**: User plus symbol

**How to Use:**
1. Click "Save Contact"
2. Your phone will:
   - **Mobile (iOS/Android)**: Open the native "Add to Contacts" interface
   - **Desktop**: Download a .vcf file that you can import into your contacts app

**What Information is Saved:**
- Name
- Job Title
- Company
- Phone Number (if visible)
- Email (if visible)
- Website
- Location (if visible)
- Bio (as notes)

**Note**: Only visible information is saved based on the card owner's privacy settings.

---

## Bio Section

### Overview

The Bio section displays the card owner's professional biography or description.

### Features

- **Truncated Display**: Bio is truncated to 150 characters by default
- **Read More/Less**: Click to expand or collapse the full bio
- **Automatic Truncation**: Long bios are truncated at word boundaries

### How to Use

1. **View Bio**: Scroll to the "BIO" section
2. **Read Full Bio**: 
   - If truncated, click "Read More" to expand
   - Click "Show Less" to collapse back

**Note**: The bio section respects privacy settings and may not be visible on all cards.

---

## Featured Links

### Overview

Featured Links are custom links that the card owner wants to highlight. These can include:
- Portfolio websites
- Blog links
- Project pages
- Resume/CV links
- Custom landing pages

### Display

- **Visible**: Up to 3 featured links are shown directly on the card
- **More Links**: If there are more than 3 links, a "+X more" button appears

### How to Use

#### Viewing Featured Links
1. Scroll to the "FEATURED" section
2. Click on any featured link to open it in a new tab

#### Viewing All Featured Links
1. If more than 3 links exist, click the "+X more" button
2. A modal opens showing all featured links
3. Click any link to open it in a new tab
4. Close the modal by clicking outside it or the X button

### Supported Link Types
- Websites
- Portfolio pages
- Blog posts
- Project pages
- Social media profiles (custom)
- Any custom URL

---

## Gallery

### Overview

The Gallery section displays images, videos, or other media content in a carousel format.

### Features

- **Carousel Navigation**: Swipe or use dots to navigate
- **Click to View**: Click any gallery item to view in full-screen modal
- **Image/Video Support**: Supports images and video links (YouTube, Vimeo)
- **Descriptions**: Each item may have a title and description
- **Truncated Descriptions**: Long descriptions are truncated with "view more" option

### How to Use

#### Viewing the Gallery
1. Scroll to the "GALLERY" section
2. Swipe left/right (mobile) or click dots (desktop) to navigate
3. View the current item's title and description

#### Viewing Gallery Items in Full Screen
1. Click on any gallery item
2. A full-screen modal opens
3. **Navigation**:
   - **Left/Right Arrows**: Navigate between items
   - **Keyboard**: Press ← or → arrow keys
   - **Dots**: Click dots at the bottom to jump to specific items
   - **Close**: Click X button or press Escape key

#### Viewing Item Descriptions
1. In the gallery carousel, descriptions are truncated to 120 characters
2. Click "view more" to expand the full description
3. Click "view less" to collapse it back

### Supported Media Types
- Images (JPEG, PNG, GIF, WebP)
- YouTube videos (via URL)
- Vimeo videos (via URL)
- Any image URL

---

## Social Media Links

### Overview

The "CONNECT WITH ME" section displays social media links to various platforms.

### Supported Platforms

- **Facebook**: Facebook profile/page
- **Instagram**: Instagram profile
- **LinkedIn**: LinkedIn profile
- **YouTube**: YouTube channel
- **TikTok**: TikTok profile
- **Twitter/X**: Twitter/X profile

### Display

- **Visible**: Up to 6 social links are shown directly
- **More Links**: If more than 6 links exist, a "+X more" button appears

### How to Use

#### Connecting on Social Media
1. Scroll to the "CONNECT WITH ME" section
2. Click on any social media icon
3. The platform opens in a new tab
4. Follow or connect with the card owner

#### Viewing All Social Links
1. If more than 6 links exist, click the "+X more" button
2. All social links open in separate tabs

### Icon Indicators
Each platform has a distinct icon:
- Facebook: Facebook icon
- Instagram: Instagram icon
- LinkedIn: LinkedIn icon
- YouTube: YouTube icon
- TikTok: TikTok icon
- Twitter/X: Twitter icon

---

## Meeting Requests (Book Now)

### Overview

The "Book Now" feature allows you to request a meeting with the card owner through a 4-step form.

### Step-by-Step Guide

#### Step 1: Meeting Type

Choose your preferred meeting format:
- **In Person**: Face-to-face meeting
- **Phone Call**: Phone conversation
- **Video Call**: Video conference (Zoom, Teams, etc.)

**How to Use:**
1. Click "Book Now" button
2. Select your preferred meeting type
3. Click "Next"

**Validation**: You must select a meeting type to proceed.

#### Step 2: Contact Details

Provide your contact information:
- **Your Name** (required): Enter your full name
- **Email Address** (required): Enter a valid email address
- **Phone Number** (optional): Enter your phone number

**How to Use:**
1. Fill in your name (minimum 2 characters)
2. Enter a valid email address
3. Optionally add your phone number
4. Click "Next"

**Validation**:
- Name must be at least 2 characters
- Email must be in valid format (e.g., name@domain.com)

#### Step 3: Date & Time

Choose your preferred meeting date and time:
- **Preferred Date**: Select a date from the calendar
- **Preferred Time**: Choose from:
  - Morning
  - Afternoon
  - Evening

**Note**: Exact time will be confirmed via email.

**How to Use:**
1. Click the date field and select a date
2. Choose your preferred time of day from dropdown
3. Click "Next"

**Validation**: Both date and time must be selected.

#### Step 4: Purpose & Summary

Review your request and optionally add a purpose:
- **Summary**: Review all your selections
- **Purpose** (optional): Briefly describe what you'd like to discuss (max 500 characters)

**How to Use:**
1. Review the summary of your request
2. Optionally add a purpose for the meeting
3. Click "Submit Request"

**Character Limit**: Purpose field allows up to 500 characters.

### Form Features

#### Progress Indicator
- A visual stepper shows your progress (steps 1-4)
- Completed steps are highlighted
- Current step is active

#### Navigation
- **Back Button**: Return to previous step
- **Next Button**: Move to next step (validates current step first)
- **Submit Button**: Appears on step 4 to submit the request

#### Form Validation
- Required fields are marked
- Invalid fields show error messages
- Form prevents submission until all required fields are valid

#### Submission Process
1. Click "Submit Request" on step 4
2. Form submits to the card owner
3. Thank you message appears
4. Modal closes automatically after 2 seconds

### Tips
- Fill out all required fields for better response
- Add a purpose to help the card owner prepare
- Choose a realistic date and time preference
- You can go back to previous steps to make changes

### Canceling
- Click the X button or click outside the modal
- If you've entered data, you'll be asked to confirm cancellation
- Click "OK" to discard your progress

---

## Privacy & Location

### Location Consent

When you first access a business card, you may be asked for location consent.

#### Why Location is Requested
- Helps the card owner understand where their card is being viewed
- Provides analytics about geographic reach
- Enhances networking insights

#### Consent Options

1. **Allow General Location (City + Province)**:
   - Shares approximate location (city and province/state only)
   - No exact coordinates are stored
   - Provides useful analytics without compromising privacy

2. **Don't Allow Location**:
   - No location data is collected
   - Card functionality remains fully available
   - Analytics will not include location data

#### Privacy Notes
- Location data is stored anonymously
- No exact coordinates are stored with "General Location" option
- You can change this setting anytime
- Location is used only for analytics purposes
- Your privacy is protected

### Data Collection

The card tracks:
- **Card Views**: When the card is opened
- **Actions**: Button clicks, link clicks, form submissions
- **Device Information**: Device type, browser, screen size (for analytics)
- **Location**: Only if consent is given (city/province level)
- **Session Information**: To prevent duplicate logging

**What is NOT Collected:**
- Personal identifiable information (unless you submit a meeting request)
- Exact GPS coordinates
- Browsing history
- Personal files or data

---

## Troubleshooting

### Card Not Loading

**Problem**: Card doesn't display or shows error message.

**Solutions**:
1. **Check Internet Connection**: Ensure you have an active internet connection
2. **Check URL**: Verify the cardUid parameter is correct
3. **Try Different Browser**: Switch to Chrome, Firefox, or Safari
4. **Clear Browser Cache**: Clear cache and cookies, then reload
5. **Check Card Status**: The card may be inactive - contact the card owner

### NFC Tap Not Working

**Problem**: Tapping the NFC card doesn't open the card.

**Solutions**:
1. **Enable NFC**: Ensure NFC is enabled on your phone
2. **Check Card**: Verify the NFC card is activated
3. **Tap Position**: Try tapping different areas of your phone
4. **Remove Case**: Phone cases can interfere with NFC
5. **Use QR Code**: Scan the QR code as an alternative

### Images Not Loading

**Problem**: Profile image or gallery images don't display.

**Solutions**:
1. **Check Internet**: Ensure stable internet connection
2. **Wait for Load**: Images may take time to load
3. **Refresh Page**: Reload the page
4. **Check Browser**: Some browsers block images - try a different browser

### Meeting Request Not Submitting

**Problem**: "Book Now" form doesn't submit.

**Solutions**:
1. **Check Required Fields**: Ensure all required fields are filled
2. **Check Email Format**: Verify email is in correct format (name@domain.com)
3. **Check Date**: Ensure date is not in the past
4. **Try Again**: Wait a moment and try submitting again
5. **Check Internet**: Ensure you have internet connection

### Contact Not Saving

**Problem**: "Save Contact" button doesn't work.

**Solutions**:
1. **Mobile**: Check if "Add to Contacts" permission is granted
2. **Desktop**: Check if .vcf file downloads (some browsers block downloads)
3. **Try Different Browser**: Switch browsers
4. **Check Permissions**: Ensure browser permissions allow downloads
5. **Manual Import**: On desktop, download the .vcf file and import manually

### Social Links Not Opening

**Problem**: Social media links don't open.

**Solutions**:
1. **Check Pop-up Blocker**: Disable pop-up blocker for this site
2. **Check Browser Settings**: Allow pop-ups for this domain
3. **Try Different Browser**: Some browsers block new tabs
4. **Manual Open**: Copy link and paste in address bar

### Gallery Not Displaying

**Problem**: Gallery section is empty or not visible.

**Solutions**:
1. **Card Owner**: The card owner may not have added gallery items
2. **Privacy Settings**: Gallery may be hidden by privacy settings
3. **Wait for Load**: Gallery may take time to load
4. **Refresh Page**: Reload the page

### Location Consent Not Appearing

**Problem**: Location consent modal doesn't appear.

**Solutions**:
1. **Already Answered**: You may have already answered (check session)
2. **Browser Settings**: Check browser location permissions
3. **Clear Session**: Clear browser session storage
4. **Not Required**: Some cards may not request location

### Mobile Display Issues

**Problem**: Card doesn't display properly on mobile.

**Solutions**:
1. **Rotate Device**: Try portrait and landscape orientations
2. **Zoom**: Pinch to zoom if needed
3. **Update Browser**: Update to latest browser version
4. **Clear Cache**: Clear browser cache and cookies
5. **Try Different Browser**: Switch mobile browsers

### Slow Loading

**Problem**: Card takes a long time to load.

**Solutions**:
1. **Check Internet Speed**: Ensure fast internet connection
2. **Wait**: Large images may take time to load
3. **Check Server**: Server may be experiencing high traffic
4. **Try Later**: Retry after a few minutes

---

## Browser Compatibility

### Supported Browsers

**Mobile:**
- Safari (iOS 12+)
- Chrome (Android 5+)
- Firefox Mobile
- Samsung Internet

**Desktop:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

### Recommended
- **Best Experience**: Chrome or Safari on mobile
- **Desktop**: Chrome or Firefox

---

## Keyboard Shortcuts

When viewing gallery items in full-screen:

- **Escape**: Close gallery modal
- **Left Arrow (←)**: Previous image
- **Right Arrow (→)**: Next image

---

## Best Practices

### For Visitors

1. **Allow Location**: Help card owners understand their reach
2. **Fill Meeting Requests Completely**: Provide all information for better responses
3. **Save Contact**: Save contacts you want to follow up with
4. **Use Social Links**: Connect on professional platforms
5. **Share Cards**: Share interesting business cards with your network

### Privacy

1. **Review Location Consent**: Understand what data is collected
2. **Check Privacy Settings**: Be aware of what information is visible
3. **Contact Card Owner**: If you have privacy concerns, contact the card owner directly

---

## Support

### Getting Help

If you encounter issues:

1. **Check This Manual**: Review relevant sections
2. **Try Troubleshooting**: Follow troubleshooting steps
3. **Contact Card Owner**: Reach out to the card owner directly
4. **Technical Support**: Contact OneTapp support if technical issues persist

### Reporting Issues

When reporting issues, include:
- Device type (iPhone, Android, Desktop)
- Browser name and version
- Description of the issue
- Steps to reproduce
- Screenshots (if possible)

---

## Frequently Asked Questions

### Q: Do I need to install an app?
**A**: No, the business card works directly in any modern web browser. No app installation is required.

### Q: Can I use this on any device?
**A**: Yes, the card works on smartphones, tablets, and desktop computers. NFC tap requires an NFC-enabled smartphone.

### Q: Is my data secure?
**A**: Yes, the card uses secure connections (HTTPS) and respects your privacy settings. Location data is anonymized.

### Q: Can I block location tracking?
**A**: Yes, you can choose "Don't Allow Location" when prompted. The card will work fully without location data.

### Q: What happens when I save a contact?
**A**: On mobile, your phone's native contacts app opens. On desktop, a .vcf file downloads that you can import.

### Q: How do I share a business card?
**A**: Click the share icon in the header. On mobile, your native share menu opens. On desktop, the URL is copied to clipboard.

### Q: Can I view the card offline?
**A**: No, the card requires an internet connection to load and display content.

### Q: Why can't I see certain information?
**A**: The card owner may have privacy settings that hide certain information. Contact them directly if you need specific details.

### Q: How do I request a meeting?
**A**: Click the "Book Now" button and follow the 4-step form. Fill in all required information and submit.

### Q: What if the card doesn't load?
**A**: Check your internet connection, try a different browser, or contact the card owner to verify the card is active.

---

## Technical Details

### System Requirements

- **Internet Connection**: Required
- **JavaScript**: Must be enabled
- **Modern Browser**: Latest version recommended
- **NFC**: Required for NFC tap functionality (smartphones only)

### Data Transmission

- **Protocol**: HTTPS (secure)
- **API**: RESTful API integration
- **Analytics**: Real-time tracking
- **Privacy**: Compliant with privacy regulations

---

**Last Updated**: [Date]
**Version**: 1.0
**Powered by**: OneTapp


