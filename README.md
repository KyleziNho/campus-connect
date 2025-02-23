# Campus Connect

A marketplace platform designed specifically for university students to buy and sell items within their campus community.

## Features

- 🛍️ Buy and sell items within your university community
- 🔐 Secure authentication with Firebase
- 💬 Real-time messaging between buyers and sellers (coming soon)
- 🌙 Dark mode support
- 📱 Fully responsive design
- 🖼️ Image upload and compression
- 🏷️ Category-based filtering

## Tech Stack

- Next.js 13+
- Firebase (Authentication, Firestore, Storage)
- Tailwind CSS
- Lucide Icons
- Image Compression

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/KyleziNho/campus-connect.git
cd campus-connect
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. For deployment, add these same environment variables in your Vercel project settings.

5. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

The application is deployed at [campus-connect.co.uk](https://campus-connect.co.uk)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.