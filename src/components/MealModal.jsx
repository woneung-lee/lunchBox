import { useState, useEffect } from 'react';
import { X, Store, Plus, Trash2, Users, User } from 'lucide-react';
import { getGroupRestaurants, createRestaurant, getCategoryIcon } from '../utils/restaurants';
import { getGroupMembers } from '../utils/members';
import { getCurrentUser } from '../utils/auth';
import { formatAmount, calculateMealTotal } from '../utils/meals';
import RestaurantModal from './RestaurantModal';
import './MealModal.css';

export default function MealModal({ 
  isOpen, 
  onClose, 
  onSave, 
  groupId,
  meal = null 
}) {
  const [restaurants, setRestaurants] = useState([]);
  const [members, setMembers] = useState([]);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 선택된 음식점
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  // 음식 아이템 목록
  const [items, setItems] = useState([]);
  
  // 새 음식 추가 폼
  const [newItem, setNewItem] = useState({
    type: 'shared', // 'individual' or 'shared'
    name: '',
    amount: '',
    memberId: '', // individual용
    participants: [] // shared용
  });
  
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (isOpen && groupId) {
      loadData();
      
      if (meal) {
        // 수정 모드
        setSelectedRestaurant({
          id: meal.restaurantId,
          name: meal.restaurantName,
          category: meal.restaurantCategory
        });
        setItems(meal.items || []);
        setMemo(meal.memo || '');
      } else {
        // 추가 모드
        resetForm();
      }
    }
  }, [isOpen, groupId, meal]);

  const loadData = async () => {
    const [restaurantsResult, membersResult] = await Promise.all([
      getGroupRestaurants(groupId),
      getGroupMembers(groupId)
    ]);
    
    if (restaurantsResult.success) {
      setRestaurants(restaurantsResult.restaurants);
    }
    
    if (membersResult.success) {
      setMembers(membersResult.members);
    }
  };

  const resetForm = () => {
    setSelectedRestaurant(null);
    setItems([]);
    setNewItem({
      type: 'shared',
      name: '',
      amount: '',
      memberId: '',
      participants: []
    });
    setMemo('');
  };

  const handleCreateRestaurant = async (restaurantData) => {
    const user = getCurrentUser();
    const result = await createRestaurant(groupId, user.uid, restaurantData);
    
    if (result.success) {
      setIsRestaurantModalOpen(false);
      await loadData();
      setSelectedRestaurant(result.restaurant);
    } else {
      alert(result.error);
    }
  };

  // 음식 추가
  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      alert('음식 이름을 입력해주세요.');
      return;
    }

    if (!newItem.amount || newItem.amount <= 0) {
      alert('금액을 입력해주세요.');
      return;
    }

    if (newItem.type === 'individual' && !newItem.memberId) {
      alert('먹은 사람을 선택해주세요.');
      return;
    }

    if (newItem.type === 'shared' && newItem.participants.length === 0) {
      alert('참여자를 선택해주세요.');
      return;
    }

    const item = {
      id: `temp_${Date.now()}_${Math.random()}`,
      type: newItem.type,
      name: newItem.name.trim(),
      amount: Number(newItem.amount)
    };

    if (newItem.type === 'individual') {
      item.memberId = newItem.memberId;
    } else {
      item.participants = [...newItem.participants];
      item.splitAmount = Math.round(Number(newItem.amount) / newItem.participants.length);
    }

    setItems([...items, item]);
    
    // 폼 초기화
    setNewItem({
      type: 'shared',
      name: '',
      amount: '',
      memberId: '',
      participants: []
    });
  };

  // 음식 삭제
  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // 참여자 토글
  const toggleParticipant = (memberId) => {
    const participants = [...newItem.participants];
    const index = participants.indexOf(memberId);
    
    if (index > -1) {
      participants.splice(index, 1);
    } else {
      participants.push(memberId);
    }
    
    setNewItem({ ...newItem, participants });
  };

  // 저장
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRestaurant) {
      alert('음식점을 선택해주세요.');
      return;
    }

    if (items.length === 0) {
      alert('음식을 추가해주세요.');
      return;
    }

    setLoading(true);
    
    await onSave({
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name,
      restaurantCategory: selectedRestaurant.category,
      items,
      memo
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

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : '알 수 없음';
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content meal-modal-advanced" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-with-icon">
            <Store size={24} color="var(--primary)" />
            <h2>{meal ? '식사 기록 수정' : '식사 기록 추가'}</h2>
          </div>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body meal-modal-body">
          {/* 1. 음식점 선택 */}
          <div className="form-section">
            <h3><Store size={18} /> 음식점</h3>
            
            {!selectedRestaurant ? (
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
                        onClick={() => setSelectedRestaurant(restaurant)}
                      >
                        <span className="restaurant-icon">
                          {getCategoryIcon(restaurant.category)}
                        </span>
                        <span className="restaurant-name">{restaurant.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="selected-restaurant">
                <span className="selected-icon">
                  {getCategoryIcon(selectedRestaurant.category)}
                </span>
                <span className="selected-name">{selectedRestaurant.name}</span>
                <button
                  type="button"
                  className="btn-change"
                  onClick={() => setSelectedRestaurant(null)}
                >
                  변경
                </button>
              </div>
            )}
          </div>

          {/* 2. 음식 추가 */}
          {selectedRestaurant && (
            <>
              <div className="form-section">
                <h3>🍽️ 음식 추가</h3>
                
                {/* 타입 선택 */}
                <div className="item-type-selector">
                  <button
                    type="button"
                    className={`type-btn ${newItem.type === 'individual' ? 'active' : ''}`}
                    onClick={() => setNewItem({ ...newItem, type: 'individual', participants: [] })}
                  >
                    <User size={16} />
                    개별 음식
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${newItem.type === 'shared' ? 'active' : ''}`}
                    onClick={() => setNewItem({ ...newItem, type: 'shared', memberId: '' })}
                  >
                    <Users size={16} />
                    공용 음식 (N빵)
                  </button>
                </div>

                {/* 음식명 + 금액 */}
                <div className="item-input-row">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="음식 이름"
                    className="item-name-input"
                    maxLength={30}
                  />
                  <input
                    type="number"
                    value={newItem.amount}
                    onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                    placeholder="금액"
                    className="item-amount-input"
                    min="0"
                    step="100"
                  />
                </div>

                {/* 개별 음식: 먹은 사람 1명 */}
                {newItem.type === 'individual' && (
                  <select
                    value={newItem.memberId}
                    onChange={(e) => setNewItem({ ...newItem, memberId: e.target.value })}
                    className="member-select"
                  >
                    <option value="">먹은 사람 선택</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* 공용 음식: 참여자 여러명 */}
                {newItem.type === 'shared' && (
                  <>
                    <div className="participants-grid">
                      {members.map(member => (
                        <button
                          key={member.id}
                          type="button"
                          className={`participant-btn ${newItem.participants.includes(member.id) ? 'active' : ''}`}
                          onClick={() => toggleParticipant(member.id)}
                        >
                          {member.name}
                        </button>
                      ))}
                    </div>
                    
                    {newItem.amount && newItem.participants.length > 0 && (
                      <div className="split-preview">
                        1인당 {formatAmount(Math.round(Number(newItem.amount) / newItem.participants.length))}원
                        <small>({newItem.participants.length}명)</small>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="button"
                  className="btn-add-item"
                  onClick={handleAddItem}
                >
                  <Plus size={18} />
                  음식 추가
                </button>
              </div>

              {/* 3. 추가된 음식 목록 */}
              {items.length > 0 && (
                <div className="form-section">
                  <h3>📝 추가된 음식 ({items.length}개)</h3>
                  
                  <div className="items-list">
                    {items.map(item => (
                      <div key={item.id} className="item-card">
                        <div className="item-header">
                          <span className="item-type-badge">
                            {item.type === 'individual' ? (
                              <><User size={12} /> 개별</>
                            ) : (
                              <><Users size={12} /> 공용</>
                            )}
                          </span>
                          <button
                            type="button"
                            className="btn-remove-item"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="item-body">
                          <div className="item-name">{item.name}</div>
                          <div className="item-amount">{formatAmount(item.amount)}원</div>
                        </div>
                        
                        <div className="item-footer">
                          {item.type === 'individual' ? (
                            <span>🍴 {getMemberName(item.memberId)}</span>
                          ) : (
                            <span>
                              👥 {item.participants.map(id => getMemberName(id)).join(', ')}
                              <small> (1인당 {formatAmount(item.splitAmount)}원)</small>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 총액 */}
                  <div className="total-amount">
                    <span>총 금액</span>
                    <strong>{formatAmount(totalAmount)}원</strong>
                  </div>
                </div>
              )}

              {/* 4. 메모 */}
              <div className="form-section">
                <label htmlFor="memo">메모 (선택)</label>
                <textarea
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="특이사항을 입력하세요"
                  rows="2"
                  maxLength="200"
                />
                <span className="char-count">{memo.length}/200</span>
              </div>

              <button 
                type="submit" 
                className="btn-save"
                disabled={loading || !selectedRestaurant || items.length === 0}
              >
                {loading ? '저장 중...' : meal ? '수정하기' : '저장하기'}
              </button>
            </>
          )}
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
