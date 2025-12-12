import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Calendar } from 'lucide-react';
import { getGroup } from '../utils/groups';
import { getDateMeals, calculateDateTotal, deleteMeal } from '../utils/meals';
import { getGroupRestaurants } from '../utils/restaurants';
import { getGroupMembers } from '../utils/members';
import MealModal from '../components/MealModal';
import MealCard from '../components/MealCard';
import './DateDetail.css';

export default function DateDetail() {
  const { groupId, dateKey } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [meals, setMeals] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [groupId, dateKey]);

  const loadData = async () => {
    setLoading(true);

    // 그룹 정보
    const groupResult = await getGroup(groupId);
    if (groupResult.success) {
      setGroup(groupResult.group);
    }

    // 식사 기록
    const mealsResult = await getDateMeals(groupId, dateKey);
    if (mealsResult.success) {
      setMeals(mealsResult.meals || []);
    }

    // 음식점 목록
    const restaurantsResult = await getGroupRestaurants(groupId);
    if (restaurantsResult.success) {
      setRestaurants(restaurantsResult.restaurants || []);
    }

    // 모임원 목록
    const membersResult = await getGroupMembers(groupId);
    if (membersResult.success) {
      setMembers(membersResult.members || []);
    }

    setLoading(false);
  };

  const handleBack = () => {
    navigate(`/group/${groupId}`);
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

  const handleSaveMeal = async () => {
    setIsMealModalOpen(false);
    await loadData();
  };

  const handleDeleteMeal = async (mealId) => {
    const result = await deleteMeal(mealId);
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || '삭제에 실패했습니다.');
    }
  };

  const formatDisplayDate = () => {
    const [year, month, day] = dateKey.split('-');
    const date = new Date(year, month - 1, day);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  const total = calculateDateTotal(meals);

  if (loading) {
    return (
      <div className="date-detail">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="date-detail">
      {/* 헤더 */}
      <div className="date-header">
        <button className="btn-back" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <div className="date-info">
          <Calendar size={20} />
          <h2>{formatDisplayDate()}</h2>
        </div>
        <div className="header-spacer"></div>
      </div>

      {/* 총액 */}
      <div className="total-amount">
        <span className="label">총액</span>
        <span className="amount">{total.toLocaleString()}원</span>
      </div>

      {/* 식사 기록 목록 */}
      <div className="meals-list">
        {meals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <p>이 날의 식사 기록이 없습니다</p>
            <small>식사 기록을 추가해보세요!</small>
          </div>
        ) : (
          meals.map(meal => (
            <MealCard
              key={meal.id}
              meal={meal}
              members={members}
              onDelete={handleDeleteMeal}
            />
          ))
        )}
      </div>

      {/* 추가 버튼 */}
      <button className="btn-add-meal" onClick={handleAddMeal}>
        <Plus size={24} />
      </button>

      {/* 식사 기록 모달 */}
      <MealModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        onSave={handleSaveMeal}
        groupId={groupId}
        dateKey={dateKey}
        restaurants={restaurants}
        members={members}
      />
    </div>
  );
}
