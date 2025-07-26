# NFC Business Card - React Version

A React-based implementation of the NFC business card that works with localhost. This version maintains all the original functionality except for the recent activity section.

## Features

- **Profile Display**: Shows profile image, name, title, and location
- **Social Links**: Displays social media links with click tracking
- **Bio Section**: Shows user bio information
- **Featured Links**: Displays custom/featured links with modal for additional links
- **Gallery**: Image gallery with modal view and navigation
- **Book Now**: Meeting request form with modal
- **Analytics**: Tracks user interactions and location data
- **Responsive Design**: Works on mobile and desktop devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on localhost:5000

## Installation

1. Navigate to the project directory:
```bash
cd nfc-card-react
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the React development server:
```bash
npm start
```

2. The application will open at `http://localhost:3000`

3. To view a specific business card, add the cardUid as a query parameter:
```
http://localhost:3000?cardUid=YOUR_CARD_UID
```

## Backend Configuration

Make sure your backend server is running on `localhost:5000` and has the following endpoints:

- `GET /api/cards/dynamic/:cardUid` - Get card data with user and profile info
- `POST /api/taps` - Log tap events
- `POST /api/taps/action` - Log user actions

## API Integration

The React app communicates with the backend through the following API calls:

### Fetching Card Data
```javascript
GET /api/cards/dynamic/{cardUid}
```

### Logging Tap Events
```javascript
POST /api/taps
{
  cardId: string,
  timestamp: Date,
  userAgent: string,
  sessionId: string,
  actions: Array
}
```

### Logging User Actions
```javascript
POST /api/taps/action
{
  cardId: string,
  timestamp: Date,
  userAgent: string,
  sessionId: string,
  actions: Array
}
```

## Features Removed

- **Recent Activity**: This section has been removed as requested

## Styling

The application uses:
- Bootstrap 5 for layout and components
- Font Awesome for icons
- Custom CSS for business card styling
- Inter font family for typography

## Development

### Project Structure
```
src/
├── components/
│   └── BusinessCard.js    # Main business card component
├── App.js                 # Main application component
├── App.css               # Custom styles
└── index.js              # Application entry point
```

### Key Components

- **App.js**: Handles data fetching, analytics, and modal state
- **BusinessCard.js**: Renders the business card UI
- **App.css**: Contains all styling for the business card

## Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` directory.

## Troubleshooting

1. **CORS Issues**: Make sure your backend has CORS configured for `http://localhost:3000`

2. **API Connection**: Ensure your backend is running on `localhost:5000`

3. **Card Not Found**: Verify the cardUid parameter is correct and the card exists in your database

## License

This project is part of the NFC Business Card system.
