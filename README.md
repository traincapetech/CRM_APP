# Calyx CRM - Complete Customer Relationship Management System

A comprehensive CRM application built with React Native (mobile app) and Node.js (backend server) that serves both mobile and web clients.

## 🚀 Features

### Core CRM Modules
- **Dashboard** - Overview of sales metrics, activities, and recent updates
- **Pipeline Management** - Visual sales pipeline with drag-and-drop stages
- **Customer Management** - Complete customer database with contact information
- **Lead Management** - Track and convert leads through the sales process
- **Activity Tracking** - Schedule and manage calls, meetings, tasks, and notes
- **Team Management** - Organize sales teams and assign responsibilities
- **Sales Forecast** - Revenue projections and pipeline analysis
- **Advanced Filtering** - Powerful search and filter capabilities across all modules

### Technical Features
- **Real-time Updates** - Live data synchronization
- **Offline Support** - Works without internet connection
- **Import/Export** - Spreadsheet integration for data management
- **Responsive Design** - Optimized for mobile and tablet devices
- **Role-based Access** - Admin, Manager, and Salesperson permissions
- **Secure Authentication** - JWT-based authentication system

## 📱 Mobile App Structure

```
src/
├── screens/
│   ├── auth/
│   │   └── LoginScreen.jsx
│   ├── dashboard/
│   │   └── DashboardScreen.jsx
│   ├── pipeline/
│   │   └── PipelineScreen.jsx
│   ├── activities/
│   │   └── ActivitiesScreen.jsx
│   ├── teams/
│   │   └── TeamsScreen.jsx
│   ├── customers/
│   │   └── CustomersScreen.jsx
│   ├── forecast/
│   │   └── ForecastScreen.jsx
│   ├── leads/
│   │   └── LeadsScreen.jsx
│   └── settings/
│       └── SettingsScreen.jsx
├── context/
│   └── AuthContext.jsx
└── services/
    └── api.js
```

## 🖥️ Backend Server Structure

```
server/
├── models/
│   ├── User.js
│   ├── Team.js
│   ├── Customer.js
│   ├── Pipeline.js
│   ├── Opportunity.js
│   ├── Activity.js
│   └── Lead.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── customers.js
│   ├── pipeline.js
│   ├── activities.js
│   ├── teams.js
│   ├── forecast.js
│   ├── leads.js
│   └── config.js
├── middleware/
│   └── auth.js
├── server.js
└── package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (>= 18)
- MongoDB
- React Native development environment
- Android Studio / Xcode

### 1. Clone and Install Dependencies

```bash
# Install mobile app dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Or start MongoDB service
mongod
```

### 3. Environment Configuration

Create a `.env` file in the server directory:

```bash
cd server
cp config.env .env
```

Update the `.env` file with your configuration:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/calyxcrm
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:8081
```

### 4. Start the Backend Server

```bash
# Development mode with auto-reload
npm run server

# Or production mode
npm run server:start
```

The server will start on `http://localhost:3000`

### 5. Start the React Native App

```bash
# Start Metro bundler
npm start

# Run on Android (in a new terminal)
npm run android

# Run on iOS (in a new terminal)
npm run ios
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### CRM Modules
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/pipeline` - Get sales pipelines
- `GET /api/activities` - Get activities
- `GET /api/teams` - Get teams
- `GET /api/forecast` - Get sales forecast
- `GET /api/leads` - Get leads

## 📊 Database Models

### User
- Personal information and authentication
- Role-based permissions (admin, manager, salesperson)
- Team assignments

### Customer
- Contact information and company details
- Sales history and relationship tracking
- Custom fields support

### Pipeline
- Configurable sales stages
- Visual pipeline management
- Stage-specific probabilities

### Opportunity
- Sales deals with values and probabilities
- Customer and salesperson assignments
- Expected close dates

### Activity
- Tasks, calls, meetings, and notes
- Due dates and priority levels
- Customer and opportunity associations

### Lead
- Lead generation and qualification
- Source tracking and scoring
- Conversion to customers

### Team
- Sales team organization
- Revenue targets and performance
- Member management

## 🎨 UI Components

The app uses React Native Paper components for a consistent Material Design experience:

- **Navigation**: Bottom tabs with drawer navigation
- **Cards**: Information display with elevation
- **Forms**: Input fields with validation
- **Lists**: Searchable and filterable data
- **Charts**: Visual data representation
- **Modals**: Interactive dialogs and forms

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection
- Rate limiting

## 📱 Mobile Features

- **Offline Support**: Core functionality works without internet
- **Push Notifications**: Activity reminders and updates
- **Camera Integration**: Photo capture for activities
- **File Upload**: Document and attachment support
- **GPS Integration**: Location-based features

## 🌐 Web Integration

The backend server is designed to serve both mobile and web clients:

- RESTful API endpoints
- CORS configuration for web access
- Shared authentication system
- Real-time updates via WebSocket (future)

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, AWS, or your preferred platform

### Mobile App Deployment
1. Build release APK/IPA
2. Deploy to Google Play Store / App Store
3. Configure push notification services

## 📈 Future Enhancements

- **Real-time Chat**: Internal team communication
- **Advanced Analytics**: Detailed reporting and insights
- **Email Integration**: Sync with email providers
- **Calendar Integration**: Schedule synchronization
- **Document Management**: File storage and sharing
- **API Integrations**: Third-party service connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Calyx CRM** - Streamline your customer relationships and boost sales performance! 🎯