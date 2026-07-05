<div align="center">

# 🌱 ZEBRA

### 공공건축물 온실가스 배출량 산정·보고 플랫폼

건물별 에너지 사용량만 입력하면 K-GHG·IPCC 기준에 맞는 Scope 1·2 배출량 계산, 대시보드,
docx 보고서까지 자동으로 이어지는 서비스입니다.

![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2-092E20?style=flat-square&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.16-A30000?style=flat-square&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/DB-SQLite%20%2F%20PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Inference%20API-FFD21E?style=flat-square&logo=huggingface&logoColor=black)

[무엇을 하나요](#무엇을-하나요) · [시작하게 된 계기](#시작하게-된-계기) · [설계 포인트](#설계-포인트) ·
[아키텍처](#아키텍처) · [실행 방법](#실행-방법) · [잘하는 것 · 아직 아쉬운 점](#잘하는-것--아직-아쉬운-점)

</div>

---

## 무엇을 하나요

담당자가 건물의 연료·전기 사용량과 면적 정보만 입력하면, 환경부 고시 배출계수와 K-GHG·IPCC
기준에 따라 **Scope 1(연료 직접배출)·Scope 2(전력 간접배출)** 배출량이 자동으로 계산됩니다.
계산 결과는 건물·연도별 대시보드로 시각화되고, 클릭 한 번으로 행정 제출용 docx 보고서로
내려받을 수 있습니다. 감축 방향을 고민할 땐 챗봇에게 물어볼 수도 있습니다.

## 시작하게 된 계기

건물 부문은 국가 온실가스 배출의 약 20%를 차지하지만, 정작 공공건축물의 에너지 사용 현황을
표준화된 방식으로 관리하는 도구는 마땅치 않았습니다.

| 문제 | ZEBRA 이전 | ZEBRA 이후 |
|---|---|---|
| 데이터 관리 | 전기·가스·유류 사용량이 부서별로 흩어져 있음 | 건물 단위로 활동자료를 표준화해 한 곳에서 관리 |
| 배출량 계산 | 담당자가 배출계수를 찾아 수기로 계산 | 배출계수 자동 매핑으로 즉시 계산 |
| 보고서 작성 | 국내 K-GHG 지침에 맞는 양식이 따로 없음 | 클릭 한 번으로 지침에 맞는 docx 보고서 생성 |
| 현황 파악 | 건물·연도별 비교가 엑셀 수작업 | 대시보드에서 추세·비율·강도지표 즉시 시각화 |
| 개선 방향 | 어떤 대안이 효과적인지 판단 근거 부족 | 챗봇이 배출 데이터를 근거로 감축 방안 제안 |

## 주요 기능

- **온실가스 배출량 자동 산정** — 환경부 고시 배출계수 + K-GHG/IPCC 기준으로 Scope 1·2 자동 계산
- **Scope 자동 분류 및 단위 변환** — 연료·전력 활동자료 입력만으로 Scope 구분과 단위 변환 처리
- **대시보드 시각화** — 건물/기관/연도별 배출 추세, Scope 비율, 면적당 강도지표 그래프
- **목표 대비 성과 관리** — 감축 목표 대비 이행률 분석
- **보고서 자동 생성** — 기관·연도별 배출량 보고서를 docx로 원클릭 다운로드
- **감축 대안 추천 챗봇** — 건물 데이터를 근거로 감축 방안을 제안 (Hugging Face 기반)

<details>
<summary><b>📄 보고서 자동 생성, 무엇이 들어가나</b></summary>

<br>

`GET /api/reports/download?year=2024` 호출 한 번으로 아래 내용을 담은 `.docx` 파일이 생성됩니다
(`docxtpl` + Jinja2로 `report_template.docx` 서식에 데이터만 채워 넣는 방식).

| 구성 | 내용 |
|---|---|
| 기관/담당자 정보 | 기관명·유형·주소, 담당자명·부서·연락처, 보고서 생성 일시 |
| 산정 기간 | 조회 연도의 1/1 ~ 12/31 |
| 총괄 요약 | 기관 전체 총배출량(kg), 대상 건물 목록, 연면적 범위(최소~최대) |
| 최고 배출 건물 | 해당 연도 총배출량이 가장 큰 건물명과 배출량을 자동 선정 |
| 활동자료 표 | 건물별 고체·액체·기체 연료 사용량 + 전력 사용량(kWh) |
| 산정결과 표 | 건물별 Scope1·Scope2·총배출량(kg)·면적당 배출강도(kg/m²) |
| 연도별 추이 | 건물별 총배출량 데이터(연도 비교 헤더용) |

건물 데이터가 없는 연도는 204(No Content)로 응답하고, 남용 방지를 위해 사용자당 시간당 20회로
요청을 제한합니다(`ReportThrottle`).

</details>

## 설계 포인트

- **Tier 기반 배출계수** — 연료 사용량에 IPCC 방법론의 Tier(1/2/3) 개념을 그대로 적용. 사업장 고유
  배출계수·발열량이 없으면 `FuelDefaultCoeff`의 기본값으로 자동 대체
- **계산 결과 캐싱** — 활동자료(연료/전력/면적)가 바뀔 때만 재계산하고, 결과는 `EmissionAgg`에
  연도별 1행으로 upsert. 대시보드·보고서는 이 캐시 테이블만 조회해 응답 속도를 확보
- **건물 아카이브 처리** — 건물을 완전히 지우지 않고 `is_archived`로 소프트 삭제. 활성 건물 한정
  조건부 UniqueConstraint로 같은 이름을 재사용할 수 있도록 설계
- **인증 자동 갱신** — access 토큰이 만료되면 refresh 토큰으로 자동 재발급 후 원요청을 재시도
  (401을 사용자가 직접 마주치지 않도록 axios 인터셉터에서 처리)
- **서식 기반 보고서** — 코드로 문서를 그리는 대신 실제 행정 제출용 `.docx` 서식에 계산 결과만
  주입(`docxtpl`)해 담당자에게 익숙한 형태 그대로 출력

## 아키텍처

```
 ① 입력                    ② 산정                        ③ 집계 캐싱                  ④ 활용
┌──────────────┐   ┌──────────────────────┐   ┌──────────────────────┐   ┌───────────────────────┐
│ 연료 사용량   │   │ Scope 1/2 계산 서비스 │   │                       │   │ 대시보드 시각화        │
│ 전력 사용량   │──▶│ 배출계수 자동 매핑    │──▶│  EmissionAgg          │──▶│ docx 보고서 자동 생성   │
│ 건물 면적     │   │ (emissions/services) │   │  (건물×연도 1행 캐시) │   │ 감축 대안 챗봇 (HF)     │
└──────────────┘   └──────────────────────┘   └──────────────────────┘   └───────────────────────┘
```

백엔드는 Django 앱 단위로 관심사를 분리했습니다.

```
accounts    인증 · 기관/계정 관리 (JWT)
buildings   건물 등록 · 소프트 삭제
activities  연료/전력/면적 활동자료 입력
emissions   Scope 1·2 산정, 대시보드 집계(EmissionAgg)
reports     docx 보고서 자동 생성
chatbot     감축 대안 추천 (Hugging Face 연동)
```

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Frontend | React 19, React Router 7, Recharts, Axios |
| Backend | Django 5.2, Django REST Framework, drf-yasg(Swagger), SimpleJWT |
| DB (개발 / 운영 권장) | SQLite / PostgreSQL 14+ |
| 챗봇 | Hugging Face Inference API (OpenAI 호환 라우터) |
| 인증 | JWT (access/refresh 자동 갱신) |

<details>
<summary><b>API 개요</b></summary>

<br>

| 리소스 | 엔드포인트 | 설명 |
|---|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/refresh`, `GET /api/auth/me` | 회원가입/로그인/JWT 발급·갱신 |
| Buildings | `GET·POST /api/buildings`, `GET·PUT·PATCH·DELETE /api/buildings/{id}` | 건물 등록/조회/수정/삭제 |
| Activities | `GET·POST /api/activities/buildings/{id}/...`, `GET /api/activities/summary` | 연료·전기·면적 활동자료 입력/집계 |
| Dashboard | `GET /api/dashboard/buildings/{id}/scope1|scope2|total|trend|scope-ratio` 등 | 건물·기관 단위 배출량 대시보드 |
| Reports | `GET /api/reports/context`, `/download` | 보고서 데이터 조회 및 docx 다운로드 |
| Chatbot | `POST /chatbot/api/recommendation/` | 감축 대안 추천 |

</details>

<details>
<summary><b>데이터베이스 설계 요약</b></summary>

<br>

- `Institution` 1─N `Account`, 1─N `Building`
- `Building` 1─N `Scope1FuelUsage`(연료), `ElectricityUsage`(전력), `AreaInfo`(면적), `EmissionAgg`(연도별 집계)
- `Building`은 `(institution, place_id)`, `(institution, name)`에 대해 활성 건물(`is_archived=False`) 한정
  조건부 UniqueConstraint를 사용 — PostgreSQL 네이티브 지원, MySQL 사용 시 서비스 레이어 검증 필요
- `EmissionAgg`는 `(building, year)` 유니크로 연도별 1행을 유지하는 계산 결과 캐시 테이블

</details>

## 실행 방법

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate            # Windows
pip install -r requirements.txt
cp .env.example .env             # HF_TOKEN, DJANGO_SECRET_KEY 값 채우기
python manage.py migrate
python manage.py runserver       # http://127.0.0.1:8000
```

```bash
# Frontend (새 터미널)
cd frontend
npm install
cp .env.example .env
npm start                        # http://localhost:3000
```

| 환경변수 | 위치 | 용도 | 필수 |
|---|---|---|---|
| `DJANGO_SECRET_KEY` | backend/.env | Django 서명 키 | ✅ |
| `HF_TOKEN` | backend/.env | 챗봇용 Hugging Face 토큰 | ✅ (없으면 챗봇만 비활성) |
| `DEBUG` | backend/.env | 개발 모드 여부 | ✅ |
| `REACT_APP_API_BASE` | frontend/.env | 백엔드 API 주소 | ✅ |

## 잘하는 것 · 아직 아쉬운 점

**잘하는 것**
- 배출계수 자동 매핑으로 Scope 1·2 산정 실수를 줄임
- 계산 결과를 캐싱해 대시보드·보고서 조회가 빠름
- 만료된 로그인 세션을 사용자가 체감하지 못하게 자동 갱신

**아직 아쉬운 점**
- 테스트 코드가 아직 없음 — 리팩터링 시 회귀 검증은 수동에 의존
- `Building`의 조건부 UniqueConstraint는 PostgreSQL 전용 — MySQL로 옮기면 서비스 레이어 검증이 별도로 필요
- 챗봇은 Hugging Face 무료 추론 API에 의존해 응답 속도가 일정하지 않을 수 있음

## 개선 내역

원 팀 프로젝트 완료 이후 개인적으로 진행한 유지보수 작업입니다.

- **인증**: access 토큰 만료 시 refresh 토큰으로 자동 갱신하도록 구현 (기존엔 60분 후 재로그인 필요)
- **버그 수정**: 챗봇 건물 목록 API 500 에러, 건물/연도 전환 시 이전 응답이 최신 상태를 덮어쓰는
  레이스 컨디션, 소개 페이지에서 상단 메뉴 하이라이트가 안 되던 문제 등
- **보고서 로직 개선**: "예시 건물"을 무작위 선정하던 것을 최고 배출 건물 기준으로 변경
- **보안**: 히스토리에 남아있던 API 키·시크릿 제거, 환경변수 템플릿(`.env.example`) 추가
- **코드 정리**: 죽은 코드·미사용 변수·디버그 로그 제거, `requirements.txt` 인코딩 수정

---

<div align="center">

🌱 건물 하나하나의 배출량이 쌓여 탄소중립 목표가 됩니다.

</div>
