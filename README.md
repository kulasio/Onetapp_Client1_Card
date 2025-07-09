# NFC Card React App

A React-based NFC business card viewer that connects to your backend API and tracks analytics.

## Features

- **Dynamic Card Loading**: Fetches card data from your backend API
- **Analytics Tracking**: Logs taps and user interactions for analytics
- **Modern UI**: Built with Material-UI components
- **Responsive Design**: Works on mobile and desktop
- **Vercel Ready**: Optimized for deployment on Vercel

## Backend Integration

The app connects to your backend at `https://onetapp-backend.onrender.com` and:

1. **Fetches Card Data**: Uses the same API endpoint as `NFC_Card_1`
2. **Logs Taps**: Automatically logs when someone views a card
3. **Tracks Interactions**: Logs link clicks, media views, and contact saves

## Deployment

### Vercel Deployment

1. **Connect to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables** (optional):
   - `REACT_APP_API_BASE_URL`: Backend API URL
   - `REACT_APP_ENABLE_ANALYTICS`: Enable/disable analytics

3. **Custom Domain**: Configure in Vercel dashboard

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy build folder to your hosting service
```

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

Example: `https://your-app.vercel.app/?cardUid=abc123&eventId=event456`

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

# Vercel Configuration
vercel.json                 # Vercel deployment config
public/
├── index.html             # Optimized HTML template
├── manifest.json          # PWA manifest
└── robots.txt            # SEO configuration
```

## API Endpoints Used

- `GET /api/cards/dynamic/{cardUid}` - Fetch card data
- `POST /api/taps` - Log tap analytics
- `POST /api/taps/action` - Log user actions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API URL | `https://onetapp-backend.onrender.com` |
| `REACT_APP_ENABLE_ANALYTICS` | Enable analytics tracking | `true` |

## Performance Optimizations

- **Preconnect**: Backend API preconnection for faster requests
- **Caching**: Static assets cached for 1 year
- **Security Headers**: XSS protection, content type options
- **SEO**: Meta tags, Open Graph, Twitter Cards
- **PWA**: Manifest for app-like experience

## Differences from NFC_Card_1

- **React-based**: More maintainable and scalable
- **Better Error Handling**: Loading states and error messages
- **Enhanced Analytics**: More detailed tracking of user interactions
- **Modern UI**: Material-UI components with better UX
- **Vercel Optimized**: Ready for production deployment
- **Type Safety**: Better data handling and validation
