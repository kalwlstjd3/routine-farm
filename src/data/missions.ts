export const CATEGORIES = [
  '스트레칭/운동',
  '물 마시기/식습관',
  '눈/목 피로 해소',
  '명상/호흡',
  '정리정돈',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Mission {
  id: string;
  category: Category;
  title: string;
  description: string;
  isCustom?: boolean;
}

export const DEFAULT_MISSIONS: Mission[] = [
  // 스트레칭/운동
  { id: 'd1', category: '스트레칭/운동', title: '목 스트레칭', description: '천천히 목을 좌우로 5회씩 돌려보세요.' },
  { id: 'd2', category: '스트레칭/운동', title: '어깨 돌리기', description: '어깨를 앞·뒤로 10회씩 크게 돌려보세요.' },
  { id: 'd3', category: '스트레칭/운동', title: '제자리 걷기', description: '자리에서 1분 동안 제자리 걷기를 해보세요.' },
  { id: 'd4', category: '스트레칭/운동', title: '허리 스트레칭', description: '양손을 허리에 얹고 좌우로 천천히 기울여 보세요.' },

  // 물 마시기/식습관
  { id: 'd5', category: '물 마시기/식습관', title: '물 한 컵 마시기', description: '지금 바로 물 한 컵(200ml)을 천천히 마셔보세요.' },
  { id: 'd6', category: '물 마시기/식습관', title: '과일 한 조각 먹기', description: '사과, 바나나 등 과일 한 조각으로 에너지를 보충하세요.' },
  { id: 'd7', category: '물 마시기/식습관', title: '간식 줄이기 다짐', description: '오늘 하루 단 음식 섭취를 줄이겠다고 다짐해 보세요.' },

  // 눈/목 피로 해소
  { id: 'd8', category: '눈/목 피로 해소', title: '먼 곳 바라보기', description: '5m 이상 먼 곳을 1분 동안 바라보며 눈의 긴장을 풀어보세요.' },
  { id: 'd9', category: '눈/목 피로 해소', title: '눈 감고 휴식', description: '눈을 감고 천천히 호흡하며 1분간 눈을 쉬게 해보세요.' },
  { id: 'd10', category: '눈/목 피로 해소', title: '눈동자 운동', description: '눈동자를 위·아래·좌·우·대각선으로 천천히 움직여 보세요.' },
  { id: 'd11', category: '눈/목 피로 해소', title: '목 앞뒤 스트레칭', description: '턱을 가슴 쪽으로 당겼다가 천장을 향해 들어 올려 보세요.' },

  // 명상/호흡
  { id: 'd12', category: '명상/호흡', title: '4-7-8 호흡법', description: '4초 들이쉬고, 7초 참고, 8초 내쉬는 호흡을 2~3회 반복하세요.' },
  { id: 'd13', category: '명상/호흡', title: '복식 호흡', description: '배를 부풀리며 코로 천천히 들이쉬고 입으로 내쉬어 보세요.' },
  { id: 'd14', category: '명상/호흡', title: '감사 일기 한 줄', description: '오늘 감사한 일 한 가지를 마음속으로 떠올려 보세요.' },

  // 정리정돈
  { id: 'd15', category: '정리정돈', title: '책상 위 정리', description: '책상 위 불필요한 물건을 치우고 깔끔하게 정리해 보세요.' },
  { id: 'd16', category: '정리정돈', title: '쓰레기 비우기', description: '주변 쓰레기통을 확인하고 가득 찼다면 비워 보세요.' },
  { id: 'd17', category: '정리정돈', title: '가방/지갑 정리', description: '가방이나 지갑 속 영수증·불필요한 물건을 꺼내 정리해 보세요.' },
];
