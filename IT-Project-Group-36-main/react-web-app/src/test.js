import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app"

const firebaseConfig = {'apiKey': "AIzaSyBhC7Sa6MwVR7AWt_Oy36kmxUw-r62IjpQ",
  'authDomain': "it-project-auth-65f7e.firebaseapp.com",
  'projectId': "it-project-auth-65f7e",
  'storageBucket': "it-project-auth-65f7e.firebasestorage.app",
  'messagingSenderId': "545277543990",
  'appId': "1:545277543990:web:7f03e9d711b59ef01a3a97",
  'measurementId': "G-C4V31ML5KM"}

const app = initializeApp(firebaseConfig);

const email = "desmondfookk@gmail.com";
const password = "12345678";

const auth = getAuth(app);
createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;

    })
    .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    });

console.log("OK")