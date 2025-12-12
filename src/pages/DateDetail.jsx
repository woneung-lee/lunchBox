import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, DollarSign } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getGroup } from '../utils/groups';
import { parseDateKey, dateUtils } from '../utils/calendar';
import { 
  getDateMeals, 
  createMeal, 
  updateMeal, 
  deleteMeal,
  calculateDateTotal,
  calculateGroupSettlement,
  formatAmount 
} from '../utils/meals';
import MealModal from '../components/MealModal';
import MealCard from '../components/MealCard';
import './DateDetail.css';

export default function DateDetail() {
  const { groupId, dateKey } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      loadData();
    }
  }, [groupId, dateKey, navigate]);

  const loadData = async () => {
    setLoading(true);
    
    // 그룹 정보 로드
    const groupResult = await getGroup(groupId);
    if (!groupResult.success) {
      alert('그룹을 찾을 수 없습니다.');
      navigate('/groups');
      return;
    }
    setGroup(groupResult.group);

    // 식사 기록 로드
    const mealsResult = await getDateMeals(groupId, dateKey);
    if (mealsResult.success) {
      setMeals(mealsResult.meals);
    }

    setLoading(false);
  };

  const handleCreateMeal = async (mealData) => {
    const result = await createMeal(groupId, dateKey, user.uid, mealData);
    
    if (result.success) {
      setIsModalOpen(false);
      await loadData();
      alert('식사 기록이 추가되었습니다! 🎉');
    } else {
      alert(result.error);
    }
  };

  const handleUpdateMeal = async (mealData) => {
    const result = await updateMeal(editingMeal.id, mealData);
    
    if (result.success) {
      setIsModalOpen(false);
      setEditingMeal(null);
      await loadData();
      alert('식사 기록이 수정되었습니다! ✅');
    } else {
      alert(result.error);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    const result = await deleteMeal(mealId);
    
    if (result.success) {
      await loadData();
      alert('식사 기록이 삭제되었습니다.');
    } else {
      alert(result.error);
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMeal(null);
  };

  if (loading || !group || !user) {
    return (
      <div className="date-detail-container">
        <div className="loading-state">
          <div className="loading-spinner">🍱</div>
          <p>정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const selectedDate = parseDateKey(dateKey);
  const isCreator = group.creatorId === user.uid;
  const canAddMeal = group.type === 'manager' ? isCreator : true;
  const dateTotal = calculateDateTotal(meals);
  const settlement = calculateGroupSettlement(meals, group.members);

  return (
    <div className="date-detail-container">
      {/* 헤더 */}
      <div className="date-detail-header">
        <button className="btn-back" onClick={() => navigate(`/group/${groupId}`)}>
          <ArrowLeft size={24} />
        </button>
        <div className="date-info">
          <div className="date-icon">
            <Calendar size={20} />
          </div>
          <div>
            <h1>{dateUtils.format(selectedDate, 'M월 d일 (EEE)')}</h1>
            <p className="group-name">{group.name}</p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="date-detail-content">
        {/* 요약 정보 */}
        {meals.length > 0 && (
          <div className="date-summary">
            <div className="summary-card">
              <DollarSign size={20} />
              <div>
                <span className="summary-label">오늘 총 지출</span>
                <span className="summary-value">{formatAmount(dateTotal)}원</span>
              </div>
            </div>
            <div className="summary-card">
              <span className="summary-icon">🍽️</span>
              <div>
                <span className="summary-label">식사 횟수</span>
                <span className="summary-value">{meals.length}회</span>
              </div>
            </div>
          </div>
        )}

        {/* 식사 기록 목록 */}
        <div className="meals-section">
          {meals.length === 0 ? (
            <div className="empty-meals">
              <div className="empty-icon">🍱</div>
              <h3>아직 식사 기록이 없어요</h3>
              <p>이 날짜의 점심 기록을 추가해보세요!</p>
            </div>
          ) : (
            <div className="meals-list">
              {meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  group={group}
                  onEdit={handleEdit}
                  onDelete={handleDeleteMeal}
                />
              ))}
            </div>
          )}
        </div>

        {/* 정산 내역 */}
        {meals.length > 0 && (
          <div className="settlement-section">
            <h3>💰 정산 내역</h3>
            <div className="settlement-list">
              {Object.entries(settlement).map(([userId, amount]) => (
                <div key={userId} className="settlement-row">
                  <span className="settlement-name">
                    {group.memberNames[userId] || '알 수 없음'}
                  </span>
                  <span className="settlement-amount">
                    {formatAmount(amount)}원
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 식사 추가 버튼 */}
        {canAddMeal && (
          <button
            className="btn-add-meal"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={24} />
            식사 기록 추가
          </button>
        )}
      </div>

      {/* 식사 기록 추가/수정 모달 */}
      <MealModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingMeal ? handleUpdateMeal : handleCreateMeal}
        groupId={groupId}
        group={group}
        meal={editingMeal}
      />
    </div>
  );
}
