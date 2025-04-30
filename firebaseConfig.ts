import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";



const firebaseConfig = {
    apiKey: "AIzaSyDYN2SCSYh-pl6tur8LVm3Q9V-PoErUSS8",
    authDomain: "petpal-72145.firebaseapp.com",
    projectId: "petpal-72145",
    storageBucket: "petpal-72145.firebasestorage.app",
    messagingSenderId: "864520559411",
    appId: "1:864520559411:web:4a1270e4b61de030dcbc46",
    measurementId: "G-QW1H986X36"
  };

  const app = initializeApp(firebaseConfig);

  const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  
  const db = getFirestore(app);
  
  export { app, auth, db };