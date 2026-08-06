# Stock MSA


주식 조회, 주문, 잔액 관리, AI 투자 지원 기능을
MSA 구조로 분리해 구현한 모의 주식 거래 플랫폼입니다.


---


## 📷 Preview


### 메인 페이지


### 종목 조회 및 관심 종목


### 주문 및 거래 내역


### AI 투자 지원


---


# 1. 프로젝트 소개

Stock MSA는 주식 시세 조회, 관심 종목 관리, 주문 처리, 잔액 관리,
AI 기반 뉴스 분석과 자연어 주문 기능을 제공하는 모의 주식 거래 플랫폼입니다.

기존의 단일 애플리케이션 구조 대신 기능별 책임에 따라 서비스를 분리하고,
API Gateway를 통해 외부 요청을 라우팅했습니다.

서비스 간에는 HTTP 기반 동기 통신과 Kafka 기반 비동기 이벤트를 함께 사용하여
기능의 특성에 맞는 통신 구조를 구성했습니다.

주요 서비스는 다음과 같습니다.

- Gateway Service
- User Service
- Stock Service
- Trade Service
- Balance Service
- AI Service
- React Frontend

| 구분 | 내용 |
| --- | --- |
| 개발 기간 | 2026.05.10 ~ 2026.06.15 |
| 개발 인원 | 3명 |
| 프로젝트 형태 | 팀 프로젝트 |
| 주요 기술 | Spring Boot · React · FastAPI · Kafka · Redis · MySQL · Docker · AWS |


---


# 2. 팀 구성 및 담당 역할

본 프로젝트는 서비스별 코드 작성자를 완전히 분리하기보다,
MSA 구조와 서비스 간 통신 흐름을 팀원 모두가 함께 설계하고 이해한 뒤
각자 담당 서비스를 중심으로 구현하는 방식으로 진행했습니다.

Gateway Service, User Service, Kafka, Frontend 등 공통 영역은
팀원들이 함께 설계하고 구현했으며, 각 담당 서비스와 AI 기능을 중심으로 역할을 나누었습니다.

## 팀 구성

| 이름 | 역할 | 담당 영역 |
| --- | --- | --- |
| **송한솔** | **팀장** | MSA 기획·DB 설계, Balance Service, Gateway/User Service, Kafka, 뉴스 분석 AI, Frontend |
| 송가연 | 팀원 | MSA 기획·DB 설계, Stock Service, Gateway/User Service, 투자 어시스턴트 AI, Frontend |
| 유지원 | 팀원 | MSA 기획·DB 설계, Trade Service, Gateway/User Service, Kafka, 자연어 주문 챗봇, Frontend |

## 담당 역할 (송한솔)

### 프로젝트 기획

- 프로젝트 기획 및 MSA 아키텍처 설계
- 서비스별 데이터베이스 설계
- 서비스 간 통신 흐름 설계
- 팀장 역할 및 형상 관리

### Backend

- Balance Service 구현
- Gateway Service 및 User Service 공동 구현
- Kafka 기반 서비스 간 이벤트 처리
- 사용자 잔액 및 연결 계좌 관리
- 거래 처리에 따른 잔액 변경 이력 관리

### AI

- AI Service 내 뉴스 분석 기능 구현
- 뉴스 수집 및 분석 파이프라인 구현
- ChromaDB 기반 뉴스 데이터 저장 및 검색
- LLM 기반 종목 뉴스 요약·분석

### Frontend

- 서비스별 API 연동
- 주식 조회 및 거래 관련 화면 구현
- AI 뉴스 분석 화면 구현


---


# 3. 주요 기능

## 회원 / 인증

- 회원가입 및 로그인
- JWT 기반 인증
- Access Token 재발급 및 Refresh Token 관리
- API Gateway 기반 요청 인증 및 라우팅

## 종목 / 시세

- 주식 종목 및 현재가 조회
- 관심 종목 등록 및 관리
- 주가 차트 및 지수 정보 조회
- 한국투자증권 API 기반 시세 데이터 연동

## 주문 / 거래

- 매수·매도 주문
- 주문 대기 및 체결 처리
- 미체결 주문 및 주문 내역 조회
- 거래 내역 및 보유 종목 조회
- 실시간 주문 결과 전달
- WebSocket 기반 실시간 호가 조회

