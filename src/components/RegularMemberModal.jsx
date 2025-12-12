import { useState, useEffect } from 'react';
import { X, Users, Phone, FileText } from 'lucide-react';
import './RegularMemberModal.css';

export default function RegularMemberModal({ 
  isOpen, 
  onClose, 
  onSave, 
  regular = null 
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    memo: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (regular) {
      setFormData({
        name: regular.name,
        phone: regular.phone || '',
        memo: regular.memo || ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        memo: ''
      });
    }
  }, [regular, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        phone: '',
        memo: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content regular-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-with-icon">
            <Users size={24} color="var(--accent)" />
            <h2>{regular ? '모임원 수정' : '모임원 등록'}</h2>
          </div>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="info-box">
            <p>📌 자주 참여하는 사람을 모임원으로 등록하세요</p>
            <small>앱에 가입하지 않아도 모임원으로 추가할 수 있어요</small>
          </div>

          {/* 이름 */}
          <div className="form-group">
            <label htmlFor="regularName">
              <Users size={18} />
              이름 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="regularName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 이영희"
              maxLength={20}
              autoFocus
            />
            <span className="char-count">{formData.name.length}/20</span>
          </div>

          {/* 전화번호 */}
          <div className="form-group">
            <label htmlFor="regularPhone">
              <Phone size={18} />
              전화번호 (선택)
            </label>
            <input
              type="tel"
              id="regularPhone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-1234-5678"
              maxLength={13}
            />
          </div>

          {/* 메모 */}
          <div className="form-group">
            <label htmlFor="regularMemo">
              <FileText size={18} />
              메모 (선택)
            </label>
            <textarea
              id="regularMemo"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="예: 회사 동료, 대학 친구 등"
              rows="3"
              maxLength="100"
            />
            <span className="char-count">{formData.memo.length}/100</span>
          </div>

          <button 
            type="submit" 
            className="btn-save"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? '저장 중...' : regular ? '수정하기' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
