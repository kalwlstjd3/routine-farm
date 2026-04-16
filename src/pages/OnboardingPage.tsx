import { colors } from '@toss/tds-colors';
import { AppStorage as Storage } from '../utils/storage';
import { Button, Top } from '@toss/tds-mobile';

const ONBOARDING_KEY = 'onboarding_done';

const STEPS = [
  { emoji: '🥚', title: '매일 1분 미션 완료', desc: '짧지만 꾸준한 습관이 시작돼요' },
  { emoji: '🔥', title: '연속 달성 일수 쌓기', desc: '매일 완료하면 연속 기록이 늘어나요' },
  { emoji: '🐔', title: '캐릭터가 성장해요', desc: '알에서 병아리, 닭까지 함께 성장해요' },
];

interface OnboardingPageProps {
  onDone: () => void;
}

export function OnboardingPage({ onDone }: OnboardingPageProps) {
  async function handleStart() {
    await Storage.setItem(ONBOARDING_KEY, 'true');
    onDone();
  }

  return (
    <>
      <Top
        title={
          <Top.TitleParagraph size={24}>루티팜에 오신 걸 환영해요!</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15} style={{ color: colors.grey500 }}>
            매일 1분으로 건강한 습관을 키워보세요
          </Top.SubtitleParagraph>
        }
      />

      {/* 알 캐릭터 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '24px 0 8px',
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #fff9e6, #ffe0b2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 52,
            boxShadow: '0 4px 20px rgba(255, 160, 80, 0.25)',
          }}
        >
          🥚
        </div>
      </div>

      {/* 3단계 설명 카드 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '32px 24px',
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '20px',
              borderRadius: 16,
              backgroundColor: colors.grey50,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {step.emoji}
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.grey900,
                  marginBottom: 4,
                }}
              >
                {step.title}
              </div>
              <div style={{ fontSize: 14, color: colors.grey500 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 시작하기 버튼 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 24px 32px',
          backgroundColor: '#fff',
        }}
      >
        <Button size="large" style={{ width: '100%' }} onClick={handleStart}>
          시작하기
        </Button>
      </div>
    </>
  );
}

export { ONBOARDING_KEY };
