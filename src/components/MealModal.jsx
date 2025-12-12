import { useState, useEffect } from 'react';
import { X, Store, Users, DollarSign, Plus } from 'lucide-react';
import { getGroupRestaurants, createRestaurant } from '../utils/restaurants';
import { getCurrentUser } from '../utils/auth';
import { formatAmount } from '../utils/meals';
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
  const [restaurants, setRestaurants] = useState([]);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  
  const [formData, setFormData] = useState({
    restaurantId: '',
    restaurantName: '',
    restaurantCategory: '',
    totalAmount: '',
    participants: [],
    memo: ''
  });

  useEffect(() => {
    if (isOpen && groupId) {
      loadRestaurants();
      
      if (meal) {
        setFormData({
          restaurantId: meal.restaurantId,
          restaurantName: meal.restaurantName,
          restaurantCategory: meal.restaurantCategory,
          totalAmount: meal.totalAmount.toString(),
          participants: meal.participants,
          memo: meal.memo || ''
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, groupId, meal]);

  const resetForm = () => {
    setFormData({
      restaurantId: '',
      restaurantName: '',
      restaurantCategory: '',
      totalAmount: '',
      participants: [],
      memo: ''
    });
    setGuestName('');
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

  // 참여자 토글 (멤버)
  const handleToggleMember = (userId, userName) => {
    const exists = formData.participants.some(p => p.id === userId);
    
    if (exists) {
      setFormData({
        ...formData,
        participants: formData.participants.filter(p => p.id !== userId)
      });
    } else {
      setFormData({
        ...formData,
        participants: [
          ...formData.participants,
          { id: userId, name: userName, type: 'member' }
        ]
      });
    }
  };

  // 게스트 추가
  const handleAddGuest = (e) => {
    e.preventDefault();
    
    if (!guestName.trim()) {
      alert('게스트 이름을 입력해주세요.');
      return;
    }

    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    setFormData({
      ...formData,
      participants: [
        ...formData.participants,
        { id: guestId, name: guestName.trim(), type: 'guest' }
      ]
    });
    
    setGuestName('');
  };

  // 게스트 삭제
  const handleRemoveGuest = (guestId) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter(p => p.id !== guestId)
    });
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
    await onSave({
      ...formData,
      totalAmount: Number(formData.totalAmount)
    });
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  const splitAmount = formData.totalAmount && formData.participants.length > 0
    ? Math.round(Number(formData.totalAmount) / formData.participants.length)
    : 0;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content meal-modal-simple" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-with-icon">
            <Store size={24} color="var(--primary)" />
            <h2>{meal ? '식사 기록 수정' : '식사 기록 추가'}</h2>
          </div>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* 음식점 선택 */}
          <div className="form-section">
            <h3><Store size={18} /> 음식점</h3>
            
            {!formData.restaurantId ? (
              <>
                <button 
                  type="button"
                  className="btn-add-restaurant"
                  onClick={() => setIsRestaurantModalOpen(true)}
                >
                  <Plus size={18} />
                  새 음식점 등록
                </button>

                {restaurants.length > 0 && (
                  <div className="restaurant-list-simple">
                    {restaurants.map(restaurant => (
                      <button
                        key={restaurant.id}
                        type="button"
                        className="restaurant-item"
                        onClick={() => handleRestaurantSelect(restaurant)}
                      >
                        <span className="restaurant-icon">{restaurant.category}</span>
                        <span className="restaurant-name">{restaurant.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="selected-restaurant">
                <span className="selected-icon">{formData.restaurantCategory}</span>
                <span className="selected-name">{formData.restaurantName}</span>
                <button
                  type="button"
                  className="btn-change"
                  onClick={() => setFormData({ ...formData, restaurantId: '', restaurantName: '', restaurantCategory: '' })}
                >
                  변경
                </button>
              </div>
            )}
          </div>

          {/* 총 금액 */}
          <div className="form-section">
            <h3><DollarSign size={18} /> 총 금액</h3>
            <input
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              placeholder="총 금액을 입력하세요"
              min="0"
              step="100"
              className="amount-input"
            />
          </div>

          {/* 참여자 선택 */}
          <div className="form-section">
            <h3><Users size={18} /> 참여자 ({formData.participants.length}명)</h3>
            
            {/* 그룹 멤버 */}
            <div className="participants-grid">
              {Object.entries(group.memberNames || {}).map(([userId, userName]) => (
                <button
                  key={userId}
                  type="button"
                  className={`participant-btn ${formData.participants.some(p => p.id === userId) ? 'active' : ''}`}
                  onClick={() => handleToggleMember(userId, userName)}
                >
                  👤 {userName}
                </button>
              ))}
            </div>

            {/* 게스트 추가 */}
            <div className="guest-section">
              <form onSubmit={handleAddGuest} className="guest-form">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="게스트 이름 입력"
                  maxLength={20}
                />
                <button type="submit" className="btn-add-guest">
                  <Plus size={18} />
                  게스트 추가
                </button>
              </form>

              {/* 추가된 게스트 목록 */}
              {formData.participants.filter(p => p.type === 'guest').length > 0 && (
                <div className="guest-list">
                  {formData.participants
                    .filter(p => p.type === 'guest')
                    .map(guest => (
                      <div key={guest.id} className="guest-tag">
                        🎫 {guest.name}
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => handleRemoveGuest(guest.id)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* N빵 결과 */}
          {splitAmount > 0 && (
            <div className="split-result">
              <div className="split-info">
                <span className="split-label">1인당 금액</span>
                <span className="split-amount">{formatAmount(splitAmount)}원</span>
              </div>
              <small>{formData.totalAmount.toLocaleString()}원 ÷ {formData.participants.length}명</small>
            </div>
          )}

          {/* 메모 */}
          <div className="form-section">
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

          <button 
            type="submit" 
            className="btn-save"
            disabled={loading || !formData.restaurantId || !formData.totalAmount || formData.participants.length === 0}
          >
            {loading ? '저장 중...' : meal ? '수정하기' : '저장하기'}
          </button>
        </form>

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
