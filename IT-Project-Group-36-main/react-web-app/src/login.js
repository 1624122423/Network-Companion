// Import the functions you need from the SDKs you need
import { initializeApp} from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhC7Sa6MwVR7AWt_Oy36kmxUw-r62IjpQ",
  authDomain: "it-project-auth-65f7e.firebaseapp.com",
  projectId: "it-project-auth-65f7e",
  storageBucket: "it-project-auth-65f7e.firebasestorage.app",
  messagingSenderId: "545277543990",
  appId: "1:545277543990:web:7f03e9d711b59ef01a3a97",
  measurementId: "G-C4V31ML5KM"
}; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const submit = document.getElementById("submit");

<<<<<<< HEAD
async function createSession(email, password) {
  try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCredential);
      auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
      const idToken_json = JSON.stringify({'id-token': idToken});
      console.log(idToken_json);
      fetch('http://localhost:5000/login', {
          method: 'POST',
          credentials: 'include', 
          headers: {'Content-Type': 'application/json'}, 
          body: idToken_json
        })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error(err))});
      }
    catch (error) {
      console.log(error);
    }
}

=======
// calls backend api to get session cookie
async function createSession(email, password){
  try {
    const userCredential = signInWithEmailAndPassword(auth, email, password);
    console.log(userCredential);
    auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
    const idToken_json = JSON.stringify({'id-token': idToken, 'email': email});
    console.log(idToken_json);

    fetch('http://localhost:5000/login', {
        method: 'POST',
        credentials: 'include', 
        headers: {'Content-Type': 'application/json'}, // IMPORTANT to avoid error 415
        body: idToken_json
      })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(error => console.error(error))});
  }  
  catch (error) {
    console.log(error);
  }
} 
>>>>>>> joshtestsignup

/*
 function to login using email & password uses firebase api to authenticate user, 
 then generate an id-token to send to backend api,
 which will verify the token against firebase api before creating a session for the user
*/ 
const login = async(event) => {
    event.preventDefault(); // prevents console from resetting
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
<<<<<<< HEAD
    
    createSession(email, password)

    fetch('http://localhost:5000/test', {
          method: 'GET',
          credentials: 'include',  // This is critical!
        })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error(err));
=======
    createSession(email, password);
>>>>>>> joshtestsignup
    
}

const signup = async(event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
<<<<<<< HEAD
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(userCredential);
=======
      //const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      //console.log(userCredential);
      await createSession(email, password);
      let basic_info = JSON.stringify({'email': email});

      fetch('http://localhost:5000/api/user/register', {
      method: 'POST',
        credentials: 'include', 
        headers: {'Content-Type': 'application/json'}, // IMPORTANT to avoid error 415
        body: basic_info
      }).then(res => res.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));
>>>>>>> joshtestsignup
    } catch (err) {
      console.error(err)

    }
}


// Sign up
submit.addEventListener("click", (event) => {signup(event)})





