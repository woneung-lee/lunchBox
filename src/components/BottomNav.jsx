import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, Store, Users, BarChart3, Dices, Settings } from 'lucide-react';
import './BottomNav.css';

const NAV_ITEMS = [
  { path: '', icon: Home, label: '메인' },
  { path: '/restaurants', icon: Store, label: '음식점' },
  { path: '/members', icon: Users, label: '모임원' },
  { path: '/stats', icon: BarChart3, label: '통계' },
  { path: '/roulette', icon: Dices, label: '룰렛' },
  { path: '/settings', icon: Settings, label: '설정' }
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId } = useParams();

  const handleNavClick = (path) => {
    navigate(`/group/${groupId}${path}`);
  };

  const isActive = (path) => {
    const currentPath = location.pathname.replace(`/group/${groupId}`, '');
    
    // 메인 페이지 체크
    if (path === '' && (currentPath === '' || currentPath.startsWith('/date/'))) {
      return true;
    }
    
    // 다른 페이지들
    return currentPath.startsWith(path) && path !== '';
  };

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
        <button
          key={path}
          className={`nav-item ${isActive(path) ? 'active' : ''}`}
          onClick={() => handleNavClick(path)}
        >
          <Icon size={24} />
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
