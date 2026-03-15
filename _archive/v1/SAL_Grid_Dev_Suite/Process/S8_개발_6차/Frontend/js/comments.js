// @task S8F2 — 댓글 대댓글 depth 확장 (3단계)
// Stage: S8 | Area: F | File: js/comments.js
// 댓글 시스템 메인 모듈 (Supabase CRUD, 페이지네이션, 좋아요, 시간 표시)

'use strict';

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
const COMMENTS_PER_PAGE = 10;
const MAX_DEPTH = 3;

// ─────────────────────────────────────────────
// Supabase 클라이언트 (전역 window.supabase 사용)
// ─────────────────────────────────────────────
function getClient() {
  if (!window.supabase) {
    throw new Error('[comments] Supabase client not initialized.');
  }
  return window.supabase;
}

// ─────────────────────────────────────────────
// 시간 표시 유틸
// ─────────────────────────────────────────────
/**
 * ISO 타임스탬프를 "몇 분 전" 형식으로 변환
 * @param {string} isoString
 * @returns {string}
 */
export function formatRelativeTime(isoString) {
  const now = Date.now();
  const past = new Date(isoString).getTime();
  const diffMs = now - past;

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffWeek < 5) return `${diffWeek}주 전`;
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return `${diffYear}년 전`;
}

// ─────────────────────────────────────────────
// 댓글 조회
// ─────────────────────────────────────────────

/**
 * 특정 게시글의 최상위 댓글 목록을 페이지네이션으로 조회
 * @param {string} postId
 * @param {number} page - 1-based
 * @returns {Promise<{ data: Array, totalCount: number }>}
 */
export async function fetchTopLevelComments(postId, page = 1) {
  const supabase = getClient();
  const from = (page - 1) * COMMENTS_PER_PAGE;
  const to = from + COMMENTS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from('comments')
    .select(
      `
      id, post_id, user_id, parent_id, depth, content,
      likes_count, is_edited, created_at, updated_at,
      profiles:user_id (nickname, avatar_url)
    `,
      { count: 'exact' }
    )
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })
    .range(from, to);

  if (error) throw error;
  return { data: data ?? [], totalCount: count ?? 0 };
}

/**
 * 특정 댓글의 자식 댓글 전체를 재귀적으로 조회 (depth <= MAX_DEPTH)
 * @param {string} postId
 * @param {string[]} parentIds
 * @returns {Promise<Array>}
 */
