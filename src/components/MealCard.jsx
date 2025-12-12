import { Edit2, Trash2, Users } from 'lucide-react';
import { formatAmount } from '../utils/meals';
import './MealCard.css';

export default function MealCard({ meal, members, onEdit, onDelete }) {
  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : '알 수 없음';
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(meal);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      if (confirm('이 식사 기록을 삭제하시겠습니까?')) {
        onDelete(meal.id);
      }
    }
  };

  return (
    <div className="meal-card">
      <div className="meal-header">
        <div className="restaurant-info">
          <h3 className="restaurant-name">{meal.restaurantName}</h3>
          <span className="restaurant-category">{meal.restaurantCategory}</span>
        </div>
        <div className="meal-actions">
          {onEdit && (
            <button className="btn-icon" onClick={handleEdit}>
              <Edit2 size={18} />
            </button>
          )}
          {onDelete && (
            <button className="btn-icon btn-delete" onClick={handleDelete}>
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="meal-items">
        {meal.items && Array.isArray(meal.items) && meal.items.map(item => (
          <div key={item.id} className="meal-item">
            {item.type === 'individual' ? (
              <>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-member">
                    👤 {getMemberName(item.memberId)}
                  </span>
                </div>
                <div className="item-amount">
                  {formatAmount(item.amount)}원
                </div>
              </>
            ) : (
              <>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-participants">
                    👥 {item.participants?.map(id => getMemberName(id)).join(', ')}
                  </span>
                </div>
                <div className="item-amount-shared">
                  <div className="total-price">
                    총 {formatAmount(item.amount)}원
                  </div>
                  <div className="split-price">
                    1인당 {formatAmount(item.splitAmount)}원
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {meal.memo && (
        <div className="meal-memo">
          📝 {meal.memo}
        </div>
      )}
    </div>
  );
}
