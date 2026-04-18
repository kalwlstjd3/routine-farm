// TODO: 출시 전 제거 예정
import { useEffect, useRef, useState } from 'react';
import { colors } from '@toss/tds-colors';
import { GoogleAdMob, loadFullScreenAd, TossAds } from '@apps-in-toss/web-framework';
import { AppStorage } from '../utils/storage';
import { clearConsoleLogs, subscribeConsoleLogs, type CapturedLog } from '../utils/consoleCapture';

const BANNER_AD_ID = 'ait.v2.live.15f9584f940c4e21';
const REWARDED_AD_ID = 'ait.v2.live.36d7a610d1764bc2';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const ALL_KEYS = [
  'streak', 'character', 'mission_done', 'today_mission',
  'onboarding_done', 'last_fed', 'custom_missions', 'my_pet', 'pet_confirmed',
];

async function clearAllStorage() {
  if (typeof window !== 'undefined' && !window.ReactNativeWebView) {
    localStorage.clear();
  } else {
    await Promise.all(ALL_KEYS.map((k) => AppStorage.removeItem(k)));
  }
}

async function setScenario(streak: number, missionDone: string, character: string) {
  await Promise.all([
    AppStorage.setItem('streak', String(streak)),
    AppStorage.setItem('mission_done', missionDone),
    AppStorage.setItem('character', character),
    AppStorage.setItem('my_pet', 'chicken'),
    AppStorage.setItem('pet_confirmed', 'true'),
    AppStorage.setItem('onboarding_done', 'true'),
  ]);
}

const SCENARIOS: { label: string; action: () => Promise<void> }[] = [
  { label: '전체 초기화', action: clearAllStorage },
  { label: '1일차', action: () => setScenario(1, todayStr(), 'initial') },
  { label: '3일차', action: () => setScenario(3, todayStr(), 'growing') },
  { label: '7일차', action: () => setScenario(7, todayStr(), 'juvenile') },
  { label: '14일차', action: () => setScenario(14, todayStr(), 'adult') },
  { label: '방치 1일', action: () => setScenario(3, daysAgoStr(1), 'hungry') },
  { label: '방치 3일', action: () => setScenario(3, daysAgoStr(3), 'fainted') },
  {
    label: '미션 초기화',
    action: () =>
      Promise.all([
        AppStorage.removeItem('today_mission'),
        AppStorage.removeItem('mission_done'),
      ]).then(() => {}),
  },
];

function getEnvChecks() {
  const rnwv = typeof window !== 'undefined' && 'ReactNativeWebView' in window;

  let tossAdsOk = false;
  let attachBannerOk = false;
  try {
    tossAdsOk = TossAds != null;
    attachBannerOk = typeof TossAds?.attachBanner === 'function';
  } catch { /* 브라우저 환경에서 정상 */ }

  // loadAppsInTossAdMob은 window 전역이 아니라 GoogleAdMob 객체의 메서드
  let loadAdMobOk = false;
  try { loadAdMobOk = typeof GoogleAdMob?.loadAppsInTossAdMob === 'function'; } catch {}

  // 실제 사용 중인 보상형 광고 API
  let loadFullScreenAdOk = false;
  let loadFullScreenAdSupported = false;
  try {
    loadFullScreenAdOk = typeof loadFullScreenAd === 'function';
    loadFullScreenAdSupported = loadFullScreenAd.isSupported();
  } catch {}

  return { rnwv, tossAdsOk, attachBannerOk, loadAdMobOk, loadFullScreenAdOk, loadFullScreenAdSupported };
}

interface DevPanelProps {
  bannerLogs?: string[];
  rewardedLogs?: string[];
}

