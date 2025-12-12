import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter, Search } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getGroup } from '../utils/groups';
import {
  getGroupRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleFavorite,
  filterByCategory,
  filterByFavorite,
  searchRestaurants,
  RESTAURANT_CATEGORIES
} from '../utils/restaurants';
import RestaurantModal from '../components/RestaurantModal';
import RestaurantList from '../components/RestaurantList';
import './GroupSettings.css';

export default function GroupSettings() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  
  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      loadData();
    }
  }, [groupId, navigate]);

  useEffect(() => {
    applyFilters();
  }, [restaurants, selectedCategory, showOnlyFavorites, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    
    // 그룹 정보 로드
    const groupResult = await getGroup(groupId);
    if (groupResult.success) {
      setGroup(groupResult.group);
    } else {
      alert('그룹을 찾을 수 없습니다.');
      navigate('/groups');
      return;
    }

    // 음식점 목록 로드
    const restaurantsResult = await getGroupRestaurants(groupId);
    if (restaurantsResult.success) {
      setRestaurants(restaurantsResult.restaurants);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...restaurants];
    
    // 카테고리 필터
    filtered = filterByCategory(filtered, selectedCategory);
    
    // 즐겨찾기 필터
    filtered = filterByFavorite(filtered, showOnlyFavorites);
    
    // 검색
    filtered = searchRestaurants(filtered, searchTerm);
    
    setFilteredRestaurants(filtered);
  };

  const handleCreateRestaurant = async (restaurantData) => {
    const result = await createRestaurant(groupId, user.uid, restaurantData);
    
    if (result.success) {
      setIsModalOpen(false);
      await loadData();
      alert('음식점이 등록되었습니다! 🎉');
    } else {
      alert(result.error);
    }
  };

  const handleUpdateRestaurant = async (restaurantData) => {
    const result = await updateRestaurant(editingRestaurant.id, restaurantData);
    
    if (result.success) {
      setIsModalOpen(false);
      setEditingRestaurant(null);
      await loadData();
      alert('음식점이 수정되었습니다! ✅');
    } else {
      alert(result.error);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    const result = await deleteRestaurant(restaurantId);
    
    if (result.success) {
      await loadData();
      alert('음식점이 삭제되었습니다.');
    } else {
      alert(result.error);
    }
  };

  const handleToggleFavorite = async (restaurant) => {
    const result = await toggleFavorite(restaurant.id, restaurant.isFavorite);
    
    if (result.success) {
      await loadData();
    } else {
      alert(result.error);
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRestaurant(null);
  };

  if (loading || !group || !user) {
    return (
      <div className="settings-container">
        <div className="loading-state">
          <div className="loading-spinner">🍱</div>
          <p>설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      {/* 헤더 */}
      <div className="settings-header">
        <button className="btn-back" onClick={() => navigate(`/group/${groupId}`)}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1>그룹 설정</h1>
          <p className="group-name">{group.name}</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="settings-content">
        {/* 음식점 관리 섹션 */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🍽️ 음식점 관리</h2>
            <button className="btn-add" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
              음식점 등록
            </button>
          </div>

          {/* 필터 및 검색 */}
          <div className="filter-bar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="음식점 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={showOnlyFavorites}
                  onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                />
                <span>⭐ 즐겨찾기만</span>
              </label>

              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">전체 카테고리</option>
                {Object.values(RESTAURANT_CATEGORIES).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 음식점 목록 */}
          <div className="restaurants-wrapper">
            <RestaurantList
              restaurants={filteredRestaurants}
              onEdit={handleEdit}
              onDelete={handleDeleteRestaurant}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>
      </div>

      {/* 음식점 등록/수정 모달 */}
      <RestaurantModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingRestaurant ? handleUpdateRestaurant : handleCreateRestaurant}
        restaurant={editingRestaurant}
      />
    </div>
  );
}
