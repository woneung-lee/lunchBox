import { Edit2, Trash2, Users } from 'lucide-react';
import { formatAmount } from '../utils/meals';
import './MealCard.css';

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

export default function MealCard({ meal, group, onEdit, onDelete }) {
  const handleDelete = () => {
    if (window.confirm(`"${meal.restaurantName}" 식사 기록을 삭제하시겠습니까?`)) {
      onDelete(meal.id);
    }
  };

  return (
    <div className="meal-card">
      {/* 헤더 */}
      <div className="meal-header">
        <div className="restaurant-info">
          <span className="restaurant-icon">
            {CATEGORY_ICONS[meal.restaurantCategory] || '🍴'}
          </span>
          <div>
            <h3 className="restaurant-name">{meal.restaurantName}</h3>
            <span className="restaurant-category">{meal.restaurantCategory}</span>
          </div>
        </div>
        
        <div className="meal-actions">
          <button
            className="btn-edit"
            onClick={() => onEdit(meal)}
            title="수정"
          >
            <Edit2 size={18} />
          </button>
          <button
            className="btn-delete"
            onClick={handleDelete}
            title="삭제"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* 금액 정보 */}
      <div className="meal-amounts">
        <div className="amount-row">
          <span className="amount-label">총 금액</span>
          <span className="amount-value total">{formatAmount(meal.totalAmount)}원</span>
        </div>
        <div className="amount-row">
          <span className="amount-label">1인당</span>
          <span className="amount-value split">{formatAmount(meal.splitAmount)}원</span>
        </div>
      </div>

      {/* 참여자 */}
      <div className="meal-participants">
        <Users size={16} />
        <div className="participants-list">
          {meal.participants.map((participantId) => {
            const nickname = group?.memberNames?.[participantId] || '알 수 없음';
            return (
              <span key={participantId} className="participant-tag">
                {nickname}
              </span>
            );
          })}
        </div>
      </div>

      {/* 메모 */}
      {meal.memo && (
        <div className="meal-memo">
          <p>{meal.memo}</p>
        </div>
      )}
    </div>
  );
}
