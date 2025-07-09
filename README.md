# NFC Card React App

A React-based NFC business card viewer that connects to your backend API and tracks analytics.

## Features

- **Dynamic Card Loading**: Fetches card data from your backend API
- **Analytics Tracking**: Logs taps and user interactions for analytics
- **Modern UI**: Built with Material-UI components
- **Responsive Design**: Works on mobile and desktop

## Backend Integration

The app connects to your backend at `https://onetapp-backend.onrender.com` and:

1. **Fetches Card Data**: Uses the same API endpoint as `NFC_Card_1`
2. **Logs Taps**: Automatically logs when someone views a card
3. **Tracks Interactions**: Logs link clicks, media views, and contact saves

## Usage

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### URL Parameters

- `cardUid`: Required - The unique identifier for the card
- `eventId`: Optional - Event/location ID for analytics

Example: `http://localhost:3000/?cardUid=abc123&eventId=event456`

## Analytics Tracking

The app automatically tracks:

- **Page Views**: When someone loads a card
- **Link Clicks**: Social links, featured links
- **Media Interactions**: Gallery views, video plays
- **Contact Actions**: Save contact, book meetings

## File Structure

```
src/
├── components/
│   └── NFCCard.js          # Main card component
├── config/
│   └── api.js              # API endpoints configuration
├── services/
│   └── apiService.js       # API functions for data fetching and analytics
└── App.js                  # App wrapper with theme
```

## API Endpoints Used

- `GET /api/cards/dynamic/{cardUid}` - Fetch card data
- `POST /api/taps` - Log tap analytics
- `POST /api/taps/action` - Log user actions

## Differences from NFC_Card_1

- **React-based**: More maintainable and scalable
- **Better Error Handling**: Loading states and error messages
- **Enhanced Analytics**: More detailed tracking of user interactions
- **Modern UI**: Material-UI components with better UX
- **Type Safety**: Better data handling and validation
