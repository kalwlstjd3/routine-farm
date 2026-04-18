import { TossAds } from '@apps-in-toss/web-framework';
import { useLayoutEffect, useRef, useState } from 'react';

export function useBannerAd(adGroupId: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const destroyRef = useRef<(() => void) | null>(null);

  const addLogRef = useRef((_msg: string) => {});
  addLogRef.current = (msg: string) => {
    const t = new Date().toLocaleTimeString('ko-KR');
    setLogs((prev) => [`[${t}] ${msg}`, ...prev].slice(0, 30));
  };

  // useLayoutEffect: 브라우저 페인트 전에 DOM 크기를 확정하고 SDK 호출
  useLayoutEffect(() => {
    const log = (msg: string) => addLogRef.current(msg);

    let supported = false;
    try {
      supported = TossAds.attachBanner.isSupported();
      log(`isSupported() → ${supported}`);
      setIsSupported(supported);
    } catch (e: unknown) {
      log(`isSupported() 예외: ${e instanceof Error ? e.message : String(e)}`);
      setIsSupported(false);
    }

    if (supported && containerRef.current) {
      const el = containerRef.current;
      // SDK 호출 전 크기·표시 강제 설정 (배경색은 투명)
      el.style.display = 'block';
      el.style.width = '100%';
      el.style.height = '50px';
      el.style.minHeight = '50px';
      el.style.overflow = 'hidden';
      el.style.backgroundColor = 'transparent';

      try {
        const result = TossAds.attachBanner(adGroupId, el, {
          callbacks: {
            onAdRendered: (payload) => {
              log(`onAdRendered ✓ slotId=${payload.slotId}`);
              // 광고 렌더 성공 — 컨테이너 표시 유지
              el.style.height = '50px';
              el.style.display = 'block';
            },
            onAdFailedToRender: (payload) => {
              log(`onAdFailedToRender ✗ code=${payload.error.code}`);
              // 광고 없음(fill 실패) — 컨테이너 완전 숨김
              el.style.height = '0';
              el.style.minHeight = '0';
              el.style.display = 'none';
              setIsSupported(false);
            },
          },
        });
        destroyRef.current = result.destroy;
        log(`attachBanner 호출 완료 — 광고 로드 대기 중...`);
      } catch (e: unknown) {
        log(`attachBanner() 예외: ${e instanceof Error ? e.message : String(e)}`);
        el.style.display = 'none';
      }
    } else if (!supported) {
      log('지원 안 됨 → attachBanner 호출 건너뜀');
    } else {
      log('containerRef.current 없음');
    }

    return () => {
      try {
        // destroyAll 대신 이 배너만 정리
        destroyRef.current?.();
        destroyRef.current = null;
      } catch {
        // cleanup 실패 시 무시
      }
    };
  }, [adGroupId]);

  return { containerRef, isSupported, logs };
}
