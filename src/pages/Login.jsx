import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../utils/auth';
import { UtensilsCrossed, User, Lock } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    const result = await signIn(formData.username, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/groups');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="logo">
            <UtensilsCrossed size={40} color="var(--primary)" />
          </div>
          <h1>🍱 점심 정산</h1>
          <p>오늘 점심은 어디서 먹을까요?</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              <User size={18} />
              아이디
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </p>
          <p className="coming-soon">
            🔜 카카오톡 로그인 서비스 준비 중
          </p>
        </div>
      </div>
    </div>
  );
}
