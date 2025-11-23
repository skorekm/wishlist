# Wishlist - Gift-Giving, Perfected 🎁

A wishlist application. Create wishlists, share them effortlessly, and coordinate gift reservations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## ✨ Features

- **🎯 Organize with Purpose** - Create unlimited wishlists tailored to every occasion—birthdays, weddings, holidays, or just because
- **🔗 One Link, Instant Access** - Share wishlists with a single link—no signups required for viewers
- **🔔 Never Get Duplicates** - Automatic coordination when items are reserved by friends and family
- **🔒 Privacy Controls** - Create separate lists for different circles and control who sees what
- **❤️ Rich, Visual Context** - Attach product images, prices, purchase links, and personal notes
- **👥 Scales with You** - Perfect for family gift exchanges or large friend groups

## 🚀 Tech Stack

- **Frontend**:
  - React 19 with TypeScript
  - TanStack Router for routing
  - TanStack Query for data fetching
  - Tailwind CSS 4 for styling
  - Framer Motion for animations
  - Shadcn UI components
  - React Helmet Async for SEO

- **Backend**:
  - Supabase (PostgreSQL database)
  - Supabase Auth (Google OAuth)
  - Supabase Edge Functions (Deno)

- **Development**:
  - Vite for build tooling
  - Bun as package manager and test runner
  - ESLint for code quality
  - TypeScript for type safety

## 📋 Prerequisites

- [Bun](https://bun.sh/) (v1.2.3 or higher)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- A Supabase project (for production) or Docker (for local development)

## 🛠️ Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wishlist
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Supabase locally** (optional, for local development)
   ```bash
   bunx supabase start
   ```

5. **Generate TypeScript types from Supabase schema**
   ```bash
   bun run generate:types
   ```

6. **Start the development server**
   ```bash
   bun run dev
   ```

   The app will be available at `http://localhost:5173`

## 📜 Available Scripts

- `bun run dev` - Start development server with Vite
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint
- `bun run typecheck` - Run TypeScript type checking
- `bun run test` - Run tests with Bun
- `bun run generate:types` - Generate TypeScript types from Supabase schema

## 🗂️ Project Structure

```
wishlist/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── modules/        # Feature-specific components
│   │   └── ui/             # Shadcn UI components
│   ├── routes/             # TanStack Router routes
│   │   ├── _authenticated/ # Protected routes
│   │   ├── index.tsx       # Landing page
│   │   ├── login.tsx       # Login page
│   │   └── ...
│   ├── services/           # API service functions
│   ├── lib/                # Utility functions
│   ├── database.types.ts   # Generated Supabase types
│   └── main.tsx           # Application entry point
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── reserve-item/   # Item reservation logic
│   │   └── delete-account/ # Account deletion logic
│   └── migrations/         # Database migrations
├── public/                 # Static assets
└── ...config files
```

## 🔐 Authentication

The app uses Supabase Auth with Google OAuth for secure authentication. Users can:
- Sign in with their Google account
- Manage their account settings
- Delete their account and all associated data

## 🎨 Design Philosophy

The application follows a **Linear-inspired** design aesthetic:
- Clean, minimalist interface
- Purposeful use of color for status indicators
- Subtle animations and micro-interactions
- Premium feel with glassmorphism effects
- Fully responsive mobile design
- Dark mode support

## 📱 Key Features in Detail

### Wishlist Management
- Create multiple wishlists for different occasions
- Add items with rich details (images, prices, links, notes)
- Set item priorities (low, medium, high)
- Mark items as public or private
- Set expiration dates for time-sensitive items

### Sharing & Collaboration
- Share wishlists via unique URLs
- No account required for viewers
- Real-time reservation status
- Mark items as purchased
- Reserve items anonymously or reveal identity

### Privacy & Control
- Control who can access your wishlists
- Revoke shared links anytime
- Delete account with full data removal
- Secure authentication via Google OAuth

## 🧪 Testing

Run the test suite:
```bash
bun run test
```

The project uses:
- Bun's built-in test runner
- Happy DOM for DOM testing
- Testing Library for React component testing

## 🚢 Deployment

1. **Build the application**
   ```bash
   bun run build
   ```

2. **Deploy to your hosting platform**
   
   The `dist` folder contains the production-ready static files.

3. **Deploy Supabase Edge Functions**
   ```bash
   bunx supabase functions deploy reserve-item
   bunx supabase functions deploy delete-account
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations with [Framer Motion](https://www.framer.com/motion/)

## 📧 Contact

For support or inquiries, please contact: support@wishlist.com

---

Made with ❤️ for better gift-giving
