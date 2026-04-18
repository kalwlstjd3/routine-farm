import { colors } from "@toss/tds-colors";
import { Button, List, ListRow, TextButton, Top } from "@toss/tds-mobile";
import { useEffect, useState } from "react";
import { useBannerAd } from "../hooks/useBannerAd";
import { useInAppAds } from "../hooks/useInAppAds";
import { useTodayMission } from "../hooks/useTodayMission";
import { useRoutineStorage } from "../hooks/useRoutineStorage";
import { getPetStageInfo } from "../data/pets";
import { type Mission } from "../data/missions";
import { DevPanel } from "../components/DevPanel";

const BANNER_AD_ID = "ait-ad-test-banner-id"; // TODO: 테스트 후 "ait.v2.live.15f9584f940c4e21" 으로 복원
const REWARDED_AD_ID = "ait.v2.live.36d7a610d1764bc2";

interface HomePageProps {
  showMatureDialog: boolean;
  onMatureDialogDismiss: () => void;
  onGoToGacha: () => void;
  onMissionSelectOpen: () => void;
  onMissionStart: (mission: Mission) => void;
}

export function HomePage({
  showMatureDialog,
  onMatureDialogDismiss,
  onGoToGacha,
  onMissionSelectOpen,
  onMissionStart,
}: HomePageProps) {
  const { streak, growthStage, missionDoneToday, myPet, loading, feedCharacter } =
    useRoutineStorage();
  const { todayMission, loading: missionLoading } = useTodayMission();

  const [isMatureDialogOpen, setMatureDialogOpen] = useState(showMatureDialog);

  useEffect(() => {
    if (showMatureDialog) setMatureDialogOpen(true);
  }, [showMatureDialog]);

  const hasPet = myPet != null;
  const stage = getPetStageInfo(myPet, growthStage);
  const isHungry = growthStage === "hungry" || growthStage === "fainted";

  // 밥 주기 버튼 표시 여부 — 미션 완료와 무관하게, 밥 주기 완료 후에만 사라짐
  const [needsFeeding, setNeedsFeeding] = useState(false);
  useEffect(() => {
    if (!loading) setNeedsFeeding(hasPet && isHungry);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // 배너 광고
  const { containerRef: bannerRef, isSupported: isBannerSupported, logs: bannerLogs } = useBannerAd(BANNER_AD_ID);

  // 보상형 광고 (밥 주기)
  const { showAd: showRewardedAd, isAdLoaded: isRewardedAdLoaded, isSupported: isRewardedAdSupported, lastReward, logs: rewardedLogs } = useInAppAds(REWARDED_AD_ID);

  // 보상 지급 시 캐릭터 밥 주기
  useEffect(() => {
    if (lastReward != null) {
      feedCharacter();
      setNeedsFeeding(false);
    }
  }, [lastReward]);

  const isPageLoading = loading || missionLoading;

  return (
    <>
      <Top
        title={
          <Top.TitleParagraph size={22} style={{ lineHeight: 1.4 }}>루티팜</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15} style={{ color: colors.grey500, lineHeight: 1.6, marginTop: 4 }}>
            오늘도 미션을 완료해 캐릭터를 키워보세요!
          </Top.SubtitleParagraph>
        }
      />

      {/* 캐릭터 영역 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 24px 24px",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: hasPet ? stage.bg : colors.grey100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            filter: hasPet ? "none" : "grayscale(1)",
            transition: "background-color 0.3s ease",
          }}
        >
          {hasPet ? stage.emoji : "🥚"}
        </div>

        <div style={{ fontSize: 13, color: colors.grey500, fontWeight: 500 }}>
          {hasPet ? stage.label : "알"}
        </div>

        {/* 펫 없는 상태 안내 */}
        {!hasPet && !isPageLoading && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              backgroundColor: colors.grey50,
              fontSize: 13,
              color: colors.grey600,
              textAlign: "center",
              lineHeight: 1.6,
              maxWidth: 240,
            }}
          >
            첫 미션을 완료하면 새로운 친구를 만날 수 있어요!
          </div>
        )}

        {/* 광고 보고 캐릭터 밥 주기 — 밥 주기 완료 전까지 유지 */}
        {hasPet && needsFeeding && (
          <Button
            size="small"
            color="dark"
            variant="weak"
            onClick={showRewardedAd}
            disabled={isRewardedAdSupported && !isRewardedAdLoaded}
            loading={isRewardedAdSupported && !isRewardedAdLoaded}
            style={{ marginTop: 4 }}
          >
            📺 광고 보고 캐릭터 밥 주기
          </Button>
        )}
      </div>

      {/* 연속 달성 일수 카드 */}
      <div
        style={{
          margin: "0 24px 24px",
          padding: "16px 20px",
          borderRadius: 16,
          backgroundColor: colors.grey50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: colors.grey500, marginBottom: 4 }}>
            연속 달성 일수
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: colors.grey900, lineHeight: 1.4 }}>
            {isPageLoading ? "-" : streak}
            <span style={{ fontSize: 16, fontWeight: 500, color: colors.grey500, marginLeft: 4 }}>
              일
            </span>
          </div>
        </div>
        <div style={{ fontSize: 32 }}>🔥</div>
      </div>

      {/* 오늘의 미션 */}
      <List>
        <div
          style={{
            padding: "0 24px 8px",
            fontSize: 13,
            fontWeight: 600,
            color: colors.grey500,
          }}
        >
          오늘의 미션
        </div>
        {todayMission != null ? (
          <ListRow
            verticalPadding="large"
            onClick={missionDoneToday ? undefined : onMissionSelectOpen}
            contents={
              <ListRow.Texts
                type="2RowTypeA"
                top={todayMission.title}
                topProps={{ color: colors.grey900, fontWeight: "bold" }}
                bottom={`${todayMission.category} · 1분`}
                bottomProps={{ color: colors.grey500 }}
              />
            }
            right={
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  backgroundColor: "#E8F5E9",
                  fontSize: 12,
                  color: "#2E7D32",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                1분
              </div>
            }
          />
        ) : (
          <div style={{ padding: "16px 24px" }}>
            <TextButton size="large" color={colors.blue500} onClick={onMissionSelectOpen}>
              미션 고르기 →
            </TextButton>
          </div>
        )}
      </List>

      {todayMission != null && (
        <div style={{ padding: "8px 24px 16px" }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.grey600, lineHeight: 1.6 }}>
            {todayMission.description}
          </p>
        </div>
      )}

      {/* 하단 버튼 — 3가지 상태 */}
      <div style={{ padding: "0 24px", paddingBottom: isBannerSupported ? 80 : 32 }}>
        {missionDoneToday ? (
          <Button size="large" style={{ width: "100%" }} disabled>
            오늘 미션 완료! ✓
          </Button>
        ) : todayMission != null ? (
          <Button
            size="large"
            style={{ width: "100%" }}
            loading={isPageLoading}
            onClick={() => onMissionStart(todayMission)}
          >
            미션 시작하기
          </Button>
        ) : null}
      </div>

      {/* 개발자 테스트 패널 — TODO: 출시 전 제거 예정 */}
      <DevPanel bannerLogs={bannerLogs} rewardedLogs={rewardedLogs} />

      {/* 배너 광고 — 하단 고정 (height/backgroundColor는 hook이 제어) */}
      <div
        ref={bannerRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: isBannerSupported ? "block" : "none",
        }}
      />

      {/* 완전 성체 달성 다이얼로그 */}
      {isMatureDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "0 24px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: "32px 24px 24px",
              width: "100%",
              maxWidth: 360,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div style={{ fontSize: 48 }}>🎉</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: colors.grey900,
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              완전 성체 달성!
            </div>
            <div
              style={{
                fontSize: 14,
                color: colors.grey500,
                textAlign: "center",
                lineHeight: 1.6,
                marginBottom: 8,
              }}
            >
              14일 연속 달성을 축하해요!
              <br />
              새로운 친구를 만나볼까요?
            </div>
            <Button
              size="large"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => {
                setMatureDialogOpen(false);
                onGoToGacha();
              }}
            >
              새 펫 뽑기 (광고 보기)
            </Button>
            <Button
              size="large"
              color="dark"
              variant="weak"
              style={{ width: "100%" }}
              onClick={() => {
                setMatureDialogOpen(false);
                onMatureDialogDismiss();
              }}
            >
              이 아이와 계속하기
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
