import { useOutletContext } from 'react-router-dom';
import { Settings } from 'lucide-react';
import './GroupCommon.css';

export default function GroupSettingsPage() {
  const { group } = useOutletContext();

  return (
    <div className="group-settings-page">
      <div className="settings-header">
        <Settings size={24} />
        <h2>그룹 설정</h2>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">⚙️</div>
        <h3>설정 기능 준비 중</h3>
        <p>그룹 관리 기능이 추가됩니다!</p>
        
        <div className="preview-features">
          <h4>예정된 기능</h4>
          <ul>
            <li>✏️ 그룹 이름 변경</li>
            <li>🔄 그룹 타입 변경</li>
            <li>👥 멤버 초대</li>
            <li>🔔 알림 설정</li>
            <li>📤 데이터 내보내기 (Excel)</li>
            <li>🗑️ 그룹 삭제</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
