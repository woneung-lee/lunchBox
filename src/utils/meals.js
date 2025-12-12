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
 */
export const createMeal = async (groupId, dateKey, userId, mealData) => {
  try {
    const { 
      restaurantId, 
      restaurantName, 
      restaurantCategory,
      totalAmount, 
      participants, 
      memo = '' 
    } = mealData;

    if (!restaurantId || !restaurantName) {
      throw new Error('음식점을 선택해주세요.');
    }

    if (!totalAmount || totalAmount <= 0) {
      throw new Error('총 금액을 입력해주세요.');
    }

    if (!participants || participants.length === 0) {
      throw new Error('참여자를 선택해주세요.');
    }

    // N빵 계산
    const splitAmount = Math.round(totalAmount / participants.length);

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
      totalAmount: Number(totalAmount),
      participants,
      splitAmount,
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
    const { totalAmount, participants, memo } = updates;

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (totalAmount !== undefined) {
      if (totalAmount <= 0) {
        throw new Error('총 금액을 입력해주세요.');
      }
      updateData.totalAmount = Number(totalAmount);
    }

    if (participants !== undefined) {
      if (!participants || participants.length === 0) {
        throw new Error('참여자를 선택해주세요.');
      }
      updateData.participants = participants;
      
      // N빵 재계산
      const amount = totalAmount !== undefined ? totalAmount : (await getMeal(mealId)).meal.totalAmount;
      updateData.splitAmount = Math.round(amount / participants.length);
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
  return meals.reduce((total, meal) => total + meal.totalAmount, 0);
};

/**
 * 사용자별 정산 금액 계산
 */
export const calculateUserSettlement = (meals, userId) => {
  let totalAmount = 0;
  
  meals.forEach(meal => {
    if (meal.participants.includes(userId)) {
      totalAmount += meal.splitAmount;
    }
  });
  
  return totalAmount;
};

/**
 * 그룹 전체 정산 내역 계산
 */
export const calculateGroupSettlement = (meals, memberIds) => {
  const settlement = {};
  
  memberIds.forEach(memberId => {
    settlement[memberId] = calculateUserSettlement(meals, memberId);
  });
  
  return settlement;
};
