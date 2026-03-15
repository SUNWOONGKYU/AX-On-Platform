// @task S6F5 — 투표 부분 렌더링 최적화
// @area F | @stage S6

/**
 * 커뮤니티 투표 부분 렌더링 최적화 모듈
 * 투표 시 전체 피드 재렌더링 대신 해당 카드만 업데이트
 */

(function() {
  'use strict';

  /**
   * 특정 게시글의 투표 수만 업데이트 (부분 렌더링)
   * @param {string} postId - 게시글 ID
   * @param {number} upCount - 추천 수
   * @param {number} downCount - 비추천 수
   * @param {string|null} userVote - 사용자 투표 상태 ('up', 'down', null)
   */
  function updatePostVote(postId, upCount, downCount, userVote) {
    var card = document.querySelector('[data-post-id="' + postId + '"]');
    if (!card) return;

    // 투표 수 업데이트
    var upEl = card.querySelector('.vote-up-count, [data-vote-up]');
    var downEl = card.querySelector('.vote-down-count, [data-vote-down]');
    var totalEl = card.querySelector('.vote-total, [data-vote-total]');

    if (upEl) upEl.textContent = String(upCount || 0);
    if (downEl) downEl.textContent = String(downCount || 0);
    if (totalEl) totalEl.textContent = String((upCount || 0) - (downCount || 0));

    // 투표 버튼 상태 업데이트
    var upBtn = card.querySelector('.vote-up-btn, [data-vote="up"]');
    var downBtn = card.querySelector('.vote-down-btn, [data-vote="down"]');

    if (upBtn) {
      upBtn.classList.toggle('active', userVote === 'up');
      upBtn.style.color = userVote === 'up' ? '#6c5ce7' : '';
    }
    if (downBtn) {
      downBtn.classList.toggle('active', userVote === 'down');
      downBtn.style.color = userVote === 'down' ? '#e74c3c' : '';
    }
  }

  /**
   * 투표 처리 (서버 호출 + 부분 렌더링)
   * @param {string} postId - 게시글 ID
   * @param {string} voteType - 'up' 또는 'down'
   */
  async function handleVote(postId, voteType) {
    if (typeof supabase === 'undefined') return;

    try {
      var userData = await supabase.auth.getUser();
      var user = userData.data && userData.data.user;
      if (!user) {
        alert('로그인 후 투표할 수 있습니다.');
        return;
      }

      // 기존 투표 확인
      var existingResult = await supabase
        .from('post_votes')
        .select('id, vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      var existingVote = existingResult.data;
      var newUserVote = null;

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // 같은 투표 → 취소
          await supabase.from('post_votes').delete().eq('id', existingVote.id);
          newUserVote = null;
        } else {
          // 다른 투표 → 변경
          await supabase.from('post_votes').update({ vote_type: voteType }).eq('id', existingVote.id);
          newUserVote = voteType;
        }
      } else {
        // 새 투표
        await supabase.from('post_votes').insert({
          post_id: postId,
          user_id: user.id,
          vote_type: voteType
        });
        newUserVote = voteType;
      }

      // 현재 투표 수 조회
      var upResult = await supabase
        .from('post_votes')
        .select('id', { count: 'exact' })
        .eq('post_id', postId)
        .eq('vote_type', 'up');

      var downResult = await supabase
        .from('post_votes')
        .select('id', { count: 'exact' })
        .eq('post_id', postId)
        .eq('vote_type', 'down');

      var upCount = upResult.count || 0;
      var downCount = downResult.count || 0;

      // 부분 렌더링 (전체 피드 재렌더링 없음)
      updatePostVote(postId, upCount, downCount, newUserVote);

    } catch (err) {
      console.error('투표 처리 오류:', err);
    }
  }

  /**
   * 투표 이벤트 위임 등록
   * 피드 컨테이너에 한 번만 등록하여 동적 요소도 처리
   */
  function initVoteListeners() {
    var feedContainer = document.querySelector('.feed-container, .community-feed, #feed-list, .post-list');
    if (!feedContainer) return;

    feedContainer.addEventListener('click', function(e) {
      var voteBtn = e.target.closest('[data-vote]');
      if (!voteBtn) {
        voteBtn = e.target.closest('.vote-up-btn, .vote-down-btn');
      }
      if (!voteBtn) return;

      e.preventDefault();
      e.stopPropagation();

      var postCard = voteBtn.closest('[data-post-id]');
      if (!postCard) return;

      var postId = postCard.getAttribute('data-post-id');
      var voteType = voteBtn.getAttribute('data-vote') ||
                     (voteBtn.classList.contains('vote-up-btn') ? 'up' : 'down');

      handleVote(postId, voteType);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initVoteListeners();
  });

  // 전역 노출
  window.CommunityVote = {
    handleVote: handleVote,
    updatePostVote: updatePostVote,
    init: initVoteListeners
  };
})();