## 잔액 / 계좌

- 회원가입 시 사용자 기본 잔액 생성
- 연결 계좌 등록 및 관리
- 주문 처리 전 잔액 검증
- 매수·매도 결과에 따른 잔액 반영
- 잔액 변경 이력 관리

## AI 투자 지원

- 종목 관련 뉴스 수집 및 저장
- ChromaDB 기반 관련 뉴스 검색
- LLM 기반 뉴스 요약 및 분석
- 투자 관련 질의를 처리하는 투자 어시스턴트
- 자연어 기반 주식 주문 챗봇


---


# 4. 기술 스택

## Backend

- Java 17
- Spring Boot
- Spring Cloud Gateway
- Spring Security
- Spring Data JPA
- Spring Data Redis
- Spring Cloud OpenFeign
- Spring WebClient
- Spring WebSocket
- SSE
- JWT
- Redisson

## Frontend

- React
- Vite
- Axios
- TanStack Query
- STOMP
- SockJS

## AI

- Python 3.11
- FastAPI
- LangChain
- LangGraph
- OpenAI API
- ChromaDB
- BeautifulSoup
- Confluent Kafka

## Database / Messaging / Cache

- MySQL
- Amazon RDS
- Redis
- Apache Kafka

## Infrastructure / DevOps

- Docker
- Kubernetes
- Amazon EKS
- Amazon ECR
- Nginx
- GitHub Actions

## External API

- 한국투자증권 API
- OpenAI API

## Collaboration

- Git
- GitHub


---


# 5. 시스템 아키텍처

![System Architecture](docs/images/msa-architecture.drawio.svg)

## 시스템 구성

본 프로젝트는 업무 책임에 따라 서비스를 분리한 MSA 구조로 구성했습니다.

외부 요청은 Gateway Service를 통해 각 내부 서비스로 전달되며,
회원 인증과 권한 검증 또한 Gateway에서 공통 처리하도록 구성했습니다.

거래와 잔액처럼 서비스 간 처리 결과 공유가 필요한 기능은
Kafka 이벤트를 이용해 비동기적으로 통신하도록 설계했습니다.

AI 기능은 별도의 FastAPI 서비스로 분리하여
Python 기반 AI 라이브러리와 LLM 기능을 독립적으로 활용했습니다.


---


# 6. 서비스 구성

기능별 책임을 기준으로 서비스를 분리하고,
각 서비스가 독립적으로 비즈니스 로직을 수행하도록 구성했습니다.

외부 요청은 Gateway Service를 통해 전달되며,
서비스 간에는 HTTP 기반 동기 통신과 Kafka 기반 비동기 이벤트를 함께 사용했습니다.


| 서비스 | 역할 |
| --- | --- |
| React Frontend | 사용자 인터페이스 및 Gateway API 호출 |
| Gateway Service | 외부 요청 라우팅, JWT 검증 및 인증 사용자 정보 전달 |
| User Service | 회원가입, 로그인, 사용자 정보 및 Refresh Token 관리 |
| Stock Service | 종목·시세·관심 종목·주가 데이터 관리 |
| Trade Service | 매수·매도 주문, 주문 매칭, 체결 및 거래 내역 관리 |
| Balance Service | 사용자 잔액, 연결 계좌 및 잔액 변경 이력 관리 |
| AI Service | 뉴스 분석, 투자 어시스턴트 및 자연어 주문 처리 |


---


# 7. 주요 처리 흐름

## 7.1 회원가입 및 기본 잔액 생성

회원가입이 완료되면 User Service는 Kafka에 `user-created` 이벤트를 발행합니다.

Balance Service는 해당 이벤트를 구독하여 신규 사용자의 기본 잔액 데이터를 생성합니다.

회원 생성과 기본 잔액 생성을 각각의 서비스에서 담당하도록 구성했습니다.

```text
회원가입 완료
      │
      ▼
User Service
      │
      │ user-created Event 발행
      ▼
Apache Kafka
      │
      ▼
Balance Service
      │
      ▼
사용자 기본 잔액 생성
```

---

## 7.2 주문 처리 흐름

사용자가 매수·매도 주문을 요청하면 Trade Service가 주문을 생성하고 Redis 기반 주문장에서 주문을 매칭합니다.

