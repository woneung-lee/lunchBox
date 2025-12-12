import { useState, useEffect } from 'react';
import { X, Store } from 'lucide-react';
import { RESTAURANT_CATEGORIES } from '../utils/restaurants';
import './RestaurantModal.css';

const CATEGORY_ICONS = {
  '한식': '🍚',
  '일식': '🍱',
  '중식': '🥟',
  '양식': '🍝',
  '분식': '🍜',
  '간식': '🍰',
  '카페': '☕',
  '기타': '🍴'
};

export default function RestaurantModal({ 
  isOpen, 
  onClose, 
  onSave, 
  restaurant = null 
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: '한식',
    isFavorite: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        category: restaurant.category,
        isFavorite: restaurant.isFavorite || false
      });
    } else {
      setFormData({
        name: '',
        category: '한식',
        isFavorite: false
      });
    }
  }, [restaurant, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('음식점 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        category: '한식',
        isFavorite: false
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content restaurant-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-with-icon">
            <Store size={24} color="var(--primary)" />
            <h2>{restaurant ? '음식점 수정' : '음식점 등록'}</h2>
          </div>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* 음식점 이름 */}
          <div className="form-group">
            <label htmlFor="restaurantName">음식점 이름</label>
            <input
              type="text"
              id="restaurantName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 김밥천국, 스타벅스"
              maxLength={50}
              autoFocus
            />
            <span className="char-count">{formData.name.length}/50</span>
          </div>

          {/* 카테고리 */}
          <div className="form-group">
            <label>카테고리</label>
            <div className="category-grid">
              {Object.values(RESTAURANT_CATEGORIES).map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`category-btn ${formData.category === category ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, category })}
                >
                  <span className="category-icon">{CATEGORY_ICONS[category]}</span>
                  <span className="category-name">{category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 즐겨찾기 */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
              />
              <span className="checkbox-text">
                ⭐ 즐겨찾기에 추가
                <small>자주 가는 음식점으로 등록합니다</small>
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn-save"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? '저장 중...' : restaurant ? '수정하기' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
