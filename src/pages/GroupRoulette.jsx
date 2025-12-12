import { useOutletContext } from 'react-router-dom';
import { Dices } from 'lucide-react';
import './GroupCommon.css';

export default function GroupRoulette() {
  const { group } = useOutletContext();

  return (
    <div className="group-roulette">
      <div className="roulette-header">
        <Dices size={24} />
        <h2>음식점 룰렛</h2>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">🎲</div>
        <h3>룰렛 기능 준비 중</h3>
        <p>오늘 뭐 먹을지 고민될 때, 룰렛으로 결정하세요!</p>
        
        <div className="preview-features">
          <h4>예정된 기능</h4>
          <ul>
            <li>🎯 등록된 음식점 랜덤 선택</li>
            <li>⭐ 즐겨찾기만 선택</li>
            <li>🏷️ 카테고리별 필터</li>
            <li>🎨 재미있는 룰렛 애니메이션</li>
            <li>📍 거리순 정렬 (위치 기반)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
