# 쇼핑몰 MVP 플로우 차트

PRD.md를 기반으로 생성한 Mermaid 플로우 차트입니다.

## 1. 전체 시스템 아키텍처

```mermaid
graph TB
    subgraph "Frontend"
        A[Next.js App Router]
        B[React Components]
        C[Client Side State]
    end

    subgraph "Authentication"
        D[Clerk Auth]
        E[Clerk Session]
    end

    subgraph "Backend API"
        F[Next.js API Routes]
        G[Server Actions]
    end

    subgraph "Database"
        H[(Supabase PostgreSQL)]
        I[users]
        J[products]
        K[cart_items]
        L[orders]
        M[order_items]
    end

    subgraph "External Services"
        N[Toss Payments]
        O[Tavily API]
        P[Vercel Deployment]
    end

    A --> B
    B --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
    H --> K
    H --> L
    H --> M
    F --> N
    F --> O
    A --> P
```

## 2. 사용자 인증 및 동기화 플로우

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Frontend as Next.js Frontend
    participant Clerk as Clerk Auth
    participant API as API Route
    participant Supabase as Supabase DB

    User->>Frontend: 로그인/회원가입 요청
    Frontend->>Clerk: 인증 요청
    Clerk-->>Frontend: 인증 성공 (토큰)
    Frontend->>API: POST /api/sync-user
    API->>Clerk: 사용자 정보 조회
    Clerk-->>API: 사용자 정보 반환
    API->>Supabase: users 테이블 조회 (clerk_id)
    alt 사용자 존재
        Supabase-->>API: 기존 사용자 정보
        API->>Supabase: UPDATE users
    else 사용자 없음
        API->>Supabase: INSERT users
    end
    Supabase-->>API: 동기화 완료
    API-->>Frontend: 동기화 성공
    Frontend-->>User: 로그인 완료
```

## 3. 상품 탐색 및 조회 플로우

```mermaid
flowchart TD
    Start([사용자 접속])
    Start --> Home[홈페이지]

    Home --> Category{카테고리 선택?}
    Category -->|Yes| CategoryList[카테고리별 상품 목록]
    Category -->|No| AllProducts[전체 상품 목록]

    Home --> Popular[인기 상품 섹션]
    Popular --> ProductList[상품 목록 페이지]

    CategoryList --> ProductList
    AllProducts --> ProductList

    ProductList --> Search{검색?}
    Search -->|Yes| SearchResult[검색 결과]
    Search -->|No| DisplayList[상품 그리드 표시]

    SearchResult --> DisplayList
    DisplayList --> ProductDetail[상품 상세 페이지]

    ProductDetail --> ImageCheck{이미지 있음?}
    ImageCheck -->|No| TavilyAPI[Tavily API 이미지 검색]
    ImageCheck -->|Yes| DisplayProduct[상품 정보 표시]
    TavilyAPI --> DisplayProduct

    DisplayProduct --> SizeSelect[사이즈 선택]
    SizeSelect --> QuantitySelect[수량 선택]
    QuantitySelect --> AddToCart{장바구니 추가?}
    QuantitySelect --> BuyNow{바로 구매?}

    AddToCart --> CartAPI[POST /api/cart]
    BuyNow --> OrderPage[주문 페이지]

    CartAPI --> CartPage[장바구니 페이지]

    style Start fill:#e1f5ff
    style CartPage fill:#c8e6c9
    style OrderPage fill:#fff9c4
```

## 4. 장바구니 관리 플로우

```mermaid
flowchart TD
    Start([장바구니 페이지])
    Start --> LoadCart[GET /api/cart]
    LoadCart --> AuthCheck{Clerk 인증?}

    AuthCheck -->|No| LoginRequired[로그인 요청]
    AuthCheck -->|Yes| FetchCart[장바구니 아이템 조회]

    FetchCart --> DisplayItems[장바구니 아이템 표시]
    DisplayItems --> UpdateQuantity{수량 변경?}
    UpdateQuantity -->|Yes| UpdateAPI[PUT /api/cart/[id]]
    UpdateQuantity -->|No| DeleteItem{아이템 삭제?}

    DeleteItem -->|Yes| DeleteAPI[DELETE /api/cart/[id]]
    DeleteItem -->|No| SelectAll{전체 선택?}

    SelectAll --> CalculateTotal[총 금액 계산]
    UpdateAPI --> RefreshCart[장바구니 새로고침]
    DeleteAPI --> RefreshCart
    RefreshCart --> DisplayItems

    CalculateTotal --> OrderButton[주문하기 버튼]
    OrderButton --> OrderPage[주문서 작성 페이지]

    style Start fill:#e1f5ff
    style OrderPage fill:#fff9c4
    style LoginRequired fill:#ffcdd2
