import { useState } from 'react';
import { X, Plus, Trash2, Store } from 'lucide-react';
import { createMeal } from '../utils/meals';
import { getCurrentUser } from '../utils/auth';
import './MealModal.css';

export default function MealModal({ 
  isOpen, 
  onClose, 
  onSave, 
  groupId, 
  dateKey, 
  restaurants, 
  members 
}) {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  // 현재 추가 중인 음식 항목
  const [itemType, setItemType] = useState('individual');
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setSelectedRestaurant(null);
    setItems([]);
    setMemo('');
    setItemType('individual');
    setItemName('');
    setItemAmount('');
    setSelectedMemberId('');
    setSelectedParticipants([]);
  };

  const handleAddItem = () => {
    if (!itemName.trim()) {
      alert('음식 이름을 입력해주세요.');
      return;
    }

    if (!itemAmount || Number(itemAmount) <= 0) {
      alert('금액을 입력해주세요.');
      return;
    }

    if (itemType === 'individual') {
      if (!selectedMemberId) {
        alert('먹은 사람을 선택해주세요.');
        return;
      }

      const newItem = {
        id: `item_${Date.now()}`,
        type: 'individual',
        name: itemName.trim(),
        amount: Number(itemAmount),
        memberId: selectedMemberId
      };

      setItems([...items, newItem]);
    } else {
      if (selectedParticipants.length === 0) {
        alert('참여자를 선택해주세요.');
        return;
      }

      const splitAmount = Math.round(Number(itemAmount) / selectedParticipants.length);

      const newItem = {
        id: `item_${Date.now()}`,
        type: 'shared',
        name: itemName.trim(),
        amount: Number(itemAmount),
        participants: [...selectedParticipants],
        splitAmount
      };

      setItems([...items, newItem]);
    }

    // 폼 리셋
    setItemName('');
    setItemAmount('');
    setSelectedMemberId('');
    setSelectedParticipants([]);
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const toggleParticipant = (memberId) => {
    if (selectedParticipants.includes(memberId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== memberId));
    } else {
      setSelectedParticipants([...selectedParticipants, memberId]);
    }
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : '알 수 없음';
  };

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

    const user = getCurrentUser();

    const mealData = {
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name,
      restaurantCategory: selectedRestaurant.category,
      items: items,
      memo: memo.trim()
    };

    const result = await createMeal(groupId, user.uid, dateKey, mealData);

    if (result.success) {
      resetForm();
      await onSave();
      onClose();
    } else {
      alert(result.error || '저장에 실패했습니다.');
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content meal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>식사 기록 추가</h2>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* 음식점 선택 */}
          <div className="form-group">
            <label>
              음식점 <span className="required">*</span>
            </label>
            {selectedRestaurant ? (
              <div className="selected-restaurant">
                <Store size={20} />
                <span>{selectedRestaurant.name}</span>
                <button
                  type="button"
                  className="btn-change"
                  onClick={() => setSelectedRestaurant(null)}
                >
                  변경
                </button>
              </div>
            ) : (
              <select
                value=""
                onChange={(e) => {
                  const restaurant = restaurants.find(r => r.id === e.target.value);
                  setSelectedRestaurant(restaurant);
                }}
              >
                <option value="">음식점 선택</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} ({restaurant.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 음식 타입 선택 */}
          <div className="form-group">
            <label>음식 타입</label>
            <div className="item-type-selector">
              <button
                type="button"
                className={`type-btn ${itemType === 'individual' ? 'active' : ''}`}
                onClick={() => setItemType('individual')}
              >
                개별 음식
              </button>
              <button
                type="button"
                className={`type-btn ${itemType === 'shared' ? 'active' : ''}`}
                onClick={() => setItemType('shared')}
              >
                공용 음식 (N빵)
              </button>
            </div>
          </div>

          {/* 음식 추가 폼 */}
          <div className="add-item-form">
            <div className="form-row">
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="음식 이름"
                maxLength={50}
              />
              <input
                type="number"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                placeholder="금액"
                min="0"
              />
            </div>

            {itemType === 'individual' ? (
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                <option value="">먹은 사람 선택</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="participants-selector">
                <label>참여자 선택 (클릭)</label>
                <div className="participants-grid">
                  {members.map(member => (
                    <button
                      key={member.id}
                      type="button"
                      className={`participant-btn ${
                        selectedParticipants.includes(member.id) ? 'selected' : ''
                      }`}
                      onClick={() => toggleParticipant(member.id)}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
                {selectedParticipants.length > 0 && (
                  <div className="split-preview">
                    1인당: {Math.round(Number(itemAmount) / selectedParticipants.length).toLocaleString()}원
                  </div>
                )}
              </div>
            )}

            <button type="button" className="btn-add-item" onClick={handleAddItem}>
              <Plus size={20} />
              음식 추가
            </button>
          </div>

          {/* 추가된 음식 목록 */}
          {items.length > 0 && (
            <div className="items-list">
              <h3>추가된 음식</h3>
              {items.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-info">
                    <div className="item-name-amount">
                      <span className="name">{item.name}</span>
                      <span className="amount">{item.amount.toLocaleString()}원</span>
                    </div>
                    {item.type === 'individual' ? (
                      <div className="item-detail">
                        👤 {getMemberName(item.memberId)}
                      </div>
                    ) : (
                      <div className="item-detail">
                        👥 {item.participants.map(id => getMemberName(id)).join(', ')}
                        <span className="split-info">
                          (1인당 {item.splitAmount.toLocaleString()}원)
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <div className="total-amount">
                <span>총액</span>
                <span>{getTotalAmount().toLocaleString()}원</span>
              </div>
            </div>
          )}

          {/* 메모 */}
          <div className="form-group">
            <label>메모 (선택)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 회식"
              rows="2"
              maxLength="100"
            />
            <span className="char-count">{memo.length}/100</span>
          </div>

          <button
            type="submit"
            className="btn-save"
            disabled={loading || !selectedRestaurant || items.length === 0}
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
