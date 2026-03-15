-- @task S5D3
-- @description experts 테이블 누락 컬럼 7개 추가
-- @area Database
-- @stage S5
--
-- 참조: S3_개발_2차/Frontend/expert-template.html (라인 711)
--   .select('id, name, title, photo_url, description, industry, functions,
--            skills, career_history, portfolio, email, website_url,
--            github_url, linkedin_url, location')
--
-- 기존 테이블에 없는 7개 컬럼을 IF NOT EXISTS로 멱등성 보장하여 추가
-- =============================================================


-- ════════════════════════════════════════════
-- 1. 누락 컬럼 7개 추가 (ALTER TABLE)
-- ════════════════════════════════════════════

-- 1-1. description: 자기소개 (about 섹션에서 expert.description 으로 참조)
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS description TEXT;

-- 1-2. skills: 전문 분야 태그 배열 (문자열 배열, JSONB 저장)
--   renderProfile()에서 expert.skills.map(s => ...) 로 순회
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;

-- 1-3. career_history: 경력 목록 (객체 배열, 각 항목: period / company / role)
--   renderProfile()에서 expert.career_history.map(c => c.period, c.company, c.role)
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS career_history JSONB DEFAULT '[]'::jsonb;

-- 1-4. portfolio: 포트폴리오 목록 (객체 배열, 각 항목: emoji / title / description / tags[])
--   renderProfile()에서 expert.portfolio.map(p => p.emoji, p.title, p.description, p.tags)
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS portfolio JSONB DEFAULT '[]'::jsonb;

-- 1-5. github_url: GitHub 프로필 링크 (연락처·액션 버튼 섹션에서 참조)
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS github_url TEXT;

-- 1-6. linkedin_url: LinkedIn 프로필 링크 (연락처 섹션에서 참조)
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- 1-7. location: 활동 지역 (연락처 섹션 '위치' 항목에서 참조)
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS location TEXT;


-- ════════════════════════════════════════════
-- 2. 기존 8명 시드 전문가 샘플 데이터 UPDATE
--    (이메일을 기준 키로 사용)
-- ════════════════════════════════════════════

-- ── 2-1. 김민준 (스마트팩토리 / 제조·에너지) ──────────────────────
UPDATE public.experts SET
  description = '삼성전자 스마트팩토리팀에서 12년간 제조 현장 AI 전환 프로젝트를 총괄했습니다. '
    || '비전 검사 자동화, 예지 보전 시스템, 공정 최적화 AI 등 제조업 전반의 디지털 전환을 실전 경험했으며, '
    || '현재는 독립 컨설턴트로서 중소 제조사의 스마트팩토리 로드맵 수립과 AI 도입을 지원하고 있습니다.',
  skills = '["스마트팩토리 설계", "AI 비전 검사", "예지 보전(PdM)", "공정 최적화", "디지털 트윈", "IIoT 센서 통합", "제조 데이터 파이프라인"]'::jsonb,
  career_history = '[
    {"period": "2020-현재", "company": "MJ AI Factory Labs (독립 컨설팅)", "role": "대표 컨설턴트"},
    {"period": "2016-2020", "company": "삼성전자 DS부문 스마트팩토리TF", "role": "시니어 AI 엔지니어"},
    {"period": "2012-2016", "company": "현대자동차 생산기술연구소", "role": "자동화 시스템 개발"}
  ]'::jsonb,
  portfolio = '[
    {"emoji": "🏭", "title": "PCB 불량 검출 AI 비전 시스템", "description": "딥러닝 기반 결함 탐지 모델 구축. 불량 검출률 99.2% 달성, 검사 속도 3배 향상.", "tags": ["Computer Vision", "PyTorch", "YOLO", "FastAPI"]},
    {"emoji": "⚡", "title": "에너지 설비 예지 보전 플랫폼", "description": "IoT 센서 데이터 기반 고장 예측 모델. 설비 다운타임 41% 절감.", "tags": ["Time-Series", "LSTM", "Grafana", "AWS IoT"]},
    {"emoji": "🔧", "title": "스마트팩토리 로드맵 수립 컨설팅", "description": "중소 제조사 7곳 대상 현장 진단 및 3년 디지털 전환 로드맵 설계.", "tags": ["컨설팅", "로드맵", "ROI 분석"]}
  ]'::jsonb,
  github_url    = 'https://github.com/minjun-kim-ai',
  linkedin_url  = 'https://linkedin.com/in/minjun-kim-smartfactory',
  location      = '경기도 수원시'
