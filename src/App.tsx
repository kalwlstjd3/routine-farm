import "./App.css";
import { type Mission } from "./data/missions";
import { useRoutineStorage } from "./hooks/useRoutineStorage";
import { HomePage } from "./pages/HomePage";
import { MissionListPage } from "./pages/MissionListPage";
import { TimerPage } from "./pages/TimerPage";
import { useState } from "react";

type Route =
  | { page: "home" }
  | { page: "missions" }
  | { page: "timer"; mission: Mission };

function App() {
  const [route, setRoute] = useState<Route>({ page: "home" });
  const { completeMission } = useRoutineStorage();

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
