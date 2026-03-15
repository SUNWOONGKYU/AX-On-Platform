-- =============================================================
--  MAN IN AI 커뮤니티 — 시드 데이터 (모의 데이터 INSERT)
--  AX-On Platform · Supabase / PostgreSQL
--  실제 auth.users 없이 동작하는 더미 프로필 + 게시글 + 댓글
-- =============================================================

-- NOTE: auth.users에 실제 유저가 없으므로 profiles FK를 우회하기 위해
--       임시로 RLS를 비활성화하고 더미 UUID를 직접 삽입합니다.
--       프로덕션에서는 Supabase Auth 가입 후 auth.users 연동 필요.

-- ── 더미 UUID 상수 정의 ──
DO $$
DECLARE
  u_expert1  UUID := '00000000-0000-0000-0000-000000000001';
  u_expert2  UUID := '00000000-0000-0000-0000-000000000002';
  u_company1 UUID := '00000000-0000-0000-0000-000000000003';
  u_company2 UUID := '00000000-0000-0000-0000-000000000004';
  u_general1 UUID := '00000000-0000-0000-0000-000000000005';
  u_general2 UUID := '00000000-0000-0000-0000-000000000006';
  u_general3 UUID := '00000000-0000-0000-0000-000000000007';
  u_general4 UUID := '00000000-0000-0000-0000-000000000008';

  p1 UUID; p2 UUID; p3 UUID; p4 UUID; p5 UUID; p6 UUID;
  c1 UUID; c2 UUID; c3 UUID;
BEGIN

-- ── profiles 삽입 (auth.users FK 우회: auth.users에 더미 row 삽입) ──
-- 실제 환경에서는 Supabase Auth로 생성된 user ID를 사용해야 합니다.
-- 개발/시드 용도로 직접 삽입:

