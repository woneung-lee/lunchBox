import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { getDateMeals } from '../utils/meals';
import { getGroupRestaurants } from '../utils/restaurants';
import { getGroupMembers } from '../utils/members';
import MealModal from '../components/MealModal';
import './GroupMain.css';

export default function GroupMain() {
  const { group } = useOutletContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  useEffect(() => {
    if (group?.id) {
      loadData();
    }
  }, [group, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 식사 기록 조회
      const dateKey = formatDateKey(selectedDate);
      const mealsResult = await getDateMeals(group.id, dateKey);
      
      if (mealsResult.success) {
        setMeals(mealsResult.meals || []); // 안전하게 처리
      } else {
        console.error('식사 기록 조회 실패:', mealsResult.error);
        setMeals([]);
      }

      // 음식점 목록 조회
      const restaurantsResult = await getGroupRestaurants(group.id);
      if (restaurantsResult.success) {
        setRestaurants(restaurantsResult.restaurants || []); // 안전하게 처리
      } else {
        console.error('음식점 조회 실패:', restaurantsResult.error);
        setRestaurants([]);
      }

      // 모임원 목록 조회
      const membersResult = await getGroupMembers(group.id);
      if (membersResult.success) {
        setMembers(membersResult.members || []); // 안전하게 처리
      } else {
        console.error('모임원 조회 실패:', membersResult.error);
        setMembers([]);
      }
    } catch (err) {
      console.error('데이터 로딩 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    }

    setLoading(false);
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleAddMeal = () => {
    if (members.length === 0) {
      alert('먼저 모임원을 추가해주세요!');
      return;
    }
    if (restaurants.length === 0) {
      alert('먼저 음식점을 등록해주세요!');
      return;
    }
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = async (mealData) => {
    // MealModal에서 처리
    setIsMealModalOpen(false);
    await loadData();
  };

  const calculateTotalAmount = () => {
    if (!meals || meals.length === 0) return 0;
    
    return meals.reduce((total, meal) => {
      if (!meal.items || !Array.isArray(meal.items)) return total;
      
      return total + meal.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    }, 0);
  };

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : '알 수 없음';
  };

  if (loading) {
    return (
      <div className="group-main">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-main">
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={loadData} className="btn-retry">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-main">
      {/* 날짜 선택 */}
      <div className="date-selector">
        <button className="btn-nav" onClick={handlePrevDay}>
          ←
        </button>
        <div className="date-display">
          <Calendar size={20} />
          <span>{formatDisplayDate(selectedDate)}</span>
        </div>
        <button className="btn-nav" onClick={handleNextDay}>
          →
        </button>
      </div>

      <button className="btn-today" onClick={handleToday}>
        오늘
      </button>

      {/* 총액 */}
      <div className="total-amount">
        <span className="label">오늘 총액</span>
        <span className="amount">
          {calculateTotalAmount().toLocaleString()}원
        </span>
      </div>

      {/* 식사 기록 목록 */}
      <div className="meals-list">
        {!meals || meals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <p>이 날의 식사 기록이 없습니다</p>
            <small>식사 기록을 추가해보세요!</small>
          </div>
        ) : (
          meals.map(meal => (
            <div key={meal.id} className="meal-card">
              <div className="meal-header">
                <h3 className="restaurant-name">{meal.restaurantName}</h3>
                <span className="restaurant-category">{meal.restaurantCategory}</span>
              </div>

              <div className="meal-items">
                {meal.items && Array.isArray(meal.items) && meal.items.map(item => (
                  <div key={item.id} className="meal-item">
                    {item.type === 'individual' ? (
                      <>
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-member">
                            👤 {getMemberName(item.memberId)}
                          </span>
                        </div>
                        <div className="item-amount">
                          {item.amount.toLocaleString()}원
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-participants">
                            👥 {item.participants?.map(id => getMemberName(id)).join(', ')}
                          </span>
                        </div>
                        <div className="item-amount-shared">
                          <div className="total-price">
                            총 {item.amount.toLocaleString()}원
                          </div>
                          <div className="split-price">
                            1인당 {item.splitAmount?.toLocaleString()}원
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {meal.memo && (
                <div className="meal-memo">
                  📝 {meal.memo}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 추가 버튼 */}
      <button className="btn-add-meal" onClick={handleAddMeal}>
        <Plus size={24} />
        식사 기록 추가
      </button>

      {/* 식사 기록 모달 */}
      <MealModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        onSave={handleSaveMeal}
        groupId={group.id}
        dateKey={formatDateKey(selectedDate)}
        restaurants={restaurants}
        members={members}
      />
    </div>
  );
}
