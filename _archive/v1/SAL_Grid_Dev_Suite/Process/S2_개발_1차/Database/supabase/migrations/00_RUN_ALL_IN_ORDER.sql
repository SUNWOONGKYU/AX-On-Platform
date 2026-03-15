-- =============================================================
--  AX-On Platform — 전체 마이그레이션 통합 SQL (멱등성 보장)
--  Supabase Dashboard > SQL Editor에서 한 번에 실행
--  기존 정책/트리거가 있어도 에러 없이 재실행 가능
-- =============================================================

-- ════════════════════════════════════════════
-- 0. 공통 ENUM 타입
-- ════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ai_expert', 'company', 'general');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE post_category AS ENUM (
    'free', 'ax_case', 'ai_tips', 'expert_column', 'company_qna', 'recruit'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ════════════════════════════════════════════
-- 1. experts 테이블
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.experts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  title text NOT NULL,
  industry text[] NOT NULL DEFAULT '{}',
  functions text[] NOT NULL DEFAULT '{}',
  bio text,
  photo_url text,
  website_url text,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_only" ON public.experts;
CREATE POLICY "anon_select_only" ON public.experts
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "auth_insert" ON public.experts;
CREATE POLICY "auth_insert" ON public.experts
  FOR INSERT TO authenticated WITH CHECK (true);


-- ════════════════════════════════════════════
-- 2. expert_categories 테이블
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.expert_categories (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('industry', 'function')),
  label text NOT NULL,
  icon text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.expert_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON public.expert_categories;
CREATE POLICY "anon_select_categories" ON public.expert_categories
  FOR SELECT TO anon USING (true);


-- ════════════════════════════════════════════
-- 3. expert_categories 시드
-- ════════════════════════════════════════════

INSERT INTO public.expert_categories (id, type, label, icon, sort_order) VALUES
('manufacturing', 'industry', '제조업',           '🏭', 1),
('finance',       'industry', '금융·핀테크',       '🏦', 2),
('healthcare',    'industry', '의료·헬스케어',     '🏥', 3),
('retail',        'industry', '유통·커머스',       '🛒', 4),
('construction',  'industry', '건설·부동산',       '🏗️', 5),
('education',     'industry', '교육',             '📚', 6),
('media',         'industry', '미디어·콘텐츠',     '🎬', 7),
('energy',        'industry', '에너지·환경',       '⚡', 8),
('logistics',     'industry', '물류·운송',         '🚚', 9),
('agriculture',   'industry', '농업·식품',         '🌾', 10),
('proptech',      'industry', '부동산(PropTech)',  '🏠', 11),
('hospitality',   'industry', '관광·호텔·외식',    '🏨', 12),
('legal',         'industry', '법률·법무서비스',   '⚖️', 13),
('public',        'industry', '공공·사회서비스',   '🏛️', 14),
('FN', 'function', '경영·재무',          '💰', 1),
('MK', 'function', '마케팅·영업',        '📈', 2),
('OP', 'function', '운영·관리',          '⚙️', 3),
('HR', 'function', '인사',              '👥', 4),
('IT', 'function', 'IT·보안',           '🔐', 5),
('SF', 'function', '전략·재무',          '💼', 6),
('PO', 'function', '생산·운영',          '🏭', 7),
('SM', 'function', '영업·마케팅',        '📊', 8),
('MS', 'function', '경영·전략',          '🎯', 9),
('FA', 'function', '재무·감사',          '📋', 10),
('MO', 'function', '제조·운영',          '🏭', 11),
('FI', 'function', '금융·투자',          '💹', 12),
('LC', 'function', '법무·컴플라이언스',  '⚖️', 13),
('AO', 'function', 'AI 오케스트레이터', '🤖', 14),
('RD', 'function', '연구·개발',          '🔬', 15)
ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════
-- 4. experts 시드 데이터
-- ════════════════════════════════════════════