주문이 체결되면 Trade Service는 거래 정보를 Kafka 이벤트로 발행하고, Balance Service는 이를 수신하여 잔액을 처리합니다.

잔액 처리 결과는 다시 Trade Service로 전달되며, 체결 정보 저장과 Stock Service 반영, SSE 기반 주문 결과 전송이 순차적으로 수행됩니다.

```text
주문 요청
    │
    ▼
Gateway Service
    │
    ▼
Trade Service
    │
    ▼
주문 생성 및 Redis 주문장 매칭
    │
    │ balance.trade.request
    ▼
Apache Kafka
    │
    ▼
Balance Service
    │
    ├── 잔액 처리 성공
    │       │
    │       │ balance.trade.success
    │       ▼
    │   Trade Service
    │       │
    │       ├── 체결 및 주문 내역 저장
    │       ├── SSE 체결 결과 전달
    │       └── stock.result Event 발행
    │                   │
    │                   ▼
    │              Stock Service
    │
    └── 잔액 처리 실패
            │
            │ balance.trade.fail
            ▼
        Trade Service
            │
            ├── 주문 실패 처리
            ├── Redis 주문장 제거
            └── SSE 실패 결과 전달
```

---

## 7.3 뉴스 분석 처리 흐름

사용자가 종목 분석을 요청하면 AI Service가 관련 뉴스를 수집하고, BeautifulSoup을 이용해 기사 본문을 추출합니다.

수집한 뉴스는 OpenAI Embedding을 통해 벡터화하여 ChromaDB에 저장하고, 사용자 요청과 유사한 뉴스를 검색하여 LLM의 Context로 활용합니다.

LLM은 검색된 뉴스와 사용자 요청을 기반으로 종목 분석 결과를 생성하여 반환합니다.

```text
종목 분석 요청
      │
      ▼
AI Service
      │
      ▼
한국경제 금융 RSS 수집
      │
      ▼
종목명 기반 뉴스 필터링
      │
      ▼
BeautifulSoup 기사 본문 수집
      │
      ▼
OpenAI Embedding
      │
      ▼
ChromaDB 저장
      │
      ▼
관련 뉴스 벡터 검색
      │
      ▼
검색 결과를 LLM Context로 구성
      │
      ▼
뉴스 분석 리포트 생성
      │
      ▼
분석 결과 반환
```


---


# 8. 주요 구현

## 8.1 API Gateway 기반 인증 및 라우팅

MSA 환경에서는 모든 요청이 Gateway Service를 통해 각 서비스로 전달됩니다.

Gateway Service는 요청 경로를 각 서비스로 라우팅하며, JWT를 검증한 뒤 인증된 사용자 정보만 내부 서비스로 전달하도록 구성했습니다.

이를 통해 인증 로직을 각 서비스에 중복 구현하지 않고 Gateway에서 공통으로 처리하도록 설계했습니다.

### 주요 구현

- 서비스별 요청 경로 라우팅
- JWT 기반 사용자 인증
- 인증 사용자 정보 Header 전달

---

## 8.2 Kafka 기반 서비스 간 이벤트 처리

서비스 간 직접 호출을 최소화하기 위해 Kafka 기반 이벤트 구조를 적용했습니다.

회원 생성, 주문 처리, 잔액 반영 등 서비스 간 상태 변경이 필요한 작업은 이벤트를 발행하고 필요한 서비스가 이를 구독하여 처리하도록 구성했습니다.

이를 통해 서비스 간 결합도를 낮추고 비동기적으로 데이터를 처리할 수 있도록 설계했습니다.

### 주요 구현

- 회원 생성 이벤트 처리
- 주문 및 거래 이벤트 처리
- 잔액 처리 이벤트
- Kafka 기반 비동기 통신

---

## 8.3 Balance Service

Balance Service는 사용자의 잔액과 연결 계좌를 관리하며, 주문 처리 과정에서 필요한 잔액 검증과 변경 이력을 담당합니다.

Trade Service에서 발행한 거래 이벤트를 Kafka를 통해 수신하고, 처리 결과를 다시 이벤트로 전달하여 서비스 간 데이터를 동기화하도록 구성했습니다.

### 주요 구현

- 사용자 기본 잔액 관리
- 연결 계좌 관리
- 주문 금액 검증 및 잔액 처리
- 잔액 변경 이력 관리
- Kafka 이벤트 수신 및 처리

