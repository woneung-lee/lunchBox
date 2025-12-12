import { Star, Edit2, Trash2 } from 'lucide-react';
import './RestaurantList.css';

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

export default function RestaurantList({ 
  restaurants, 
  onEdit, 
  onDelete, 
  onToggleFavorite,
  onSelect = null  // 선택 모드용 (날짜 상세 페이지에서 사용)
}) {
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="empty-restaurants">
        <div className="empty-icon">🍽️</div>
        <p>등록된 음식점이 없습니다</p>
        <small>음식점을 등록해보세요!</small>
      </div>
    );
  }

  return (
    <div className="restaurant-list">
      {restaurants.map((restaurant) => (
        <div 
          key={restaurant.id} 
          className={`restaurant-card ${onSelect ? 'selectable' : ''}`}
          onClick={() => onSelect && onSelect(restaurant)}
        >
          <div className="restaurant-icon">
            {CATEGORY_ICONS[restaurant.category]}
          </div>
          
          <div className="restaurant-info">
            <div className="restaurant-name">
              {restaurant.name}
              {restaurant.isFavorite && (
                <Star size={16} fill="var(--secondary)" color="var(--secondary)" />
              )}
            </div>
            <div className="restaurant-category">{restaurant.category}</div>
          </div>

          {!onSelect && (
            <div className="restaurant-actions">
              <button
                className={`btn-favorite ${restaurant.isFavorite ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(restaurant);
                }}
                title={restaurant.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
              >
                <Star size={18} fill={restaurant.isFavorite ? 'var(--secondary)' : 'none'} />
              </button>
              
              <button
                className="btn-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(restaurant);
                }}
                title="수정"
              >
                <Edit2 size={18} />
              </button>
              
              <button
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`"${restaurant.name}"을(를) 삭제하시겠습니까?`)) {
                    onDelete(restaurant.id);
                  }
                }}
                title="삭제"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
