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
 * 식사 기록 추가
 * @param {string} groupId - 그룹 ID
 * @param {string} dateKey - 날짜 키 (YYYY-MM-DD)
 * @param {string} userId - 사용자 ID
 * @param {object} mealData - 식사 데이터
 * 
 * mealData 구조:
 * {
 *   restaurantId, restaurantName, restaurantCategory,
 *   items: [
 *     { type: 'individual', name: '김치찌개', amount: 8000, memberId: 'xxx' },
 *     { type: 'shared', name: '탕수육', amount: 30000, participants: ['xxx', 'yyy'] }
 *   ],
 *   memo
 * }
 */
export const createMeal = async (groupId, dateKey, userId, mealData) => {
  try {
    const { 
      restaurantId, 
      restaurantName, 
      restaurantCategory,
      items = [],
      memo = '' 
    } = mealData;

    if (!restaurantId || !restaurantName) {
      throw new Error('음식점을 선택해주세요.');
    }

    if (!items || items.length === 0) {
      throw new Error('음식을 추가해주세요.');
    }

    // 각 아이템 검증
    for (const item of items) {
      if (!item.name || !item.name.trim()) {
        throw new Error('음식 이름을 입력해주세요.');
      }
      if (!item.amount || item.amount <= 0) {
        throw new Error('금액을 입력해주세요.');
      }
      if (item.type === 'individual' && !item.memberId) {
        throw new Error('개별 음식은 먹은 사람을 선택해주세요.');
      }
      if (item.type === 'shared' && (!item.participants || item.participants.length === 0)) {
        throw new Error('공용 음식은 참여자를 선택해주세요.');
      }
    }

    // 새 식사 기록 ID 생성
    const mealRef = doc(collection(db, 'meals'));
    const mealId = mealRef.id;

    // 각 아이템에 ID 부여 및 N빵 계산
    const processedItems = items.map((item, index) => {
      const processedItem = {
        id: `item_${index}_${Date.now()}`,
        type: item.type,
        name: item.name.trim(),
        amount: Number(item.amount)
      };

      if (item.type === 'individual') {
        processedItem.memberId = item.memberId;
      } else if (item.type === 'shared') {
        processedItem.participants = item.participants;
        processedItem.splitAmount = Math.round(item.amount / item.participants.length);
      }

      return processedItem;
    });

    const meal = {
      id: mealId,
      groupId,
      dateKey,
      restaurantId,
      restaurantName,
      restaurantCategory,
      items: processedItems,
      memo: memo.trim(),
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(mealRef, meal);

    return { success: true, meal };
  } catch (error) {
    console.error('식사 기록 추가 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 날짜별 식사 기록 조회
 */
export const getDateMeals = async (groupId, dateKey) => {
  try {
    const q = query(
      collection(db, 'meals'),
      where('groupId', '==', groupId),
      where('dateKey', '==', dateKey),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const meals = [];

    querySnapshot.forEach((doc) => {
      meals.push(doc.data());
    });

    return { success: true, meals };
  } catch (error) {
    console.error('식사 기록 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 식사 기록 상세 조회
 */
export const getMeal = async (mealId) => {
  try {
    const mealDoc = await getDoc(doc(db, 'meals', mealId));
    
    if (!mealDoc.exists()) {
      throw new Error('식사 기록을 찾을 수 없습니다.');
    }

    return { success: true, meal: mealDoc.data() };
  } catch (error) {
    console.error('식사 기록 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 식사 기록 수정
 */
export const updateMeal = async (mealId, updates) => {
  try {
    const { items, memo } = updates;

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (items !== undefined) {
      if (!items || items.length === 0) {
        throw new Error('음식을 추가해주세요.');
      }
      
      // N빵 재계산
      const processedItems = items.map(item => {
        const processedItem = { ...item };
        if (item.type === 'shared' && item.participants && item.participants.length > 0) {
          processedItem.splitAmount = Math.round(item.amount / item.participants.length);
        }
        return processedItem;
      });
      
      updateData.items = processedItems;
    }

    if (memo !== undefined) {
      updateData.memo = memo.trim();
    }

    await updateDoc(doc(db, 'meals', mealId), updateData);

    return { success: true };
  } catch (error) {
    console.error('식사 기록 수정 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 식사 기록 삭제
 */
export const deleteMeal = async (mealId) => {
  try {
    await deleteDoc(doc(db, 'meals', mealId));
    return { success: true };
  } catch (error) {
    console.error('식사 기록 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 금액 포맷팅
 */
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

/**
 * 날짜별 총 금액 계산
 */
export const calculateDateTotal = (meals) => {
  let total = 0;
  
  meals.forEach(meal => {
    meal.items?.forEach(item => {
      total += item.amount || 0;
    });
  });
  
  return total;
};

/**
 * 모임원별 정산 금액 계산
 * @param {array} meals - 식사 기록 배열
 * @param {string} memberId - 모임원 ID
 */
export const calculateMemberSettlement = (meals, memberId) => {
  let total = 0;
  
  meals.forEach(meal => {
    meal.items?.forEach(item => {
      if (item.type === 'individual' && item.memberId === memberId) {
        // 개별 음식: 전액 부담
        total += item.amount || 0;
      } else if (item.type === 'shared' && item.participants?.includes(memberId)) {
        // 공용 음식: N빵
        total += item.splitAmount || 0;
      }
    });
  });
  
  return total;
};

/**
 * 그룹 전체 정산 내역
 * @param {array} meals - 식사 기록 배열
 * @param {array} members - 모임원 배열
 */
export const calculateGroupSettlement = (meals, members) => {
  const settlement = {};
  
  // 모든 모임원 초기화
  members.forEach(member => {
    settlement[member.id] = {
      memberId: member.id,
      memberName: member.name,
      amount: 0
    };
  });

  // 각 식사의 정산 계산
  meals.forEach(meal => {
    meal.items?.forEach(item => {
      if (item.type === 'individual' && settlement[item.memberId]) {
        settlement[item.memberId].amount += item.amount || 0;
      } else if (item.type === 'shared' && item.participants) {
        item.participants.forEach(participantId => {
          if (settlement[participantId]) {
            settlement[participantId].amount += item.splitAmount || 0;
          }
        });
      }
    });
  });

  return Object.values(settlement);
};

/**
 * 식사 기록의 총 금액 계산
 */
export const calculateMealTotal = (meal) => {
  let total = 0;
  meal.items?.forEach(item => {
    total += item.amount || 0;
  });
  return total;
};
