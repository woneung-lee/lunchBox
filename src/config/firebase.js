import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정 - 본인의 Firebase 프로젝트 설정으로 교체하세요
const firebaseConfig = {
  apiKey: "AIzaSyAXpp13ARkgrGMHBvccZI5WMz5S3FlC9gw",
  authDomain: "lunchbox-d547e.firebaseapp.com",
  projectId: "lunchbox-d547e",
  storageBucket: "lunchbox-d547e.firebasestorage.app",
  messagingSenderId: "726812509012",
  appId: "1:726812509012:web:ec734f89aa3a9f8c15bec1"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
