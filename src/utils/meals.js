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
 * 식사 기록 추가 (재설계 버전)
 */
export const createMeal = async (groupId, dateKey, userId, mealData) => {
  try {
    const { 
      restaurantId, 
      restaurantName, 
      restaurantCategory,
      items,
      participants,
      memo = '' 
    } = mealData;

    if (!restaurantId || !restaurantName) {
      throw new Error('음식점을 선택해주세요.');
    }

    if (!items || items.length === 0) {
      throw new Error('메뉴를 추가해주세요.');
    }

    if (!participants || participants.length === 0) {
      throw new Error('참여자를 선택해주세요.');
    }

    // 정산 계산
    const settlement = calculateSettlement(items, participants);
    const totalAmount = calculateTotalAmount(items);

    // 새 식사 기록 ID 생성
    const mealRef = doc(collection(db, 'meals'));
    const mealId = mealRef.id;

    const meal = {
      id: mealId,
      groupId,
      dateKey,
      restaurantId,
      restaurantName,
      restaurantCategory,
      items,
      participants,
      settlement,
      totalAmount,
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
    const { items, participants, memo } = updates;

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (items !== undefined) {
      if (!items || items.length === 0) {
        throw new Error('메뉴를 추가해주세요.');
      }
      updateData.items = items;
      updateData.totalAmount = calculateTotalAmount(items);
    }

    if (participants !== undefined) {
      if (!participants || participants.length === 0) {
        throw new Error('참여자를 선택해주세요.');
      }
      updateData.participants = participants;
    }

    // items 또는 participants가 변경되면 정산 재계산
    if (items !== undefined || participants !== undefined) {
      const currentMeal = await getMeal(mealId);
      const finalItems = items || currentMeal.meal.items;
      const finalParticipants = participants || currentMeal.meal.participants;
      updateData.settlement = calculateSettlement(finalItems, finalParticipants);
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
 * 정산 계산 (핵심 로직!)
 */
export const calculateSettlement = (items, participants) => {
  const settlement = {};
  
  // 모든 참여자 초기화
  participants.forEach(participant => {
    settlement[participant.id] = 0;
  });

  // 각 메뉴 아이템별로 계산
  items.forEach(item => {
    if (item.type === 'individual') {
      // 개인 메뉴: 해당 사람이 전액 부담
      if (settlement[item.consumerId] !== undefined) {
        settlement[item.consumerId] += item.price;
      }
    } else if (item.type === 'shared') {
      // 공용 메뉴: N빵
      const splitAmount = Math.round(item.price / item.consumerIds.length);
      item.consumerIds.forEach(consumerId => {
        if (settlement[consumerId] !== undefined) {
          settlement[consumerId] += splitAmount;
        }
      });
    }
  });

  return settlement;
};

/**
 * 총 금액 계산
 */
export const calculateTotalAmount = (items) => {
  return items.reduce((total, item) => total + item.price, 0);
};

/**
 * 날짜별 총 금액 계산
 */
export const calculateDateTotal = (meals) => {
  return meals.reduce((total, meal) => total + (meal.totalAmount || 0), 0);
};

/**
 * 사용자별 정산 금액 계산 (여러 식사 기록 합산)
 */
export const calculateUserTotal = (meals, userId) => {
  let total = 0;
  
  meals.forEach(meal => {
    if (meal.settlement && meal.settlement[userId]) {
      total += meal.settlement[userId];
    }
  });
  
  return total;
};

/**
 * 그룹 전체 정산 내역 (여러 식사 기록 합산)
 */
export const calculateGroupSettlement = (meals, participants) => {
  const settlement = {};
  
  // 모든 참여자 초기화
  participants.forEach(participant => {
    settlement[participant.id] = {
      name: participant.name,
      type: participant.type,
      amount: 0
    };
  });

  // 각 식사 기록의 정산 합산
  meals.forEach(meal => {
    if (meal.settlement) {
      Object.entries(meal.settlement).forEach(([participantId, amount]) => {
        if (settlement[participantId]) {
          settlement[participantId].amount += amount;
        }
      });
    }
  });

  return settlement;
};

/**
 * 금액 포맷팅
 */
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

/**
 * 참여자 타입별 아이콘
 */
export const getParticipantIcon = (type) => {
  switch (type) {
    case 'member':
      return '👤';
    case 'regular':
      return '👥';
    case 'guest':
      return '🎫';
    default:
      return '👤';
  }
};