WHERE email = 'minjun.kim@axon-expert.kr';


-- ── 2-2. 이서연 (핀테크 AI / 금융·유통) ───────────────────────────
UPDATE public.experts SET
  description = '카카오뱅크·네이버파이낸셜에서 AI 기반 신용 평가 모델과 초개인화 금융 서비스를 개발했습니다. '
    || '머신러닝을 활용한 대출 심사 자동화부터 고객 행동 분석 기반 금융 상품 추천까지, '
    || 'B2C 핀테크 서비스의 전 주기를 실무에서 경험했습니다.',
  skills = '["AI 신용 평가 모델", "개인화 추천 시스템", "금융 데이터 분석", "이상 거래 탐지(FDS)", "고객 세그멘테이션", "마케팅 자동화", "A/B 테스트 설계"]'::jsonb,
  career_history = '[
    {"period": "2022-현재", "company": "SY FinAI Partners (독립 컨설팅)", "role": "AI 전략 컨설턴트"},
    {"period": "2019-2022", "company": "네이버파이낸셜", "role": "AI 마케팅 리드"},
    {"period": "2016-2019", "company": "카카오뱅크", "role": "신용모델팀 데이터 사이언티스트"}
  ]'::jsonb,
  portfolio = '[
    {"emoji": "💳", "title": "AI 신용 평가 고도화 프로젝트", "description": "비정형 금융 데이터(SNS, 쇼핑 이력)를 활용한 신용 스코어 개선. 승인율 12% 향상.", "tags": ["XGBoost", "Feature Engineering", "MLflow"]},
    {"emoji": "🎯", "title": "초개인화 금융 상품 추천 엔진", "description": "행동 데이터 기반 실시간 추천 모델. CTR 34% 개선, 상품 전환율 2.1배 향상.", "tags": ["Collaborative Filtering", "Kafka", "Redis"]},
    {"emoji": "📊", "title": "마케팅 캠페인 ROI 자동 최적화 시스템", "description": "예산 배분 AI 알고리즘 도입으로 광고 비용 효율 28% 개선.", "tags": ["강화학습", "Google Ads API", "Looker"]}
  ]'::jsonb,
  github_url    = NULL,
  linkedin_url  = 'https://linkedin.com/in/seoyeon-lee-finai',
  location      = '서울특별시 강남구'
WHERE email = 'seoyeon.lee@axon-expert.kr';


-- ── 2-3. 박준호 (의료 AI / 헬스케어) ──────────────────────────────
UPDATE public.experts SET
  description = '서울아산병원 의료AI팀에서 CT·MRI 영상 판독 AI와 임상 데이터 분석 모델을 개발했습니다. '
    || '의학 지식과 딥러닝을 결합해 실제 임상 환경에서 사용 가능한 AI 솔루션을 설계하고 검증하는 데 강점이 있습니다. '
    || '현재 서울대학교 의료 AI 협동과정 겸임 연구원으로도 활동 중입니다.',
  skills = '["의료 영상 AI (CT/MRI)", "임상 데이터 분석", "EHR 데이터 처리", "의학 AI 규제·인허가", "딥러닝 모델 임상 검증", "DICOM 데이터 파이프라인", "멀티모달 의료 AI"]'::jsonb,
  career_history = '[
    {"period": "2021-현재", "company": "MedAI Research Institute (독립 연구)", "role": "수석 연구원"},
    {"period": "2018-2021", "company": "서울아산병원 의료AI팀", "role": "AI 엔지니어 (영상의학과 협력)"},
    {"period": "2015-2018", "company": "한국과학기술원(KAIST) 바이오AI연구실", "role": "박사 연구원"}
  ]'::jsonb,
  portfolio = '[
    {"emoji": "🏥", "title": "폐암 조기 탐지 CT 판독 AI", "description": "3D-CNN 기반 폐 결절 탐지 모델. 민감도 94.7%, 특이도 91.2% 달성. 식약처 SaMD 허가 진행 중.", "tags": ["3D-CNN", "DICOM", "PyTorch", "임상검증"]},
    {"emoji": "🧬", "title": "패혈증 조기 예측 EHR 분석 모델", "description": "ICU 환자 실시간 데이터 기반 패혈증 발생 6시간 전 예측. AUC 0.91.", "tags": ["LSTM", "FHIR", "실시간 추론"]},
    {"emoji": "📋", "title": "의료 AI 규제 컨설팅 가이드라인 개발", "description": "식약처 AI 의료기기 소프트웨어(SaMD) 허가 절차 자문 및 기술 문서 작성 지원.", "tags": ["SaMD", "ISO 13485", "임상시험"]}
  ]'::jsonb,
  github_url    = 'https://github.com/junho-park-medai',
  linkedin_url  = 'https://linkedin.com/in/junho-park-medai',
  location      = '서울특별시 송파구'
