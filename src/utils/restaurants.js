import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * 음식점 등록
 */
export const createRestaurant = async (groupId, userId, restaurantData) => {
  try {
    const { name, category, address = '', phone = '', memo = '', isFavorite = false } = restaurantData;

    if (!name || !name.trim()) {
      throw new Error('음식점 이름을 입력해주세요.');
    }

    if (!category) {
      throw new Error('카테고리를 선택해주세요.');
    }

    // 새 음식점 ID 생성
    const restaurantRef = doc(collection(db, 'restaurants'));
    const restaurantId = restaurantRef.id;

    const restaurant = {
      id: restaurantId,
      groupId,
      name: name.trim(),
      category,
      address: address.trim(),
      phone: phone.trim(),
      memo: memo.trim(),
      isFavorite,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(restaurantRef, restaurant);

    return { success: true, restaurant };
  } catch (error) {
    console.error('음식점 등록 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹의 음식점 목록 조회
 */
export const getGroupRestaurants = async (groupId) => {
  try {
    const q = query(
      collection(db, 'restaurants'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const restaurants = [];

    querySnapshot.forEach((doc) => {
      restaurants.push(doc.data());
    });

    return { success: true, restaurants };
  } catch (error) {
    console.error('음식점 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 음식점 상세 조회
 */
export const getRestaurant = async (restaurantId) => {
  try {
    const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
    
    if (!restaurantDoc.exists()) {
      throw new Error('음식점을 찾을 수 없습니다.');
    }

    return { success: true, restaurant: restaurantDoc.data() };
  } catch (error) {
    console.error('음식점 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 음식점 수정
 */
export const updateRestaurant = async (restaurantId, updates) => {
  try {
    const { name, category, address, phone, memo, isFavorite } = updates;

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (!name.trim()) {
        throw new Error('음식점 이름을 입력해주세요.');
      }
      updateData.name = name.trim();
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    if (address !== undefined) {
      updateData.address = address.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }

    if (memo !== undefined) {
      updateData.memo = memo.trim();
    }

    if (isFavorite !== undefined) {
      updateData.isFavorite = isFavorite;
    }

    await updateDoc(doc(db, 'restaurants', restaurantId), updateData);

    return { success: true };
  } catch (error) {
    console.error('음식점 수정 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 음식점 삭제
 */
export const deleteRestaurant = async (restaurantId) => {
  try {
    await deleteDoc(doc(db, 'restaurants', restaurantId));
    return { success: true };
  } catch (error) {
    console.error('음식점 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 즐겨찾기 토글
 */
export const toggleFavorite = async (restaurantId, currentValue) => {
  try {
    await updateDoc(doc(db, 'restaurants', restaurantId), {
      isFavorite: !currentValue,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('즐겨찾기 토글 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 카테고리 아이콘 가져오기
 */
export const getCategoryIcon = (category) => {
  const icons = {
    '한식': '🍚',
    '일식': '🍱',
    '중식': '🥟',
    '양식': '🍝',
    '분식': '🍜',
    '간식': '🍰',
    '카페': '☕',
    '기타': '🍴'
  };
  return icons[category] || '🍴';
};

/**
 * 카테고리 목록 (RestaurantModal에서 사용)
 */
export const RESTAURANT_CATEGORIES = [
  '한식',
  '일식',
  '중식',
  '양식',
  '분식',
  '간식',
  '카페',
  '기타'
];