INSERT INTO public.experts (name, title, industry, functions, bio, photo_url, website_url, email)
SELECT * FROM (VALUES
('김민준', '스마트팩토리 AI 전환 12년, 제조업 디지털화 전문가',
 ARRAY['manufacturing','energy'], ARRAY['MO','IT'],
 '삼성전자 스마트팩토리팀 출신으로 제조 현장 AI 전환 프로젝트를 12년간 수행했습니다.',
 NULL::text, NULL::text, 'minjun.kim@axon-expert.kr'),
('이서연', '핀테크 AI 신용 분석 및 초개인화 마케팅 전략가',
 ARRAY['finance','retail'], ARRAY['FI','MK'],
 '카카오뱅크·네이버파이낸셜 출신으로 AI 기반 신용 평가 및 개인화 금융 서비스 전문가입니다.',
 NULL, NULL, 'seoyeon.lee@axon-expert.kr'),
('박준호', '의료 AI 영상 진단·임상 데이터 분석 전문가',
 ARRAY['healthcare'], ARRAY['RD','IT'],
 '서울아산병원 의료AI팀 출신으로 CT·MRI 영상 판독 AI 모델 개발 및 임상 검증 전문가입니다.',
 NULL, NULL, 'junho.park@axon-expert.kr'),
('최지영', 'AI 기반 교육 혁신 및 공공 서비스 자동화 전문가',
 ARRAY['education','public'], ARRAY['AO','HR'],
 '교육부 디지털교육팀 및 EBS 출신으로 AI 튜터 시스템 설계 및 공공 행정 자동화 경험을 보유합니다.',
 NULL, NULL, 'jiyoung.choi@axon-expert.kr'),
('윤재원', '물류 최적화·공급망 AI 예측 모델 구현 전문가',
 ARRAY['logistics','retail'], ARRAY['OP','PO'],
 'CJ대한통운·쿠팡 출신으로 물류 네트워크 최적화 및 수요 예측 AI 시스템 구축 전문가입니다.',
 NULL, NULL, 'jaewon.yoon@axon-expert.kr'),
('정은지', 'AI 콘텐츠 생성·미디어 개인화 추천 전략가',
 ARRAY['media','retail'], ARRAY['MK','SM'],
 'JTBC·왓챠 출신으로 AI 기반 콘텐츠 추천 알고리즘 및 생성형 AI 마케팅 캠페인 전문가입니다.',
 NULL, NULL, 'eunji.jung@axon-expert.kr'),
('한동훈', '건설·부동산 AI 가치평가 및 리스크 예측 전문가',
 ARRAY['construction','proptech'], ARRAY['MS','FA'],
 '현대건설·직방 출신으로 부동산 AI 가격 예측 모델 및 건설 현장 안전 AI 솔루션 개발 전문가입니다.',
 NULL, NULL, 'donghoon.han@axon-expert.kr'),
('오소현', '법률 AI 계약서 분석·컴플라이언스 자동화 전문가',
 ARRAY['legal','finance'], ARRAY['LC','AO'],
 '김앤장 법률사무소·LG그룹 법무팀 출신으로 AI 계약 리뷰 시스템 및 규제 자동 모니터링 전문가입니다.',
 NULL, NULL, 'sohyun.oh@axon-expert.kr')
) AS v(name, title, industry, functions, bio, photo_url, website_url, email)
WHERE NOT EXISTS (SELECT 1 FROM public.experts WHERE experts.email = v.email);


-- ════════════════════════════════════════════
-- 5. users_profiles 테이블 (로그인/회원가입용)
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.users_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  nickname    text NOT NULL,
  role        user_role NOT NULL DEFAULT 'general',
  bio         text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_profiles_role ON public.users_profiles (role);
