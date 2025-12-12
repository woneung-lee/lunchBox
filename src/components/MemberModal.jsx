import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './MemberModal.css';

export default function MemberModal({ isOpen, onClose, onSave, member }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setPhone(member.phone || '');
      setMemo(member.memo || '');
    } else {
      setName('');
      setPhone('');
      setMemo('');
    }
  }, [member]);

  const handleClose = () => {
    if (!loading) {
      setName('');
      setPhone('');
      setMemo('');
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setLoading(true);

    const memberData = {
      name: name.trim(),
      phone: phone.trim(),
      memo: memo.trim()
    };

    await onSave(memberData);
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content member-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{member ? '모임원 수정' : '모임원 추가'}</h2>
          <button className="btn-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>
              이름 <span className="required">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>전화번호 (선택)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label>메모 (선택)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              rows="3"
              maxLength="100"
            />
            <span className="char-count">{memo.length}/100</span>
          </div>

          <button
            type="submit"
            className="btn-save"
            disabled={loading || !name.trim()}
          >
            {loading ? '저장 중...' : member ? '수정하기' : '추가하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
