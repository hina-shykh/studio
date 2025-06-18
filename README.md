# FireBlog - A Client-Side Blogging Platform

FireBlog is a complete client-side rendered blogging website built with Next.js (React), Firebase Authentication, and Firestore. It allows users to register, log in, create, read, update, and delete blog posts. All operations are performed directly on the client-side using the Firebase SDK, with no backend server code.

## Features

*   **User Authentication**: Email/password registration and login via Firebase Authentication.
*   **Post Management (CRUD)**:
    *   Create new blog posts.
    *   Read all posts on the homepage.
    *   View individual posts.
    *   Edit existing posts (only by the author).
    *   Delete posts (only by the author).
*   **Client-Side Operations**: All Firebase interactions (Auth and Firestore) are handled directly in the Next.js frontend.
*   **Protected Routes**: Routes for creating and editing posts are protected and require authentication.
*   **Responsive Design**: Styled with Tailwind CSS and ShadCN UI components for a modern and responsive experience.

## Tech Stack

*   **Frontend**: Next.js (React framework) with App Router, TypeScript
*   **Styling**: Tailwind CSS, ShadCN UI
*   **Firebase**:
    *   Firebase Authentication (Email & Password)
    *   Firebase Firestore (for storing posts and user profiles)
*   **Hosting**: Firebase Hosting (intended deployment target)

## Project Structure

```
fireblog/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router: pages, layouts
│   │   ├── (auth)/             # Authentication related pages (login, register)
│   │   ├── create/             # Create post page
│   │   ├── edit/[id]/          # Edit post page
│   │   ├── post/[id]/          # Single post view page
│   │   ├── globals.css         # Global styles and Tailwind directives
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage (lists all posts)
│   ├── components/
│   │   ├── layout/             # Layout components (Navbar)
│   │   └── ui/                 # ShadCN UI components
│   ├── contexts/
│   │   └── AuthContext.tsx     # Firebase Authentication context and HOC
│   ├── lib/
│   │   ├── firebase/
│   │   │   └── config.ts       # Firebase initialization and configuration
│   │   └── utils.ts            # Utility functions
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
├── .env.local.example          # Example environment variables
├── next.config.js              # Next.js configuration
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Firebase Setup

1.  **Create a Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click on "Add project" and follow the steps to create a new project.

2.  **Register your app with Firebase**:
    *   In your Firebase project dashboard, click on the "Web" icon (`</>`) to add a web app.
    *   Register your app, get the Firebase SDK snippet. You'll need the configuration object.

3.  **Enable Firebase Services**:
    *   **Authentication**:
        *   Go to "Authentication" in the Firebase console.
        *   Click on the "Sign-in method" tab.
        *   Enable "Email/Password" as a sign-in provider.
    *   **Firestore Database**:
        *   Go to "Firestore Database" in the Firebase console.
        *   Click "Create database".
        *   Choose "Start in **production mode**" (we will update security rules).
        *   Select a Firestore location.

4.  **Set up Firestore Security Rules**:
    *   In the Firestore Database section, go to the "Rules" tab.
    *   Replace the default rules with the following:

    ```js
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /posts/{postId} {
          allow read: if true;
          allow create: if request.auth != null;
          allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
        }

        match /users/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```
    *   Click "Publish".

5.  **Configure Environment Variables**:
    *   Create a file named `.env.local` in the root of your project.
    *   Copy the content from `.env.local.example` into `.env.local`.
    *   Fill in the values with your Firebase project's configuration details obtained in step 2.

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

## Running the App Locally

1.  **Clone the repository (if applicable) or ensure you have the project files.**
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will usually start on `http://localhost:3000` or the port specified in `package.json` (e.g., `9002`).

## How Firebase is Used

*   **Firebase Authentication (`firebase/auth`)**:
    *   Used for user registration (Email/Password) and login.
    *   `onAuthStateChanged` listener in `src/contexts/AuthContext.tsx` manages the current user's state globally.
    *   User sessions are automatically handled by the Firebase SDK's persistence.
    *   Protected routes (`/create`, `/edit/:id`) use a Higher-Order Component (`withAuth`) that checks the user's authentication status from `AuthContext`.

*   **Firestore (`firebase/firestore`)**:
    *   **`posts` collection**:
        *   Stores blog post data: `title`, `content`, `authorId`, `authorEmail`, `authorDisplayName`, `createdAt`, `updatedAt`.
        *   `authorId` links a post to the UID of the Firebase user who created it.
        *   Security rules ensure only authenticated users can create posts, and only authors can update/delete their own posts. All users can read posts.
    *   **`users` collection**:
        *   Stores basic user profile information: `uid`, `email`, `displayName`.
        *   A user document is created upon registration.
        *   Security rules ensure a user can only read/write their own document.
    *   All Firestore operations (add, get, update, delete documents) are performed client-side using functions from the Firebase JS SDK (v9 modular). Timestamps are handled using `serverTimestamp()`.

## Deployment to Firebase Hosting

1.  **Install Firebase CLI**:
    If you don't have it, install it globally:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase**:
    ```bash
    firebase login
    ```

3.  **Initialize Firebase in your project (if not already done for Hosting)**:
    If this project was scaffolded, it might already have Firebase Hosting config. If not, or to reconfigure:
    ```bash
    firebase init hosting
    ```
    *   Select "Use an existing project" and choose your Firebase project.
    *   Set your public directory to `out` (for a static Next.js export) or configure for a Next.js SSR/ISR deployment if preferred (requires different setup). For a purely client-side app as requested, a static export is suitable.

    **For a static export (fully client-side):**
    *   Update `next.config.ts` to enable static export:
        ```ts
        const nextConfig: NextConfig = {
          output: 'export', // Add this line
          // ... other configurations
        };
        ```
    *   Update `package.json` build script:
        ```json
        "scripts": {
          "build": "next build", // next build will now produce static export due to config
          // ...
        }
        ```
    *   When `firebase init hosting` asks for public directory, enter `out`.
    *   Configure as a single-page app (rewrite all URLs to /index.html): Yes.
    *   Set up automatic builds and deploys with GitHub: No (unless you want this).

4.  **Build the Next.js app**:
    ```bash
    npm run build
    ```
    This will create an `out` folder with the static assets.

5.  **Deploy to Firebase Hosting**:
    ```bash
    firebase deploy --only hosting
    ```

After deployment, Firebase CLI will provide you with the URL of your hosted application.

---

This project serves as a comprehensive example of building a frontend-only application using Next.js and Firebase, suitable for learning and demonstration purposes.
