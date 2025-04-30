# PetPal

PetPal is a comprehensive mobile application designed to help pet owners manage their pets' health records, daily activities, and care routines. The app provides a centralized platform for tracking multiple pets, their medical history, appointments, and more.

![PetPal App Banner](https://via.placeholder.com/800x200?text=PetPal+App)

## Features

### 🐾 Multi-Pet Profile Management
- Create and manage profiles for multiple pets
- Store pet details including name, breed, age, and photos
- Easily switch between different pet profiles

### 🩺 Health Tracking
- Monitor pet weight with visual charts and trends
- Track vaccinations and medical appointments
- Store and access veterinary records
- Record medication schedules and set reminders

### 🗺️ Pet-Friendly Locations
- Find nearby pet services (vets, parks, pet stores)
- Custom map styling for better visibility
- Save favorite locations for quick access

### 📝 Pet Journal
- Record daily activities and milestones
- Attach photos to journal entries
- Track behavioral changes and patterns

### ⏰ Reminders System
- Set medication reminders
- Schedule vet appointments
- Get notified about upcoming pet care tasks

### ☁️ Weather Integration
- Check local weather conditions
- Plan outdoor activities with your pet
- Receive weather-based recommendations

### 📱 User-Friendly Interface
- Intuitive navigation with tab-based layout
- Dark mode support
- Responsive design for various device sizes

## Screenshots

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img src="https://via.placeholder.com/200x400?text=Dashboard" alt="Dashboard" width="200"/>
  <img src="https://via.placeholder.com/200x400?text=Pet+Profiles" alt="Pet Profiles" width="200"/>
  <img src="https://via.placeholder.com/200x400?text=Health+Tracking" alt="Health Tracking" width="200"/>
  <img src="https://via.placeholder.com/200x400?text=Maps" alt="Maps" width="200"/>
  <img src="https://via.placeholder.com/200x400?text=Journal" alt="Journal" width="200"/>
</div>

## Technologies Used

- **Frontend**: React Native, Expo
- **State Management**: React Context API
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Maps**: Google Maps API
- **Local Storage**: AsyncStorage
- **Charts**: React Native Chart Kit
- **UI Components**: Custom components with Tailwind-inspired styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account

### Setup Instructions

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/petpal.git
   cd petpal
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Create a `.env` file in the root directory with your API keys:
   \`\`\`
   EXPO_PUBLIC_GOOGLE_API_KEY=your_google_api_key
   EXPO_PUBLIC_S3_BUCKET_NAME=your_s3_bucket_name
   EXPO_PUBLIC_S3_REGION=your_s3_region
   EXPO_PUBLIC_S3_ACCESS_KEY=your_s3_access_key
   EXPO_PUBLIC_S3_SECRET_KEY=your_s3_secret_key
   \`\`\`

4. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Add your Firebase configuration to the app

5. Start the development server:
   \`\`\`bash
   npx expo start
   \`\`\`

## Usage

1. **Sign Up/Login**: Create an account or log in to access your pet profiles
2. **Create Pet Profile**: Add your pets with their details and photos
3. **Dashboard**: View upcoming reminders and recent activities
4. **Health**: Track weight, vaccinations, and medical records
5. **Maps**: Find pet-friendly locations nearby
6. **Journal**: Record daily activities and milestones
7. **Profile**: Manage pet profiles and account settings

## Project Structure

\`\`\`
petpal/
├── app/                  # Main application screens
│   ├── (app)/            # App screens requiring authentication
│   ├── (auth)/           # Authentication screens
│   ├── (tabs)/           # Tab navigation screens
│   └── context/          # React Context providers
├── components/           # Reusable UI components
│   ├── health/           # Health tracking components
│   ├── journal/          # Journal related components
│   ├── maps/             # Map view components
│   ├── profile/          # Profile management components
│   ├── reminders/        # Reminder components
│   ├── ui/               # Base UI components
│   └── weather/          # Weather display components
├── constants/            # App constants and configuration
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── assets/               # Static assets
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
