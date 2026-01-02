// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: "resturant-app-bb067.firebaseapp.com",
//   projectId: "resturant-app-bb067",
//   storageBucket: "resturant-app-bb067.appspot.com",
//   messagingSenderId: "585101680141",
//   appId: "1:585101680141:web:100b8ff502fb807c69ff44"
// };

// // Initialize Firebase
// export const app = initializeApp(firebaseConfig);

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDVzW78lDemadABOh28lvy0d9ZrRDtqCEY",
//   authDomain: "restaurant-management-jay.firebaseapp.com",
//   projectId: "restaurant-management-jay",
//   storageBucket: "restaurant-management-jay.firebasestorage.app",
//   messagingSenderId: "279034137906",
//   appId: "1:279034137906:web:60dc218d99a52709715b2b",
//   measurementId: "G-ZWW6RR331B"
// };

// // Initialize Firebase
// // 👇 I added "export" here. This is crucial!
// export const app = initializeApp(firebaseConfig); 
// const analytics = getAnalytics(app);

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVzW78lDemadABOh28lvy0d9ZrRDtqCEY",
  authDomain: "restaurant-management-jay.firebaseapp.com",
  projectId: "restaurant-management-jay",
  storageBucket: "restaurant-management-jay.firebasestorage.app",
  messagingSenderId: "279034137906",
  appId: "1:279034137906:web:338373c071069657715b2b",
  measurementId: "G-R5BHX3BYYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);