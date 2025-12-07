# WorkNest 

A modern, full-stack job board application built with Next.js and Django. WorkNest connects companies with talented job seekers through an intuitive platform that streamlines the hiring process.



## 🚀 Features

### For Companies
- **Post Job Listings**: Create detailed job postings with rich text descriptions
- **Manage Applications**: Review and track job applications
- **Company Profiles**: Build comprehensive company profiles with branding
- **Flexible Pricing**: Choose from multiple listing duration options (30, 60, 90 days)
- **Payment Integration**: Secure payments via Stripe

### For Job Seekers
- **Browse Jobs**: Filter and search through available positions
- **Apply to Jobs**: Submit applications with cover letters
- **Save Jobs**: Bookmark interesting opportunities
- **Profile Management**: Create detailed profiles with resume uploads
- **Application Tracking**: Monitor application status

### Platform Features
- **OAuth Authentication**: Google and GitHub login integration
- **Dark/Light Theme**: Responsive design with theme switching
- **Rich Text Editor**: TipTap editor for job descriptions
- **File Uploads**: Resume and company logo uploads via UploadThing
- **Real-time Notifications**: Toast notifications for user actions
- **Mobile Responsive**: Optimized for all device sizes

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Rich Text**: TipTap Editor
- **State Management**: React Context + React Hook Form
- **Authentication**: Custom auth implementation
- **Payments**: Stripe
- **File Uploads**: UploadThing

### Backend
- **Framework**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT with django-allauth
- **File Storage**: Cloud-based via UploadThing
- **API**: RESTful API architecture

### DevOps & Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Database**: PostgreSQL (Railway)
- **CDN**: UploadThing for file storage
- **Containerization**: Docker

## 🏗️ Project Structure

```
├── app/                          # Next.js app directory
│   ├── (mainLayout)/            # Main application routes
│   ├── api/                     # API routes (webhooks, uploads)
│   ├── auth/                    # Authentication pages
│   └── utils/                   # Utility functions and helpers
├── backend/                     # Django backend
│   ├── accounts/                # User and company models
│   ├── jobs/                    # Job posting and application models
│   └── worknest/               # Django settings and configuration
├── components/                  # Reusable React components
│   ├── forms/                   # Form components
│   ├── general/                 # General UI components
│   ├── richTextEditor/         # TipTap editor components
│   └── ui/                     # shadcn/ui components
└── public/                     # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.11+
- PostgreSQL
- Git

### Frontend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd worknest
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

Configure the following environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
UPLOADTHING_SECRET=your-uploadthing-secret-key
UPLOADTHING_APP_ID=your-uploadthing-app-id
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

4. **Run the development server**
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment setup**
```bash
cp .env.example .env
```

Configure your Django settings including database credentials.

5. **Run migrations**
```bash
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Start the Django server**
```bash
python manage.py runserver
```

The API will be available at [http://localhost:8000](http://localhost:8000).

## 🔧 Configuration

### OAuth Setup
1. **Google OAuth**: Create a project in Google Cloud Console and obtain client credentials
2. **GitHub OAuth**: Create a GitHub OAuth App and configure callback URLs

### Payment Setup
1. **Stripe**: Create a Stripe account and obtain API keys
2. Configure webhook endpoints for payment processing

### File Upload Setup
1. **UploadThing**: Create an account and obtain API keys
2. Configure file upload endpoints

## 📱 Usage

### For Companies
1. Sign up and complete company onboarding
2. Create your company profile
3. Post job listings with detailed descriptions
4. Review and manage applications
5. Track hiring metrics

### For Job Seekers
1. Sign up and complete job seeker onboarding
2. Create your profile and upload resume
3. Browse and filter job listings
4. Apply to positions with cover letters
5. Track application status

## 🐳 Docker Deployment

Build and run with Docker:

```bash
# Backend only (frontend deploys to Vercel)
docker build -t worknest-backend .
docker run -p 8000:8000 worknest-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

The Django REST API provides endpoints for:
- User authentication and management
- Company and job seeker profiles
- Job posting CRUD operations
- Job application management
- File upload handling

API documentation is available at `/api/docs/` when running the Django server.

## 🔒 Security Features

- JWT token authentication
- CORS configuration
- Input validation and sanitization
- Secure file upload handling
- Rate limiting
- SQL injection prevention

## 🚀 Deployment

### Frontend (Vercel)
The frontend automatically deploys to Vercel on pushes to main branch.

### Backend (Railway)
The backend deploys to Railway with automatic migrations and static file collection.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Backend powered by [Django](https://djangoproject.com/)

