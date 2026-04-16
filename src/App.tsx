import "./App.css";
import { AppStorage as Storage } from "./utils/storage";
import { type Mission } from "./data/missions";
import { useRoutineStorage } from "./hooks/useRoutineStorage";
import { HomePage } from "./pages/HomePage";
import { MissionListPage } from "./pages/MissionListPage";
import { ONBOARDING_KEY, OnboardingPage } from "./pages/OnboardingPage";
import { TimerPage } from "./pages/TimerPage";
import { useEffect, useState } from "react";

type Route =
  | { page: "loading" }
  | { page: "onboarding" }
  | { page: "home" }
  | { page: "missions" }
  | { page: "timer"; mission: Mission };

function App() {
  const [route, setRoute] = useState<Route>({ page: "loading" });
  const { completeMission } = useRoutineStorage();

  // 앱 최초 진입 시 온보딩 완료 여부 확인
  useEffect(() => {
    Storage.getItem(ONBOARDING_KEY).then((val) => {
      setRoute({ page: val === "true" ? "home" : "onboarding" });
    });
  }, []);

  if (route.page === "loading") {
    // Storage 읽는 동안 빈 화면 (깜빡임 방지)
    return null;
  }

  if (route.page === "onboarding") {
    return <OnboardingPage onDone={() => setRoute({ page: "home" })} />;
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
        onComplete={() => {
          completeMission();
          setRoute({ page: "home" });
        }}
        onBack={() => setRoute({ page: "missions" })}
      />
    );
  }

  return <HomePage onMissionListOpen={() => setRoute({ page: "missions" })} />;
}

export default App;
