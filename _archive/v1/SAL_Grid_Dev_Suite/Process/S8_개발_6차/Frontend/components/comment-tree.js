// @task S8F2 — 댓글 대댓글 depth 확장 (3단계)
// Stage: S8 | Area: F | File: components/comment-tree.js
// 트리 구조 렌더링 컴포넌트 (재귀적, 최대 3 depth, 접기/펼치기, 좋아요, 수정/삭제)

'use strict';

import {
  createComment,
  updateComment,
  deleteComment,
  toggleLike,
  formatRelativeTime,
  getCurrentUserId,
} from '../js/comments.js';

const MAX_DEPTH = 3;

// ─────────────────────────────────────────────
// depth별 보더 색상 (CSS 변수와 동기화)
// ─────────────────────────────────────────────
const DEPTH_BORDER_COLORS = ['#6c5ce7', '#a29bfe', '#dddddd'];

// ─────────────────────────────────────────────
// 공개 API
// ─────────────────────────────────────────────

/**
 * 댓글 트리 전체를 컨테이너 엘리먼트에 렌더링
 * @param {HTMLElement} container
 * @param {Array} tree - buildTree()가 반환한 트리 배열
 * @param {string|null} currentUserId
 * @param {Function} onMutate - 댓글 변경(작성/수정/삭제) 후 호출되는 콜백
 */
