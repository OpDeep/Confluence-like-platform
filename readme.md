# 📚 Knowledge Base Platform

A modern, full-stack knowledge management platform built with React, Node.js, and SQLite. This Confluence-like application enables teams to create, collaborate, and organize documentation with advanced features like real-time mentions, version control, and intelligent sharing.

![Knowledge Base Platform](https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

### 🔐 **Authentication System**
- User registration with email validation
- Secure login with JWT authentication
- Password reset functionality with email notifications
- Demo accounts for quick testing

### 📝 **Document Management**
- Rich text editor with formatting capabilities
- Auto-save functionality (every 30 seconds)
- Document versioning and history tracking
- Metadata tracking (author, creation date, last modified)

### 🔍 **Search & Discovery**
- Global search across document titles and content
- Real-time search with highlighting
- Filter documents by ownership and sharing status
- Advanced document categorization

### 👥 **Collaboration Features**
- @username mentions with automatic notifications
- Auto-sharing when users are mentioned
- Real-time notification system with unread counts
- User search and sharing management

### 🔒 **Privacy Controls**
- Public documents (accessible to anyone)
- Private documents (author and shared users only)
- Granular permission system (view/edit access)
- Secure document sharing with email invitations

### 📊 **Analytics Dashboard**
- Document statistics and metrics
- User activity tracking
- Visual document organization
- Filter and sort capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd knowledge-base-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the frontend (port 5173) and backend (port 5000) servers concurrently.

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🧪 Demo Accounts

The application comes pre-seeded with demo accounts for testing:

| Email | Password | Role |
|-------|----------|------|
| john.doe@example.com | password123 | Admin User |
| jane.smith@example.com | password123 | Team Lead |
| mike.johnson@example.com | password123 | Developer |
| sarah.wilson@example.com | password123 | Designer |

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main application layout
│   └── LoadingSpinner.tsx
├── contexts/           # React context providers
│   └── AuthContext.tsx # Authentication state management
├── pages/              # Application pages/routes
│   ├── Dashboard.tsx   # Main dashboard
│   ├── DocumentView.tsx
│   ├── DocumentEdit.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── Search.tsx
│   └── Profile.tsx
└── App.tsx            # Main application component
```

### Backend (Node.js + Express)
```
server/
├── database/          # Database configuration
│   ├── init.js       # Database initialization
│   └── seed.js       # Sample data seeding
├── middleware/        # Express middleware
│   └── auth.js       # JWT authentication
├── routes/           # API route handlers
│   ├── auth.js       # Authentication routes
│   ├── documents.js  # Document management
│   ├── users.js      # User operations
│   └── search.js     # Search functionality
└── index.js          # Server entry point
```

### Database Schema
```sql
-- Core Tables
users                 # User accounts and profiles
documents            # Document storage and metadata
document_versions    # Version control and history
document_permissions # Sharing and access control
mentions             # User mentions and notifications
password_reset_tokens # Password reset functionality
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Modern icon library
- **Date-fns** - Date manipulation utilities

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Better SQLite3** - Fast, embedded database
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email functionality
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and formatting
- **Concurrently** - Run multiple commands
- **Nodemon** - Auto-restart development server

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user
POST /api/auth/forgot-password # Password reset request
POST /api/auth/reset-password  # Password reset confirmation
```

### Documents
```
GET    /api/documents       # List accessible documents
GET    /api/documents/:id   # Get single document
POST   /api/documents       # Create new document
PUT    /api/documents/:id   # Update document
DELETE /api/documents/:id   # Delete document
POST   /api/documents/:id/share # Share document
GET    /api/documents/:id/versions # Get version history
```

### Users & Search
```
GET /api/users/search       # Search users for sharing
GET /api/users/mentions     # Get user mentions/notifications
PUT /api/users/mentions/:id/read # Mark mention as read
GET /api/search            # Global document search
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (blue-600 to indigo-700)
- **Secondary**: Slate tones (slate-50 to slate-900)
- **Accent**: Emerald, Purple, Orange for status indicators
- **Background**: Gradient from slate-50 via blue-50 to indigo-50

### Typography
- **Headings**: Bold, gradient text effects
- **Body**: Readable slate colors with proper contrast
- **Interactive**: Blue accent colors with hover states

### Components
- **Glassmorphism**: Backdrop blur with transparency
- **Rounded corners**: Consistent 12px-24px border radius
- **Shadows**: Layered shadow system for depth
- **Animations**: Smooth transitions and hover effects

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the server directory:
```env
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5000
```

### Database Configuration
The application uses SQLite with automatic initialization:
- Database file: `server/database/knowledge_base.db`
- Auto-migration on startup
- Sample data seeding for development

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm run build:server
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "build:server"]
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Document creation and editing
- [ ] Auto-save functionality
- [ ] Search across documents
- [ ] User mentions and notifications
- [ ] Document sharing and permissions
- [ ] Password reset flow
- [ ] Responsive design on mobile

### Test Scenarios
1. **Authentication Flow**
   - Register new user
   - Login with demo accounts
   - Test password reset

2. **Document Management**
   - Create, edit, delete documents
   - Test auto-save (wait 30 seconds)
   - Verify version history

3. **Collaboration**
   - Mention users with @username
   - Check notification system
   - Test document sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Images from [Pexels](https://pexels.com/)
- UI inspiration from modern design systems
- Built with modern web technologies

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo accounts and test data

---

**Built with ❤️ using React, Node.js, and modern web technologies**