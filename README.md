# TimeSync - Timezone Management Application

## Overview

TimeSync is a full-stack web application that helps users manage and synchronize time across multiple timezones. It features real-time timezone tracking, team collaboration, and shared timezone views with an intuitive card-based interface.

## Features

- **Multi-timezone Dashboard**: View multiple timezones simultaneously with synchronized time display
- **Interactive Time Adjustment**: Use the time slider to adjust and preview different times across all timezones
- **Smart Timezone Search**: Add new timezones with intelligent country and city suggestions
- **Team Collaboration**: Create and share timezone collections with team members via shareable links
- **Guest Mode**: Use the application without authentication for quick access
- **Firebase Authentication**: Optional Google sign-in for persistent user data
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Prerequisites

Before running the application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database (for production) or use in-memory storage for development

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd timezone-management-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional):
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration (optional)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   
   # Database Configuration (optional - uses in-memory storage by default)
   DATABASE_URL=your_postgresql_connection_string
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

## Running the Application

### Development Mode

Start the development server with hot reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

### Database Setup (Optional)

The application uses in-memory storage by default. To use PostgreSQL:

1. **Create a PostgreSQL database**
2. **Set the DATABASE_URL environment variable**
3. **Run database migrations**:
   ```bash
   npm run db:push
   ```

## Firebase Setup (Optional)

To enable Google authentication:

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)
2. **Enable Google Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Google sign-in
   - Add your domain to authorized domains
3. **Get Firebase configuration**:
   - Go to Project Settings > General
   - Find your web app configuration
   - Copy the `apiKey`, `projectId`, and `appId`
4. **Set environment variables** with your Firebase credentials

## API Endpoints

### Authentication
- `POST /api/auth/guest` - Create guest user session
- `POST /api/auth/firebase` - Authenticate with Firebase

### Timezones
- `GET /api/timezones` - Get user's timezones
- `POST /api/timezones` - Add new timezone
- `DELETE /api/timezones/:id` - Remove timezone
- `PUT /api/timezones/:id/primary` - Set primary timezone

### Teams
- `POST /api/teams` - Create team
- `GET /api/teams/:shareId` - Get team by share ID

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Timezone, Theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Application entry point
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage layer
│   └── websocket.ts        # WebSocket implementation
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schemas and types
└── README.md              # This file
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for components
- **TanStack Query** for data fetching
- **Wouter** for routing
- **Luxon** for timezone handling

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **Firebase Admin SDK** for authentication
- **WebSocket** for real-time updates
- **PostgreSQL** database support

## Usage

1. **Start the application** using `npm run dev`
2. **Open your browser** to `http://localhost:5000`
3. **Use Guest Mode** or sign in with Google (if configured)
4. **Add timezones** using the "+" button and search functionality
5. **Adjust time** using the slider to see synchronized updates
6. **Create teams** to share timezone collections with others
7. **Toggle themes** using the theme button in the header

## Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture

### Testing
- Manual testing in development mode
- Browser developer tools for debugging
- Network tab for API monitoring

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Kill processes using port 5000
   lsof -ti:5000 | xargs kill -9
   ```

2. **Dependencies not installed**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build errors**:
   ```bash
   npm run check  # TypeScript type checking
   ```

4. **Database connection issues**:
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check firewall settings

### Development Tips

- Use browser developer tools for debugging
- Check console logs for errors
- Monitor network requests in browser dev tools
- Use React Developer Tools extension

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify all dependencies are installed
4. Ensure environment variables are configured correctly

## Deployment

The application is designed to run on Replit and can be deployed using Replit's deployment system. The build process is optimized for serverless environments.

For other deployment platforms:
1. Build the application: `npm run build`
2. Upload the `dist` folder and server files
3. Set environment variables
4. Start with `npm start`