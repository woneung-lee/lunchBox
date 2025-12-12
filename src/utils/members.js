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
 * 모임원 추가
 * @param {string} groupId - 그룹 ID
 * @param {string} currentUserId - 현재 사용자 ID
 * @param {object} memberData - { name, phone?, memo?, isAppUser }
 */
export const addMember = async (groupId, currentUserId, memberData) => {
  try {
    const { name, phone = '', memo = '', isAppUser = false, userId = null } = memberData;

    if (!name || !name.trim()) {
      throw new Error('이름을 입력해주세요.');
    }

    // 새 모임원 ID 생성
    const memberRef = doc(collection(db, 'members'));
    const memberId = memberRef.id;

    const member = {
      id: memberId,
      groupId,
      userId: userId || null, // 앱 사용자면 uid, 아니면 null
      name: name.trim(),
      phone: phone.trim(),
      memo: memo.trim(),
      isAppUser, // 앱 가입자 여부
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

/**
 * 그룹의 모임원 목록 조회
 */
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
    return { success: false, error: error.message };
  }
};

/**
 * 모임원 상세 조회
 */
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

/**
 * 모임원 수정
 */
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

/**
 * 모임원 삭제
 */
export const deleteMember = async (memberId) => {
  try {
    await deleteDoc(doc(db, 'members', memberId));
    return { success: true };
  } catch (error) {
    console.error('모임원 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 현재 사용자의 모임원 정보 찾기
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 */
export const getCurrentUserMember = async (groupId, userId) => {
  try {
    const q = query(
      collection(db, 'members'),
      where('groupId', '==', groupId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: true, member: null };
    }

    return { success: true, member: querySnapshot.docs[0].data() };
  } catch (error) {
    console.error('현재 사용자 모임원 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 본인 닉네임 설정/수정
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {string} nickname - 닉네임
 */
export const setMyNickname = async (groupId, userId, nickname) => {
  try {
    if (!nickname || !nickname.trim()) {
      throw new Error('닉네임을 입력해주세요.');
    }

    // 기존 모임원 정보 찾기
    const result = await getCurrentUserMember(groupId, userId);
    
    if (result.success && result.member) {
      // 이미 있으면 수정
      await updateMember(result.member.id, { name: nickname.trim() });
      return { success: true, isNew: false };
    } else {
      // 없으면 새로 생성
      const addResult = await addMember(groupId, userId, {
        name: nickname.trim(),
        isAppUser: true,
        userId: userId
      });
      return { success: addResult.success, isNew: true };
    }
  } catch (error) {
    console.error('닉네임 설정 오류:', error);
    return { success: false, error: error.message };
  }
};