export async function fetchChildComments(postId, parentIds) {
  if (!parentIds || parentIds.length === 0) return [];

  const supabase = getClient();
  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      id, post_id, user_id, parent_id, depth, content,
      likes_count, is_edited, created_at, updated_at,
      profiles:user_id (nickname, avatar_url)
    `
    )
    .eq('post_id', postId)
    .in('parent_id', parentIds)
    .lte('depth', MAX_DEPTH)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * 최상위 댓글과 하위 댓글을 모두 가져와 트리 구조로 조립
 * @param {string} postId
 * @param {number} page
 * @returns {Promise<{ tree: Array, totalCount: number }>}
 */
export async function fetchCommentTree(postId, page = 1) {
  const { data: topLevel, totalCount } = await fetchTopLevelComments(postId, page);

  if (topLevel.length === 0) return { tree: [], totalCount };

  // 재귀적으로 자식 댓글 수집 (depth 1 → 2 → 3)
  let allChildren = [];
  let currentParentIds = topLevel.map((c) => c.id);

  for (let d = 1; d < MAX_DEPTH; d++) {
    const children = await fetchChildComments(postId, currentParentIds);
    if (children.length === 0) break;
    allChildren = allChildren.concat(children);
    currentParentIds = children.map((c) => c.id);
  }

  const tree = buildTree(topLevel, allChildren);
  return { tree, totalCount };
}

/**
 * flat 배열을 parent_id 기준 트리 구조로 변환
 * @param {Array} roots
 * @param {Array} children
 * @returns {Array}
 */
function buildTree(roots, children) {
  const map = {};

  // 루트 등록
  roots.forEach((c) => {
    map[c.id] = { ...c, children: [] };
  });

  // 자식 등록
  children.forEach((c) => {
    map[c.id] = { ...c, children: [] };
  });

  // 트리 연결
  children.forEach((c) => {
    if (map[c.parent_id]) {
      map[c.parent_id].children.push(map[c.id]);
    }
  });

  return roots.map((r) => map[r.id]);
}

// ─────────────────────────────────────────────
// 댓글 작성
// ─────────────────────────────────────────────

/**
 * 댓글 또는 대댓글 작성
 * @param {Object} params
 * @param {string} params.postId
 * @param {string} params.userId
 * @param {string} params.content
 * @param {string|null} params.parentId - null이면 최상위 댓글
 * @param {number} params.parentDepth - 부모의 depth (최상위 시 0)
 * @returns {Promise<Object>} 생성된 댓글
 */
export async function createComment({ postId, userId, content, parentId = null, parentDepth = 0 }) {
  if (!content || content.trim().length === 0) {
    throw new Error('댓글 내용을 입력해주세요.');
  }

  const depth = parentId ? parentDepth + 1 : 0;

  if (depth > MAX_DEPTH) {
    throw new Error(`댓글은 최대 ${MAX_DEPTH}단계까지만 작성할 수 있습니다.`);
  }

  const supabase = getClient();
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      parent_id: parentId,
      depth,
      content: content.trim(),
      likes_count: 0,
      is_edited: false,
    })
    .select(
      `
      id, post_id, user_id, parent_id, depth, content,
      likes_count, is_edited, created_at, updated_at,
      profiles:user_id (nickname, avatar_url)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────
// 댓글 수정
// ─────────────────────────────────────────────

/**
 * 댓글 수정 (본인만 가능 — RLS에서도 강제)
 * @param {string} commentId
 * @param {string} userId
 * @param {string} newContent
 * @returns {Promise<Object>}
 */
export async function updateComment(commentId, userId, newContent) {
  if (!newContent || newContent.trim().length === 0) {
    throw new Error('수정할 내용을 입력해주세요.');
  }

  const supabase = getClient();
  const { data, error } = await supabase
    .from('comments')
    .update({
      content: newContent.trim(),
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('user_id', userId) // 본인 확인 (이중 보호)
    .select(
      `
      id, content, is_edited, updated_at,
      profiles:user_id (nickname, avatar_url)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────
// 댓글 삭제
// ─────────────────────────────────────────────

/**
 * 댓글 삭제 (본인만 가능 — RLS에서도 강제)
 * 자식 댓글이 있는 경우 내용만 "[삭제된 댓글입니다]"로 처리 (soft delete)
 * @param {string} commentId
 * @param {string} userId
 * @param {boolean} hasChildren
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId, userId, hasChildren = false) {
  const supabase = getClient();

  if (hasChildren) {
    // soft delete: 내용 마스킹
    const { error } = await supabase
      .from('comments')
      .update({
        content: '[삭제된 댓글입니다]',
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}

// ─────────────────────────────────────────────
// 좋아요 토글
// ─────────────────────────────────────────────

/**
 * 댓글 좋아요 토글
 * @param {string} commentId
 * @param {string} userId
 * @returns {Promise<{ liked: boolean, likes_count: number }>}
 */
export async function toggleLike(commentId, userId) {
  const supabase = getClient();

  // 기존 좋아요 여부 확인
  const { data: existing, error: fetchError } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  let liked;

  if (existing) {
    // 좋아요 취소
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);
    if (error) throw error;
    liked = false;
  } else {
    // 좋아요 추가
    const { error } = await supabase
      .from('comment_likes')
      .insert({ comment_id: commentId, user_id: userId });
    if (error) throw error;
    liked = true;
  }

  // 최신 likes_count 조회
  const { data: updated, error: countError } = await supabase
    .from('comments')
    .select('likes_count')
    .eq('id', commentId)
    .single();

  if (countError) throw countError;

  return { liked, likes_count: updated.likes_count };
}

// ─────────────────────────────────────────────
// 페이지네이션 헬퍼
// ─────────────────────────────────────────────

/**
 * 총 페이지 수 계산
 * @param {number} totalCount
 * @returns {number}
 */
export function getTotalPages(totalCount) {
  return Math.ceil(totalCount / COMMENTS_PER_PAGE);
}

/**
 * 페이지네이션 상태 객체 생성
 * @param {number} currentPage
 * @param {number} totalCount
 * @returns {{ currentPage: number, totalPages: number, hasPrev: boolean, hasNext: boolean }}
 */
export function buildPaginationState(currentPage, totalCount) {
  const totalPages = getTotalPages(totalCount);
  return {
    currentPage,
    totalPages,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}

// ─────────────────────────────────────────────
// 현재 로그인 사용자 조회 헬퍼
// ─────────────────────────────────────────────

/**
 * 현재 Supabase 세션의 user ID 반환
 * @returns {Promise<string|null>}
 */
export async function getCurrentUserId() {
  const supabase = getClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}