INSERT INTO auth.users (id, email, created_at, updated_at, confirmation_sent_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, aud, role)
VALUES
  (u_expert1,  'expert1@manin.ai',  NOW(), NOW(), NOW(), NOW(), '{}', '{}', FALSE, 'authenticated', 'authenticated'),
  (u_expert2,  'expert2@manin.ai',  NOW(), NOW(), NOW(), NOW(), '{}', '{}', FALSE, 'authenticated', 'authenticated'),
  (u_company1, 'company1@manin.ai', NOW(), NOW(), NOW(), NOW(), '{}', '{}', FALSE, 'authenticated', 'authenticated'),
  (u_company2, 'company2@manin.ai', NOW(), NOW(), NOW(), NOW(), '{}', '{}', FALSE, 'authenticated', 'authenticated'),
  (u_general1, 'user1@manin.ai',    NOW(), NOW(), NOW(), NOW(), '{}', '{}', FALSE, 'authenticated', 'authenticated'),
  (u_general2, 'user2@manin.ai',    NOW(), NOW(), NOW(), NOW(), '{}', '{}', FALSE, 'authenticated', 'authenticated'),
  (u_general3, 'user3@manin.ai',    NOW(), NOW(), NOW(), NOW(), '{}', '{}', FALSE, 'authenticated', 'authenticated'),
  (u_general4, 'user4@manin.ai',    NOW(), NOW(), NOW(), NOW(), '{}', '{}', FALSE, 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- ── profiles 삽입 ──
INSERT INTO profiles (id, username, display_name, role, bio, karma, is_verified) VALUES
  (u_expert1,  'kim_ai_phd',   '김AI박사',   'ai_expert', '금융 데이터 분석 AI 전문가. GPT/Claude 실무 연구 6년차.', 842, TRUE),
  (u_expert2,  'lee_nlp',      '이NLP연구원', 'ai_expert', '자연어처리 박사. LLM 파인튜닝 및 RAG 아키텍처 전문.', 563, TRUE),
  (u_company1, 'startup_han',  '한스타트업',  'company',   'AI 스타트업 CTO. B2B SaaS 개발 중.', 215, FALSE),
  (u_company2, 'axon_corp',    'AX기업팀',   'company',   '대기업 DX 추진팀. 전사 AI 도입 담당.', 189, FALSE),
  (u_general1, 'park_dev',     '박개발자',    'general',   '풀스택 개발자. AI API 활용에 관심 많음.', 94, FALSE),
  (u_general2, 'choi_student', '최학생',      'general',   'AI 공부 중인 대학원생.', 47, FALSE),
  (u_general3, 'jung_marketer','정마케터',    'general',   'AI 마케팅 툴 탐구 중.', 31, FALSE),
  (u_general4, 'yoon_pm',      '윤PM',       'general',   'IT 프로젝트 매니저. AI 도구 도입 검토 중.', 58, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ── 게시글 삽입 ──
INSERT INTO community_posts (id, title, content, category, author_id, upvotes, downvotes, views, comment_count, is_pinned, is_hot, created_at) VALUES

  -- 게시글 1: 전문가 칼럼 (고정 + 인기)
  (gen_random_uuid(),
   'Claude vs GPT-4o 실무 비교 — 6개월 사용 후기',
   E'안녕하세요. 저는 금융 데이터 분석 분야의 AI 전문가로 활동하고 있습니다.\n\n지난 6개월간 GPT-4o와 Claude 3.5 Sonnet을 실무 환경에서 병행 사용한 경험을 공유합니다.\n\n**요약**\n- 코드 생성: Claude 3.5 > GPT-4o (더 긴 컨텍스트, 일관성)\n- 문서 작성: 비슷하지만 Claude가 한국어 자연스러움\n- 데이터 분석: GPT-4o의 Code Interpreter 강점\n- API 비용: Claude가 약 20% 저렴 (실측)\n\n**결론**: 둘 다 사용하되, 코드/분석은 Claude, 멀티모달은 GPT-4o 추천합니다.',
   'expert_column', u_expert1, 142, 3, 2341, 3, TRUE, TRUE,
   NOW() - INTERVAL '2 hours'),

  -- 게시글 2: AX 사례 (인기)
  (gen_random_uuid(),
   '제조업 AI 도입 6개월 성과 — 불량률 23% 감소',
   E'안녕하세요, 저희 회사는 중소 제조업체로 6개월 전 AI 비전 검사 시스템을 도입했습니다.\n\n**도입 전**: 불량 검출 정확도 87%, 검사원 5명 필요\n**도입 후**: 불량 검출 정확도 99.2%, 검사원 2명으로 축소\n\n**비용**: 초기 구축비 8천만원, 월 운영비 120만원\n**ROI**: 6개월 만에 손익분기점 달성\n\n구체적인 도입 프로세스나 벤더 선정 기준이 궁금하신 분은 댓글 주세요.',
   'ax_case', u_company1, 89, 2, 1547, 2, FALSE, TRUE,
   NOW() - INTERVAL '5 hours'),

  -- 게시글 3: AI 활용법
  (gen_random_uuid(),
   'Cursor AI로 생산성 3배 올린 실제 워크플로우 공개',
   E'개발자분들께 실제로 쓰는 Cursor AI 워크플로우를 공유합니다.\n\n**1단계: 컨텍스트 세팅**\n.cursorrules 파일에 프로젝트 구조, 코딩 컨벤션, 금지 패턴 정의\n\n**2단계: 주석 우선 작성**\n// 이 함수는 사용자 권한 체크 후 JWT 발급 → 이후 구현 요청\n\n**3단계: 리뷰 루프**\nAI 코드 → 내가 리뷰 → 수정 요청 → 재생성 (평균 2-3회)\n\n하루 평균 커밋 수: 12개 → 38개로 증가',
   'ai_tips', u_expert2, 67, 5, 892, 1, FALSE, TRUE,
   NOW() - INTERVAL '8 hours'),

  -- 게시글 4: 기업 Q&A
  (gen_random_uuid(),
   '사내 AI 도입 시 개인정보 처리 문제 어떻게 해결하셨나요?',
   E'안녕하세요. 저희 회사에서 전사 AI 어시스턴트 도입을 검토 중인데 개인정보 처리 문제가 걸립니다.\n\n**걱정되는 부분**\n- 고객 데이터가 AI 학습에 사용될 수 있는지\n- 사내 기밀 문서를 AI에 넣어도 되는지\n- 개인정보보호법 준수 방안\n\n이미 도입하신 기업 담당자분들 경험 공유 부탁드립니다.',
   'company_qna', u_company2, 43, 1, 654, 2, FALSE, FALSE,
   NOW() - INTERVAL '12 hours'),

  -- 게시글 5: 자유 토론
  (gen_random_uuid(),
   'AI가 내 직업을 대체할까봐 걱정되시는 분 있나요?',
   E'요즘 AI 뉴스를 보면 점점 불안해집니다.\n\n저는 콘텐츠 마케터인데 ChatGPT가 나온 이후로 주변에서 "AI로 다 되는 거 아니야?"라는 말을 자주 듣습니다.\n\n실제로 AI와 함께 일하면서 "아, 이건 AI가 더 잘 하는구나"싶은 순간이 있었나요? 반대로 "이건 절대 대체 못하겠다"싶은 부분은요?\n\n서로 솔직하게 이야기 나눠봐요.',
   'free', u_general3, 38, 4, 523, 2, FALSE, FALSE,
   NOW() - INTERVAL '18 hours'),

  -- 게시글 6: 채용/협업
  (gen_random_uuid(),
   '[채용] AI 스타트업 풀스택 개발자 모집 — 원격 100%',
   E'안녕하세요, 저희는 기업 AI 자동화 솔루션을 개발하는 초기 스타트업입니다.\n\n**모집 포지션**: 풀스택 개발자 1명\n\n**기술스택**\n- Frontend: React / Next.js\n- Backend: Node.js / Python\n- AI: OpenAI API, LangChain 경험자 우대\n- DB: Supabase / PostgreSQL\n\n**조건**: 풀타임/파트타임 모두 가능, 원격 100%\n**연락**: 댓글 또는 DM 주세요',
   'recruit', u_company1, 21, 1, 445, 1, FALSE, FALSE,
   NOW() - INTERVAL '24 hours')

RETURNING id INTO p1;

-- ── 게시글 ID를 변수에 저장해서 댓글에 연결 ──
-- (RETURNING은 단건만 지원하므로 subquery로 조회)
SELECT id INTO p1 FROM community_posts WHERE title = 'Claude vs GPT-4o 실무 비교 — 6개월 사용 후기' LIMIT 1;
SELECT id INTO p2 FROM community_posts WHERE title = '제조업 AI 도입 6개월 성과 — 불량률 23% 감소' LIMIT 1;
SELECT id INTO p3 FROM community_posts WHERE title = 'AI가 내 직업을 대체할까봐 걱정되시는 분 있나요?' LIMIT 1;

-- ── 댓글 삽입 (게시글 1) ──
INSERT INTO community_comments (id, post_id, parent_id, content, author_id, upvotes, downvotes, depth, created_at)
VALUES
  -- 루트 댓글 1
  (gen_random_uuid(), p1, NULL,
   '정말 유용한 후기 감사합니다! 저희 회사도 비슷한 고민을 하고 있었는데, Claude API 도입을 검토해봐야겠네요.',
   u_company2, 18, 0, 0, NOW() - INTERVAL '1 hour 30 minutes'),
  -- 루트 댓글 2
  (gen_random_uuid(), p1, NULL,
   '코드 생성에서 Claude가 더 낫다는 건 저도 동의해요. 특히 긴 파일 수정할 때 맥락 유지가 확실히 다르더라고요.',
   u_general1, 24, 1, 0, NOW() - INTERVAL '45 minutes');

SELECT id INTO c1 FROM community_comments WHERE post_id = p1 AND depth = 0 ORDER BY created_at ASC LIMIT 1;

-- 답글 (댓글 1의 자식)
INSERT INTO community_comments (id, post_id, parent_id, content, author_id, upvotes, downvotes, depth, created_at)
VALUES
  (gen_random_uuid(), p1, c1,
   '네, 기업용 Claude.ai도 좋습니다. 팀 협업 기능이 특히 편리해요. 도입 전에 테스트 기간을 충분히 가져보시길 권장합니다.',
   u_expert1, 12, 0, 1, NOW() - INTERVAL '1 hour');

SELECT id INTO c2 FROM community_comments WHERE post_id = p1 AND depth = 1 LIMIT 1;

-- 대댓글
INSERT INTO community_comments (id, post_id, parent_id, content, author_id, upvotes, downvotes, depth, created_at)
VALUES
  (gen_random_uuid(), p1, c2,
   '저도 개인적으로 써보고 싶은데 어디서 시작하면 좋을까요?',
   u_general2, 5, 0, 2, NOW() - INTERVAL '30 minutes');

-- ── 댓글 삽입 (게시글 2) ──
INSERT INTO community_comments (id, post_id, parent_id, content, author_id, upvotes, downvotes, depth, created_at)
VALUES
  (gen_random_uuid(), p2, NULL,
   'ROI 6개월 달성은 정말 인상적이네요. 벤더 선정할 때 가장 중요하게 본 기준이 무엇이었나요?',
   u_company2, 11, 0, 0, NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), p2, NULL,
   '저희도 비슷한 도입을 검토 중인데, 초기 구축비 8천만원이 합리적인 수준인지 감이 안 오네요.',
   u_general4, 7, 0, 0, NOW() - INTERVAL '2 hours');

-- ── 댓글 삽입 (게시글 5: 자유토론) ──
INSERT INTO community_comments (id, post_id, parent_id, content, author_id, upvotes, downvotes, depth, created_at)
VALUES
  (gen_random_uuid(), p3, NULL,
   '저도 마케터인데 솔직히 반복적인 카피라이팅은 이미 AI가 더 잘해요. 대신 브랜드 방향성 설정이나 고객 인사이트 발굴은 아직 사람이 필요하다고 느껴요.',
   u_general1, 15, 0, 0, NOW() - INTERVAL '16 hours'),
  (gen_random_uuid(), p3, NULL,
   'AI 도구를 잘 쓰는 사람이 못 쓰는 사람을 대체하는 시대가 오고 있는 것 같아요. 직업 자체보다 역량의 문제가 클 듯.',
   u_expert2, 22, 1, 0, NOW() - INTERVAL '14 hours');

-- ── comment_count 정합성 갱신 ──
UPDATE community_posts p
SET comment_count = (
  SELECT COUNT(*) FROM community_comments c
  WHERE c.post_id = p.id AND c.is_deleted = FALSE
);

END $$;
