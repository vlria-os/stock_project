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
API Gateway를 통해 외부 요청을 라우팅하며, 서비스 간에는 HTTP 통신과 Kafka 기반 비동기 이벤트를 함께 사용하도록 구성했습니다.

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
- 뉴스 수집 및 분석 흐름 구현
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
- WebSocket 기반 실시간 호가 제공

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
- Nginx
- Kubernetes
- Amazon EKS
- Amazon ECR
- GitHub Actions

## External API

- 한국투자증권 API
- OpenAI API

## Collaboration

- Git
- GitHub


---


# 5. 시스템 아키텍처

![System Architecture](docs/images/msa-architecture.svg)

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

Gateway Service는 외부 요청을 각 서비스로 전달하며,
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

## 7.1 회원가입 및 초기 데이터 생성

회원가입 완료
      │
User Service
      │
Kafka User Event 발행
      │
├── Balance Service: 기본 잔액 생성
└── Stock Service: 사용자 관련 초기 데이터 처리

## 7.2 주문 처리 흐름

주문 요청
      │
Gateway Service
      │
Trade Service
      │
잔액 확인 요청
      │
Kafka Event
      │
Balance Service
      │
잔액 확인 및 응답
      │
Trade Service
      │
주문 처리 및 체결
      │
Kafka Event
      │
├── Balance Service: 잔액 반영
└── Stock Service: 보유 정보 반영


## 7.3 자연어 주문 흐름


사용자 자연어 입력
      │
AI Service
      │
주문 정보 추출
      │
Kafka 주문 이벤트 발행
      │
Trade Service
      │
주문 처리
      │
결과 반환


---


# 8. 주요 구현

## 8.1 API Gateway 기반 인증 및 라우팅

- 서비스별 요청 경로 라우팅
- Gateway에서 JWT 검증
- 인증 사용자 정보 Header 전달

## 8.2 Kafka 기반 서비스 간 이벤트 처리

- User Service 회원 생성 이벤트
- Trade Service 주문 및 거래 이벤트
- Balance Service 잔액 처리 이벤트
- 서비스 간 비동기 통신

## 8.3 Balance Service

- 사용자별 기본 잔액 관리
- 연결 계좌 관리
- 주문 금액 확인 및 잔액 처리
- 잔액 변경 이력 저장
- Kafka 이벤트 수신 및 처리

## 8.4 Stock Service

- 한국투자증권 API 기반 종목 및 주가 조회
- 주가 차트 데이터 관리
- 관심 종목 관리
- 스케줄러 기반 시세 데이터 갱신

## 8.5 Trade Service

- 매수·매도 주문 관리
- Redis 기반 주문장 관리
- 주문 매칭 엔진
- 주문 상태 및 거래 내역 관리
- SSE 기반 주문 결과 전달


---


# 9. AI Service

## 9.1 뉴스 분석 서비스

- 종목 관련 뉴스 수집
- 뉴스 데이터 전처리
- ChromaDB 저장
- 관련 뉴스 검색
- LLM 기반 뉴스 요약 및 분석

## 9.2 투자 어시스턴트

- 사용자 입력 기반 투자 정보 제공
- 종목 및 투자 관련 질의 처리
- LangGraph 기반 처리 흐름

## 9.3 자연어 주문 챗봇

- 자연어에서 종목, 수량, 매수·매도 정보 추출
- 주문 정보 검증
- Kafka 기반 주문 이벤트 전달
- 주문 처리 결과 반환


---


# 10. 인증 및 보안

## 10.1 JWT 기반 인증

- User Service에서 Access Token 발급
- Gateway Service에서 JWT 검증
- 인증된 사용자 요청만 내부 서비스로 전달

## 10.2 Refresh Token 관리

- Redis 기반 Refresh Token 저장
- Access Token 재발급
- 로그아웃 시 Refresh Token 제거

## 10.3 Gateway Rate Limiting

- Redis 기반 요청 횟수 관리
- 비정상적이거나 과도한 요청 제한


---


# 11. CI/CD 및 배포

## 11.1 서비스별 Docker 구성

- Gateway Service
- User Service
- Stock Service
- Trade Service
- Balance Service
- AI Service
- React Frontend

## 11.2 GitHub Actions 기반 자동 배포

- 서비스별 Workflow 구성
- Docker Image Build
- 서비스별 배포 자동화


---


# 12. Troubleshooting

## 12.1 Kafka 기반 서비스 간 데이터 정합성 처리

### 문제


### 원인


### 해결


### 결과


## 12.2 Gateway 인증 정보 전달 문제


### 문제


### 해결


### 결과


## 12.3 주문 처리와 잔액 반영 시점 문제


### 문제


### 해결


### 결과


## 12.4 AI 뉴스 데이터 검색 및 응답 구성 문제


### 문제


### 해결


### 결과


---


# 13. 핵심 코드


## 13.1 Kafka 기반 거래 이벤트 처리


## 13.2 Balance Service 잔액 검증 및 반영


## 13.3 Gateway JWT 인증


## 13.4 뉴스 수집 및 ChromaDB 기반 검색

