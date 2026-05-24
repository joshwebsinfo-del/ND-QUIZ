// Replace this configuration with your actual Firebase project configuration
// To get these: Go to Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app-id.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// For development/mock purposes, we will export a mock auth interface
// In a real app, you would import and use real Firebase like this:
// import { initializeApp } from 'firebase/app';
// import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  // MOCK LOGIN
  console.log("Mocking Google Sign In...");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          displayName: "ND IT Student",
          email: "student@gmail.com",
          photoURL: "https://ui-avatars.com/api/?name=ND+IT+Student&background=0D8ABC&color=fff",
          role: "admin",
        }
      });
    }, 1000);
  });
};

export const logout = async () => {
  console.log("Mocking Sign Out...");
  return new Promise((resolve) => setTimeout(resolve, 500));
};
