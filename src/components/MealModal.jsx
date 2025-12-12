import { useState, useEffect } from 'react';
import { X, Store, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { getGroupRestaurants, createRestaurant } from '../utils/restaurants';
import { getCurrentUser } from '../utils/auth';
import { calculateSettlement, calculateTotalAmount, formatAmount, getParticipantIcon } from '../utils/meals';
import RestaurantList from './RestaurantList';
import RestaurantModal from './RestaurantModal';
import ParticipantSelector from './ParticipantSelector';
import MenuItemManager from './MenuItemManager';
import './MealModal.css';

export default function MealModal({ 
  isOpen, 
  onClose, 
  onSave, 
  groupId,
  group,
  meal = null 
}) {
  const [step, setStep] = useState(1); // 1: 음식점, 2: 참여자, 3: 메뉴
  const [restaurants, setRestaurants] = useState([]);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    restaurantId: '',
    restaurantName: '',
    restaurantCategory: '',
    participants: [],
    items: [],
    memo: ''
  });

  useEffect(() => {
    if (isOpen && groupId) {
      loadRestaurants();
      
      if (meal) {
        // 수정 모드
        setFormData({
          restaurantId: meal.restaurantId,
          restaurantName: meal.restaurantName,
          restaurantCategory: meal.restaurantCategory,
          participants: meal.participants,
          items: meal.items,
          memo: meal.memo || ''
        });
        setStep(3); // 바로 메뉴 입력 단계로
      } else {
        // 추가 모드 초기화
        resetForm();
      }
    }
  }, [isOpen, groupId, meal]);

  const resetForm = () => {
    setFormData({
      restaurantId: '',
      restaurantName: '',
      restaurantCategory: '',
      participants: [],
      items: [],
      memo: ''
    });
    setStep(1);
  };

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
      handleRestaurantSelect(result.restaurant);
    } else {
      alert(result.error);
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.restaurantId) {
      alert('음식점을 선택해주세요.');
      return;
    }
    
    if (step === 2 && formData.participants.length === 0) {
      alert('참여자를 선택해주세요.');
      return;
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    if (meal && step === 3) {
      // 수정 모드에서 메뉴 단계는 뒤로가기 불가
      return;
    }
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (formData.items.length === 0) {
      alert('메뉴를 추가해주세요.');
      return;
    }

    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  const settlement = formData.items.length > 0 && formData.participants.length > 0
    ? calculateSettlement(formData.items, formData.participants)
    : {};
  
  const totalAmount = calculateTotalAmount(formData.items);

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content meal-modal-v2" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="header-with-icon">
            <Store size={24} color="var(--primary)" />
            <h2>{meal ? '식사 기록 수정' : '식사 기록 추가'}</h2>
          </div>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        {/* 단계 표시 */}
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">음식점</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">참여자</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">메뉴</div>
          </div>
        </div>

        {/* Step 1: 음식점 선택 */}
        {step === 1 && (
          <div className="modal-body">
            <button 
              type="button"
              className="btn-add-restaurant"
              onClick={() => setIsRestaurantModalOpen(true)}
            >
              새 음식점 등록
            </button>

            {restaurants.length === 0 ? (
              <div className="empty-state">
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

        {/* Step 2: 참여자 선택 */}
        {step === 2 && (
          <div className="modal-body">
            <div className="selected-restaurant-badge">
              <span className="badge-icon">{formData.restaurantCategory}</span>
              <span className="badge-name">{formData.restaurantName}</span>
            </div>

            <ParticipantSelector
              group={group}
              selectedParticipants={formData.participants}
              onParticipantsChange={(participants) => setFormData({ ...formData, participants })}
            />

            <div className="button-group">
              <button className="btn-back" onClick={handleBack}>
                <ArrowLeft size={18} />
                이전
              </button>
              <button className="btn-next" onClick={handleNext}>
                다음
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 메뉴 입력 */}
        {step === 3 && (
          <div className="modal-body">
            <div className="selected-info">
              <div className="info-row">
                <span className="info-label">음식점</span>
                <span className="info-value">{formData.restaurantName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">참여자</span>
                <span className="info-value">{formData.participants.length}명</span>
              </div>
            </div>

            <MenuItemManager
              items={formData.items}
              participants={formData.participants}
              onItemsChange={(items) => setFormData({ ...formData, items })}
            />

            {/* 정산 미리보기 */}
            {formData.items.length > 0 && (
              <div className="settlement-preview">
                <h4>💰 정산 미리보기</h4>
                <div className="settlement-total">
                  <span>총 금액</span>
                  <span className="total-amount">{formatAmount(totalAmount)}원</span>
                </div>
                <div className="settlement-list">
                  {formData.participants.map(participant => (
                    <div key={participant.id} className="settlement-row">
                      <span className="participant-info">
                        <span className="participant-icon">
                          {getParticipantIcon(participant.type)}
                        </span>
                        {participant.name}
                      </span>
                      <span className="participant-amount">
                        {formatAmount(settlement[participant.id] || 0)}원
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 메모 */}
            <div className="form-group">
              <label htmlFor="memo">메모 (선택)</label>
              <textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                placeholder="특이사항을 입력하세요"
                rows="2"
                maxLength="200"
              />
              <span className="char-count">{formData.memo.length}/200</span>
            </div>

            <div className="button-group">
              {!meal && (
                <button className="btn-back" onClick={handleBack}>
                  <ArrowLeft size={18} />
                  이전
                </button>
              )}
              <button 
                className="btn-submit"
                onClick={handleSubmit}
                disabled={loading || formData.items.length === 0}
              >
                {loading ? '저장 중...' : (
                  <>
                    <Check size={18} />
                    {meal ? '수정하기' : '저장하기'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 음식점 등록 모달 */}
        <RestaurantModal
          isOpen={isRestaurantModalOpen}
          onClose={() => setIsRestaurantModalOpen(false)}
          onSave={handleCreateRestaurant}
          restaurant={null}
        />
      </div>
    </div>
  );
}
