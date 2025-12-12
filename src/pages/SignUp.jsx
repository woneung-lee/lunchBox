import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp, validateUsername, validatePassword, checkUsernameAvailability } from '../utils/auth';
import { UtensilsCrossed, User, Lock, CheckCircle, XCircle } from 'lucide-react';
import './SignUp.css';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirm: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // 아이디 실시간 검사
  const handleUsernameChange = async (e) => {
    const username = e.target.value;
    setFormData(prev => ({ ...prev, username }));
    setUsernameAvailable(null);

    if (!username) {
      setErrors(prev => ({ ...prev, username: '' }));
      return;
    }

    if (!validateUsername(username)) {
      setErrors(prev => ({ 
        ...prev, 
        username: '5~20자의 영문 소문자, 숫자, -, _ 만 사용 가능합니다.' 
      }));
      return;
    }

    // 중복 확인
    setUsernameChecking(true);
    try {
      const isAvailable = await checkUsernameAvailability(username);
      setUsernameAvailable(isAvailable);
      if (!isAvailable) {
        setErrors(prev => ({ 
          ...prev, 
          username: '사용할 수 없는 아이디입니다. 다른 아이디를 입력해 주세요.' 
        }));
      } else {
        setErrors(prev => ({ ...prev, username: '' }));
      }
    } catch (error) {
      console.error('아이디 확인 오류:', error);
    } finally {
      setUsernameChecking(false);
    }
  };

  // 비밀번호 실시간 검사
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));

    if (!password) {
      setErrors(prev => ({ ...prev, password: '' }));
      return;
    }

    if (!validatePassword(password)) {
      setErrors(prev => ({ 
        ...prev, 
        password: '8~16자 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.' 
      }));
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
    }

    // 비밀번호 확인도 체크
    if (formData.passwordConfirm && password !== formData.passwordConfirm) {
      setErrors(prev => ({ ...prev, passwordConfirm: '비밀번호가 일치하지 않습니다.' }));
    } else if (formData.passwordConfirm) {
      setErrors(prev => ({ ...prev, passwordConfirm: '' }));
    }
  };

  // 비밀번호 확인 실시간 검사
  const handlePasswordConfirmChange = (e) => {
    const passwordConfirm = e.target.value;
    setFormData(prev => ({ ...prev, passwordConfirm }));

    if (!passwordConfirm) {
      setErrors(prev => ({ ...prev, passwordConfirm: '' }));
      return;
    }

    if (passwordConfirm !== formData.password) {
      setErrors(prev => ({ ...prev, passwordConfirm: '비밀번호가 일치하지 않습니다.' }));
    } else {
      setErrors(prev => ({ ...prev, passwordConfirm: '' }));
    }
  };

  // 회원가입 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 최종 유효성 검사
    if (!validateUsername(formData.username)) {
      setErrors(prev => ({ 
        ...prev, 
        username: '5~20자의 영문 소문자, 숫자, -, _ 만 사용 가능합니다.' 
      }));
      return;
    }

    if (!validatePassword(formData.password)) {
      setErrors(prev => ({ 
        ...prev, 
        password: '8~16자 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.' 
      }));
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setErrors(prev => ({ ...prev, passwordConfirm: '비밀번호가 일치하지 않습니다.' }));
      return;
    }

    if (usernameAvailable === false) {
      return;
    }

    setLoading(true);
    const result = await signUp(formData.username, formData.password);
    setLoading(false);

    if (result.success) {
      alert('회원가입이 완료되었습니다! 🎉');
      navigate('/groups');
    } else {
      alert(result.error);
    }
  };

  const isFormValid = 
    formData.username && 
    formData.password && 
    formData.passwordConfirm &&
    !errors.username && 
    !errors.password && 
    !errors.passwordConfirm &&
    usernameAvailable === true;

  return (
    <div className="signup-container">
      <div className="signup-card fade-in">
        <div className="signup-header">
          <div className="logo">
            <UtensilsCrossed size={40} color="var(--primary)" />
          </div>
          <h1>🍱 점심 정산</h1>
          <p>함께 먹고, 공정하게 나눠요</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* 아이디 입력 */}
          <div className="form-group">
            <label htmlFor="username">
              <User size={18} />
              아이디
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleUsernameChange}
                placeholder="영문 소문자, 숫자, -, _ (5~20자)"
                className={errors.username ? 'error' : usernameAvailable ? 'success' : ''}
              />
              {usernameChecking && <span className="checking">확인중...</span>}
              {!usernameChecking && usernameAvailable === true && (
                <CheckCircle className="status-icon success" size={20} />
              )}
              {!usernameChecking && usernameAvailable === false && (
                <XCircle className="status-icon error" size={20} />
              )}
            </div>
            {errors.username && <span className="error-message">{errors.username}</span>}
            {!errors.username && usernameAvailable && (
              <span className="success-message">사용 가능한 아이디입니다 ✓</span>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handlePasswordChange}
              placeholder="영문, 숫자, 특수문자 포함 (8~16자)"
              className={errors.password ? 'error' : formData.password && !errors.password ? 'success' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
            <div className="password-hint">
              사용 가능한 특수문자: ! " # $ % & ' ( ) * + , - . / : ; ? @ [ \ ] ^ _ ` {`{`} | {`}`} ~
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label htmlFor="passwordConfirm">
              <Lock size={18} />
              비밀번호 확인
            </label>
            <input
              type="password"
              id="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handlePasswordConfirmChange}
              placeholder="비밀번호를 다시 입력하세요"
              className={errors.passwordConfirm ? 'error' : formData.passwordConfirm && !errors.passwordConfirm ? 'success' : ''}
            />
            {errors.passwordConfirm && <span className="error-message">{errors.passwordConfirm}</span>}
          </div>

          {/* 가입 버튼 */}
          <button 
            type="submit" 
            className="btn-primary"
            disabled={!isFormValid || loading}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
          <p className="coming-soon">
            🔜 카카오톡 로그인 서비스 준비 중
          </p>
        </div>
      </div>
    </div>
  );
}
