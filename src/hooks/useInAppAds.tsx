import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { useDialog, useToast } from "@toss/tds-mobile";
import { useCallback, useEffect, useRef, useState } from "react";

interface Reward {
  unitType: string;
  unitAmount: number;
}

interface UseInAppAdsReturn {
  isAdLoaded: boolean;
  isSupported: boolean;
  showAd: () => void;
  lastReward: Reward | null;
  logs: string[];
}

// 참고문서: https://developers-apps-in-toss.toss.im/ads/intro.html
export function useInAppAds(adGroupId: string): UseInAppAdsReturn {
  const dialog = useDialog();
  const toast = useToast();

  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [lastReward, setLastReward] = useState<Reward | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const unregisterRef = useRef<(() => void) | null>(null);

  // ref로 최신 로드 상태 추적 — showAd의 stale closure 방지
  const isAdLoadedRef = useRef(false);

  // ref로 관리해서 useCallback 의존성 없이 최신 setLogs 사용
  const addLogRef = useRef((_msg: string) => {});
  addLogRef.current = (msg: string) => {
    const t = new Date().toLocaleTimeString("ko-KR");
    setLogs((prev) => [`[${t}] ${msg}`, ...prev].slice(0, 30));
  };

  function setLoaded(val: boolean) {
    isAdLoadedRef.current = val;
    setIsAdLoaded(val);
  }

  /**
   * 광고를 로드합니다. 마운트 시 자동 호출, 광고 완료 후 재호출해 다음 광고 준비.
   */
  const load = useCallback(() => {
    const log = (msg: string) => addLogRef.current(msg);
    setLoaded(false);
    log("loadFullScreenAd() 호출");

    try {
      unregisterRef.current = loadFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === "loaded") {
            log("이벤트: loaded ✓ → 버튼 활성화됨");
            setLoaded(true);
          }
        },
        onError: (error) => {
          log(`로드 onError: ${error}`);
          console.error("광고 로드 실패:", error);
        },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      log(`loadFullScreenAd() 예외: ${msg}`);
      console.error("광고 로드 실패:", e);
      setLoaded(false);
    }
  }, [adGroupId]);

  useEffect(() => {
    const log = (msg: string) => addLogRef.current(msg);
    let supported = false;
    try {
      supported = loadFullScreenAd.isSupported();
      log(`isSupported() → ${supported}`);
      setIsSupported(supported);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      log(`isSupported() 예외: ${msg}`);
      dialog.openAlert({
        title: "광고 지원 여부 확인 실패",
        description:
          "광고 지원 여부 확인 실패: \n\n- 인앱광고 기능은 브라우저가 아닌 샌드박스앱/토스앱에서 실행해주세요.\n\n" +
          e,
      });
      setIsSupported(false);
    }

    if (supported) {
      load();
    } else {
      log("지원 안 됨 → load 호출 건너뜀");
    }

    return () => {
      try {
        unregisterRef.current?.();
      } catch (error) {
        console.error("광고 정리(cleanup) 중 에러:", error);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  /**
   * 광고를 실제로 화면에 표시합니다.
   * - isAdLoadedRef로 체크해 stale closure 문제를 방지합니다.
   * - 광고 완료 후 자동으로 다음 광고를 load합니다 (load→show→load 순환).
   */
  const showAd = useCallback(() => {
    const log = (msg: string) => addLogRef.current(msg);

    log(`showAd() 진입 — isSupported=${isSupported}, isAdLoaded=${isAdLoadedRef.current}`);

    if (!isSupported) {
      log("showAd() 차단: isSupported=false");
      return;
    }

    // ref로 체크 — useCallback deps에서 isAdLoaded를 제거해 stale closure 방지
    if (!isAdLoadedRef.current) {
      log("showAd() 차단: isAdLoaded=false (아직 로드 안 됨)");
      return;
    }

    log("showFullScreenAd() 호출");
    try {
      showFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          switch (event.type) {
            case "userEarnedReward":
              log(`이벤트: userEarnedReward (${event.data.unitType} ${event.data.unitAmount})`);
              toast.openToast(
                `보상 획득: ${event.data.unitType} ${event.data.unitAmount}개`,
              );
              setLastReward(event.data);
              break;
            case "dismissed":
              log("이벤트: dismissed → 다음 광고 load");
              setLoaded(false);
              load();
              break;
            case "failedToShow":
              log("이벤트: failedToShow → 재load");
              setLoaded(false);
              load();
              break;
          }
        },
        onError: (error) => {
          log(`showFullScreenAd onError: ${error}`);
          setLoaded(false);
          load();
        },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      log(`showFullScreenAd() 예외: ${msg}`);
      setLoaded(false);
      load();
    }
  // isAdLoaded를 deps에서 제거 — ref로 최신값 참조
  }, [adGroupId, isSupported, load]);

  return { isAdLoaded, isSupported, showAd, lastReward, logs };
}
