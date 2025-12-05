# StorySnap - Historical Stories Platform

A beautiful platform for sharing and discovering historical place stories with images and audio narration. Built for preserving cultural heritage and historical narratives.

## Features

- 🔐 **Authentication** - Firebase Auth with email/password login and signup
- 📝 **Story Creation** - Rich text editor with multi-image upload to Cloudinary
- 👨‍💼 **Admin Panel** - Review and approve/reject submitted stories
- 📱 **Public Feed** - Beautiful grid layout of approved stories
- 🖼️ **Image Galleries** - Multiple images per story with carousel navigation
- 🔊 **Audio Narration** - Web Speech API for listening to stories
- 🌐 **Bengali Support** - Full translation files for Bengali language
- 🎨 **Premium UI** - Modern design with glassmorphism, smooth animations

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: MongoDB with Mongoose
- **Image Storage**: Cloudinary
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Playfair Display (headings), Inter (body)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas recommended)
- Firebase project
- Cloudinary account

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd storysnap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.local` and fill in your credentials:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/storysnap?retryWrites=true&w=majority

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Users

1. **Sign Up** - Create an account at `/signup`
2. **Create Story** - Share your historical story at `/create-story`
3. **Browse Feed** - Explore approved stories at `/feed`
4. **View Story** - Click any story to see full details with audio narration

### For Admins

1. **Set Admin Role** - Manually update user role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Access Admin Panel** - Navigate to `/admin`
3. **Review Stories** - Approve or reject pending submissions

## Project Structure

```
storysnap/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── stories/        # Story CRUD endpoints
│   │   │   ├── upload/         # Image upload endpoint
│   │   │   └── admin/          # Admin endpoints
│   │   ├── create-story/       # Story creation page
│   │   ├── feed/               # Public feed page
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   ├── story/[id]/         # Individual story view
│   │   ├── layout.tsx          # Root layout with AuthProvider
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Global styles
│   ├── contexts/
│   │   └── AuthContext.tsx     # Firebase auth context
│   ├── lib/
│   │   ├── firebase.ts         # Firebase configuration
│   │   ├── mongodb.ts          # MongoDB connection
│   │   └── cloudinary.ts       # Cloudinary utilities
│   ├── models/
│   │   ├── User.ts             # User model
│   │   └── Story.ts            # Story model
│   └── middleware.ts           # Route protection
├── messages/
│   ├── en.json                 # English translations
│   └── bn.json                 # Bengali translations
└── .env.local                  # Environment variables
```

## Key Features Explained

### Story Approval Workflow

1. User creates story → Status: `pending`
2. Admin reviews in admin panel
3. Admin approves → Status: `approved` (visible in feed)
4. Admin rejects → Status: `rejected` (not visible)

### Audio Narration

- Uses Web Speech API (browser-based)
- Click speaker icon on story page
- Supports English narration
- Free, no API costs

### Image Upload

- Multi-image support per story
- Uploaded to Cloudinary
- Automatic optimization
- Carousel navigation in story view

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database Models

**User Model**
- `firebaseUid`: String (unique)
- `email`: String (unique)
- `name`: String
- `role`: 'user' | 'admin'
- `createdAt`: Date

**Story Model**
- `title`: String
- `content`: String
- `images`: Array of { url, publicId }
- `authorId`: String
- `authorName`: String
- `location`: String
- `historicalPeriod`: String (optional)
- `status`: 'pending' | 'approved' | 'rejected'
- `audioUrl`: String (optional)
- `createdAt`: Date
- `approvedAt`: Date (optional)
- `approvedBy`: String (optional)

## Contributing

This is a personal project built for preserving historical stories. Feel free to fork and customize for your own use!

## License

MIT

## Credits

Built with ❤️ for Papa's historical storytelling hobby.# storysnap
