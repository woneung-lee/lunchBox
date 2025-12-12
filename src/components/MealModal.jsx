import { useState, useEffect } from 'react';
import { X, Store, Users, DollarSign, Plus } from 'lucide-react';
import { getGroupRestaurants, createRestaurant } from '../utils/restaurants';
import { getCurrentUser } from '../utils/auth';
import RestaurantList from './RestaurantList';
import RestaurantModal from './RestaurantModal';
import './MealModal.css';

export default function MealModal({ 
  isOpen, 
  onClose, 
  onSave, 
  groupId,
  group,
  meal = null 
}) {
  const [step, setStep] = useState(1); // 1: 음식점 선택, 2: 상세 입력
  const [restaurants, setRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    restaurantId: '',
    restaurantName: '',
    restaurantCategory: '',
    totalAmount: '',
    participants: [],
    memo: ''
  });
  const [loading, setLoading] = useState(false);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && groupId) {
      loadRestaurants();
      
      if (meal) {
        // 수정 모드
        setFormData({
          restaurantId: meal.restaurantId,
          restaurantName: meal.restaurantName,
          restaurantCategory: meal.restaurantCategory,
          totalAmount: meal.totalAmount.toString(),
          participants: meal.participants,
          memo: meal.memo || ''
        });
        setStep(2); // 바로 상세 입력 단계로
      } else {
        // 추가 모드
        setFormData({
          restaurantId: '',
          restaurantName: '',
          restaurantCategory: '',
          totalAmount: '',
          participants: group?.members || [],
          memo: ''
        });
        setStep(1);
      }
    }
  }, [isOpen, groupId, meal, group]);

  const loadRestaurants = async () => {
    const result = await getGroupRestaurants(groupId);
    if (result.success) {
      setRestaurants(result.restaurants);
    }
  };

  const handleRestaurantSelect = (restaurant) => {
    setFormData({
      ...formData,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantCategory: restaurant.category
    });
    setStep(2);
  };

  const handleCreateRestaurant = async (restaurantData) => {
    const user = getCurrentUser();
    const result = await createRestaurant(groupId, user.uid, restaurantData);
    
    if (result.success) {
      setIsRestaurantModalOpen(false);
      await loadRestaurants();
      // 방금 등록한 음식점 자동 선택
      handleRestaurantSelect(result.restaurant);
    } else {
      alert(result.error);
    }
  };

  const handleParticipantToggle = (userId) => {
    const newParticipants = formData.participants.includes(userId)
      ? formData.participants.filter(id => id !== userId)
      : [...formData.participants, userId];
    
    setFormData({ ...formData, participants: newParticipants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.restaurantId) {
      alert('음식점을 선택해주세요.');
      return;
    }

    if (!formData.totalAmount || formData.totalAmount <= 0) {
      alert('총 금액을 입력해주세요.');
      return;
    }

    if (formData.participants.length === 0) {
      alert('참여자를 선택해주세요.');
      return;
    }

    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setStep(1);
      setFormData({
        restaurantId: '',
        restaurantName: '',
        restaurantCategory: '',
        totalAmount: '',
        participants: [],
        memo: ''
      });
      onClose();
    }
  };

  const handleBack = () => {
    if (meal) {
      // 수정 모드에서는 뒤로가기 불가
      return;
    }
    setStep(1);
    setFormData({
      ...formData,
      restaurantId: '',
      restaurantName: '',
      restaurantCategory: ''
    });
  };

  if (!isOpen) return null;

  const splitAmount = formData.totalAmount && formData.participants.length > 0
    ? Math.round(Number(formData.totalAmount) / formData.participants.length)
    : 0;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content meal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-with-icon">
            <Store size={24} color="var(--primary)" />
            <h2>{meal ? '식사 기록 수정' : '식사 기록 추가'}</h2>
          </div>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        {/* Step 1: 음식점 선택 */}
        {step === 1 && !meal && (
          <div className="modal-body">
            <div className="step-header">
              <h3>🍽️ 음식점을 선택하세요</h3>
              <p>등록된 음식점 목록에서 선택하거나 새로 등록하세요</p>
            </div>

            {/* 음식점 등록 버튼 */}
            <button 
              type="button"
              className="btn-add-restaurant"
              onClick={() => setIsRestaurantModalOpen(true)}
            >
              <Plus size={20} />
              새 음식점 등록
            </button>

            {restaurants.length === 0 ? (
              <div className="empty-restaurants">
                <p>등록된 음식점이 없습니다</p>
                <small>위 버튼을 눌러 음식점을 등록해주세요</small>
              </div>
            ) : (
              <RestaurantList
                restaurants={restaurants}
                onSelect={handleRestaurantSelect}
              />
            )}
          </div>
        )}

        {/* Step 2: 상세 입력 */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="modal-body">
            {/* 선택된 음식점 */}
            <div className="selected-restaurant">
              <div className="restaurant-badge">
                <span className="badge-category">{formData.restaurantCategory}</span>
                <span className="badge-name">{formData.restaurantName}</span>
              </div>
              {!meal && (
                <button type="button" className="btn-change" onClick={handleBack}>
                  변경
                </button>
              )}
            </div>

            {/* 총 금액 */}
            <div className="form-group">
              <label htmlFor="totalAmount">
                <DollarSign size={18} />
                총 금액
              </label>
              <input
                type="number"
                id="totalAmount"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                placeholder="15000"
                min="0"
                step="100"
                autoFocus
              />
            </div>

            {/* 참여자 선택 */}
            <div className="form-group">
              <label>
                <Users size={18} />
                참여자 선택
              </label>
              <div className="participants-grid">
                {group?.memberNames && Object.entries(group.memberNames).map(([userId, nickname]) => (
                  <button
                    key={userId}
                    type="button"
                    className={`participant-btn ${formData.participants.includes(userId) ? 'active' : ''}`}
                    onClick={() => handleParticipantToggle(userId)}
                  >
                    {nickname || '멤버'}
                  </button>
                ))}
              </div>
            </div>

            {/* N빵 계산 결과 */}
            {splitAmount > 0 && (
              <div className="split-result">
                <div className="split-info">
                  <span className="split-label">1인당 금액</span>
                  <span className="split-amount">{splitAmount.toLocaleString()}원</span>
                </div>
                <small>총 {formData.totalAmount.toLocaleString()}원 ÷ {formData.participants.length}명</small>
              </div>
            )}

            {/* 메모 */}
            <div className="form-group">
              <label htmlFor="memo">메모 (선택)</label>
              <textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                placeholder="메뉴나 특이사항을 입력하세요"
                rows="3"
                maxLength="200"
              />
              <span className="char-count">{formData.memo.length}/200</span>
            </div>

            <button 
              type="submit" 
              className="btn-save"
              disabled={loading || !formData.totalAmount || formData.participants.length === 0}
            >
              {loading ? '저장 중...' : meal ? '수정하기' : '추가하기'}
            </button>
          </form>
        )}
      </div>

      {/* 음식점 등록 모달 */}
      <RestaurantModal
        isOpen={isRestaurantModalOpen}
        onClose={() => setIsRestaurantModalOpen(false)}
        onSave={handleCreateRestaurant}
        restaurant={null}
      />
    </div>
  );
}
