# 🛒 Book Shop Backend

Node.js 기반 Express 프레임워크로 만든 도서 쇼핑몰 백엔드 프로젝트입니다.  
JWT 기반 인증, 카테고리별 도서 조회, 장바구니, 좋아요, 주문 등 주요 기능을 구현했습니다.

프론트엔드 프로젝트는 [book-store (GitHub)](https://github.com/sunfivemin/book-store) 와 연결됩니다.

---

## 📦 사용 기술 스택

- Node.js
- Express
- MySQL (with `mysql2`)
- dotenv
- cors
- express-validator
- jsonwebtoken
- http-status-codes

---

## 📁 디렉토리 구조

```bash
📦 book-shop
├── controller          # 각 도메인별 컨트롤러
├── routes              # 도메인별 라우터
├── mariadb.js          # DB 연결 설정
├── app.js              # 서버 진입점
├── .env                # 환경 변수
├── package.json
└── README.md
```

---

## 🛠 주요 기능

- 회원가입 / 로그인 (JWT 토큰 발급)
- 도서 목록 조회 (카테고리별, 최신순, 페이징 포함)
- 도서 상세 조회
- 장바구니 추가 / 조회 / 삭제
- 좋아요 추가 / 삭제
- 주문 생성 / 조회
- CORS 설정 및 인증 처리

---

## 🚀 실행 방법

1. `.env` 파일 생성:

```env
PORT=9999
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=bookshop
JWT_SECRET=your_jwt_secret
```

2. 의존성 설치:

```env
npm install
```

3. 서버 실행:

```env
npx nodemon app.js
```

⸻

📡 API 예시

📚 도서 목록 조회

```http
GET /books
GET /books?category_id=1&page=2
```

🛒 장바구니

```http
POST   /carts        // 장바구니에 추가
GET    /carts        // 장바구니 조회
DELETE /carts/:id    // 장바구니 항목 삭제
```

🧾 주문

```http
POST /orders
GET  /orders         // 주문 내역 조회
```

❤️ 좋아요

```http
POST   /likes
DELETE /likes/:id
```

⸻

🧩 프론트엔드 연결
• 프론트엔드 저장소: sunfivemin/book-store
• React + TypeScript 기반
• Tailwind CSS + Vanilla Extract 스타일 시스템
• 도서 목록, 카테고리, 장바구니 연동됨