---

## 8.4 AI 뉴스 분석

AI Service는 종목 관련 뉴스를 수집하고 분석하여 투자 판단에 참고할 수 있는 정보를 제공합니다.

수집한 뉴스는 OpenAI Embedding을 이용해 벡터화하여 ChromaDB에 저장하고, 사용자 요청과 관련성이 높은 뉴스를 검색한 뒤 LLM의 Context로 활용하도록 구성했습니다.

검색된 관련 뉴스를 LLM의 Context로 활용하여 종목 분석 결과를 생성하도록 구성했습니다.

### 주요 구현

- 한국경제 금융 RSS 기반 뉴스 수집
- BeautifulSoup 기반 기사 본문 추출
- OpenAI Embedding 기반 벡터 생성
- ChromaDB 기반 뉴스 저장 및 검색
- LLM 기반 뉴스 분석 결과 생성


---


# 9. 인증 및 보안

## 9.1 JWT 기반 인증

MSA 환경에서는 Gateway Service가 모든 요청의 진입점 역할을 수행합니다.

사용자가 로그인하면 User Service에서 Access Token을 발급하며, 이후 요청은 Gateway Service에서 JWT를 검증한 뒤 인증된 사용자 정보만 내부 서비스로 전달하도록 구성했습니다.

이를 통해 인증 로직을 각 서비스에 중복 구현하지 않고 Gateway에서 공통으로 처리하도록 설계했습니다.

### 주요 구현

- User Service 기반 JWT 발급
- Gateway Service 기반 JWT 검증
- 인증 사용자 정보 Header 전달

---

## 9.2 Refresh Token 관리

Refresh Token은 Redis를 이용하여 관리했습니다.

Access Token 재발급 요청 시 JWT 유효성을 확인한 뒤 Redis에 저장된 Refresh Token과 비교하여 일치하는 경우에만 새로운 Access Token을 발급하도록 구성했습니다.

로그아웃 시에는 Redis에 저장된 Refresh Token을 삭제하여 기존 Refresh Token을 이용한 재발급을 방지했습니다.

### 주요 구현

- Redis 기반 Refresh Token 저장
- Access Token 재발급
- 로그아웃 시 Refresh Token 제거


---


# 10. CI/CD 및 배포

각 서비스를 독립적으로 배포할 수 있도록 Gateway, User, Stock, Trade, Balance, AI, Frontend별 Dockerfile과 GitHub Actions Workflow를 구성했습니다.

서비스별 소스가 `main` 브랜치에 반영되면 해당 서비스의 Workflow만 실행되며, Docker 이미지를 생성해 Amazon ECR에 저장한 뒤 Amazon EKS에서 실행 중인 서비스가 새로운 이미지를 사용하도록 배포를 구성했습니다.

이를 통해 특정 서비스만 독립적으로 빌드하고 배포할 수 있도록 구성하여 MSA 구조에 맞는 배포 환경을 적용했습니다.

---

## 10.1 서비스별 Docker 구성

각 서비스는 독립적으로 컨테이너화하여 배포할 수 있도록 Docker 환경을 구성했습니다.

Spring Boot 서비스는 Java 17 기반으로 실행되도록 구성했으며, AI Service는 Python 3.11과 FastAPI 환경에서 실행되도록 구성했습니다.

Frontend는 React Build 결과를 Nginx를 통해 서비스하도록 구성했습니다.

### 주요 구현

- 서비스별 Dockerfile 구성
- Java 17 기반 Spring Boot 실행 환경
- Python 3.11 기반 FastAPI 실행 환경
- React Build 및 Nginx 기반 정적 파일 제공


---


## 10.2 GitHub Actions 기반 자동 배포

서비스별 Workflow를 구성하여 변경된 서비스만 독립적으로 빌드 및 배포하도록 구성했습니다.

Docker 이미지는 Amazon ECR에 저장하고, GitHub Actions를 통해 Amazon EKS에서 실행 중인 서비스가 새로운 이미지를 사용하도록 배포를 진행했습니다.

### 주요 구현

- 서비스별 GitHub Actions Workflow
- Amazon ECR Docker Image Push
- Commit SHA 기반 이미지 버전 관리
- Amazon EKS 배포 자동화