```

## 5. 주문 및 결제 프로세스 플로우

```mermaid
flowchart TD
    Start([주문하기])
    Start --> OrderForm[주문서 작성 페이지]
    OrderForm --> CartItems[장바구니 아이템 확인]
    CartItems --> ShippingInfo[배송지 정보 입력]

    ShippingInfo --> Validate{폼 유효성 검사}
    Validate -->|실패| ShowError[에러 메시지 표시]
    ShowError --> ShippingInfo
    Validate -->|성공| CreateOrder[POST /api/orders]

    CreateOrder --> GenerateOrderNum[주문번호 생성]
    GenerateOrderNum --> SaveOrder[orders 테이블 저장]
    SaveOrder --> SaveOrderItems[order_items 테이블 저장<br/>주문 시점 스냅샷]
    SaveOrderItems --> ClearCart[장바구니 아이템 삭제]
    ClearCart --> PaymentPage[결제 페이지]

    PaymentPage --> TossWidget[Toss Payments 위젯 표시]
    TossWidget --> UserPayment[사용자 결제 진행]
    UserPayment --> PaymentResult{결제 결과}

    PaymentResult -->|성공| VerifyPayment[POST /api/payments/verify<br/>서버 사이드 검증]
    PaymentResult -->|실패| PaymentFailed[결제 실패 메시지]
    PaymentFailed --> PaymentPage

    VerifyPayment --> UpdateOrderStatus[주문 상태 업데이트<br/>payment_status: paid<br/>status: completed]
    UpdateOrderStatus --> PaymentCallback[POST /api/payments/callback<br/>웹훅 처리]
    PaymentCallback --> OrderComplete[주문 완료 페이지<br/>주문번호 표시]

    OrderComplete --> MyPage[마이페이지 이동]
    OrderComplete --> Home[홈으로 이동]

    style Start fill:#e1f5ff
    style OrderComplete fill:#c8e6c9
    style PaymentFailed fill:#ffcdd2
