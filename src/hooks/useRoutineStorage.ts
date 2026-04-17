import { useCallback, useEffect, useState } from 'react';
import { AppStorage as Storage } from '../utils/storage';
import { type GrowthStage } from '../data/pets';

// GrowthStage는 pets.ts에서 정의하고 여기서 re-export
export type { GrowthStage };

const KEYS = {
  STREAK: 'streak',
  CHARACTER: 'character',
  MISSION_DONE: 'mission_done',
  LAST_FED: 'last_fed',
  MY_PET: 'my_pet',
  PET_CONFIRMED: 'pet_confirmed',
} as const;

interface RoutineState {
  streak: number;
  growthStage: GrowthStage;
  missionDoneToday: boolean;
  myPet: string | null;
}

function resolveGrowthStage(streak: number, daysSinceLastMission: number): GrowthStage {
  if (daysSinceLastMission >= 3) return 'fainted';
  if (daysSinceLastMission >= 1) return 'hungry';
  if (streak >= 14) return 'adult';
  if (streak >= 7) return 'juvenile';
  if (streak >= 3) return 'growing';
  return 'initial';
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function useRoutineStorage() {
  const [state, setState] = useState<RoutineState>({
    streak: 0,
    growthStage: 'initial',
    missionDoneToday: false,
    myPet: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [streakRaw, missionDoneRaw, lastFedRaw, myPetRaw] = await Promise.all([
        Storage.getItem(KEYS.STREAK),
        Storage.getItem(KEYS.MISSION_DONE),
        Storage.getItem(KEYS.LAST_FED),
        Storage.getItem(KEYS.MY_PET),
      ]);

      const streak = streakRaw != null ? parseInt(streakRaw, 10) : 0;
      const today = getTodayDate();
      const missionDoneToday = missionDoneRaw === today;

      const daysSinceMission = missionDoneRaw == null
        ? Infinity
        : Math.floor(
            (new Date(today).getTime() - new Date(missionDoneRaw).getTime()) /
            (1000 * 60 * 60 * 24)
          );
      // last_fed는 "오늘 밥을 줬는가"만 체크.
      // 오늘 먹였으면 오늘은 배고프지 않고, 내일부터는 mission_done 기준으로 재계산.
      // Math.min 방식은 last_fed가 오래됐어도 daysSinceMission을 억제해
      // fainted를 잘못 막는 부작용이 있어 제거.
      const wasFedToday = lastFedRaw === today;
      const daysSinceLastMission = wasFedToday ? 0 : daysSinceMission;

      const growthStage = resolveGrowthStage(streak, daysSinceLastMission);

      await Storage.setItem(KEYS.CHARACTER, growthStage);

      setState({ streak, growthStage, missionDoneToday, myPet: myPetRaw });
      setLoading(false);
    }

    load();
  }, []);

  /**
   * 미션 완료 처리.
   * needsGacha: 펫이 없어서 뽑기 화면으로 이동해야 하면 true
   * justMatured: 이번 완료로 14일(완전 성체)을 달성했으면 true
   */
  const completeMission = useCallback(async (): Promise<{
    needsGacha: boolean;
    justMatured: boolean;
  }> => {
    const today = getTodayDate();

    const [prevMissionDoneRaw, myPetRaw] = await Promise.all([
      Storage.getItem(KEYS.MISSION_DONE),
      Storage.getItem(KEYS.MY_PET),
    ]);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const prevStreak = state.streak;
    const newStreak = prevMissionDoneRaw === yesterdayStr
      ? prevStreak + 1
      : prevMissionDoneRaw === today
        ? prevStreak
        : 1;

    const newGrowthStage = resolveGrowthStage(newStreak, 0);
    const needsGacha = myPetRaw == null;
    const justMatured = newStreak === 14 && !needsGacha;

    await Promise.all([
      Storage.setItem(KEYS.STREAK, String(newStreak)),
      Storage.setItem(KEYS.CHARACTER, newGrowthStage),
      Storage.setItem(KEYS.MISSION_DONE, today),
    ]);

    setState((prev) => ({
      ...prev,
      streak: newStreak,
      growthStage: newGrowthStage,
      missionDoneToday: true,
    }));

    return { needsGacha, justMatured };
  }, [state.streak]);

  /**
   * 광고 시청 보상으로 캐릭터에게 밥을 줘요.
   */
  const feedCharacter = useCallback(async () => {
    const today = getTodayDate();
    const newGrowthStage = resolveGrowthStage(state.streak, 0);
    await Promise.all([
      Storage.setItem(KEYS.CHARACTER, newGrowthStage),
      Storage.setItem(KEYS.LAST_FED, today),
    ]);
    setState((prev) => ({ ...prev, growthStage: newGrowthStage }));
  }, [state.streak]);

  /**
   * 펫 뽑기에서 펫을 확정해요.
   */
  const confirmPet = useCallback(async (petId: string) => {
    await Promise.all([
      Storage.setItem(KEYS.MY_PET, petId),
      Storage.setItem(KEYS.PET_CONFIRMED, 'true'),
    ]);
    setState((prev) => ({ ...prev, myPet: petId }));
  }, []);

  return { ...state, loading, completeMission, feedCharacter, confirmPet };
}