WHERE email = 'junho.park@axon-expert.kr';


-- ── 2-4. 최지영 (교육 AI / 공공 서비스) ───────────────────────────
UPDATE public.experts SET
  description = '교육부 디지털교육팀 및 EBS에서 AI 기반 교육 혁신과 공공 행정 자동화를 이끌었습니다. '
    || 'AI 튜터 시스템 기획부터 공공 민원 챗봇 구축까지, 교육·공공 분야 AI 도입의 전략과 실행 모두를 경험했습니다. '
    || '현재 정부 AI 자문위원회 위원으로 활동하며 공공 AI 정책 수립에 기여하고 있습니다.',
  skills = '["AI 튜터 시스템 설계", "공공 행정 자동화", "교육 데이터 분석", "생성형 AI 교육 콘텐츠", "정책 AI 기획", "공공 챗봇 개발", "데이터 거버넌스"]'::jsonb,
  career_history = '[
    {"period": "2022-현재", "company": "JY EduAI Consulting (독립 컨설팅)", "role": "대표 / AI 교육 전략가"},
    {"period": "2019-2022", "company": "EBS 디지털혁신본부", "role": "AI 서비스 기획팀장"},
    {"period": "2016-2019", "company": "교육부 디지털교육기반과", "role": "AI 교육 정책 연구관"}
  ]'::jsonb,
  portfolio = '[
    {"emoji": "📚", "title": "초·중학생 수학 AI 튜터 시스템", "description": "학습자 오답 패턴 분석 기반 맞춤형 설명 생성. EBS 온라인 클래스 시범 도입, 학업 성취도 18% 향상.", "tags": ["LLM", "학습 분석", "개인화 교육"]},
    {"emoji": "🏛️", "title": "지자체 민원 AI 자동 분류·배정 시스템", "description": "연 240만 건 민원 문서 자동 분류 및 담당부서 배정. 처리 시간 62% 단축.", "tags": ["NLP", "BERT", "FastAPI", "공공 API"]},
    {"emoji": "🤖", "title": "공공기관 생성형 AI 도입 가이드라인 수립", "description": "10개 정부부처 대상 생성형 AI 활용 정책·보안 가이드라인 공동 집필 및 교육.", "tags": ["정책 기획", "AI 거버넌스", "공공 보안"]}
  ]'::jsonb,
  github_url    = NULL,
  linkedin_url  = 'https://linkedin.com/in/jiyoung-choi-eduai',
  location      = '서울특별시 종로구'
WHERE email = 'jiyoung.choi@axon-expert.kr';


-- ── 2-5. 윤재원 (물류 AI / 공급망 최적화) ──────────────────────────
UPDATE public.experts SET
  description = 'CJ대한통운·쿠팡에서 물류 네트워크 최적화와 수요 예측 AI 시스템을 구축했습니다. '
    || '라스트마일 배송 경로 최적화, 창고 자동화, 재고 수요 예측 등 물류 SCM 전 영역의 AI 적용 경험을 보유하고 있습니다. '
    || '현재 중견 물류사 및 이커머스 스타트업 대상 AI 컨설팅을 수행하고 있습니다.',
  skills = '["물류 네트워크 최적화", "수요 예측 AI", "라스트마일 경로 최적화", "재고 관리 AI", "WMS/TMS 연동", "공급망 리스크 분석", "실시간 물류 대시보드"]'::jsonb,
  career_history = '[
    {"period": "2021-현재", "company": "LogiAI Partners (독립 컨설팅)", "role": "물류 AI 전문 컨설턴트"},
    {"period": "2018-2021", "company": "쿠팡 로지스틱스서비스", "role": "AI 라우팅 최적화 팀장"},
    {"period": "2013-2018", "company": "CJ대한통운 SCM연구소", "role": "물류 최적화 선임 연구원"}
  ]'::jsonb,
  portfolio = '[
    {"emoji": "🚚", "title": "라스트마일 배송 경로 AI 최적화 엔진", "description": "실시간 교통·날씨 데이터 결합 강화학습 기반 배송 경로 최적화. 배송 비용 19% 절감.", "tags": ["강화학습", "OR-Tools", "Google Maps API"]},
    {"emoji": "📦", "title": "이커머스 수요 예측 및 자동 발주 시스템", "description": "SKU 3만개 대상 시계열 예측 모델. 재고 부족률 73% 감소, 과잉 재고 31% 감소.", "tags": ["Prophet", "LightGBM", "Airflow", "Snowflake"]},
    {"emoji": "🏗️", "title": "풀필먼트 센터 슬롯팅 최적화", "description": "상품 배치 AI 알고리즘 적용. 피킹 동선 28% 단축, 시간당 처리량 22% 향상.", "tags": ["최적화 알고리즘", "WMS", "Simulation"]}
  ]'::jsonb,
  github_url    = 'https://github.com/jaewon-yoon-logistics',
  linkedin_url  = 'https://linkedin.com/in/jaewon-yoon-logiai',
  location      = '경기도 성남시 분당구'