export function renderCommentTree(container, tree, currentUserId, onMutate) {
  container.innerHTML = '';

  if (!tree || tree.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'comment-empty';
    empty.textContent = '아직 댓글이 없습니다. 첫 댓글을 남겨보세요!';
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'comment-list';

  tree.forEach((comment) => {
    const item = createCommentItem(comment, 0, currentUserId, onMutate);
    list.appendChild(item);
  });

  container.appendChild(list);
}

// ─────────────────────────────────────────────
// 댓글 아이템 생성 (재귀)
// ─────────────────────────────────────────────

/**
 * 단일 댓글 <li> 엘리먼트 생성 (자식 포함 재귀)
 * @param {Object} comment
 * @param {number} depth - 현재 렌더링 depth (0-based)
 * @param {string|null} currentUserId
 * @param {Function} onMutate
 * @returns {HTMLLIElement}
 */
function createCommentItem(comment, depth, currentUserId, onMutate) {
  const li = document.createElement('li');
  li.className = `comment-item comment-depth-${depth}`;
  li.dataset.commentId = comment.id;
  li.style.marginLeft = `${depth * 20}px`;

  if (depth > 0) {
    li.style.borderLeft = `3px solid ${DEPTH_BORDER_COLORS[Math.min(depth - 1, 2)]}`;
    li.style.paddingLeft = '12px';
  }

  // 페이드인 애니메이션 클래스
  li.classList.add('comment-fade-in');

  // 댓글 카드
  const card = buildCommentCard(comment, depth, currentUserId, onMutate, li);
  li.appendChild(card);

  // 자식 댓글 재귀 렌더링
  if (comment.children && comment.children.length > 0 && depth < MAX_DEPTH) {
    const childList = document.createElement('ul');
    childList.className = 'comment-list comment-children';
    childList.dataset.parentId = comment.id;

    comment.children.forEach((child) => {
      const childItem = createCommentItem(child, depth + 1, currentUserId, onMutate);
      childList.appendChild(childItem);
    });

    li.appendChild(childList);

    // 접기/펼치기 토글 버튼
    if (comment.children.length > 0) {
      const toggleBtn = buildToggleButton(childList);
      card.querySelector('.comment-meta')?.appendChild(toggleBtn);
    }
  }

  return li;
}

// ─────────────────────────────────────────────
// 댓글 카드 빌더
// ─────────────────────────────────────────────

function buildCommentCard(comment, depth, currentUserId, onMutate, li) {
  const card = document.createElement('div');
  card.className = 'comment-card';

  const isOwner = currentUserId && comment.user_id === currentUserId;
  const isDeleted = comment.content === '[삭제된 댓글입니다]';
  const nickname = comment.profiles?.nickname ?? '익명';
  const avatarUrl = comment.profiles?.avatar_url ?? null;
  const hasChildren = comment.children && comment.children.length > 0;

  // ── 헤더 (아바타 + 닉네임 + 시간)
  const header = document.createElement('div');
  header.className = 'comment-header';

  const avatar = buildAvatar(avatarUrl, nickname);
  header.appendChild(avatar);

  const meta = document.createElement('div');
  meta.className = 'comment-meta';

  const nicknameEl = document.createElement('span');
  nicknameEl.className = 'comment-nickname';
  nicknameEl.textContent = nickname;
  meta.appendChild(nicknameEl);

  const timeEl = document.createElement('span');
  timeEl.className = 'comment-time';
  timeEl.title = new Date(comment.created_at).toLocaleString('ko-KR');
  timeEl.textContent = formatRelativeTime(comment.created_at);
  if (comment.is_edited) {
    const editedBadge = document.createElement('span');
    editedBadge.className = 'comment-edited-badge';
    editedBadge.textContent = '(수정됨)';
    meta.appendChild(editedBadge);
  }
  meta.appendChild(timeEl);

  header.appendChild(meta);
  card.appendChild(header);

  // ── 본문
  const body = document.createElement('div');
  body.className = isDeleted ? 'comment-body comment-deleted' : 'comment-body';
  body.textContent = comment.content;
  card.appendChild(body);

  if (!isDeleted) {
    // ── 액션 바 (좋아요, 답글, 수정, 삭제)
    const actions = document.createElement('div');
    actions.className = 'comment-actions';

    // 좋아요 버튼
    const likeBtn = buildLikeButton(comment, currentUserId, onMutate);
    actions.appendChild(likeBtn);

    // 답글 버튼 (depth < MAX_DEPTH 일 때만)
    if (depth < MAX_DEPTH && currentUserId) {
      const replyBtn = buildReplyButton(comment, depth, currentUserId, onMutate, li);
      actions.appendChild(replyBtn);
    }

    // 수정/삭제 (본인만)
    if (isOwner) {
      const editBtn = buildEditButton(comment, body, onMutate);
      const deleteBtn = buildDeleteButton(comment, currentUserId, hasChildren, li, onMutate);
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
    }

    card.appendChild(actions);
  }

  return card;
}

// ─────────────────────────────────────────────
// 아바타
// ─────────────────────────────────────────────

function buildAvatar(avatarUrl, nickname) {
  const wrapper = document.createElement('div');
  wrapper.className = 'comment-avatar';

  if (avatarUrl) {
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = nickname;
    img.onerror = () => {
      img.replaceWith(buildInitialAvatar(nickname));
    };
    wrapper.appendChild(img);
  } else {
    wrapper.appendChild(buildInitialAvatar(nickname));
  }

  return wrapper;
}

function buildInitialAvatar(nickname) {
  const span = document.createElement('span');
  span.className = 'comment-avatar-initial';
  span.textContent = nickname.charAt(0).toUpperCase();
  return span;
}

// ─────────────────────────────────────────────
// 접기/펼치기 토글
// ─────────────────────────────────────────────

function buildToggleButton(childList) {
  const btn = document.createElement('button');
  btn.className = 'comment-toggle-btn';
  btn.setAttribute('aria-expanded', 'true');
  btn.textContent = `답글 ${childList.children.length}개 접기`;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    childList.style.display = expanded ? 'none' : '';
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.textContent = expanded
      ? `답글 ${childList.children.length}개 펼치기`
      : `답글 ${childList.children.length}개 접기`;
  });

  return btn;
}

// ─────────────────────────────────────────────
// 좋아요 버튼
// ─────────────────────────────────────────────

function buildLikeButton(comment, currentUserId, onMutate) {
  const btn = document.createElement('button');
  btn.className = 'comment-like-btn';
  btn.dataset.commentId = comment.id;

  const iconSpan = document.createElement('span');
  iconSpan.className = 'like-icon';
  iconSpan.textContent = '♥';

  const countSpan = document.createElement('span');
  countSpan.className = 'like-count';
  countSpan.textContent = comment.likes_count ?? 0;

  btn.appendChild(iconSpan);
  btn.appendChild(countSpan);

  if (!currentUserId) {
    btn.disabled = true;
    btn.title = '로그인 후 좋아요를 누를 수 있습니다.';
  } else {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const { liked, likes_count } = await toggleLike(comment.id, currentUserId);
        countSpan.textContent = likes_count;
        btn.classList.toggle('liked', liked);
      } catch (err) {
        console.error('[comment-tree] 좋아요 오류:', err);
      } finally {
        btn.disabled = false;
      }
    });
  }

  return btn;
}

