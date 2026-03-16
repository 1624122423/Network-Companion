// src/api.js
// -------------------------------------------------------------
// Frontend API wrapper for the mentor–mentee booking app.
// - Base URL can come from Vite env (VITE_API_BASE_URL) or default to "/api"
// - JWT is stored in localStorage and attached as Bearer token when `auth: true`
// - Non-2xx responses throw an Error with .status and .payload for UI handling
// -------------------------------------------------------------

import { initializeApp} from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,deleteUser } from "firebase/auth";

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

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



console.log("API Base URL:", API_BASE)
const TOKEN_KEY = 'authToken';

// -------- Auth token helpers --------
export function setAuthToken(token) { token ? localStorage.setItem(TOKEN_KEY, token) : null; }
export function getAuthToken() { return localStorage.getItem(TOKEN_KEY); }
export function clearAuthToken() { localStorage.removeItem(TOKEN_KEY); }

// -------- Core request helper --------
async function request(path, { method = 'GET', params, body, auth = false, credentials = true} = {}) {
  let url = `${API_BASE}${path}`;

  // Build query string
  if (params && Object.keys(params).length) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    }
    url += `?${qs.toString()}`;
  }

  // Headers
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  console.log(headers)

  if (auth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: credentials? "include": "omit"
  }).catch((err) => {console.error(err); throw err}) ;

  if (!res.ok) {
    // Try to parse JSON error body; fall back to status text
    let errPayload = {};
    try { errPayload = await res.json(); } catch {}
    const err = new Error(errPayload?.message || res?.statusText || `HTTP ${res?.status}`);
    err.status = res.status;
    err.payload = errPayload;
    throw err;
  }

  // Some DELETE/PATCH endpoints may return no content
  const text = await res.text();
  return text ? JSON.parse(text) : {};
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function createSession(email, password) {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Get Firebase ID token
    const idToken = await auth.currentUser.getIdToken(true);
    const idToken_json = { 'id-token': idToken };
    console.log(idToken_json);

    // Send token to backend
    const res = await request('/users/login', {
      method: 'POST',
      body: idToken_json,
    });

    return res; // allow caller to handle it
  } catch (error) {
    console.error("Error in createSession:", error);
    throw error; // rethrow so caller can catch
  }
}

  


export async function signup({username, email, first_name, last_name, password})  {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  const idToken = await userCredential.user.getIdToken()

  let basic_info = {
    'email': email, 
    "username": username, 
    "first_name": first_name, 
    "last_name": last_name,
    "id-token": idToken};
  

  await request('/users/register', {
    method: 'POST',
    params: {},
    body: basic_info
  }).catch(error=>{
    console.error(error);
    const auth = getAuth();
    const user = auth.currentUser;
    console.log("here")
    deleteUser(user).then(() => {
      // User deleted.
      console.log("deleteduser")
    }).catch((err) => {
      // An error ocurred
      console.error(err)
    });
    throw error
    })

  setAuthToken(idToken);
  console.log(idToken);   
}
    


// =============== Users (register/login) ===============
// POST /api/users/register
export async function registerUser({ username, email, password, first_name, last_name }) {
  return request('/users/register', {
    method: 'POST',
    body: { username, email, password, first_name, last_name }
  });
}

// POST /api/users/login -> { success, message, token }
export async function loginUser({ email, password }) {
  const data = await request('/users/login', {
    method: 'POST',
    body: { email, password }
  });
  if (data?.token) setAuthToken(data.token);
  return data;
}

// =============== Mentors ===============
// GET /api/mentors?field_of_expertise&location&min_hourly_rate&max_hourly_rate&rating&page&page_size
export async function registerMentors(body){
  body["id-token"] = getAuthToken();
  return request('/users/register_as_mentor', {
    body: body, 
    method: 'POST'
  })
}

export async function getMentors({
  field_of_expertise,
  location,
  page = 1,
  page_size = 20,
} = {}) {
  return request('/mentors', {
    params: { field_of_expertise, location, page, page_size }
  });
} 

// GET /api/mentors/{mentor_id}
export async function getMentorById(mentor_id) {
  return request(`/mentors/${mentor_id}`);
}

// (Optional, mentor self profile) GET /api/mentors/me
export async function getMentorMe() {
  return request('/mentors/me', { auth: true });
}

// POST /api/timeslots body: {start_time, end_time, location}
export async function  createTimeSlots({start_time, end_time, location}) {
  try {
    return request('/timeslots/', {
      method: 'POST',
      body: JSON.stringify({
        'start_time': start_time,
        'end_time': end_time,
        'location': location
      }) 
    })
  } catch (err) {
    alert(err.message)
  }
}

export async function getTimeSlots(){
  return request('/timeslots/')
}

// =============== Appointments (bookings) ===============
// POST /api/appointments  body: { mentor_id, start_time, end_time, user_id }
export async function createAppointment({ appointmentId}) {
  console.log(appointmentId)
  return request('/appointments', {
    method: 'POST',
    body: { 'appointment_id': appointmentId }
  });
}

// DELETE /api/appointments/{appointment_id}
export async function cancelAppointment(appointment_id) {
  return request(`/timeslots/${appointment_id}`, { method: 'DELETE', auth: false });
}

// GET /api/appointments/{user_id}
export async function getUserAppointments() {
  return request(`/appointments/`, {});
}

// GET /api/appointments/mentor/{mentor_id}
export async function getMentorAppointments(mentor_id) {
  return request(`/appointments/mentor/${mentor_id}`, { auth: true });
}

// PATCH /api/appointments/{appointment_id}/accept
export async function acceptAppointment(appointment_id) {
  return request(`/appointments/${appointment_id}/accept`, { method: 'PATCH', auth: true });
}

// PATCH /api/appointments/{appointment_id}/reject
export async function rejectAppointment(appointment_id) {
  return request(`/appointments/${appointment_id}/reject`, { method: 'PATCH', auth: true });
}

// =============== Notifications (optional) ===============
// POST /api/notifications  body: { user_id, mentor_id, notification_type, message }
export async function sendNotification({ user_id, mentor_id, notification_type, message }) {
  return request('/notifications', {
    method: 'POST',
    auth: true,
    body: { user_id, mentor_id, notification_type, message }
  });
}

// ----- Bookings API (server-first; UI falls back to local mock on error) -----

/**
 * Get current user's bookings/upcoming appointments.
 * Expected server response shape: { data: Appointment[] }
 * Appointment shape (minimum fields used by UI):
 * { id, title, mentorName, location, start, end, status }
 */
export async function getBookings() {
  return request("/appointments/my", { method: "GET" });
}

/**
 * Cancel a booking by id.
 * Expected 2xx if success; non-2xx throws to caller.
 */
export async function cancelBooking(appointmentId) {
  return request(`/appointments/${appointmentId}`, { method: "DELETE" });
}

export async function logout(){
  return request("/users/logout")
}


