import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { getGroupMeals, calculateGroupSettlement } from '../utils/meals';
import { getGroupMembers } from '../utils/members';
import './GroupStatistics.css';

export default function GroupStatistics() {
  const { group } = useOutletContext();
  const [meals, setMeals] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (group?.id) {
      loadData();
    }
  }, [group]);

  const loadData = async () => {
    setLoading(true);

    const mealsResult = await getGroupMeals(group.id);
    if (mealsResult.success) {
      setMeals(mealsResult.meals || []);
    }

    const membersResult = await getGroupMembers(group.id);
    if (membersResult.success) {
      setMembers(membersResult.members || []);
    }

    setLoading(false);
  };

  const getTotalAmount = () => {
    return meals.reduce((total, meal) => {
      return total + meal.items.reduce((sum, item) => sum + item.amount, 0);
    }, 0);
  };

  const getAveragePerMeal = () => {
    if (meals.length === 0) return 0;
    return Math.round(getTotalAmount() / meals.length);
  };

  const getMemberSettlement = () => {
    return calculateGroupSettlement(meals, members);
  };

  const totalAmount = getTotalAmount();
  const averagePerMeal = getAveragePerMeal();
  const settlement = getMemberSettlement();

  if (loading) {
    return (
      <div className="group-statistics">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="group-statistics">
      <h2 className="page-title">통계</h2>

      {/* 전체 통계 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 107, 107, 0.1)' }}>
            <BarChart3 size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="stat-info">
            <div className="stat-label">총 지출</div>
            <div className="stat-value">{totalAmount.toLocaleString()}원</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(107, 203, 119, 0.1)' }}>
            <TrendingUp size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="stat-info">
            <div className="stat-label">평균 식사비</div>
            <div className="stat-value">{averagePerMeal.toLocaleString()}원</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(74, 144, 226, 0.1)' }}>
            <Calendar size={24} style={{ color: '#4A90E2' }} />
          </div>
          <div className="stat-info">
            <div className="stat-label">총 식사 횟수</div>
            <div className="stat-value">{meals.length}끼</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
            <Users size={24} style={{ color: '#FFC107' }} />
          </div>
          <div className="stat-info">
            <div className="stat-label">모임원 수</div>
            <div className="stat-value">{members.length}명</div>
          </div>
        </div>
      </div>

      {/* 모임원별 정산 */}
      <div className="settlement-section">
        <h3 className="section-title">모임원별 정산</h3>
        
        {settlement.length === 0 ? (
          <div className="empty-state">
            <p>정산 내역이 없습니다</p>
          </div>
        ) : (
          <div className="settlement-list">
            {settlement
              .sort((a, b) => b.amount - a.amount)
              .map(item => (
                <div key={item.memberId} className="settlement-item">
                  <div className="member-name">{item.memberName}</div>
                  <div className="member-amount">{item.amount.toLocaleString()}원</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
