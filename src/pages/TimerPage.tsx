import { colors } from '@toss/tds-colors';
import { Button, TextButton, Top } from '@toss/tds-mobile';
import { useEffect, useRef, useState } from 'react';
import { type Mission } from '../data/missions';
import { useBannerAd } from '../hooks/useBannerAd';

const BANNER_AD_ID = 'ait.v2.live.15f9584f940c4e21';

const TOTAL_SECONDS = 60;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TimerPageProps {
  isAdsInitialized: boolean;
  mission: Mission;
  onComplete: () => void;
  onBack: () => void;
}

export function TimerPage({ isAdsInitialized, mission, onComplete, onBack }: TimerPageProps) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { containerRef: bannerRef, isSupported: isBannerSupported } = useBannerAd(BANNER_AD_ID, isAdsInitialized);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 타이머 완료 시 1.5초 후 자동으로 완료 처리
  useEffect(() => {
    if (!isDone) return;
    const timeout = setTimeout(() => onComplete(), 1500);
    return () => clearTimeout(timeout);
  }, [isDone]);

  const progress = secondsLeft / TOTAL_SECONDS;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <>
      <Top
        upper={
          <TextButton
            size="medium"
            color={colors.grey700}
            onClick={onBack}
            style={{ padding: '16px 24px 0' }}
          >
            ← 뒤로
          </TextButton>
        }
        title={<Top.TitleParagraph size={22} style={{ lineHeight: 1.4 }}>{mission.title}</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15} style={{ color: colors.grey500, lineHeight: 1.6, marginTop: 4 }}>
            {mission.description}
          </Top.SubtitleParagraph>
        }
      />

      {/* 원형 타이머 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 24px 40px',
        }}
      >
        {/* SVG + 숫자 겹치기 */}
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
            {/* 배경 트랙 */}
            <circle
              cx={70}
              cy={70}
              r={RADIUS}
              fill="none"
              stroke={colors.grey100}
              strokeWidth={10}
            />
            {/* 진행 호 */}
            <circle
              cx={70}
              cy={70}
              r={RADIUS}
              fill="none"
              stroke={isDone ? '#4CAF50' : '#FF8A65'}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.8s linear' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: isDone ? '#4CAF50' : colors.grey900,
              letterSpacing: 1,
            }}
          >
            {isDone ? '완료!' : timeLabel}
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 14, color: colors.grey500 }}>
          {isDone ? '미션을 성공적으로 완료했어요 🎉' : '미션을 수행하는 동안 타이머가 돌아가요'}
        </div>
      </div>

      {/* 완료하기 버튼 */}
      <div style={{ padding: '0 24px', paddingBottom: isBannerSupported ? 112 : 32 }}>
        <Button
          size="large"
          style={{ width: '100%' }}
          disabled={!isDone}
          onClick={onComplete}
        >
          완료하기 ✓
        </Button>
      </div>

      {/* 배너 광고 — 토스앱 환경에서만 노출 (height/backgroundColor는 hook이 제어) */}
      <div
        ref={bannerRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: isBannerSupported ? 'block' : 'none',
        }}
      />
    </>
  );
}