WHERE email = 'jaewon.yoon@axon-expert.kr';


-- ── 2-6. 정은지 (AI 콘텐츠·미디어 / 개인화 추천) ──────────────────
UPDATE public.experts SET
  description = 'JTBC·왓챠에서 AI 기반 콘텐츠 추천 알고리즘과 생성형 AI 마케팅 캠페인을 기획·개발했습니다. '
    || '미디어 소비 데이터 분석부터 Gen AI를 활용한 콘텐츠 자동 제작까지, '
    || '엔터테인먼트·미디어 분야의 AI 전략 수립과 실행을 전문으로 합니다.',
  skills = '["콘텐츠 추천 시스템", "생성형 AI 마케팅", "미디어 데이터 분석", "콘텐츠 A/B 테스트", "소셜 미디어 자동화", "AI 카피라이팅", "인플루언서 AI 매칭"]'::jsonb,
  career_history = '[
    {"period": "2022-현재", "company": "EJ ContentAI Studio (독립 기획)", "role": "AI 콘텐츠 전략가"},
    {"period": "2019-2022", "company": "왓챠(Watcha) 데이터팀", "role": "추천 알고리즘 PM"},
    {"period": "2016-2019", "company": "JTBC 디지털사업부", "role": "디지털 마케팅 매니저"}
  ]'::jsonb,
  portfolio = '[
    {"emoji": "🎬", "title": "왓챠 영상 콘텐츠 개인화 추천 시스템 고도화", "description": "협업 필터링 + 콘텐츠 기반 하이브리드 모델. 사용자 체류시간 41% 증가.", "tags": ["추천 알고리즘", "Matrix Factorization", "Spark MLlib"]},
    {"emoji": "✍️", "title": "생성형 AI 마케팅 카피 자동화 파이프라인", "description": "GPT-4o 기반 타겟별 SNS 카피 자동 생성. 캠페인 CTR 2.8배 향상, 제작 시간 80% 절감.", "tags": ["GPT-4o", "Prompt Engineering", "Meta Ads API"]},
    {"emoji": "📱", "title": "유튜브 숏폼 트렌드 예측 AI 대시보드", "description": "YouTube·TikTok 데이터 크롤링 기반 콘텐츠 트렌드 7일 예측 모델. 10개 채널 운영 적용.", "tags": ["NLP", "트렌드 분석", "Streamlit", "YouTube API"]}
  ]'::jsonb,
  github_url    = NULL,
  linkedin_url  = 'https://linkedin.com/in/eunji-jung-contentai',
  location      = '서울특별시 마포구'
WHERE email = 'eunji.jung@axon-expert.kr';


