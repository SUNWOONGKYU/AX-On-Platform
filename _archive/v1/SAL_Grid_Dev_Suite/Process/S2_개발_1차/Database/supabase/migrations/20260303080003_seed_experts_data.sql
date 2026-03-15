-- 전문가 시드 데이터 (8명)
-- industry/functions 값은 expert_categories.id 참조

INSERT INTO public.experts (name, title, industry, functions, bio, photo_url, website_url, email) VALUES
(
  '김민준',
  '스마트팩토리 AI 전환 12년, 제조업 디지털화 전문가',
  ARRAY['manufacturing', 'energy'],
  ARRAY['MO', 'IT'],
  '삼성전자 스마트팩토리팀 출신으로 제조 현장 AI 전환 프로젝트를 12년간 수행했습니다. 공정 이상 탐지, 설비 예측 정비, 스마트팩토리 통합 플랫폼 구축을 전문으로 합니다.',
  NULL,
  NULL,
  'minjun.kim@axon-expert.kr'
),
(
  '이서연',
  '핀테크 AI 신용 분석 및 초개인화 마케팅 전략가',
  ARRAY['finance', 'retail'],
  ARRAY['FI', 'MK'],
  '카카오뱅크·네이버파이낸셜 출신으로 AI 기반 신용 평가 및 개인화 금융 서비스 전문가입니다. 고객 이탈 예측, 개인화 상품 추천, 사기거래 탐지 모델을 다수 개발했습니다.',
  NULL,
  NULL,
  'seoyeon.lee@axon-expert.kr'
),
(
  '박준호',
  '의료 AI 영상 진단·임상 데이터 분석 전문가',
  ARRAY['healthcare'],
  ARRAY['RD', 'IT'],
  '서울아산병원 의료AI팀 출신으로 CT·MRI 영상 판독 AI 모델 개발 및 임상 검증 전문가입니다. 의료 데이터 파이프라인 및 AI 거버넌스 체계 구축 경험을 보유합니다.',
  NULL,
  NULL,
  'junho.park@axon-expert.kr'
),
(
  '최지영',
  'AI 기반 교육 혁신 및 공공 서비스 자동화 전문가',
  ARRAY['education', 'public'],
  ARRAY['AO', 'HR'],
  '교육부 디지털교육팀 및 EBS 출신으로 AI 튜터 시스템 설계 및 공공 행정 자동화 경험을 보유합니다. 대규모 AI 에이전트 오케스트레이션 프로젝트를 다수 수행했습니다.',
  NULL,
  NULL,
  'jiyoung.choi@axon-expert.kr'
),
(
  '윤재원',
  '물류 최적화·공급망 AI 예측 모델 구현 전문가',
  ARRAY['logistics', 'retail'],
  ARRAY['OP', 'PO'],
  'CJ대한통운·쿠팡 출신으로 물류 네트워크 최적화 및 수요 예측 AI 시스템 구축 전문가입니다. 실시간 배차 최적화, 재고 자동 발주, 배송 지연 예측 모델을 개발했습니다.',
  NULL,
  NULL,
  'jaewon.yoon@axon-expert.kr'
),
(
  '정은지',
  'AI 콘텐츠 생성·미디어 개인화 추천 전략가',
  ARRAY['media', 'retail'],
  ARRAY['MK', 'SM'],
  'JTBC·왓챠 출신으로 AI 기반 콘텐츠 추천 알고리즘 및 생성형 AI 마케팅 캠페인 전문가입니다. SNS 콘텐츠 자동 생성, 시청자 세분화, 광고 최적화 시스템을 구축했습니다.',
  NULL,
  NULL,
  'eunji.jung@axon-expert.kr'
),
(
  '한동훈',
  '건설·부동산 AI 가치평가 및 리스크 예측 전문가',
  ARRAY['construction', 'proptech'],
  ARRAY['MS', 'FA'],
  '현대건설·직방 출신으로 부동산 AI 가격 예측 모델 및 건설 현장 안전 AI 솔루션 개발 전문가입니다. 건설 공정 리스크 분석, 실시간 자재비 예측, AI 기반 투자 타당성 분석을 수행합니다.',
  NULL,
  NULL,
  'donghoon.han@axon-expert.kr'
),
(
  '오소현',
  '법률 AI 계약서 분석·컴플라이언스 자동화 전문가',
  ARRAY['legal', 'finance'],
  ARRAY['LC', 'AO'],
  '김앤장 법률사무소·LG그룹 법무팀 출신으로 AI 계약 리뷰 시스템 및 규제 자동 모니터링 전문가입니다. AML 탐지, 계약서 리스크 분석, 내부통제 자동화 시스템을 설계했습니다.',
  NULL,
  NULL,
  'sohyun.oh@axon-expert.kr'
);
