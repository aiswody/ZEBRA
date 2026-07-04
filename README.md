# ZEBRA — 공공건축물 온실가스 배출량 산정 및 보고 서비스

공공건축물의 에너지 사용 데이터를 기반으로 **Scope 1(직접배출)·Scope 2(간접배출)** 온실가스 배출량을
국가 산정지침(K-GHG)과 국제 표준(IPCC 2006, ISO 14064-1)에 따라 자동으로 산정하고, 대시보드 시각화와
보고서(docx) 자동 생성을 지원하는 웹 서비스입니다.

## 배경

공공건축물(관공서, 학교, 도서관, 체육센터 등)의 전기·도시가스·경유·LPG 등 에너지 사용량은
정량적으로 통합 관리되지 않고 있으며, 국내 지침(K-GHG, 탄소중립기본법)의 세부 요건까지
충족하는 시스템이 부재했습니다. 이 프로젝트는 공공기관이 자체적으로 Scope 1·2 배출량을
산정·관리·보고할 수 있는 플랫폼을 목표로 시작되었습니다.

## 주요 기능

- **온실가스 배출량 자동 산정**: 환경부 고시 배출계수 및 K-GHG/IPCC 기준을 적용해 Scope 1·2 배출량 자동 계산
- **Scope 자동 분류 및 단위 변환**: 연료·전력 활동자료 입력 시 Scope 구분과 단위 변환 자동 처리
- **대시보드 시각화**: 건물/기관/연도별 배출량 추세, Scope 비율, 면적당 강도지표를 그래프로 제공
- **목표 대비 성과 관리**: 감축 목표 대비 이행률 분석
- **보고서 자동 생성**: 연도별 배출량·감축 추이가 포함된 docx 보고서 원클릭 생성
- **감축 대안 추천 챗봇**: 사용자 질의에 따라 탄소 감축 방안을 제안 (Hugging Face 기반)

## 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | React 19, React Router 7, Recharts, Axios |
| Backend | Django 5.2, Django REST Framework, drf-yasg(Swagger), SimpleJWT |
| DB (개발) | SQLite |
| DB (운영 권장) | PostgreSQL 14+ (Building 모델의 조건부 UniqueConstraint를 네이티브 지원) |
| 챗봇 | Hugging Face Inference API (OpenAI 호환 라우터) |
| 인증 | JWT (accounts 앱) |

## 아키텍처

```
Frontend(React) ─ REST API ─ Backend(Django)
                                 ├─ accounts    (인증/기관/계정)
                                 ├─ buildings   (건물 등록/관리)
                                 ├─ activities  (연료/전력/면적 활동자료 입력)
                                 ├─ emissions   (Scope 1·2 산정 및 대시보드 집계, EmissionAgg)
                                 ├─ reports     (docx 보고서 자동 생성)
                                 └─ chatbot     (감축 대안 추천, Hugging Face 연동)
```

산정 흐름: `Scope1FuelUsage / ElectricityUsage / AreaInfo` (활동자료) → 계산 서비스 →
`EmissionAgg`(연도별 집계 캐시) → 대시보드/보고서에서 고속 조회

## API 개요

| 리소스 | 엔드포인트 | 설명 |
|---|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/refresh`, `GET /api/auth/me` | 회원가입/로그인/JWT 발급·갱신 |
| Buildings | `GET·POST /api/buildings`, `GET·PUT·PATCH·DELETE /api/buildings/{id}` | 건물 등록/조회/수정/삭제 |
| Activities | `GET·POST /api/activities/buildings/{id}/...`, `GET /api/activities/summary` | 연료·전기·면적 활동자료 입력/집계 |
| Dashboard | `GET /api/dashboard/buildings/{id}/scope1|scope2|total|trend|scope-ratio` 등 | 건물·기관 단위 배출량 대시보드 |
| Reports | `GET /api/reports/context`, `/download` | 보고서 데이터 조회 및 docx 다운로드 |
| Chatbot | `POST /chatbot/api/recommendation/` | 감축 대안 추천 |

## 데이터베이스 설계 요약

- `Institution` 1─N `Account`, 1─N `Building`
- `Building` 1─N `Scope1FuelUsage`(연료), `ElectricityUsage`(전력), `AreaInfo`(면적), `EmissionAgg`(연도별 집계)
- `Building`은 `(institution, place_id)`, `(institution, name)`에 대해 활성 건물(`is_archived=False`) 한정
  조건부 UniqueConstraint를 사용 — PostgreSQL 네이티브 지원, MySQL 사용 시 서비스 레이어 검증 필요
- `EmissionAgg`는 `(building, year)` 유니크로 연도별 1행을 유지하는 계산 결과 캐시 테이블

## 로컬 실행

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# backend/.env 생성 (HF_TOKEN, DJANGO_SECRET_KEY, DEBUG 값 필요)
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm start
```
