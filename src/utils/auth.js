import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * 아이디 유효성 검사
 * 5~20자의 영문 소문자, 숫자, -, _ 만 가능
 */
export const validateUsername = (username) => {
  const regex = /^[a-z0-9_-]{5,20}$/;
  return regex.test(username);
};

/**
 * 비밀번호 유효성 검사
 * 8~16자 영문 대/소문자, 숫자, 특수문자
 */
export const validatePassword = (password) => {
  const regex = /^[A-Za-z0-9!"#$%&'()*+,\-./:;?@[\\\]^_`{|}~]{8,16}$/;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!"#$%&'()*+,\-./:;?@[\\\]^_`{|}~]/.test(password);
  
  return regex.test(password) && hasLetter && hasNumber && hasSpecial;
};

/**
 * 아이디 중복 확인
 */
export const checkUsernameAvailability = async (username) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // 비어있으면 사용 가능
  } catch (error) {
    console.error('아이디 확인 오류:', error);
    throw error;
  }
};

/**
 * 회원가입
 */
export const signUp = async (username, password) => {
  try {
    // 1. 아이디 유효성 검사
    if (!validateUsername(username)) {
      throw new Error('아이디는 5~20자의 영문 소문자, 숫자, -, _ 만 사용 가능합니다.');
    }

    // 2. 비밀번호 유효성 검사
    if (!validatePassword(password)) {
      throw new Error('비밀번호는 8~16자 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.');
    }

    // 3. 아이디 중복 확인
    const isAvailable = await checkUsernameAvailability(username);
    if (!isAvailable) {
      throw new Error('사용할 수 없는 아이디입니다. 다른 아이디를 입력해 주세요.');
    }

    // 4. Firebase Auth에 이메일 형식으로 가입 (username@lunch-app.local)
    const email = `${username}@lunch-app.local`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 5. 사용자 프로필 업데이트
    await updateProfile(user, {
      displayName: username
    });

    // 6. Firestore에 사용자 정보 저장
    await setDoc(doc(db, 'users', user.uid), {
      username: username,
      createdAt: new Date().toISOString(),
      groups: []
    });

    return { success: true, user };
  } catch (error) {
    console.error('회원가입 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 로그인
 */
export const signIn = async (username, password) => {
  try {
    const email = `${username}@lunch-app.local`;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('로그인 오류:', error);
    let errorMessage = '로그인에 실패했습니다.';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * 로그아웃
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 현재 사용자 정보 가져오기
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * 사용자 정보 가져오기
 */
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    throw error;
  }
};
