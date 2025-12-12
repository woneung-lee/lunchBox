import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, User, CheckCircle } from 'lucide-react';
import { 
  getGroupMembers, 
  addMember, 
  updateMember, 
  deleteMember,
  getCurrentUserMember,
  setMyNickname 
} from '../utils/members';
import { getCurrentUser } from '../utils/auth';
import './GroupMembers.css';

export default function GroupMembers() {
  const { group } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserMember, setCurrentUserMember] = useState(null);
  
  // 본인 닉네임 설정
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  
  // 모임원 추가/수정 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    memo: ''
  });

  useEffect(() => {
    if (group?.id) {
      loadMembers();
    }
  }, [group]);

  const loadMembers = async () => {
    setLoading(true);
    const user = getCurrentUser();
    
    const [membersResult, currentResult] = await Promise.all([
      getGroupMembers(group.id),
      getCurrentUserMember(group.id, user.uid)
    ]);
    
    if (membersResult.success) {
      setMembers(membersResult.members);
    }
    
    if (currentResult.success) {
      setCurrentUserMember(currentResult.member);
      if (currentResult.member) {
        setNickname(currentResult.member.name);
      }
    }
    
    setLoading(false);
  };

  // 본인 닉네임 저장
  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    const user = getCurrentUser();
    const result = await setMyNickname(group.id, user.uid, nickname.trim());
    
    if (result.success) {
      setIsEditingNickname(false);
      await loadMembers();
    } else {
      alert(result.error || '닉네임 설정에 실패했습니다.');
    }
  };

  // 모임원 추가 모달 열기
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({ name: '', phone: '', memo: '' });
    setIsModalOpen(true);
  };

  // 모임원 수정 모달 열기
  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone || '',
      memo: member.memo || ''
    });
    setIsModalOpen(true);
  };

  // 모임원 저장
  const handleSaveMember = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    const user = getCurrentUser();

    let result;
    if (editingMember) {
      result = await updateMember(editingMember.id, formData);
    } else {
      result = await addMember(group.id, user.uid, {
        ...formData,
        isAppUser: false
      });
    }

    if (result.success) {
      setIsModalOpen(false);
      await loadMembers();
    } else {
      alert(result.error || '저장에 실패했습니다.');
    }
  };

  // 모임원 삭제
  const handleDeleteMember = async (member) => {
    if (!confirm(`${member.name}님을 삭제하시겠습니까?`)) {
      return;
    }

    const result = await deleteMember(member.id);

    if (result.success) {
      await loadMembers();
    } else {
      alert(result.error || '삭제에 실패했습니다.');
    }
  };

  // 검색 필터
  const filteredMembers = members.filter(member => {
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      (member.phone && member.phone.includes(query)) ||
      (member.memo && member.memo.toLowerCase().includes(query))
    );
  });

  // 본인과 다른 모임원 분리
  const currentUserId = getCurrentUser()?.uid;
  const myMember = filteredMembers.find(m => m.userId === currentUserId);
  const otherMembers = filteredMembers.filter(m => m.userId !== currentUserId);

  return (
    <div className="group-members">
      {/* 본인 닉네임 카드 */}
      <div className="my-nickname-card">
        <div className="card-header">
          <User size={20} color="var(--primary)" />
          <h3>내 닉네임</h3>
        </div>
        
        {isEditingNickname ? (
          <div className="nickname-edit-form">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력"
              maxLength={20}
              autoFocus
            />
            <div className="edit-actions">
              <button 
                className="btn-save-nickname"
                onClick={handleSaveNickname}
              >
                <CheckCircle size={16} />
                저장
              </button>
              <button 
                className="btn-cancel"
                onClick={() => {
                  setIsEditingNickname(false);
                  setNickname(currentUserMember?.name || '');
                }}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="nickname-display">
            <div className="nickname-value">
              {currentUserMember ? currentUserMember.name : '닉네임 미설정'}
            </div>
            <button 
              className="btn-edit-nickname"
              onClick={() => setIsEditingNickname(true)}
            >
              <Edit2 size={16} />
              {currentUserMember ? '수정' : '설정'}
            </button>
          </div>
        )}
        
        <p className="nickname-hint">
          💡 모임원들이 보는 내 이름입니다
        </p>
      </div>

      {/* 검색 & 추가 */}
      <div className="members-header">
        <h2>모임원 관리</h2>
        <button className="btn-add" onClick={handleOpenAddModal}>
          <Plus size={20} />
          모임원 추가
        </button>
      </div>

      <div className="search-box">
        <Search size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이름, 전화번호, 메모로 검색"
        />
      </div>

      {/* 모임원 목록 */}
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <>
          <div className="members-count">
            전체 {filteredMembers.length}명
          </div>

          <div className="members-list">
            {filteredMembers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>모임원이 없습니다</p>
                <small>모임원을 추가해보세요!</small>
              </div>
            ) : (
              <>
                {/* 본인 */}
                {myMember && (
                  <div className="member-card my-card">
                    <div className="member-info">
                      <div className="member-avatar">
                        <User size={24} />
                      </div>
                      <div className="member-details">
                        <div className="member-name">
                          {myMember.name}
                          <span className="me-badge">나</span>
                        </div>
                        {myMember.phone && (
                          <div className="member-phone">📞 {myMember.phone}</div>
                        )}
                        {myMember.memo && (
                          <div className="member-memo">📝 {myMember.memo}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 다른 모임원들 */}
                {otherMembers.map(member => (
                  <div key={member.id} className="member-card">
                    <div className="member-info">
                      <div className="member-avatar">
                        <User size={24} />
                      </div>
                      <div className="member-details">
                        <div className="member-name">
                          {member.name}
                          {member.isAppUser && (
                            <span className="app-user-badge">앱 사용자</span>
                          )}
                        </div>
                        {member.phone && (
                          <div className="member-phone">📞 {member.phone}</div>
                        )}
                        {member.memo && (
                          <div className="member-memo">📝 {member.memo}</div>
                        )}
                      </div>
                    </div>
                    
                    {!member.isAppUser && (
                      <div className="member-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleOpenEditModal(member)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteMember(member)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}

      {/* 모임원 추가/수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMember ? '모임원 수정' : '모임원 추가'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="modal-body">
              <div className="form-group">
                <label>
                  이름 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 홍길동"
                  maxLength={20}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>전화번호 (선택)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="예: 010-1234-5678"
                  maxLength={20}
                />
              </div>

              <div className="form-group">
                <label>메모 (선택)</label>
                <textarea
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  placeholder="예: 회사 동료"
                  rows="3"
                  maxLength="100"
                />
                <span className="char-count">{formData.memo.length}/100</span>
              </div>

              <button type="submit" className="btn-primary">
                {editingMember ? '수정하기' : '추가하기'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
