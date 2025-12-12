import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '0';
  return Number(amount).toLocaleString();
};

export const createMeal = async (groupId, userId, dateKey, mealData) => {
  try {
    const { restaurantId, restaurantName, restaurantCategory, items, memo = '' } = mealData;

    if (!restaurantId) {
      throw new Error('음식점을 선택해주세요.');
    }

    if (!items || items.length === 0) {
      throw new Error('음식을 추가해주세요.');
    }

    const mealRef = doc(collection(db, 'meals'));
    const mealId = mealRef.id;

    const validatedItems = items.map(item => {
      if (item.type === 'individual') {
        return {
          id: item.id || `item_${Date.now()}_${Math.random()}`,
          type: 'individual',
          name: item.name.trim(),
          amount: Number(item.amount),
          memberId: item.memberId
        };
      } else if (item.type === 'shared') {
        const splitAmount = Math.round(Number(item.amount) / item.participants.length);
        return {
          id: item.id || `item_${Date.now()}_${Math.random()}`,
          type: 'shared',
          name: item.name.trim(),
          amount: Number(item.amount),
          participants: item.participants,
          splitAmount: splitAmount
        };
      }
      throw new Error('잘못된 음식 타입입니다.');
    });

    const meal = {
      id: mealId,
      groupId,
      dateKey,
      restaurantId,
      restaurantName,
      restaurantCategory,
      items: validatedItems,
      memo: memo.trim(),
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(mealRef, meal);

    return { success: true, meal };
  } catch (error) {
    console.error('식사 기록 생성 오류:', error);
    return { success: false, error: error.message };
  }
};

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
    return { success: false, error: error.message, meals: [] };
  }
};

export const getGroupMeals = async (groupId) => {
  try {
    const q = query(
      collection(db, 'meals'),
      where('groupId', '==', groupId),
      orderBy('dateKey', 'desc'),
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
    return { success: false, error: error.message, meals: [] };
  }
};

export const deleteMeal = async (mealId) => {
  try {
    await deleteDoc(doc(db, 'meals', mealId));
    return { success: true };
  } catch (error) {
    console.error('식사 기록 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};

export const calculateMemberSettlement = (meals, memberId) => {
  let totalAmount = 0;

  meals.forEach(meal => {
    if (!meal.items || !Array.isArray(meal.items)) return;

    meal.items.forEach(item => {
      if (item.type === 'individual' && item.memberId === memberId) {
        totalAmount += item.amount;
      } else if (item.type === 'shared' && item.participants.includes(memberId)) {
        totalAmount += item.splitAmount;
      }
    });
  });

  return totalAmount;
};

export const calculateGroupSettlement = (meals, members) => {
  const settlement = {};

  members.forEach(member => {
    settlement[member.id] = {
      memberId: member.id,
      memberName: member.name,
      amount: 0
    };
  });

  meals.forEach(meal => {
    if (!meal.items || !Array.isArray(meal.items)) return;

    meal.items.forEach(item => {
      if (item.type === 'individual') {
        if (settlement[item.memberId]) {
          settlement[item.memberId].amount += item.amount;
        }
      } else if (item.type === 'shared') {
        item.participants.forEach(participantId => {
          if (settlement[participantId]) {
            settlement[participantId].amount += item.splitAmount;
          }
        });
      }
    });
  });

  return Object.values(settlement);
};
