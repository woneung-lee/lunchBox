import { useState } from 'react';
import { Users, UserPlus, X } from 'lucide-react';
import './ParticipantSelector.css';

export default function ParticipantSelector({ 
  group,
  selectedParticipants,
  onParticipantsChange
}) {
  const [guestName, setGuestName] = useState('');

  // 참여자 토글
  const handleToggle = (participantId) => {
    const exists = selectedParticipants.some(p => p.id === participantId);
    
    if (exists) {
      onParticipantsChange(selectedParticipants.filter(p => p.id !== participantId));
    } else {
      // 멤버인지 모임원인지 확인
      let newParticipant;
      
      if (group.memberNames && group.memberNames[participantId]) {
        // 앱 가입 멤버
        newParticipant = {
          id: participantId,
          type: 'member',
          name: group.memberNames[participantId]
        };
      } else if (group.regularMembers && group.regularMembers[participantId]) {
        // 모임원
        newParticipant = {
          id: participantId,
          type: 'regular',
          name: group.regularMembers[participantId].name
        };
      }
      
      if (newParticipant) {
        onParticipantsChange([...selectedParticipants, newParticipant]);
      }
    }
  };

  // 게스트 추가
  const handleAddGuest = (e) => {
    e.preventDefault();
    
    if (!guestName.trim()) {
      alert('게스트 이름을 입력해주세요.');
      return;
    }

    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const newGuest = {
      id: guestId,
      type: 'guest',
      name: guestName.trim()
    };

    onParticipantsChange([...selectedParticipants, newGuest]);
    setGuestName('');
  };

  // 게스트 삭제
  const handleRemoveGuest = (guestId) => {
    onParticipantsChange(selectedParticipants.filter(p => p.id !== guestId));
  };

  const isSelected = (id) => selectedParticipants.some(p => p.id === id);

  return (
    <div className="participant-selector">
      <div className="section-header">
        <Users size={20} />
        <h3>참여자 선택</h3>
        <span className="count">{selectedParticipants.length}명</span>
      </div>

      {/* 앱 가입 멤버 */}
      {group.memberNames && Object.keys(group.memberNames).length > 0 && (
        <div className="participant-group">
          <h4>📱 그룹 멤버</h4>
          <div className="participant-grid">
            {Object.entries(group.memberNames).map(([userId, nickname]) => (
              <button
                key={userId}
                type="button"
                className={`participant-btn ${isSelected(userId) ? 'active' : ''}`}
                onClick={() => handleToggle(userId)}
              >
                <span className="participant-icon">👤</span>
                <span className="participant-name">{nickname}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 모임원 */}
      {group.regularMembers && Object.keys(group.regularMembers).filter(id => group.regularMembers[id] !== null).length > 0 && (
        <div className="participant-group">
          <h4>👥 모임원</h4>
          <div className="participant-grid">
            {Object.entries(group.regularMembers)
              .filter(([_, regular]) => regular !== null)
              .map(([regularId, regular]) => (
                <button
                  key={regularId}
                  type="button"
                  className={`participant-btn ${isSelected(regularId) ? 'active' : ''}`}
                  onClick={() => handleToggle(regularId)}
                >
                  <span className="participant-icon">👥</span>
                  <span className="participant-name">{regular.name}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 게스트 추가 */}
      <div className="participant-group">
        <h4>🎫 게스트</h4>
        
        <form onSubmit={handleAddGuest} className="guest-form">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="게스트 이름 입력"
            maxLength={20}
          />
          <button type="submit" className="btn-add-guest">
            <UserPlus size={18} />
            추가
          </button>
        </form>

        {/* 추가된 게스트 목록 */}
        {selectedParticipants.filter(p => p.type === 'guest').length > 0 && (
          <div className="guest-list">
            {selectedParticipants
              .filter(p => p.type === 'guest')
              .map(guest => (
                <div key={guest.id} className="guest-tag">
                  <span className="guest-icon">🎫</span>
                  <span className="guest-name">{guest.name}</span>
                  <button
                    type="button"
                    className="btn-remove-guest"
                    onClick={() => handleRemoveGuest(guest.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 선택된 참여자 요약 */}
      {selectedParticipants.length > 0 && (
        <div className="selected-summary">
          <div className="summary-row">
            <span>선택된 참여자</span>
            <span className="summary-count">{selectedParticipants.length}명</span>
          </div>
          <div className="summary-names">
            {selectedParticipants.map((p, index) => (
              <span key={p.id}>
                {p.name}
                {index < selectedParticipants.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
