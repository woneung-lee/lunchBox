import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Shuffle, Play } from 'lucide-react';
import { getGroupRestaurants } from '../utils/restaurants';
import './GroupRoulette.css';

export default function GroupRoulette() {
  const { group } = useOutletContext();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (group?.id) {
      loadRestaurants();
    }
  }, [group]);

  const loadRestaurants = async () => {
    setLoading(true);
    const result = await getGroupRestaurants(group.id);
    
    if (result.success) {
      setRestaurants(result.restaurants || []);
    }
    
    setLoading(false);
  };

  const handleSpin = () => {
    if (restaurants.length === 0) {
      alert('먼저 음식점을 등록해주세요!');
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedRestaurant(null);

    // 룰렛 애니메이션 (3초)
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      setSelectedRestaurant(restaurants[randomIndex]);
      count++;

      if (count >= 20) {
        clearInterval(interval);
        
        // 최종 결과
        setTimeout(() => {
          const finalIndex = Math.floor(Math.random() * restaurants.length);
          setSelectedRestaurant(restaurants[finalIndex]);
          setIsSpinning(false);
        }, 500);
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="group-roulette">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="group-roulette">
      <h2 className="page-title">오늘 뭐 먹지?</h2>

      <div className="roulette-description">
        등록된 음식점 중에서 랜덤으로 선택해드립니다!
      </div>

      {/* 룰렛 결과 */}
      <div className={`roulette-result ${isSpinning ? 'spinning' : ''}`}>
        {selectedRestaurant ? (
          <>
            <div className="result-icon">
              {isSpinning ? '🎰' : '🎉'}
            </div>
            <div className="restaurant-name">{selectedRestaurant.name}</div>
            <div className="restaurant-category">{selectedRestaurant.category}</div>
            {!isSpinning && selectedRestaurant.address && (
              <div className="restaurant-address">{selectedRestaurant.address}</div>
            )}
          </>
        ) : (
          <>
            <div className="result-icon">🍽️</div>
            <div className="result-text">버튼을 눌러주세요!</div>
          </>
        )}
      </div>

      {/* 룰렛 버튼 */}
      <button 
        className={`btn-spin ${isSpinning ? 'spinning' : ''}`}
        onClick={handleSpin}
        disabled={isSpinning || restaurants.length === 0}
      >
        {isSpinning ? (
          <>
            <Shuffle size={24} className="spin-icon" />
            돌리는 중...
          </>
        ) : (
          <>
            <Play size={24} />
            룰렛 돌리기
          </>
        )}
      </button>

      {/* 음식점 목록 */}
      <div className="restaurants-info">
        <h3>등록된 음식점 ({restaurants.length})</h3>
        {restaurants.length === 0 ? (
          <div className="empty-state">
            <p>등록된 음식점이 없습니다</p>
            <small>음식점 탭에서 음식점을 등록해주세요!</small>
          </div>
        ) : (
          <div className="restaurants-grid">
            {restaurants.map(restaurant => (
              <div key={restaurant.id} className="restaurant-chip">
                {restaurant.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
