import { colors } from "@toss/tds-colors";
import { Button, List, ListRow, Top } from "@toss/tds-mobile";
import { useEffect } from "react";
import { useBannerAd } from "../hooks/useBannerAd";
import { useInAppAds } from "../hooks/useInAppAds";
import { type CharacterState, useRoutineStorage } from "../hooks/useRoutineStorage";

const BANNER_AD_ID = "ait-ad-test-banner-id";
const REWARDED_AD_ID = "ait-ad-test-rewarded-id";

const TODAY_MISSION = {
  category: "스트레칭/운동",
  title: "목 스트레칭",
  description: "천천히 목을 좌우로 5회씩 돌려보세요.",
  duration: "1분",
};

const CHARACTER_INFO: Record<CharacterState, { emoji: string; label: string; bg: string }> = {
  egg:      { emoji: "🥚", label: "알",       bg: colors.grey100 },
  hatching: { emoji: "🐣", label: "부화 중",  bg: "#FFF9E6" },
  chick:    { emoji: "🐥", label: "병아리",   bg: "#FFFDE7" },
  chicken:  { emoji: "🐔", label: "성체",     bg: "#FFF3E0" },
  hungry:   { emoji: "😢", label: "배고파요", bg: "#FFF0F0" },
  fainted:  { emoji: "😵", label: "기절",     bg: "#F5F5F5" },
};

interface HomePageProps {
  onMissionListOpen: () => void;
}

export function HomePage({ onMissionListOpen }: HomePageProps) {
  const { streak, character, missionDoneToday, loading, completeMission, feedCharacter } =
    useRoutineStorage();

  const stage = CHARACTER_INFO[character];
  const isHungry = character === "hungry" || character === "fainted";

  // 배너 광고
  const { containerRef: bannerRef, isSupported: isBannerSupported } = useBannerAd(BANNER_AD_ID);

  // 보상형 광고 (밥 주기)
  const { showAd: showRewardedAd, lastReward } = useInAppAds(REWARDED_AD_ID);

  // 보상 지급 시 캐릭터 밥 주기
  useEffect(() => {
    if (lastReward != null) {
      feedCharacter();
    }
  }, [lastReward]);

  return (
    <>
      <Top
        title={
          <Top.TitleParagraph size={22}>루티팜</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15} style={{ color: colors.grey500 }}>
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
            backgroundColor: stage.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
          }}
        >
          {stage.emoji}
        </div>
        <div
          style={{
            fontSize: 13,
            color: colors.grey500,
            fontWeight: 500,
          }}
        >
          {stage.label}
        </div>

        {/* 광고 보고 캐릭터 밥 주기 — hungry/fainted 상태일 때만 표시 */}
        {isHungry && (
          <Button
            size="small"
            color="dark"
            variant="weak"
            onClick={showRewardedAd}
            style={{ marginTop: 4 }}
          >
            📺 광고 보고 캐릭터 밥 주기
          </Button>
        )}
      </div>

      {/* 스트릭 카드 */}
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
          <div
            style={{
              fontSize: 13,
              color: colors.grey500,
              marginBottom: 4,
            }}
          >
            연속 달성 일수
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: colors.grey900,
              lineHeight: 1.2,
            }}
          >
            {loading ? "-" : streak}
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: colors.grey500,
                marginLeft: 4,
              }}
            >
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
        <ListRow
          verticalPadding="large"
          onClick={onMissionListOpen}
          contents={
            <ListRow.Texts
              type="2RowTypeA"
              top={TODAY_MISSION.title}
              topProps={{ color: colors.grey900, fontWeight: "bold" }}
              bottom={`${TODAY_MISSION.category} · ${TODAY_MISSION.duration}`}
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
              {TODAY_MISSION.duration}
            </div>
          }
        />
      </List>

      <div style={{ padding: "8px 24px 16px" }}>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 14,
            color: colors.grey600,
            lineHeight: 1.6,
          }}
        >
          {TODAY_MISSION.description}
        </p>
      </div>

      {/* 미션 완료 버튼 */}
      <div style={{ padding: "0 24px", paddingBottom: isBannerSupported ? 80 : 32 }}>
        <Button
          size="large"
          style={{ width: "100%" }}
          loading={loading}
          disabled={missionDoneToday}
          onClick={completeMission}
        >
          {missionDoneToday ? "오늘 미션 완료! ✓" : "미션 완료 ✓"}
        </Button>
      </div>

      {/* 배너 광고 — 하단 고정 */}
      <div
        ref={bannerRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          minHeight: isBannerSupported ? 50 : 0,
          backgroundColor: isBannerSupported ? colors.grey50 : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </>
  );
}
