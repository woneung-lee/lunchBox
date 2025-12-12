import { useOutletContext } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import './GroupCommon.css';

export default function GroupStats() {
  const { group } = useOutletContext();

  return (
    <div className="group-stats">
      <div className="stats-header">
        <BarChart3 size={24} />
        <h2>통계</h2>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">📊</div>
        <h3>통계 기능 준비 중</h3>
        <p>곧 멋진 통계 기능이 추가됩니다!</p>
        
        <div className="preview-features">
          <h4>예정된 기능</h4>
          <ul>
            <li>📈 월별/주별 지출 현황</li>
            <li>🍽️ 가장 많이 간 음식점</li>
            <li>💰 멤버별 정산 통계</li>
            <li>📊 카테고리별 지출 분석</li>
            <li>📅 요일별 지출 패턴</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
