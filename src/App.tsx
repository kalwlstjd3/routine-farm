import "./App.css";
import { AppStorage as Storage } from "./utils/storage";
import { type Mission } from "./data/missions";
import { useRoutineStorage } from "./hooks/useRoutineStorage";
import { useTodayMission } from "./hooks/useTodayMission";
import { HomePage } from "./pages/HomePage";
import { MissionListPage } from "./pages/MissionListPage";
import { MissionSelectPage } from "./pages/MissionSelectPage";
import { ONBOARDING_KEY, OnboardingPage } from "./pages/OnboardingPage";
import { PetGachaPage } from "./pages/PetGachaPage";
import { TimerPage } from "./pages/TimerPage";
import { useEffect, useState } from "react";

type Route =
  | { page: "loading" }
  | { page: "onboarding" }
  | { page: "home"; showMatureDialog?: boolean }
  | { page: "mission-select" }
  | { page: "missions" }
  | { page: "timer"; mission: Mission }
  | { page: "pet-gacha" };

function App() {
  const [route, setRoute] = useState<Route>({ page: "loading" });
  const { completeMission } = useRoutineStorage();
  const { todayMission, saveTodayMission } = useTodayMission();

  // 앱 최초 진입 시 온보딩 완료 여부 확인
  useEffect(() => {
    Storage.getItem(ONBOARDING_KEY).then((val) => {
      setRoute({ page: val === "true" ? "home" : "onboarding" });
    });
  }, []);

  if (route.page === "loading") {
    return null;
  }

  if (route.page === "onboarding") {
    return <OnboardingPage onDone={() => setRoute({ page: "home" })} />;
  }

  if (route.page === "mission-select") {
    return (
      <MissionSelectPage
        initialMission={todayMission}
        onConfirm={async (mission) => {
          await saveTodayMission(mission);
          setRoute({ page: "home" });
        }}
        onBack={() => setRoute({ page: "home" })}
      />
    );
  }

  if (route.page === "missions") {
    return (
      <MissionListPage
        onMissionSelect={(mission) => setRoute({ page: "timer", mission })}
        onBack={() => setRoute({ page: "home" })}
      />
    );
  }

  if (route.page === "timer") {
    return (
      <TimerPage
        mission={route.mission}
        onComplete={async () => {
          const { needsGacha, justMatured } = await completeMission();
          if (needsGacha) {
            setRoute({ page: "pet-gacha" });
          } else {
            setRoute({ page: "home", showMatureDialog: justMatured });
          }
        }}
        onBack={() => setRoute({ page: "home" })}
      />
    );
  }

  if (route.page === "pet-gacha") {
    return <PetGachaPage onDone={() => setRoute({ page: "home" })} />;
  }

  return (
    <HomePage
      showMatureDialog={route.page === "home" ? (route.showMatureDialog ?? false) : false}
      onMatureDialogDismiss={() => setRoute({ page: "home" })}
      onGoToGacha={() => setRoute({ page: "pet-gacha" })}
      onMissionSelectOpen={() => setRoute({ page: "mission-select" })}
      onMissionStart={(mission) => setRoute({ page: "timer", mission })}
    />
  );
}

export default App;
