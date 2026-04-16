import { TossAds } from '@apps-in-toss/web-framework';
import { useEffect, useRef, useState } from 'react';

export function useBannerAd(adGroupId: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    let supported = false;
    try {
      supported = TossAds.attachBanner.isSupported();
      setIsSupported(supported);
    } catch {
      setIsSupported(false);
    }

    if (supported && containerRef.current) {
      try {
        TossAds.attachBanner(adGroupId, containerRef.current);
      } catch (error) {
        console.error('배너 광고 로드 실패:', error);
      }
    }

    return () => {
      try {
        TossAds.destroyAll();
      } catch {
        // cleanup 실패 시 무시
      }
    };
  }, [adGroupId]);

  return { containerRef, isSupported };
}