// ─────────────────────────────────────────────
// 답글 버튼 + 인라인 입력폼
// ─────────────────────────────────────────────

function buildReplyButton(comment, depth, currentUserId, onMutate, li) {
  const btn = document.createElement('button');
  btn.className = 'comment-reply-btn';
  btn.textContent = '답글';

  let formVisible = false;
  let replyForm = null;

  btn.addEventListener('click', () => {
    if (formVisible) {
      replyForm?.remove();
      formVisible = false;
      btn.textContent = '답글';
      return;
    }

    replyForm = buildInlineForm({
      placeholder: '답글을 입력하세요...',
      onSubmit: async (content) => {
        try {
          const newComment = await createComment({
            postId: comment.post_id,
            userId: currentUserId,
            content,
            parentId: comment.id,
            parentDepth: depth,
          });
          replyForm.remove();
          formVisible = false;
          btn.textContent = '답글';
          onMutate?.('create', newComment);
        } catch (err) {
          showFormError(replyForm, err.message);
        }
      },
      onCancel: () => {
        replyForm?.remove();
        formVisible = false;
        btn.textContent = '답글';
      },
    });

    li.appendChild(replyForm);
    formVisible = true;
    btn.textContent = '취소';
    replyForm.querySelector('textarea')?.focus();
  });

  return btn;
}

// ─────────────────────────────────────────────
// 수정 버튼
// ─────────────────────────────────────────────

function buildEditButton(comment, bodyEl, onMutate) {
  const btn = document.createElement('button');
  btn.className = 'comment-edit-btn';
  btn.textContent = '수정';

  btn.addEventListener('click', async () => {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) return;

    const originalText = bodyEl.textContent;
    bodyEl.innerHTML = '';

    const textarea = document.createElement('textarea');
    textarea.className = 'comment-edit-textarea';
    textarea.value = originalText;
    bodyEl.appendChild(textarea);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'comment-save-btn';
    saveBtn.textContent = '저장';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'comment-cancel-btn';
    cancelBtn.textContent = '취소';

    const btnRow = document.createElement('div');
    btnRow.className = 'comment-edit-actions';
    btnRow.appendChild(saveBtn);
    btnRow.appendChild(cancelBtn);
    bodyEl.appendChild(btnRow);

    textarea.focus();

    saveBtn.addEventListener('click', async () => {
      try {
        const updated = await updateComment(comment.id, currentUserId, textarea.value);
        bodyEl.innerHTML = '';
        bodyEl.textContent = updated.content;
        onMutate?.('update', updated);
      } catch (err) {
        alert(err.message);
      }
    });

    cancelBtn.addEventListener('click', () => {
      bodyEl.innerHTML = '';
      bodyEl.textContent = originalText;
    });
  });

  return btn;
}

// ─────────────────────────────────────────────
// 삭제 버튼
// ─────────────────────────────────────────────

