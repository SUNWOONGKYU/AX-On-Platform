# AX-On Platform 디자인 규칙

## 색상 시스템

### 라이트 (기본 배경)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--surface` | `#faf9f7` | 기본 배경 |
| `--surface-warm` | `#f5f0eb` | 보조 배경 (교대 섹션) |
| `--surface-card` | `#ffffff` | 카드 배경 |

### 다크 — Tomorrow Night Blue
> **규칙: 모든 다크 영역은 Tomorrow Night Blue 팔레트를 사용한다.**

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--dark-bg` | `#002451` | 다크 섹션 배경 (footer, cycle 등) |
| `--dark-bg-deep` | `#001126` | 가장 어두운 배경 (타이틀바 레벨) |
| `--dark-bg-hover` | `#00346e` | 다크 카드 hover / 현재 행 |
| `--dark-bg-active` | `#003f8e` | 다크 선택 / 활성 상태 |
| `--dark-text` | `#ffffff` | 다크 영역 본문 텍스트 |
| `--dark-text-muted` | `#7285b7` | 다크 영역 보조 텍스트 |
| `--dark-border` | `rgba(114, 133, 183, 0.15)` | 다크 영역 테두리 |

### 브랜드 색상
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--amber` | `#e8920d` | 프라이머리 액센트 |
| `--amber-light` | `#f5b942` | 프라이머리 밝은 변형 |
| `--teal` | `#0d9488` | AX 프로젝트 액센트 |
| `--coral` | `#e85d4a` | 경고 / 강조 |
| `--violet` | `#7c5ce0` | 커뮤니티 액센트 |
| `--sky` | `#3b82f6` | AI 전문가 액센트 |

### 참고
- Tomorrow Night Blue 원본: [VS Code 테마](https://github.com/microsoft/vscode/blob/main/extensions/theme-tomorrow-night-blue/themes/tomorrow-night-blue-color-theme.json)
- 기존 `--ink: #1a1a2e` → 텍스트 전용, 다크 배경으로 사용 금지
