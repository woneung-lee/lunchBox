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
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * 그룹 타입
 * - manager: 총괄형 (총무가 모든 기록 관리)
 * - participant: 참여형 (각자 자기 기록 입력)
 */
export const GROUP_TYPES = {
  MANAGER: 'manager',
  PARTICIPANT: 'participant'
};

/**
 * 그룹 생성
 */
export const createGroup = async (userId, username, groupName, groupType) => {
  try {
    if (!groupName.trim()) {
      throw new Error('그룹 이름을 입력해주세요.');
    }

    if (!Object.values(GROUP_TYPES).includes(groupType)) {
      throw new Error('올바른 그룹 타입을 선택해주세요.');
    }

    // 새 그룹 ID 생성
    const groupRef = doc(collection(db, 'groups'));
    const groupId = groupRef.id;

    // 그룹 데이터
    const groupData = {
      id: groupId,
      name: groupName.trim(),
      type: groupType,
      creatorId: userId,
      creatorName: username,
      members: [userId],
      memberNames: {
        [userId]: username
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Firestore에 그룹 저장
    await setDoc(groupRef, groupData);

    // 사용자의 groups 배열에 추가
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      groups: arrayUnion({
        groupId: groupId,
        role: 'creator'
      })
    });

    return { success: true, groupId, group: groupData };
  } catch (error) {
    console.error('그룹 생성 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 사용자의 모든 그룹 가져오기
 */
export const getUserGroups = async (userId) => {
  try {
    // 사용자 정보에서 그룹 ID 목록 가져오기
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: true, groups: [] };
    }

    const userData = userDoc.data();
    const userGroupIds = userData.groups || [];

    if (userGroupIds.length === 0) {
      return { success: true, groups: [] };
    }

    // 각 그룹 정보 가져오기
    const groups = [];
    for (const userGroup of userGroupIds) {
      const groupDoc = await getDoc(doc(db, 'groups', userGroup.groupId));
      if (groupDoc.exists()) {
        groups.push({
          ...groupDoc.data(),
          role: userGroup.role
        });
      }
    }

    // 최신순으로 정렬
    groups.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return { success: true, groups };
  } catch (error) {
    console.error('그룹 목록 조회 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹 정보 가져오기
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
 * 그룹 이름 변경
 */
export const updateGroupName = async (groupId, newName) => {
  try {
    if (!newName.trim()) {
      throw new Error('그룹 이름을 입력해주세요.');
    }

    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      name: newName.trim(),
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('그룹 이름 변경 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹에 멤버 초대 (참여형 그룹)
 */
export const inviteMember = async (groupId, inviteeUsername) => {
  try {
    // 초대할 사용자 찾기
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', inviteeUsername));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('존재하지 않는 사용자입니다.');
    }

    const inviteeDoc = querySnapshot.docs[0];
    const inviteeId = inviteeDoc.id;
    const inviteeData = inviteeDoc.data();

    // 그룹 정보 가져오기
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    const groupData = groupDoc.data();

    // 이미 멤버인지 확인
    if (groupData.members.includes(inviteeId)) {
      throw new Error('이미 그룹에 참여 중인 사용자입니다.');
    }

    // 그룹에 멤버 추가
    await updateDoc(doc(db, 'groups', groupId), {
      members: arrayUnion(inviteeId),
      [`memberNames.${inviteeId}`]: inviteeData.username,
      updatedAt: new Date().toISOString()
    });

    // 사용자의 groups 배열에 추가
    await updateDoc(doc(db, 'users', inviteeId), {
      groups: arrayUnion({
        groupId: groupId,
        role: 'member'
      })
    });

    return { success: true };
  } catch (error) {
    console.error('멤버 초대 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹 탈퇴
 */
export const leaveGroup = async (userId, groupId) => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    const groupData = groupDoc.data();

    // 그룹 생성자는 탈퇴 불가
    if (groupData.creatorId === userId) {
      throw new Error('그룹 생성자는 탈퇴할 수 없습니다. 그룹을 삭제해주세요.');
    }

    // 그룹에서 멤버 제거
    await updateDoc(doc(db, 'groups', groupId), {
      members: arrayRemove(userId),
      [`memberNames.${userId}`]: null,
      updatedAt: new Date().toISOString()
    });

    // 사용자의 groups 배열에서 제거
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const updatedGroups = userData.groups.filter(g => g.groupId !== groupId);
    
    await updateDoc(doc(db, 'users', userId), {
      groups: updatedGroups
    });

    return { success: true };
  } catch (error) {
    console.error('그룹 탈퇴 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹 삭제 (생성자만 가능)
 */
export const deleteGroup = async (userId, groupId) => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    const groupData = groupDoc.data();

    // 생성자만 삭제 가능
    if (groupData.creatorId !== userId) {
      throw new Error('그룹 생성자만 삭제할 수 있습니다.');
    }

    // 모든 멤버의 groups 배열에서 제거
    for (const memberId of groupData.members) {
      const memberDoc = await getDoc(doc(db, 'users', memberId));
      if (memberDoc.exists()) {
        const memberData = memberDoc.data();
        const updatedGroups = memberData.groups.filter(g => g.groupId !== groupId);
        await updateDoc(doc(db, 'users', memberId), {
          groups: updatedGroups
        });
      }
    }

    // 그룹 삭제
    await deleteDoc(doc(db, 'groups', groupId));

    return { success: true };
  } catch (error) {
    console.error('그룹 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹 내 닉네임 변경
 */
export const updateMemberNickname = async (groupId, userId, newNickname) => {
  try {
    if (!newNickname.trim()) {
      throw new Error('닉네임을 입력해주세요.');
    }

    await updateDoc(doc(db, 'groups', groupId), {
      [`memberNames.${userId}`]: newNickname.trim(),
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('닉네임 변경 오류:', error);
    return { success: false, error: error.message };
  }
};
