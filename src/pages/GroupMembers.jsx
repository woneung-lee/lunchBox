import { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Users, Plus, Edit2, Trash2, Phone, FileText } from 'lucide-react';
import { getRegularMembers, addRegularMember, updateRegularMember, deleteRegularMember } from '../utils/regulars';
import RegularMemberModal from '../components/RegularMemberModal';
import './GroupMembers.css';

export default function GroupMembers() {
  const { groupId } = useParams();
  const { group, loadGroup } = useOutletContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = async (memberData) => {
    const result = await addRegularMember(groupId, memberData);
    if (result.success) {
      setIsModalOpen(false);
      await loadGroup();
      alert('모임원이 등록되었습니다! 🎉');
    } else {
      alert(result.error);
    }
  };

  const handleUpdate = async (memberData) => {
    const result = await updateRegularMember(groupId, editingId, memberData);
    if (result.success) {
      setIsModalOpen(false);
      setEditingMember(null);
      setEditingId(null);
      await loadGroup();
      alert('모임원이 수정되었습니다! ✅');
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (regularId) => {
    if (window.confirm('이 모임원을 삭제하시겠습니까?')) {
      const result = await deleteRegularMember(groupId, regularId);
      if (result.success) {
        await loadGroup();
        alert('모임원이 삭제되었습니다.');
      } else {
        alert(result.error);
      }
    }
  };

  const handleEdit = (regularId, regular) => {
    setEditingId(regularId);
    setEditingMember(regular);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setEditingId(null);
  };

  const regularMembers = group?.regularMembers || {};
  const filteredMembers = Object.entries(regularMembers)
    .filter(([_, member]) => member !== null)
    .filter(([_, member]) => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.memo.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const appMembers = group?.memberNames || {};

  return (
    <div className="group-members">
      {/* 헤더 */}
      <div className="members-header">
        <div className="header-title">
          <Users size={24} />
          <h2>모임원 관리</h2>
        </div>
        <button className="btn-add" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          등록
        </button>
      </div>

      {/* 앱 가입 멤버 */}
      <div className="member-section">
        <h3>📱 그룹 멤버 ({Object.keys(appMembers).length}명)</h3>
        <div className="app-members-list">
          {Object.entries(appMembers).map(([userId, nickname]) => (
            <div key={userId} className="member-card app-member">
              <div className="member-icon">👤</div>
              <div className="member-info">
                <div className="member-name">{nickname}</div>
                <div className="member-badge">앱 가입자</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 모임원 */}
      <div className="member-section">
        <div className="section-title">
          <h3>👥 모임원 ({filteredMembers.length}명)</h3>
          <input
            type="text"
            className="search-input"
            placeholder="이름, 전화번호 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredMembers.length === 0 ? (
          <div className="empty-members">
            <div className="empty-icon">👥</div>
            <h4>등록된 모임원이 없습니다</h4>
            <p>자주 함께하는 사람들을 모임원으로 등록하세요</p>
            <button className="btn-add-empty" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
              모임원 등록
            </button>
          </div>
        ) : (
          <div className="regular-members-list">
            {filteredMembers.map(([regularId, member]) => (
              <div key={regularId} className="member-card regular-member">
                <div className="member-icon">👥</div>
                <div className="member-info">
                  <div className="member-name">{member.name}</div>
                  {member.phone && (
                    <div className="member-detail">
                      <Phone size={14} />
                      {member.phone}
                    </div>
                  )}
                  {member.memo && (
                    <div className="member-detail">
                      <FileText size={14} />
                      {member.memo}
                    </div>
                  )}
                </div>
                <div className="member-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(regularId, member)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(regularId)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 모임원 등록/수정 모달 */}
      <RegularMemberModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingMember ? handleUpdate : handleCreate}
        regular={editingMember}
      />
    </div>
  );
}
