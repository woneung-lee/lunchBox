import { Users, Crown, UserCircle } from 'lucide-react';
import './GroupCard.css';

export default function GroupCard({ group, onClick }) {
  const isCreator = group.role === 'creator';
  const memberCount = group.members?.length || 1;

  return (
    <div className="group-card" onClick={onClick}>
      <div className="group-card-header">
        <div className="group-icon">
          🍱
        </div>
        <div className="group-type-badge" data-type={group.type}>
          {group.type === 'manager' ? '총괄형' : '참여형'}
        </div>
      </div>

      <div className="group-card-body">
        <h3 className="group-name">{group.name}</h3>
        
        <div className="group-info">
          <div className="info-item">
            <Users size={16} />
            <span>{memberCount}명</span>
          </div>
          
          {isCreator && (
            <div className="info-item creator">
              <Crown size={16} />
              <span>총무</span>
            </div>
          )}
          
          {!isCreator && (
            <div className="info-item member">
              <UserCircle size={16} />
              <span>멤버</span>
            </div>
          )}
        </div>
      </div>

      <div className="group-card-footer">
        <span className="created-date">
          {new Date(group.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
}
