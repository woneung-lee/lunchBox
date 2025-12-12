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

export const addMember = async (groupId, currentUserId, memberData) => {
  try {
    const { name, phone = '', memo = '' } = memberData;

    if (!name || !name.trim()) {
      throw new Error('이름을 입력해주세요.');
    }

    const memberRef = doc(collection(db, 'members'));
    const memberId = memberRef.id;

    const member = {
      id: memberId,
      groupId,
      name: name.trim(),
      phone: phone.trim(),
      memo: memo.trim(),
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(memberRef, member);

    return { success: true, member };
  } catch (error) {
    console.error('모임원 추가 오류:', error);
    return { success: false, error: error.message };
  }
};

export const getGroupMembers = async (groupId) => {
  try {
    const q = query(
      collection(db, 'members'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const members = [];

    querySnapshot.forEach((doc) => {
      members.push(doc.data());
    });

    return { success: true, members };
  } catch (error) {
    console.error('모임원 조회 오류:', error);
    return { success: false, error: error.message, members: [] };
  }
};

export const getMember = async (memberId) => {
  try {
    const memberDoc = await getDoc(doc(db, 'members', memberId));
    
    if (!memberDoc.exists()) {
      throw new Error('모임원을 찾을 수 없습니다.');
    }

    return { success: true, member: memberDoc.data() };
  } catch (error) {
    console.error('모임원 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

export const updateMember = async (memberId, updates) => {
  try {
    const { name, phone, memo } = updates;

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (!name.trim()) {
        throw new Error('이름을 입력해주세요.');
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }

    if (memo !== undefined) {
      updateData.memo = memo.trim();
    }

    await updateDoc(doc(db, 'members', memberId), updateData);

    return { success: true };
  } catch (error) {
    console.error('모임원 수정 오류:', error);
    return { success: false, error: error.message };
  }
};

export const deleteMember = async (memberId) => {
  try {
    await deleteDoc(doc(db, 'members', memberId));
    return { success: true };
  } catch (error) {
    console.error('모임원 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};
