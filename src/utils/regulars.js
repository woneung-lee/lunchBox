import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * 모임원 추가
 */
export const addRegularMember = async (groupId, memberData) => {
  try {
    const { name, phone = '', memo = '' } = memberData;

    if (!name || !name.trim()) {
      throw new Error('이름을 입력해주세요.');
    }

    // UUID 생성
    const regularId = `regular_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    const currentRegulars = groupDoc.data().regularMembers || {};

    // 중복 이름 체크
    const isDuplicate = Object.values(currentRegulars).some(
      regular => regular.name === name.trim()
    );

    if (isDuplicate) {
      throw new Error('이미 같은 이름의 모임원이 있습니다.');
    }

    const newRegular = {
      name: name.trim(),
      phone: phone.trim(),
      memo: memo.trim(),
      createdAt: new Date().toISOString()
    };

    await updateDoc(groupRef, {
      [`regularMembers.${regularId}`]: newRegular
    });

    return { success: true, regularId, regular: newRegular };
  } catch (error) {
    console.error('모임원 추가 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 모임원 수정
 */
export const updateRegularMember = async (groupId, regularId, updates) => {
  try {
    const { name, phone, memo } = updates;

    if (name !== undefined && !name.trim()) {
      throw new Error('이름을 입력해주세요.');
    }

    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    const currentRegulars = groupDoc.data().regularMembers || {};

    if (!currentRegulars[regularId]) {
      throw new Error('모임원을 찾을 수 없습니다.');
    }

    const updateData = {};

    if (name !== undefined) {
      updateData[`regularMembers.${regularId}.name`] = name.trim();
    }
    if (phone !== undefined) {
      updateData[`regularMembers.${regularId}.phone`] = phone.trim();
    }
    if (memo !== undefined) {
      updateData[`regularMembers.${regularId}.memo`] = memo.trim();
    }

    await updateDoc(groupRef, updateData);

    return { success: true };
  } catch (error) {
    console.error('모임원 수정 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 모임원 삭제
 */
export const deleteRegularMember = async (groupId, regularId) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    
    await updateDoc(groupRef, {
      [`regularMembers.${regularId}`]: null
    });

    return { success: true };
  } catch (error) {
    console.error('모임원 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 모임원 목록 조회
 */
export const getRegularMembers = async (groupId) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    const regularMembers = groupDoc.data().regularMembers || {};
    
    // null 값 제거 (삭제된 모임원)
    const filteredRegulars = Object.entries(regularMembers)
      .filter(([_, regular]) => regular !== null)
      .reduce((acc, [id, regular]) => {
        acc[id] = regular;
        return acc;
      }, {});

    return { success: true, regularMembers: filteredRegulars };
  } catch (error) {
    console.error('모임원 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 모임원 검색
 */
export const searchRegularMembers = (regularMembers, searchTerm) => {
  if (!searchTerm) return regularMembers;

  return Object.entries(regularMembers)
    .filter(([_, regular]) => 
      regular.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regular.phone.includes(searchTerm) ||
      regular.memo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .reduce((acc, [id, regular]) => {
      acc[id] = regular;
      return acc;
    }, {});
};
