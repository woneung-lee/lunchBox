import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import {
  getGroupMembers,
  addMember,
  updateMember,
  deleteMember
} from '../utils/members';
import { getCurrentUser } from '../utils/auth';
import MemberModal from '../components/MemberModal';
import './GroupMembers.css';

export default function GroupMembers() {
  const { group } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    if (group?.id) {
      loadMembers();
    }
  }, [group]);

  const loadMembers = async () => {
    setLoading(true);
    const result = await getGroupMembers(group.id);
    
    if (result.success) {
      setMembers(result.members || []);
    } else {
      console.error('모임원 조회 실패:', result.error);
      setMembers([]);
    }
    
    setLoading(false);
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setIsMemberModalOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (memberData) => {
    const user = getCurrentUser();

    if (editingMember) {
      // 수정
      const result = await updateMember(editingMember.id, memberData);
      if (result.success) {
        await loadMembers();
        setIsMemberModalOpen(false);
        setEditingMember(null);
      } else {
        alert(result.error || '수정에 실패했습니다.');
      }
    } else {
      // 추가
      const result = await addMember(group.id, user.uid, memberData);
      if (result.success) {
        await loadMembers();
        setIsMemberModalOpen(false);
      } else {
        alert(result.error || '추가에 실패했습니다.');
      }
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('이 모임원을 삭제하시겠습니까?')) {
      return;
    }

    const result = await deleteMember(memberId);
    if (result.success) {
      await loadMembers();
    } else {
      alert(result.error || '삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="group-members">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="group-members">
      {/* 헤더 */}
      <div className="members-header">
        <h2>모임원 관리</h2>
        <button className="btn-add" onClick={handleAddMember}>
          <Plus size={20} />
          모임원 추가
        </button>
      </div>

      {/* 모임원 목록 */}
      <div className="members-list">
        {members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>모임원이 없습니다</p>
            <small>모임원을 추가해주세요!</small>
          </div>
        ) : (
          members.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                {member.phone && (
                  <div className="member-phone">📞 {member.phone}</div>
                )}
                {member.memo && (
                  <div className="member-memo">📝 {member.memo}</div>
                )}
              </div>
              <div className="member-actions">
                <button
                  className="btn-icon"
                  onClick={() => handleEditMember(member)}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDeleteMember(member.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 모임원 모달 */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        member={editingMember}
      />
    </div>
  );
}
