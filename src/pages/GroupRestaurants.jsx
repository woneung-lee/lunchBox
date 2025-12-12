import { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Store, Plus } from 'lucide-react';
import { getGroupRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from '../utils/restaurants';
import RestaurantModal from '../components/RestaurantModal';
import RestaurantList from '../components/RestaurantList';
import './GroupRestaurants.css';

export default function GroupRestaurants() {
  const { groupId } = useParams();
  const { user } = useOutletContext();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, [groupId]);

  const loadRestaurants = async () => {
    setLoading(true);
    const result = await getGroupRestaurants(groupId);
    if (result.success) {
      setRestaurants(result.restaurants);
    }
    setLoading(false);
  };

  const handleCreate = async (restaurantData) => {
    const result = await createRestaurant(groupId, user.uid, restaurantData);
    if (result.success) {
      setIsModalOpen(false);
      await loadRestaurants();
      alert('음식점이 등록되었습니다! 🎉');
    } else {
      alert(result.error);
    }
  };

  const handleUpdate = async (restaurantData) => {
    const result = await updateRestaurant(editingRestaurant.id, restaurantData);
    if (result.success) {
      setIsModalOpen(false);
      setEditingRestaurant(null);
      await loadRestaurants();
      alert('음식점이 수정되었습니다! ✅');
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (restaurantId) => {
    if (window.confirm('이 음식점을 삭제하시겠습니까?')) {
      const result = await deleteRestaurant(restaurantId);
      if (result.success) {
        await loadRestaurants();
        alert('음식점이 삭제되었습니다.');
      } else {
        alert(result.error);
      }
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

  // 필터링된 음식점 목록
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || restaurant.category === filterCategory;
    const matchesFavorite = !showOnlyFavorites || restaurant.isFavorite;
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const categories = ['all', '한식', '일식', '중식', '양식', '분식', '간식', '카페', '기타'];

  if (loading) {
    return (
      <div className="group-restaurants loading">
        <div className="loading-spinner">🍱</div>
        <p>음식점 목록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="group-restaurants">
      {/* 헤더 */}
      <div className="restaurants-header">
        <div className="header-title">
          <Store size={24} />
          <h2>음식점 관리</h2>
          <span className="count">{filteredRestaurants.length}개</span>
        </div>
        <button className="btn-add" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          등록
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="filter-section">
        <input
          type="text"
          className="search-input"
          placeholder="음식점 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${filterCategory === category ? 'active' : ''}`}
              onClick={() => setFilterCategory(category)}
            >
              {category === 'all' ? '전체' : category}
            </button>
          ))}
        </div>

        <label className="favorite-filter">
          <input
            type="checkbox"
            checked={showOnlyFavorites}
            onChange={(e) => setShowOnlyFavorites(e.target.checked)}
          />
          <span>⭐ 즐겨찾기만 보기</span>
        </label>
      </div>

      {/* 음식점 목록 */}
      {filteredRestaurants.length === 0 ? (
        <div className="empty-restaurants">
          <div className="empty-icon">🍽️</div>
          <h3>등록된 음식점이 없습니다</h3>
          <p>자주 가는 음식점을 등록해보세요</p>
          <button className="btn-add-empty" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            음식점 등록
          </button>
        </div>
      ) : (
        <RestaurantList
          restaurants={filteredRestaurants}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
        />
      )}

      {/* 음식점 등록/수정 모달 */}
      <RestaurantModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingRestaurant ? handleUpdate : handleCreate}
        restaurant={editingRestaurant}
      />
    </div>
  );
}
