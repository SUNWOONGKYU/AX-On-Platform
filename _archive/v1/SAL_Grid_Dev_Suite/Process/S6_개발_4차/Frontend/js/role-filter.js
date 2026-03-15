// @task S6F6 — 역할 필터 서버사이드 처리
// @area F | @stage S6

/**
 * 역할(Role) 필터링을 서버사이드(Supabase RPC)로 처리하는 모듈
 * 클라이언트 필터링 대신 서버 쿼리 사용으로 성능 최적화
 */

(function() {
  'use strict';

  var PAGE_SIZE = 20;

  /**
   * 서버사이드 역할 필터로 전문가 목록 조회
   * @param {string} role - 필터할 역할 (빈 문자열이면 전체)
   * @param {number} page - 페이지 번호 (0부터)
   * @returns {Promise<Array>}
   */
  async function getExpertsByRole(role, page) {
    if (typeof supabase === 'undefined') return [];
    page = page || 0;

    try {
      var query = supabase
        .from('experts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (role && role !== 'all' && role !== '') {
        query = query.eq('specialty', role);
      }

      var result = await query;
      if (result.error) throw result.error;

      return {
        data: result.data || [],
        count: result.count || 0,
        page: page,
        totalPages: Math.ceil((result.count || 0) / PAGE_SIZE)
      };
    } catch (err) {
      console.error('전문가 필터 오류:', err);
      return { data: [], count: 0, page: 0, totalPages: 0 };
    }
  }

  /**
   * 서버사이드 역할 필터로 커뮤니티 게시글 조회
   * @param {string} role - 필터할 역할 (빈 문자열이면 전체)
   * @param {number} page - 페이지 번호 (0부터)
   * @returns {Promise<Array>}
   */
  async function getPostsByRole(role, page) {
    if (typeof supabase === 'undefined') return [];
    page = page || 0;

    try {
      var query = supabase
        .from('community_posts')
        .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (role && role !== 'all' && role !== '') {
        query = query.eq('category', role);
      }

      var result = await query;
      if (result.error) throw result.error;

      return {
        data: result.data || [],
        count: result.count || 0,
        page: page,
        totalPages: Math.ceil((result.count || 0) / PAGE_SIZE)
      };
    } catch (err) {
      console.error('게시글 필터 오류:', err);
      return { data: [], count: 0, page: 0, totalPages: 0 };
    }
  }

  /**
   * 필터 변경 이벤트 바인딩
   * select/button 요소의 변경 시 서버사이드 필터 호출
   */
  function initRoleFilter() {
    // 전문가 페이지 필터
    var expertFilter = document.querySelector('#expert-role-filter, [data-filter="expert-role"]');
    if (expertFilter) {
      expertFilter.addEventListener('change', function() {
        var role = this.value;
        getExpertsByRole(role, 0).then(function(result) {
          if (typeof window.renderExperts === 'function') {
            window.renderExperts(result.data, result);
          }
        });
      });
    }

    // 커뮤니티 페이지 필터
    var communityFilter = document.querySelector('#community-role-filter, [data-filter="community-role"]');
    if (communityFilter) {
      communityFilter.addEventListener('change', function() {
        var role = this.value;
        getPostsByRole(role, 0).then(function(result) {
          if (typeof window.renderFeed === 'function') {
            window.renderFeed(result.data, result);
          }
        });
      });
    }

    // 탭 버튼 방식 필터
    document.querySelectorAll('[data-role-filter]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var role = this.getAttribute('data-role-filter');
        var target = this.getAttribute('data-filter-target') || 'community';

        // 활성 탭 스타일
        this.parentElement.querySelectorAll('[data-role-filter]').forEach(function(b) {
          b.classList.remove('active');
          b.style.fontWeight = '';
          b.style.color = '';
        });
        this.classList.add('active');
        this.style.fontWeight = '700';
        this.style.color = '#6c5ce7';

        if (target === 'expert') {
          getExpertsByRole(role, 0).then(function(result) {
            if (typeof window.renderExperts === 'function') {
              window.renderExperts(result.data, result);
            }
          });
        } else {
          getPostsByRole(role, 0).then(function(result) {
            if (typeof window.renderFeed === 'function') {
              window.renderFeed(result.data, result);
            }
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initRoleFilter();
  });

  // 전역 노출
  window.RoleFilter = {
    getExpertsByRole: getExpertsByRole,
    getPostsByRole: getPostsByRole,
    init: initRoleFilter,
    PAGE_SIZE: PAGE_SIZE
  };
})();
