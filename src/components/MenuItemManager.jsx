import { useState } from 'react';
import { UtensilsCrossed, Plus, Edit2, Trash2, Users } from 'lucide-react';
import './MenuItemManager.css';

export default function MenuItemManager({ 
  items,
  participants,
  onItemsChange
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [menuType, setMenuType] = useState('individual'); // 'individual' or 'shared'
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    consumerId: '',  // 개인 메뉴
    consumerIds: []  // 공용 메뉴
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      consumerId: '',
      consumerIds: []
    });
    setMenuType('individual');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = (type) => {
    setMenuType(type);
    setIsAdding(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setMenuType(item.type);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      consumerId: item.consumerId || '',
      consumerIds: item.consumerIds || []
    });
    setIsAdding(true);
  };

  const handleDelete = (itemId) => {
    if (window.confirm('이 메뉴를 삭제하시겠습니까?')) {
      onItemsChange(items.filter(item => item.id !== itemId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('메뉴 이름을 입력해주세요.');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      alert('가격을 입력해주세요.');
      return;
    }

    if (menuType === 'individual') {
      if (!formData.consumerId) {
        alert('먹은 사람을 선택해주세요.');
        return;
      }
    } else {
      if (formData.consumerIds.length === 0) {
        alert('먹은 사람을 선택해주세요.');
        return;
      }
    }

    const newItem = {
      id: editingId || `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: formData.name.trim(),
      price: Number(formData.price),
      type: menuType,
      ...(menuType === 'individual' 
        ? { consumerId: formData.consumerId }
        : { consumerIds: formData.consumerIds }
      )
    };

    if (editingId) {
      // 수정
      onItemsChange(items.map(item => item.id === editingId ? newItem : item));
    } else {
      // 추가
      onItemsChange([...items, newItem]);
    }

    resetForm();
  };

  const handleConsumerToggle = (participantId) => {
    const newConsumers = formData.consumerIds.includes(participantId)
      ? formData.consumerIds.filter(id => id !== participantId)
      : [...formData.consumerIds, participantId];
    
    setFormData({ ...formData, consumerIds: newConsumers });
  };

  const getParticipantName = (id) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : '알 수 없음';
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <div className="menu-item-manager">
      <div className="section-header">
        <UtensilsCrossed size={20} />
        <h3>메뉴 입력</h3>
        <span className="total-amount">총 {getTotalAmount().toLocaleString()}원</span>
      </div>

      {/* 메뉴 추가 버튼 */}
      {!isAdding && (
        <div className="add-buttons">
          <button
            type="button"
            className="btn-add-menu individual"
            onClick={() => handleAdd('individual')}
          >
            <Plus size={18} />
            개인 메뉴
          </button>
          <button
            type="button"
            className="btn-add-menu shared"
            onClick={() => handleAdd('shared')}
          >
            <Plus size={18} />
            공용 메뉴
          </button>
        </div>
      )}

      {/* 메뉴 추가/수정 폼 */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="menu-form">
          <div className="form-header">
            <h4>{editingId ? '메뉴 수정' : menuType === 'individual' ? '개인 메뉴 추가' : '공용 메뉴 추가'}</h4>
            <button type="button" className="btn-cancel" onClick={resetForm}>
              취소
            </button>
          </div>

          <div className="form-row">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="메뉴 이름 (예: 짜장면)"
              maxLength={30}
              autoFocus
            />
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="가격"
              min="0"
              step="100"
            />
          </div>

          {/* 개인 메뉴 - 1명 선택 */}
          {menuType === 'individual' && (
            <div className="consumer-select">
              <label>먹은 사람 선택</label>
              <div className="consumer-grid">
                {participants.map(participant => (
                  <button
                    key={participant.id}
                    type="button"
                    className={`consumer-btn ${formData.consumerId === participant.id ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, consumerId: participant.id })}
                  >
                    {participant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 공용 메뉴 - 여러명 선택 */}
          {menuType === 'shared' && (
            <div className="consumer-select">
              <label>
                먹은 사람 선택 (복수 선택)
                {formData.consumerIds.length > 0 && (
                  <span className="split-preview">
                    1인당 {Math.round(formData.price / formData.consumerIds.length).toLocaleString()}원
                  </span>
                )}
              </label>
              <div className="consumer-grid">
                {participants.map(participant => (
                  <button
                    key={participant.id}
                    type="button"
                    className={`consumer-btn ${formData.consumerIds.includes(participant.id) ? 'active' : ''}`}
                    onClick={() => handleConsumerToggle(participant.id)}
                  >
                    {participant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn-submit">
            {editingId ? '수정하기' : '추가하기'}
          </button>
        </form>
      )}

      {/* 메뉴 목록 */}
      {items.length > 0 && (
        <div className="menu-list">
          <h4>추가된 메뉴 ({items.length}개)</h4>
          {items.map(item => (
            <div key={item.id} className={`menu-item ${item.type}`}>
              <div className="item-info">
                <div className="item-header">
                  <span className="item-name">{item.name}</span>
                  <span className="item-type-badge">
                    {item.type === 'individual' ? '개인' : '공용'}
                  </span>
                </div>
                <div className="item-details">
                  <span className="item-price">{item.price.toLocaleString()}원</span>
                  <div className="item-consumers">
                    <Users size={14} />
                    {item.type === 'individual' 
                      ? getParticipantName(item.consumerId)
                      : item.consumerIds.map(id => getParticipantName(id)).join(', ')
                    }
                    {item.type === 'shared' && (
                      <span className="split-amount">
                        (각 {Math.round(item.price / item.consumerIds.length).toLocaleString()}원)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="item-actions">
                <button
                  type="button"
                  className="btn-edit"
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && !isAdding && (
        <div className="empty-menu">
          <p>메뉴를 추가해주세요</p>
          <small>개인 메뉴와 공용 메뉴를 각각 추가할 수 있어요</small>
        </div>
      )}
    </div>
  );
}
