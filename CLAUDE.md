<!-- @docs/skills/apps-in-toss.md -->
<!-- @docs/skills/tds-mobile.md -->

# 루티팜 (RoutineFarm)

## 앱 컨셉
매일 1분짜리 건강 미션을 완료하면 다마고치 스타일의 펫 캐릭터가 성장하는 앱인토스 미니앱.
"루틴(습관)을 키우다"는 의미를 담은 앱.

## 타겟 사용자
불특정 다수

## 수익 모델
인앱 광고 (보상형)
- 캐릭터 hungry/fainted 상태일 때 광고 보고 밥 주기
- 펫 뽑기 후 마음에 안 들면 광고 보고 다시 뽑기
- 14일 달성 후 새 펫 뽑을 때 광고 시청
- 브라우저 환경에서는 광고 비활성화, 토스앱/샌드박스에서만 동작

## 기술 스택
- Vite + React + TypeScript
- 앱인토스 SDK (@apps-in-toss/web-framework)
- TDS (@toss/tds-mobile)
- Storage: 브라우저는 localStorage fallback, 토스앱은 앱인토스 Storage 사용 (src/utils/storage.ts)

## 화면 구성

### 1. 온보딩 (OnboardingPage)
- 최초 1회만 표시 (Storage 'onboarding_done' 키로 관리)
- 🥚 캐릭터 + 3가지 소개 카드
- "시작하기" 버튼 → 홈으로 이동

### 2. 홈 (HomePage)
- 펫 없는 상태: 🥚 회색 알 + "첫 미션을 완료하면 새로운 친구를 만날 수 있어요!" 안내
- 펫 있는 상태: 현재 펫 성장 단계 이모지 + 라벨
- hungry/fainted 상태: "광고 보고 캐릭터 밥 주기" 버튼
- 연속 달성 일수 카드 (🔥)
- 오늘의 미션 영역:
  - 미션 미선택: "미션 고르기 →" → MissionSelectPage
  - 미션 선택됨: 미션 내용 + "미션 시작하기" → TimerPage
  - 미션 완료: "오늘 미션 완료! ✓" 비활성화

### 3. 미션 선택 (MissionSelectPage)
- 🎲 랜덤 버튼: 전체 미션 중 랜덤 1개 선택
- 카테고리 탭 5개: 스트레칭/운동, 물 마시기/식습관, 눈/목 피로 해소, 명상/호흡, 정리정돈
- 미션 선택 후 "이 미션 선택" → 홈으로 복귀
- Storage 'today_mission' 키에 JSON 저장, 매일 자정 초기화

### 4. 타이머 (TimerPage)
- 미션 제목 + 설명 표시
- SVG 원형 카운트다운 (60초)
- "완료하기 ✓": 카운트다운 완료 전까지 비활성화
- 완료 시 completeMission() 호출
  - 펫 없으면 → PetGachaPage로 이동
  - 펫 있으면 → 홈으로 복귀 (14일 달성 시 완전 성체 다이얼로그 표시)

### 5. 펫 뽑기 (PetGachaPage)
- 첫 미션 완료 후 또는 14일 달성 후 새 펫 뽑을 때 표시
- "두근두근... 어떤 친구가 나올까요? 🥚" 문구
- 2초 로딩 애니메이션 후 랜덤 펫 공개
- "다시 뽑기 (광고 보기)" → 광고 시청 후 재뽑기 (브라우저는 그냥 랜덤)
- "이 아이로 할게요!" → 펫 확정 저장 후 홈으로

## 펫 시스템 (10종) — src/data/pets.ts

### 알/부화 시작 (4종)
닭 (chicken), 거북이 (turtle), 앵무새 (parrot), 오리 (duck)

### 아기부터 시작 (6종)
고양이(스코티시폴드) (cat_scottish), 고양이(러시안블루) (cat_russian),
강아지(포메라니안) (dog_pomeranian), 강아지(골든리트리버) (dog_golden),
강아지(시바이누) (dog_shiba), 햄스터 (hamster)

### 성장 단계 (GrowthStage 타입)
| GrowthStage | 연속 달성 일수 | 알/부화 시작 | 아기 시작 |
|---|---|---|---|
| initial  | 0일   | 🥚 알       | 🐱 아기    |
| growing  | 3일   | 🐣 부화중   | 조금 자람  |
| juvenile | 7일   | 🐥 새끼     | 청년       |
| adult    | 14일  | 성체        | 완전 성체  |
| hungry   | 1일 방치 | 😢 배고파요 | 😢 배고파요 |
| fainted  | 3일+ 방치 | 😵 기절    | 😵 기절    |

### 14일 달성 시
팝업: "🎉 완전 성체 달성! 새로운 친구를 만날까요?"
- "새 펫 뽑기 (광고 보기)" → PetGachaPage
- "이 아이와 계속하기" → 현재 펫 유지

## Storage 키 목록
| 키 | 값 | 설명 |
|---|---|---|
| streak | 숫자 | 연속 달성 일수 |
| character | 문자열 | 현재 성장 단계 (GrowthStage) |
| mission_done | YYYY-MM-DD | 마지막 미션 완료 날짜 |
| today_mission | JSON | 오늘 선택한 미션 |
| onboarding_done | 'true' | 온보딩 완료 여부 |
| last_fed | YYYY-MM-DD | 마지막 밥 준 날짜 |
| custom_missions | JSON | 사용자 추가 미션 목록 |
| my_pet | 문자열 | 현재 펫 ID (예: 'cat_scottish') |
| pet_confirmed | 'true' | 펫 확정 여부 |

## 유저에게 보여주는 텍스트 규칙
- "스트릭" 대신 "연속 달성 일수" 사용

## 브라우저 개발 환경 참고
- 광고 기능은 토스앱/샌드박스에서만 동작 (브라우저 노출 안 함)
- SafeAreaInsets 에러는 브라우저 환경에서 정상 (무시)
- localStorage.clear() 후 새로고침하면 온보딩부터 재시작
