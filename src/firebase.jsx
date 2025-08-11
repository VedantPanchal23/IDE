import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWjEH7OPwaxMZxhALWLRjyyDcP4UMQASw",
  authDomain: "ai-ide-1d166.firebaseapp.com",
  projectId: "ai-ide-1d166",
  storageBucket: "ai-ide-1d166.firebasestorage.app.appspot.com",
  messagingSenderId: "935927594016",
  appId: "1:935927594016:web:e5fe63e78439fefa6b1045"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);