export function DevPanel({ bannerLogs = [], rewardedLogs = [] }: DevPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<CapturedLog[]>([]);

  useEffect(() => {
    return subscribeConsoleLogs(setConsoleLogs);
  }, []);

  function handleDevTap() {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    const next = tapCount + 1;
    if (next >= 5) {
      setTapCount(0);
      setIsOpen((prev) => !prev);
    } else {
      setTapCount(next);
      tapTimer.current = setTimeout(() => setTapCount(0), 1000);
    }
  }

  async function run(action: () => Promise<void>) {
    await action();
    window.location.reload();
  }

  const env = getEnvChecks();

  const checkRow = (ok: boolean, label: string) => (
    <div key={label} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 13 }}>{ok ? '✅' : '❌'}</span>
      <span style={{ fontSize: 11, color: ok ? colors.grey700 : '#c0392b' }}>{label}</span>
    </div>
  );

  const logBox = (logs: string[]) => (
    <div
      style={{
        fontSize: 10,
        color: colors.grey700,
        backgroundColor: '#fff',
        borderRadius: 6,
        padding: '6px 8px',
        maxHeight: 90,
        overflowY: 'auto',
        border: `1px solid ${colors.grey200}`,
        fontFamily: 'monospace',
        lineHeight: 1.6,
        wordBreak: 'break-all',
      }}
    >
      {logs.length === 0
        ? <span style={{ color: colors.grey400 }}>로그 없음</span>
        : logs.map((l, i) => <div key={i}>{l}</div>)
      }
    </div>
  );

  return (
    <div style={{ padding: '0 24px 48px' }}>
      <div
        onClick={handleDevTap}
        style={{
          textAlign: 'center',
          fontSize: 10,
          color: colors.grey300,
          userSelect: 'none',
          padding: '12px 0',
          cursor: 'default',
        }}
      >
        DEV
      </div>

      {isOpen && (
        <div
          style={{
            padding: 16,
            backgroundColor: colors.grey50,
            borderRadius: 12,
            border: `1px solid ${colors.grey200}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {/* 시나리오 버튼 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.grey600, marginBottom: 12 }}>
            🛠 개발자 패널
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {SCENARIOS.map(({ label, action }) => (
              <button
                key={label}
                onClick={() => run(action)}
                style={{
                  padding: '8px 12px',
                  fontSize: 12,
                  color: colors.grey700,
                  backgroundColor: '#fff',
                  border: `1px solid ${colors.grey200}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 광고 디버그 */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: `1px solid ${colors.grey200}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.grey600, marginBottom: 10 }}>
              📡 광고 디버그
            </div>

            {/* 환경 체크 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              {checkRow(env.rnwv, 'window.ReactNativeWebView')}
              {checkRow(env.tossAdsOk, 'TossAds 객체')}
              {checkRow(env.attachBannerOk, 'TossAds.attachBanner (배너)')}
              {checkRow(env.loadAdMobOk, 'GoogleAdMob.loadAppsInTossAdMob')}
              {checkRow(env.loadFullScreenAdOk, 'loadFullScreenAd 함수 (보상형)')}
              {checkRow(env.loadFullScreenAdSupported, 'loadFullScreenAd.isSupported()')}
              <div style={{ fontSize: 10, color: colors.grey500, marginTop: 2, lineHeight: 1.7 }}>
                <div>배너 ID: {BANNER_AD_ID}</div>
                <div>보상형 ID: {REWARDED_AD_ID}</div>
              </div>
            </div>

            {/* 배너 광고 로그 */}
            <div style={{ fontSize: 11, fontWeight: 600, color: colors.grey600, marginBottom: 4 }}>
              배너 광고 로그
            </div>
            {logBox(bannerLogs)}

            {/* 보상형 광고 로그 */}
            <div style={{ fontSize: 11, fontWeight: 600, color: colors.grey600, marginTop: 10, marginBottom: 4 }}>
              보상형 광고 로그
            </div>
            {logBox(rewardedLogs)}
          </div>

          {/* 콘솔 에러 */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: `1px solid ${colors.grey200}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.grey600 }}>
                🚨 콘솔 에러
              </div>
              <button
                onClick={clearConsoleLogs}
                style={{
                  fontSize: 10,
                  color: colors.grey500,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.grey200}`,
                  borderRadius: 6,
                  padding: '2px 8px',
                  cursor: 'pointer',
                }}
              >
                에러 초기화
              </button>
            </div>

            {consoleLogs.length === 0 ? (
              <div style={{ fontSize: 11, color: '#27ae60' }}>에러 없음 ✅</div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  maxHeight: 160,
                  overflowY: 'auto',
                }}
              >
                {consoleLogs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 10,
                      backgroundColor: log.level === 'error' ? '#fff5f5' : '#fffbf0',
                      border: `1px solid ${log.level === 'error' ? '#fcc' : '#fde68a'}`,
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontFamily: 'monospace',
                      lineHeight: 1.5,
                      wordBreak: 'break-all',
                    }}
                  >
                    <span style={{ color: log.level === 'error' ? '#c0392b' : '#b7791f', fontWeight: 600 }}>
                      [{log.time}] {log.level.toUpperCase()}
                    </span>
                    {' '}{log.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