```

## 6. 데이터베이스 관계도 (ER Diagram)

```mermaid
erDiagram
    users ||--o{ orders : "has"
    products ||--o{ cart_items : "in"
    products ||--o{ order_items : "contains"
    orders ||--o{ order_items : "has"
    orders ||--o| shipping_addresses : "has"

    users {
        uuid id PK
        text clerk_id UK
        text name
        timestamp created_at
    }

    products {
        uuid id PK
        text name
        text description
        integer price
        text image_url
        text category
        text_array sizes
        integer stock
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    cart_items {
        uuid id PK
        text clerk_id
        uuid product_id FK
        text size
        integer quantity
        timestamp created_at
        timestamp updated_at
    }

    orders {
        uuid id PK
        text clerk_id
        text order_number UK
        integer total_amount
        text status
        text payment_status
        text payment_id
        text recipient_name
        text recipient_phone
        text shipping_address
        text shipping_detail_address
        text shipping_postal_code
        timestamp created_at
        timestamp updated_at
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        text product_name
        integer product_price
        text size
        integer quantity
        timestamp created_at
    }

    shipping_addresses {
        uuid id PK
        uuid order_id FK
        text recipient_name
        text phone
        text address
        text detail_address
        text postal_code
        timestamp created_at
    }
```

## 7. API 호출 플로우

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Route
    participant Auth as Clerk Auth
    participant DB as Supabase
    participant Ext as External API

    Note over C,Ext: 상품 목록 조회
    C->>API: GET /api/products?category=tops
    API->>DB: SELECT * FROM products
    DB-->>API: 상품 목록
    API->>API: 이미지 보강 (Tavily)
    API-->>C: 상품 목록 반환

    Note over C,Ext: 장바구니 추가
    C->>API: POST /api/cart
    API->>Auth: 인증 확인
    Auth-->>API: userId
    API->>DB: INSERT/UPDATE cart_items
    DB-->>API: 성공
    API-->>C: 장바구니 아이템 반환

    Note over C,Ext: 주문 생성
    C->>API: POST /api/orders
    API->>Auth: 인증 확인
    Auth-->>API: userId
    API->>DB: INSERT orders
    API->>DB: INSERT order_items
    API->>DB: DELETE cart_items
    DB-->>API: 주문 정보
    API-->>C: 주문 정보 반환

    Note over C,Ext: 결제 검증
    C->>Ext: Toss Payments 결제
    Ext-->>C: 결제 완료
    C->>API: POST /api/payments/verify
    API->>Ext: 결제 검증
    Ext-->>API: 검증 결과
    API->>DB: UPDATE orders
    DB-->>API: 업데이트 완료
    API-->>C: 결제 검증 완료
```

## 8. 홈페이지 플로우

```mermaid
flowchart TD
    Start([홈페이지 접속])
    Start --> LoadCategories[카테고리 네비게이션 로드]
    LoadCategories --> DisplayCategories[6개 카테고리 표시<br/>상의, 하의, 아우터<br/>드레스, 신발, 액세서리]

    DisplayCategories --> LoadPopular[인기 상품 로드<br/>GET /api/products/popular]
    LoadPopular --> PopularCheck{주문 데이터 있음?}
    PopularCheck -->|Yes| PopularByOrder[주문량 기준 인기 상품]
    PopularCheck -->|No| LatestProducts[최신 상품으로 대체]

    PopularByOrder --> DisplayPopular[인기 상품 8-12개 표시]
    LatestProducts --> DisplayPopular

    DisplayPopular --> LoadLatest[최신 상품 로드<br/>GET /api/products]
    LoadLatest --> DisplayLatest[최신 상품 12-16개 표시]

    DisplayLatest --> MoreProducts{더보기 클릭?}
    MoreProducts -->|Yes| ProductListPage[상품 목록 페이지]
    MoreProducts -->|No| CategoryClick{카테고리 클릭?}

    CategoryClick -->|Yes| CategoryListPage[카테고리별 상품 목록]
    CategoryClick -->|No| ProductClick{상품 클릭?}

    ProductClick -->|Yes| ProductDetailPage[상품 상세 페이지]

    style Start fill:#e1f5ff
    style DisplayPopular fill:#fff9c4
    style DisplayLatest fill:#c8e6c9
```

## 9. 이미지 보강 플로우 (Tavily API)

```mermaid
flowchart TD
    Start([상품 데이터 조회])
    Start --> CheckImage{image_url 있음?}

    CheckImage -->|Yes| UseExisting[기존 이미지 사용]
    CheckImage -->|No| CheckTavilyKey{TAVILY_API_KEY<br/>설정됨?}

    CheckTavilyKey -->|No| UsePlaceholder[SVG 플레이스홀더 사용]
    CheckTavilyKey -->|Yes| BuildQuery[검색 쿼리 생성<br/>제품명 + 카테고리]

    BuildQuery --> CallTavily[POST Tavily API<br/>이미지 검색]
    CallTavily --> TavilyResult{Tavily 응답}

    TavilyResult -->|성공| ExtractImage[이미지 URL 추출]
    TavilyResult -->|실패| UsePlaceholder
    TavilyResult -->|에러| LogError[에러 로깅]
    LogError --> UsePlaceholder

    ExtractImage --> ReturnImage[이미지 URL 반환]
    UseExisting --> ReturnImage
    UsePlaceholder --> ReturnImage

    ReturnImage --> DisplayProduct[상품 표시]

    style Start fill:#e1f5ff
    style ReturnImage fill:#c8e6c9
    style UsePlaceholder fill:#ffcdd2
```

## 10. 전체 사용자 여정 (User Journey)

```mermaid
flowchart LR
    A[홈페이지 접속] --> B{로그인 상태?}
    B -->|No| C[로그인/회원가입]
    B -->|Yes| D[상품 탐색]
    C --> E[사용자 동기화<br/>Clerk → Supabase]
    E --> D

    D --> F[카테고리 선택]
    D --> G[검색]
    D --> H[인기 상품 보기]

    F --> I[상품 목록]
    G --> I
    H --> I

    I --> J[상품 상세]
    J --> K{이미지 있음?}
    K -->|No| L[Tavily 이미지 검색]
    K -->|Yes| M[상품 정보 표시]
    L --> M

    M --> N[사이즈/수량 선택]
    N --> O{액션 선택}
    O -->|장바구니| P[장바구니 추가]
    O -->|바로 구매| Q[주문서 작성]

    P --> R[장바구니 페이지]
    R --> S[수량 변경/삭제]
    S --> T[주문하기]
    T --> Q

    Q --> U[배송지 입력]
    U --> V[주문 생성]
    V --> W[Toss Payments 결제]
    W --> X{결제 결과}
    X -->|성공| Y[주문 완료]
    X -->|실패| W
    Y --> Z[마이페이지<br/>주문 내역 확인]

    style A fill:#e1f5ff
    style Y fill:#c8e6c9
    style Z fill:#fff9c4
```

---

**생성일**: 2025-02-13  
**기준 문서**: `docs/PRD.md`  
**버전**: 1.0 (MVP)
