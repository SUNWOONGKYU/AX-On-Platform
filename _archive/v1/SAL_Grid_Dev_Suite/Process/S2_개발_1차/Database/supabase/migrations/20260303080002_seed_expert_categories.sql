-- expert_categories 시드 데이터: 14개 산업 분류 + 15개 기능 분야

INSERT INTO public.expert_categories (id, type, label, icon, sort_order) VALUES
-- 산업 분류 (14개)
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
-- 기능 분야 (15개)
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
