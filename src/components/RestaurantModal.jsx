import { useState, useEffect } from 'react';
import { X, Store } from 'lucide-react';
import { RESTAURANT_CATEGORIES } from '../utils/restaurants';
import './RestaurantModal.css';

export default function RestaurantModal({ 
  isOpen, 
  onClose, 
  onSave, 
  restaurant = null 
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    phone: '',
    memo: '',
    isFavorite: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        category: restaurant.category,
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        memo: restaurant.memo || '',
        isFavorite: restaurant.isFavorite || false
      });
    } else {
      setFormData({
        name: '',
        category: '',
        address: '',
        phone: '',
        memo: '',
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

    if (!formData.category) {
      alert('카테고리를 선택해주세요.');
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
        category: '',
        address: '',
        phone: '',
        memo: '',
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
            <Store size={24} color="var(--accent)" />
            <h2>{restaurant ? '음식점 수정' : '음식점 등록'}</h2>
          </div>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* 이름 */}
          <div className="form-group">
            <label htmlFor="restaurantName">
              이름 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="restaurantName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 김밥천국"
              maxLength={50}
              autoFocus
            />
          </div>

          {/* 카테고리 */}
          <div className="form-group">
            <label htmlFor="restaurantCategory">
              카테고리 <span className="required">*</span>
            </label>
            <div className="category-grid">
              {RESTAURANT_CATEGORIES.map(category => (
                <button
                  key={category}
                  type="button"
                  className={`category-btn ${formData.category === category ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, category })}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 주소 */}
          <div className="form-group">
            <label htmlFor="restaurantAddress">주소 (선택)</label>
            <input
              type="text"
              id="restaurantAddress"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="예: 서울시 강남구..."
              maxLength={100}
            />
          </div>

          {/* 전화번호 */}
          <div className="form-group">
            <label htmlFor="restaurantPhone">전화번호 (선택)</label>
            <input
              type="tel"
              id="restaurantPhone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="예: 02-1234-5678"
              maxLength={20}
            />
          </div>

          {/* 메모 */}
          <div className="form-group">
            <label htmlFor="restaurantMemo">메모 (선택)</label>
            <textarea
              id="restaurantMemo"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="예: 김밥이 맛있음"
              rows="3"
              maxLength="200"
            />
            <span className="char-count">{formData.memo.length}/200</span>
          </div>

          {/* 즐겨찾기 */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
              />
              <span>⭐ 즐겨찾기</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn-save"
            disabled={loading || !formData.name.trim() || !formData.category}
          >
            {loading ? '저장 중...' : restaurant ? '수정하기' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
