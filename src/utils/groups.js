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
 * 그룹 생성 (타입 구분 제거!)
 */
export const createGroup = async (userId, groupData) => {
  try {
    const { name } = groupData;

    if (!name || !name.trim()) {
      throw new Error('그룹 이름을 입력해주세요.');
    }

    // 새 그룹 ID 생성
    const groupRef = doc(collection(db, 'groups'));
    const groupId = groupRef.id;

    const group = {
      id: groupId,
      name: name.trim(),
      createdBy: userId,
      memberIds: [userId], // 생성자 자동 추가
      memberNames: {
        [userId]: '관리자' // 기본 이름
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(groupRef, group);

    return { success: true, group };
  } catch (error) {
    console.error('그룹 생성 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 사용자의 그룹 목록 조회
 */
export const getUserGroups = async (userId) => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const groups = [];

    querySnapshot.forEach((doc) => {
      groups.push(doc.data());
    });

    return { success: true, groups };
  } catch (error) {
    console.error('그룹 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹 상세 조회
 */
export const getGroup = async (groupId) => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    
    if (!groupDoc.exists()) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    return { success: true, group: groupDoc.data() };
  } catch (error) {
    console.error('그룹 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹 수정
 */
export const updateGroup = async (groupId, updates) => {
  try {
    const { name } = updates;

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (!name.trim()) {
        throw new Error('그룹 이름을 입력해주세요.');
      }
      updateData.name = name.trim();
    }

    await updateDoc(doc(db, 'groups', groupId), updateData);

    return { success: true };
  } catch (error) {
    console.error('그룹 수정 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹 삭제
 */
export const deleteGroup = async (groupId) => {
  try {
    await deleteDoc(doc(db, 'groups', groupId));
    return { success: true };
  } catch (error) {
    console.error('그룹 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹에 멤버 추가 (초대 기능용 - 나중에 구현)
 */
export const addMemberToGroup = async (groupId, userId, userName) => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    
    if (!groupDoc.exists()) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    const group = groupDoc.data();
    
    // 이미 멤버인지 확인
    if (group.memberIds.includes(userId)) {
      throw new Error('이미 그룹 멤버입니다.');
    }

    // 멤버 추가
    const newMemberIds = [...group.memberIds, userId];
    const newMemberNames = {
      ...group.memberNames,
      [userId]: userName
    };

    await updateDoc(doc(db, 'groups', groupId), {
      memberIds: newMemberIds,
      memberNames: newMemberNames,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('멤버 추가 오류:', error);
    return { success: false, error: error.message };
  }
};
