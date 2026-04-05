const firebaseConfig = {
  apiKey:            "AIzaSyBwR21PEU_jhb8oLJKXgPIzcvGm8I9_wVs",
  authDomain:        "love0523-33af7.firebaseapp.com",
  projectId:         "love0523-33af7",
  storageBucket:     "love0523-33af7.firebasestorage.app",
  messagingSenderId: "723908766892",
  appId:             "1:723908766892:web:8947621736a7a3a75d4309"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
// Firestore는 SDK가 로드된 페이지에서만 초기화
const db = typeof firebase.firestore === 'function' ? firebase.firestore() : null;
