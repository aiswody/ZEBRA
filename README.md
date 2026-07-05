<div align="center">

# 🦓 ZEBRA — 공공건축물 온실가스 배출량 산정 및 보고 서비스

**공공건축물의 에너지 사용 데이터를 K-GHG·IPCC 기준에 따라 자동으로 Scope 1·2 배출량으로 환산하고,
대시보드와 보고서로 보여주는 서비스입니다.**

![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2-092E20?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![DRF](https://img.shields.io/badge/DRF-3.16-A30000?logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/DB-SQLite%20%2F%20PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Inference%20API-FFD21E?logo=huggingface&logoColor=black)

[한 줄 요약](#-한-줄-요약) · [왜 만들었나](#-왜-만들었나) · [주요 기능](#주요-기능) ·
[아키텍처](#아키텍처) · [기술 스택](#기술-스택) · [로컬 실행](#로컬-실행)

</div>

---

## 💡 한 줄 요약

> 공공건축물의 전기·가스·유류 사용량만 입력하면, K-GHG·IPCC 기준에 맞는 Scope 1·2 배출량이
> 자동으로 계산되고 대시보드 시각화와 docx 보고서까지 원클릭으로 나옵니다.

## 🎯 왜 만들었나

| 기존 현실 | ZEBRA의 해결 |
|---|---|
| 전기·가스·유류 등 에너지 사용량이 흩어져 있어 통합 관리가 안 됨 | 건물 단위로 활동자료를 한 곳에 모아 표준화 관리 |
| Scope 1·2 배출량을 수기로 계산 → 시간 소모, 실수 가능성 | 배출계수 자동 매핑으로 **즉시 자동 계산** |
| 국내 K-GHG 지침에 맞는 보고서 양식이 따로 없음 | 클릭 한 번으로 **K-GHG 기준 docx 보고서** 자동 생성 |
| 건물별·연도별 배출 현황을 한눈에 비교하기 어려움 | 대시보드에서 추세·Scope 비율·면적당 강도지표 시각화 |

대한민국은 「탄소중립기본법」과 NDC 목표에 따라 공공부문 온실가스 감축 의무를 확대하고 있지만,
공공건축물의 에너지 사용량은 다원적이고 정량적 산정·보고 체계가 없었습니다. ZEBRA는 이 공백을
메우기 위한 산정·시각화·보고 통합 플랫폼입니다.

## 주요 기능

- **온실가스 배출량 자동 산정**: 환경부 고시 배출계수 및 K-GHG/IPCC 기준을 적용해 Scope 1·2 배출량 자동 계산
- **Scope 자동 분류 및 단위 변환**: 연료·전력 활동자료 입력 시 Scope 구분과 단위 변환 자동 처리
- **대시보드 시각화**: 건물/기관/연도별 배출량 추세, Scope 비율, 면적당 강도지표를 그래프로 제공
- **목표 대비 성과 관리**: 감축 목표 대비 이행률 분석
- **보고서 자동 생성**: 기관·연도별 온실가스 배출량 보고서를 docx 파일로 원클릭 다운로드 (아래 상세 참고)
- **감축 대안 추천 챗봇**: 사용자 질의에 따라 탄소 감축 방안을 제안 (Hugging Face 기반)

<details>
<summary><b>📄 보고서 자동 생성 상세 보기</b></summary>

<br>

`GET /api/reports/download?year=2024` 호출 한 번으로 아래 내용을 담은 `.docx` 파일이 생성됩니다
(`docxtpl` + Jinja2로 `report_template.docx` 서식에 데이터를 채워 넣는 방식).

| 구성 | 내용 |
|---|---|
| 기관/담당자 정보 | 기관명·유형·주소, 담당자명·부서·연락처, 보고서 생성 일시 |
| 산정 기간 | 조회 연도의 1/1 ~ 12/31 |
| 총괄 요약 | 기관 전체 총배출량(kg), 대상 건물 목록, 연면적 범위(최소~최대) |
| 최고 배출 건물 | 해당 연도 총배출량이 가장 큰 건물명과 배출량을 자동 선정 |
| 활동자료 표 | 건물별 고체·액체·기체 연료 사용량 + 전력 사용량(kWh) |
| 산정결과 표 | 건물별 Scope1·Scope2·총배출량(kg)·면적당 배출강도(kg/m²) |
| 연도별 추이 | 건물별 총배출량 데이터(연도 비교 헤더용) |

건물 데이터가 하나도 없는 연도는 204(No Content)로 응답하며, 남용 방지를 위해 사용자당 시간당 20회로
요청을 제한합니다(`ReportThrottle`).

</details>

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

## 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | React 19, React Router 7, Recharts, Axios |
| Backend | Django 5.2, Django REST Framework, drf-yasg(Swagger), SimpleJWT |
| DB (개발) | SQLite |
| DB (운영 권장) | PostgreSQL 14+ (Building 모델의 조건부 UniqueConstraint를 네이티브 지원) |
| 챗봇 | Hugging Face Inference API (OpenAI 호환 라우터) |
| 인증 | JWT (accounts 앱) |

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

## 개선 내역

원 팀 프로젝트 완료 이후 개인적으로 진행한 유지보수 작업입니다.

- **인증**: access 토큰 만료 시 refresh 토큰으로 자동 갱신하도록 구현 (기존엔 60분 후 재로그인 필요)
- **버그 수정**: 챗봇 건물 목록 API 500 에러, 건물/연도 전환 시 이전 응답이 최신 상태를 덮어쓰는
  레이스 컨디션, 소개 페이지에서 상단 메뉴 하이라이트가 안 되던 문제 등
- **보고서 로직 개선**: "예시 건물"을 무작위 선정하던 것을 최고 배출 건물 기준으로 변경
- **보안**: 히스토리에 남아있던 API 키·시크릿 제거, 환경변수 템플릿(`.env.example`) 추가
- **코드 정리**: 죽은 코드·미사용 변수·디버그 로그 제거, `requirements.txt` 인코딩 수정