---


# 11. 기술적 고민 및 해결

## 11.1 서비스 간 통신 방식 선택

### 문제

MSA 구조에서는 서비스 간 통신 방식을 결정해야 했습니다.

모든 요청을 Kafka 기반 비동기 방식으로 처리하면 요청 흐름이 복잡해지고, 즉시 응답이 필요한 기능까지 이벤트 기반으로 처리해야 하는 문제가 있었습니다.

반대로 모든 통신을 HTTP 기반 동기 호출로 구성하면 서비스 간 의존도가 높아지고, 하나의 서비스 변경이 다른 서비스에도 영향을 줄 수 있었습니다.

### 해결

즉시 응답이 필요한 기능은 HTTP 기반 동기 통신을 사용하고, 하나의 서비스에서 발생한 상태 변경을 다른 서비스가 독립적으로 처리할 수 있는 기능은 Kafka 기반 비동기 이벤트로 분리했습니다.

회원가입 후 기본 잔액 생성, 주문 체결에 따른 잔액 처리, 거래 결과 반영과 같이 서비스 간 상태를 전달하는 작업은 Kafka를 적용했고, 사용자 요청에 대한 즉시 응답이 필요한 조회 및 검증 기능은 HTTP 기반 통신을 사용했습니다.

```text
즉시 응답이 필요한 요청
        │
        ▼
HTTP / OpenFeign

서비스 간 상태 변경
        │
        ▼
Kafka Event
```

### 결과

서비스의 특성에 따라 HTTP와 Kafka를 함께 사용하도록 구성했습니다.

즉시 응답이 필요한 기능은 단순한 요청·응답 구조를 유지하고, 서비스 간 상태 변경은 이벤트 기반으로 분리하여 각 서비스가 독립적으로 처리할 수 있도록 설계했습니다.

## 11.2 뉴스 데이터 중복 저장 문제

### 문제

뉴스 데이터를 주기적으로 수집하는 과정에서 동일한 기사가 반복해서 저장될 수 있었습니다.

중복 데이터가 계속 저장되면 ChromaDB의 검색 결과에 동일한 뉴스가 여러 번 포함될 수 있고, 저장 공간도 불필요하게 증가하는 문제가 있었습니다.

### 해결

기사 URL을 MD5 해시로 변환하여 ChromaDB의 Document ID로 사용했습니다.

새로운 뉴스를 저장하기 전에 동일한 Document ID가 존재하는지 확인하도록 구성하여 이미 저장된 뉴스는 다시 저장하지 않도록 처리했습니다.

```text
뉴스 수집
      │
      ▼
기사 URL
      │
      ▼
MD5 Hash 생성
      │
      ▼
Document ID 생성
      │
      ▼
중복 여부 확인
      │
 ┌────┴────┐
 │         │
없음      존재
 │         │
 ▼         ▼
저장      저장 생략
```

### 결과

동일한 뉴스가 반복 저장되는 문제를 방지하여 ChromaDB의 데이터 중복을 줄이고, 검색 결과의 일관성을 유지하도록 구성했습니다.

## 11.3 기사 본문 수집 실패 처리

### 문제

뉴스 기사마다 HTML 구조가 달라 일부 기사에서는 본문을 정상적으로 수집하지 못하는 경우가 있었습니다.

본문을 가져오지 못하면 뉴스 분석에 필요한 정보가 부족해질 수 있었습니다.

### 해결

BeautifulSoup으로 기사 본문을 우선 수집하고, 본문을 가져오지 못한 경우에는 RSS에서 제공하는 기사 요약 내용을 대신 사용하도록 처리했습니다.

```text
기사 수집
      │
      ▼
BeautifulSoup 본문 추출
      │
 ┌────┴────┐
 │         │
성공      실패
 │         │
 ▼         ▼
본문 사용 RSS 요약 사용
```

### 결과

본문 수집 실패 상황에서도 분석이 중단되지 않도록 하여 뉴스 분석 기능을 안정적으로 제공할 수 있도록 구성했습니다.


---


# 12. 핵심 코드


## 12.1 Kafka 기반 거래 이벤트 처리


## 12.2 Balance Service 잔액 검증 및 반영


## 12.3 Gateway JWT 인증


## 12.4 뉴스 수집 및 ChromaDB 기반 검색