function buildDeleteButton(comment, currentUserId, hasChildren, li, onMutate) {
  const btn = document.createElement('button');
  btn.className = 'comment-delete-btn';
  btn.textContent = '삭제';

  btn.addEventListener('click', async () => {
    const confirmed = window.confirm(
      hasChildren
        ? '하위 댓글이 있어 내용만 삭제됩니다. 계속할까요?'
        : '댓글을 삭제할까요?'
    );
    if (!confirmed) return;

    try {
      await deleteComment(comment.id, currentUserId, hasChildren);
      if (hasChildren) {
        const bodyEl = li.querySelector('.comment-body');
        if (bodyEl) {
          bodyEl.textContent = '[삭제된 댓글입니다]';
          bodyEl.classList.add('comment-deleted');
        }
        onMutate?.('soft-delete', { id: comment.id });
      } else {
        li.remove();
        onMutate?.('delete', { id: comment.id });
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다: ' + err.message);
    }
  });

  return btn;
}

// ─────────────────────────────────────────────
// 인라인 입력폼 (공통)
// ─────────────────────────────────────────────

function buildInlineForm({ placeholder, onSubmit, onCancel }) {
  const form = document.createElement('div');
  form.className = 'comment-inline-form';

  const textarea = document.createElement('textarea');
  textarea.className = 'comment-textarea';
  textarea.placeholder = placeholder;
  textarea.rows = 3;
  form.appendChild(textarea);

  const btnRow = document.createElement('div');
  btnRow.className = 'comment-form-actions';

  const submitBtn = document.createElement('button');
  submitBtn.className = 'comment-submit-btn';
  submitBtn.textContent = '등록';
  submitBtn.addEventListener('click', () => {
    onSubmit(textarea.value);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'comment-cancel-btn';
  cancelBtn.textContent = '취소';
  cancelBtn.addEventListener('click', onCancel);

  btnRow.appendChild(submitBtn);
  btnRow.appendChild(cancelBtn);
  form.appendChild(btnRow);

  return form;
}

function showFormError(formEl, message) {
  let errEl = formEl.querySelector('.comment-form-error');
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.className = 'comment-form-error';
    formEl.appendChild(errEl);
  }
  errEl.textContent = message;
}

// ─────────────────────────────────────────────
// 최상위 댓글 작성 폼 렌더링
// ─────────────────────────────────────────────

/**
 * 게시글 상단 최상위 댓글 작성 폼을 컨테이너에 렌더링
 * @param {HTMLElement} container
 * @param {string} postId
 * @param {string|null} currentUserId
 * @param {Function} onMutate
 */
export function renderTopLevelForm(container, postId, currentUserId, onMutate) {
  container.innerHTML = '';

  if (!currentUserId) {
    const msg = document.createElement('p');
    msg.className = 'comment-login-notice';
    msg.textContent = '댓글을 작성하려면 로그인이 필요합니다.';
    container.appendChild(msg);
    return;
  }

  const form = buildInlineForm({
    placeholder: '댓글을 입력하세요...',
    onSubmit: async (content) => {
      try {
        const newComment = await createComment({
          postId,
          userId: currentUserId,
          content,
          parentId: null,
          parentDepth: 0,
        });
        form.querySelector('textarea').value = '';
        onMutate?.('create', newComment);
      } catch (err) {
        showFormError(form, err.message);
      }
    },
    onCancel: () => {
      form.querySelector('textarea').value = '';
    },
  });

  // 최상위 폼은 취소 버튼 불필요 → 내용 지우기로 대체
  const cancelBtn = form.querySelector('.comment-cancel-btn');
  if (cancelBtn) {
    cancelBtn.textContent = '초기화';
  }

  container.appendChild(form);
}

// ─────────────────────────────────────────────
// 페이지네이션 렌더링
// ─────────────────────────────────────────────

/**
 * 페이지네이션 UI를 컨테이너에 렌더링
 * @param {HTMLElement} container
 * @param {{ currentPage: number, totalPages: number, hasPrev: boolean, hasNext: boolean }} state
 * @param {Function} onPageChange - (page: number) => void
 */
export function renderPagination(container, state, onPageChange) {
  container.innerHTML = '';

  if (state.totalPages <= 1) return;

  const nav = document.createElement('nav');
  nav.className = 'comment-pagination';
  nav.setAttribute('aria-label', '댓글 페이지');

  // 이전 버튼
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn pagination-prev';
  prevBtn.textContent = '이전';
  prevBtn.disabled = !state.hasPrev;
  prevBtn.addEventListener('click', () => onPageChange(state.currentPage - 1));
  nav.appendChild(prevBtn);

  // 페이지 번호
  for (let i = 1; i <= state.totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-btn pagination-page${i === state.currentPage ? ' active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.disabled = i === state.currentPage;
    pageBtn.addEventListener('click', () => onPageChange(i));
    nav.appendChild(pageBtn);
  }

  // 다음 버튼
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn pagination-next';
  nextBtn.textContent = '다음';
  nextBtn.disabled = !state.hasNext;
  nextBtn.addEventListener('click', () => onPageChange(state.currentPage + 1));
  nav.appendChild(nextBtn);

  container.appendChild(nav);
}