-- ── 2-7. 한동훈 (건설·부동산 AI / 가치평가·리스크) ─────────────────
UPDATE public.experts SET
  description = '현대건설·직방에서 부동산 AI 가격 예측 모델과 건설 현장 안전 AI 솔루션을 개발했습니다. '
    || '공간 데이터 분석, 건설 IoT 센서 연동, 부동산 시장 예측 모델 등 건설·프롭테크 분야의 AI 적용에 특화되어 있습니다. '
    || '현재 프롭테크 스타트업 자문 및 건설사 AI 도입 컨설팅을 병행합니다.',
  skills = '["부동산 AI 가격 예측", "건설 현장 안전 AI", "공간 데이터 분석(GIS)", "건설 IoT 모니터링", "리스크 평가 모델", "드론 영상 분석", "PropTech 플랫폼 기획"]'::jsonb,
  career_history = '[
    {"period": "2022-현재", "company": "DH PropAI Consulting (독립 컨설팅)", "role": "대표 컨설턴트"},
    {"period": "2018-2022", "company": "직방 데이터사이언스팀", "role": "AI 가격 예측 리드"},
    {"period": "2013-2018", "company": "현대건설 스마트건설연구소", "role": "현장 안전 AI 선임 연구원"}
  ]'::jsonb,
  portfolio = '[
    {"emoji": "🏠", "title": "아파트 실거래가 AI 예측 모델", "description": "GIS 데이터·학군·교통 접근성 등 300+ 변수 기반 예측. MAPE 2.3% 달성, 직방 앱 적용.", "tags": ["XGBoost", "GIS", "공공 데이터 API", "Shapely"]},
    {"emoji": "🏗️", "title": "건설 현장 안전 사고 AI 예측 시스템", "description": "드론 영상 + 웨어러블 IoT 센서 데이터 융합. 위험 행동 실시간 탐지, 사고율 37% 감소.", "tags": ["Computer Vision", "YOLO", "IoT", "엣지 컴퓨팅"]},
    {"emoji": "📈", "title": "상업용 부동산 공실률 예측 모델", "description": "거시경제 지표·유동인구 데이터 결합 예측 모델. 투자 판단 지원 플랫폼으로 연계.", "tags": ["Prophet", "공간 회귀", "SKT 유동인구 API"]}
  ]'::jsonb,
  github_url    = 'https://github.com/donghoon-han-propai',
  linkedin_url  = 'https://linkedin.com/in/donghoon-han-propai',
  location      = '서울특별시 강남구'
WHERE email = 'donghoon.han@axon-expert.kr';


-- ── 2-8. 오소현 (법률 AI / 계약서 분석·컴플라이언스) ───────────────
UPDATE public.experts SET
  description = '김앤장 법률사무소·LG그룹 법무팀에서 AI 계약 리뷰 시스템과 규제 자동 모니터링 플랫폼을 구축했습니다. '
    || '법률 NLP 모델 개발부터 컴플라이언스 자동화 시스템 도입까지, '
    || '법무·법률 분야 AI 솔루션의 기획·개발·도입 전 과정을 경험했습니다. '
    || '변호사 자격 보유자로 법률과 AI 기술을 모두 이해하는 희귀한 전문성을 갖추고 있습니다.',
  skills = '["AI 계약서 분석·검토", "법률 NLP 모델 개발", "컴플라이언스 자동화", "규제 모니터링 AI", "법률 문서 요약 AI", "리스크 조항 탐지", "LegalTech 플랫폼 기획"]'::jsonb,
  career_history = '[
    {"period": "2023-현재", "company": "SH LegalAI Partners (독립 컨설팅)", "role": "대표 / AI 법률 전문가"},
    {"period": "2020-2023", "company": "LG그룹 법무팀", "role": "AI 컴플라이언스 리드"},
    {"period": "2016-2020", "company": "김앤장 법률사무소", "role": "기업법무 변호사 (AI 법률팀 겸직)"}
  ]'::jsonb,
  portfolio = '[
    {"emoji": "⚖️", "title": "기업 계약서 AI 자동 검토 시스템", "description": "LLM 기반 계약 위험 조항 자동 탐지·분류. 검토 시간 70% 단축, 주요 대기업 3곳 도입.", "tags": ["LLM", "법률 NLP", "위험 조항 분류", "GPT-4o"]},
    {"emoji": "🔍", "title": "개인정보보호법·규제 자동 모니터링 플랫폼", "description": "국내외 규제 변경 사항 실시간 크롤링·분석·영향도 평가 자동화. 컴플라이언스팀 50% 업무 절감.", "tags": ["RAG", "법령 크롤링", "NLP", "Slack 연동"]},
    {"emoji": "📄", "title": "M&A Due Diligence AI 지원 도구", "description": "수천 페이지 계약·재무 문서 AI 분석 자동화. DD 기간 3주 → 1주로 단축.", "tags": ["Document AI", "Azure Form Recognizer", "LangChain", "벡터DB"]}
  ]'::jsonb,
  github_url    = NULL,
  linkedin_url  = 'https://linkedin.com/in/sohyun-oh-legalai',
  location      = '서울특별시 서초구'
WHERE email = 'sohyun.oh@axon-expert.kr';


-- ════════════════════════════════════════════
-- 실행 완료!
-- 추가된 컬럼: description, skills, career_history, portfolio,
--             github_url, linkedin_url, location
-- 업데이트된 전문가: 8명 전원
-- ════════════════════════════════════════════
