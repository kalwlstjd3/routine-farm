import { colors } from '@toss/tds-colors';
import { Button, Top } from '@toss/tds-mobile';
import { useEffect, useState } from 'react';
import { getRandomPet, type PetDefinition } from '../data/pets';
import { useRoutineStorage } from '../hooks/useRoutineStorage';

interface PetGachaPageProps {
  onDone: () => void;
}

export function PetGachaPage({ onDone }: PetGachaPageProps) {
  const { confirmPet } = useRoutineStorage();
  const [isLoading, setIsLoading] = useState(true);
  const [drawnPet, setDrawnPet] = useState<PetDefinition | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDrawnPet(getRandomPet());
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  function handleReroll() {
    setDrawnPet(getRandomPet());
  }

  async function handleConfirm() {
    if (drawnPet == null) return;
    setIsConfirming(true);
    await confirmPet(drawnPet.id);
    onDone();
  }

  const initialStage = drawnPet?.stages.initial;

  return (
    <>
      <Top
        title={
          <Top.TitleParagraph size={22} style={{ lineHeight: 1.4 }}>
            새로운 친구
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15} style={{ color: colors.grey500, lineHeight: 1.6, marginTop: 4 }}>
            {isLoading ? '두근두근... 어떤 친구가 나올까요? 🥚' : '새로운 친구를 만났어요!'}
          </Top.SubtitleParagraph>
        }
      />

      {/* 펫 공개 영역 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 24px 40px',
          gap: '16px',
        }}
      >
        {/* 이모지 원형 */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: isLoading ? '#F5F5F5' : (initialStage?.bg ?? '#F5F5F5'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 72,
            transition: 'background-color 0.4s ease',
            animation: isLoading ? 'pulse 1s ease-in-out infinite' : undefined,
          }}
        >
          {isLoading ? '🥚' : (initialStage?.emoji ?? '🥚')}
        </div>

        {/* 펫 이름 */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: colors.grey900,
            minHeight: 28,
          }}
        >
          {isLoading ? '' : drawnPet?.name}
        </div>

        {/* 설명 */}
        <div
          style={{
            fontSize: 14,
            color: colors.grey500,
            textAlign: 'center',
            lineHeight: 1.6,
            minHeight: 22,
          }}
        >
          {isLoading
            ? '친구를 찾는 중이에요...'
            : `${drawnPet?.startType === 'egg' ? '알에서 태어날' : '아기부터 함께 키울'} 수 있어요!`}
        </div>
      </div>

      {/* 버튼 영역 */}
      <div
        style={{
          padding: '0 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <Button
          size="large"
          style={{ width: '100%' }}
          disabled={isLoading || isConfirming}
          loading={isConfirming}
          onClick={handleConfirm}
        >
          이 아이로 할게요! 🐾
        </Button>
        <Button
          size="large"
          color="dark"
          variant="weak"
          style={{ width: '100%' }}
          disabled={isLoading || isConfirming}
          onClick={handleReroll}
        >
          다시 뽑기 (광고 보기)
        </Button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.95); }
        }
      `}</style>
    </>
  );
}