CREATE INDEX IF NOT EXISTS idx_users_profiles_nickname ON public.users_profiles (nickname);

ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_profiles_select_own" ON public.users_profiles;
CREATE POLICY "users_profiles_select_own" ON public.users_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_profiles_update_own" ON public.users_profiles;
CREATE POLICY "users_profiles_update_own" ON public.users_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_profiles_insert_own" ON public.users_profiles;
CREATE POLICY "users_profiles_insert_own" ON public.users_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ════════════════════════════════════════════
-- 6. 커뮤니티 테이블
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  role         user_role NOT NULL DEFAULT 'general',
  bio          TEXT,
  avatar_url   TEXT,
  karma        INTEGER DEFAULT 0,
  is_verified  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(500) NOT NULL,
  content       TEXT NOT NULL,
  category      post_category NOT NULL DEFAULT 'free',
  author_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  upvotes       INTEGER DEFAULT 0,
  downvotes     INTEGER DEFAULT 0,
  views         INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned     BOOLEAN DEFAULT FALSE,
  is_hot        BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_votes (
  post_id    UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote       SMALLINT NOT NULL CHECK (vote IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  author_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  upvotes    INTEGER DEFAULT 0,
  downvotes  INTEGER DEFAULT 0,
  depth      INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comment_votes (
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote       SMALLINT NOT NULL CHECK (vote IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_community_posts_category    ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_author      ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created     ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post     ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent   ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created  ON community_comments(created_at ASC);

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_updated_at ON community_posts;
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_comments_updated_at ON community_comments;
CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 트리거: comment_count 자동 증감
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comment_count ON community_comments;
CREATE TRIGGER trg_comment_count
  AFTER INSERT OR DELETE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- RLS
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes      ENABLE ROW LEVEL SECURITY;

-- profiles RLS
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- community_posts RLS
DROP POLICY IF EXISTS "posts_select_all" ON community_posts;
CREATE POLICY "posts_select_all" ON community_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "posts_insert_auth" ON community_posts;
CREATE POLICY "posts_insert_auth" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "posts_update_own" ON community_posts;
CREATE POLICY "posts_update_own" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "posts_delete_own" ON community_posts;
CREATE POLICY "posts_delete_own" ON community_posts
  FOR DELETE USING (auth.uid() = author_id);

-- post_votes RLS
DROP POLICY IF EXISTS "post_votes_select_all" ON post_votes;
CREATE POLICY "post_votes_select_all" ON post_votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "post_votes_insert_auth" ON post_votes;
CREATE POLICY "post_votes_insert_auth" ON post_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "post_votes_update_own" ON post_votes;
CREATE POLICY "post_votes_update_own" ON post_votes
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "post_votes_delete_own" ON post_votes;
CREATE POLICY "post_votes_delete_own" ON post_votes
  FOR DELETE USING (auth.uid() = user_id);

-- community_comments RLS
DROP POLICY IF EXISTS "comments_select_all" ON community_comments;
CREATE POLICY "comments_select_all" ON community_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "comments_insert_auth" ON community_comments;
CREATE POLICY "comments_insert_auth" ON community_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "comments_update_own" ON community_comments;
CREATE POLICY "comments_update_own" ON community_comments
  FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "comments_delete_own" ON community_comments;
CREATE POLICY "comments_delete_own" ON community_comments
  FOR DELETE USING (auth.uid() = author_id);

-- comment_votes RLS
DROP POLICY IF EXISTS "comment_votes_select_all" ON comment_votes;
CREATE POLICY "comment_votes_select_all" ON comment_votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "comment_votes_insert_auth" ON comment_votes;
CREATE POLICY "comment_votes_insert_auth" ON comment_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "comment_votes_update_own" ON comment_votes;
CREATE POLICY "comment_votes_update_own" ON comment_votes
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "comment_votes_delete_own" ON comment_votes;
CREATE POLICY "comment_votes_delete_own" ON comment_votes
  FOR DELETE USING (auth.uid() = user_id);


-- ════════════════════════════════════════════
-- 7. 커뮤니티 시드 데이터
-- ════════════════════════════════════════════

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
  p1 UUID; p2 UUID; p3 UUID;
  c1 UUID; c2 UUID;
BEGIN

-- 더미 auth.users
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

-- profiles
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

-- 게시글
INSERT INTO community_posts (title, content, category, author_id, upvotes, downvotes, views, comment_count, is_pinned, is_hot, created_at)
SELECT * FROM (VALUES
  ('Claude vs GPT-4o 실무 비교 — 6개월 사용 후기',
   E'금융 데이터 분석 분야의 AI 전문가입니다.\n\n코드 생성: Claude > GPT-4o\n문서 작성: Claude가 한국어 자연스러움\nAPI 비용: Claude가 약 20% 저렴',
   'expert_column'::post_category, u_expert1, 142, 3, 2341, 0, TRUE, TRUE, NOW() - INTERVAL '2 hours'),
  ('제조업 AI 도입 6개월 성과 — 불량률 23% 감소',
   E'중소 제조업체로 AI 비전 검사 시스템 도입.\n\n도입 전: 87% → 도입 후: 99.2%\nROI: 6개월 만에 손익분기점 달성',
   'ax_case'::post_category, u_company1, 89, 2, 1547, 0, FALSE, TRUE, NOW() - INTERVAL '5 hours'),
  ('Cursor AI로 생산성 3배 올린 워크플로우',
   E'1단계: .cursorrules에 구조 정의\n2단계: 주석 우선 작성\n3단계: AI 코드 리뷰 루프\n\n하루 커밋: 12개 → 38개',
   'ai_tips'::post_category, u_expert2, 67, 5, 892, 0, FALSE, TRUE, NOW() - INTERVAL '8 hours'),
  ('사내 AI 도입 시 개인정보 처리 문제?',
   E'전사 AI 어시스턴트 도입 검토 중. 개인정보 처리 문제가 걸립니다.',
   'company_qna'::post_category, u_company2, 43, 1, 654, 0, FALSE, FALSE, NOW() - INTERVAL '12 hours'),
  ('AI가 내 직업을 대체할까봐 걱정되시는 분?',
   E'콘텐츠 마케터인데 솔직하게 이야기 나눠봐요.',
   'free'::post_category, u_general3, 38, 4, 523, 0, FALSE, FALSE, NOW() - INTERVAL '18 hours'),
  ('[채용] AI 스타트업 풀스택 개발자 — 원격 100%',
   E'React, Next.js, Node.js, Python, Supabase\n풀타임/파트타임 모두 가능',
   'recruit'::post_category, u_company1, 21, 1, 445, 0, FALSE, FALSE, NOW() - INTERVAL '24 hours')
) AS v(title, content, category, author_id, upvotes, downvotes, views, comment_count, is_pinned, is_hot, created_at)
WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE community_posts.title = v.title);

-- 댓글
SELECT id INTO p1 FROM community_posts WHERE title LIKE 'Claude vs GPT-4o%' LIMIT 1;
SELECT id INTO p2 FROM community_posts WHERE title LIKE '제조업 AI 도입%' LIMIT 1;
SELECT id INTO p3 FROM community_posts WHERE title LIKE 'AI가 내 직업%' LIMIT 1;

IF p1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM community_comments WHERE post_id = p1) THEN
  INSERT INTO community_comments (post_id, parent_id, content, author_id, upvotes, downvotes, depth, created_at) VALUES
    (p1, NULL, '정말 유용한 후기 감사합니다! Claude API 도입을 검토해봐야겠네요.', u_company2, 18, 0, 0, NOW() - INTERVAL '90 minutes'),
    (p1, NULL, '코드 생성에서 Claude가 더 낫다는 건 저도 동의해요.', u_general1, 24, 1, 0, NOW() - INTERVAL '45 minutes');

  SELECT id INTO c1 FROM community_comments WHERE post_id = p1 AND depth = 0 ORDER BY created_at ASC LIMIT 1;
  INSERT INTO community_comments (post_id, parent_id, content, author_id, upvotes, downvotes, depth, created_at) VALUES
    (p1, c1, '기업용 Claude.ai도 좋습니다. 팀 협업 기능이 편리해요.', u_expert1, 12, 0, 1, NOW() - INTERVAL '1 hour');

  SELECT id INTO c2 FROM community_comments WHERE post_id = p1 AND depth = 1 LIMIT 1;
  INSERT INTO community_comments (post_id, parent_id, content, author_id, upvotes, downvotes, depth, created_at) VALUES
    (p1, c2, '저도 써보고 싶은데 어디서 시작하면 좋을까요?', u_general2, 5, 0, 2, NOW() - INTERVAL '30 minutes');
END IF;

IF p2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM community_comments WHERE post_id = p2) THEN
  INSERT INTO community_comments (post_id, parent_id, content, author_id, upvotes, downvotes, depth, created_at) VALUES
    (p2, NULL, 'ROI 6개월 달성은 인상적이네요. 벤더 선정 기준이 무엇이었나요?', u_company2, 11, 0, 0, NOW() - INTERVAL '3 hours'),
    (p2, NULL, '초기 구축비 8천만원이 합리적인 수준인지 감이 안 오네요.', u_general4, 7, 0, 0, NOW() - INTERVAL '2 hours');
END IF;

IF p3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM community_comments WHERE post_id = p3) THEN
  INSERT INTO community_comments (post_id, parent_id, content, author_id, upvotes, downvotes, depth, created_at) VALUES
    (p3, NULL, '반복적인 카피라이팅은 이미 AI가 더 잘해요.', u_general1, 15, 0, 0, NOW() - INTERVAL '16 hours'),
    (p3, NULL, 'AI 도구를 잘 쓰는 사람이 못 쓰는 사람을 대체하는 시대가 오고 있는 것 같아요.', u_expert2, 22, 1, 0, NOW() - INTERVAL '14 hours');
END IF;

-- comment_count 정합성
UPDATE community_posts p
SET comment_count = (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id AND c.is_deleted = FALSE);

END $$;


-- ════════════════════════════════════════════
-- 실행 완료!
-- ════════════════════════════════════════════
