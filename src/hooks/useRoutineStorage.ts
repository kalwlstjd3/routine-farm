import { Storage } from '@apps-in-toss/web-framework';
import { useCallback, useEffect, useState } from 'react';

const KEYS = {
  STREAK: 'streak',
  CHARACTER: 'character',
  MISSION_DONE: 'mission_done',
} as const;

export type CharacterState = 'egg' | 'hatching' | 'chick' | 'chicken' | 'hungry' | 'fainted';

interface RoutineState {
  streak: number;
  character: CharacterState;
  missionDoneToday: boolean;
}

function resolveCharacter(streak: number, daysSinceLastMission: number): CharacterState {
  if (daysSinceLastMission >= 3) return 'fainted';
  if (daysSinceLastMission >= 1) return 'hungry';
  if (streak >= 14) return 'chicken';
  if (streak >= 7) return 'chick';
  if (streak >= 3) return 'hatching';
  return 'egg';
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * mission_done 값은 "YYYY-MM-DD" 형식으로 저장해요.
 * 오늘 날짜와 같으면 완료 상태, 다르면 미완료 상태예요.
 */
export function useRoutineStorage() {
  const [state, setState] = useState<RoutineState>({
    streak: 0,
    character: 'egg',
    missionDoneToday: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [streakRaw, missionDoneRaw] = await Promise.all([
        Storage.getItem(KEYS.STREAK),
        Storage.getItem(KEYS.MISSION_DONE),
      ]);

      const streak = streakRaw != null ? parseInt(streakRaw, 10) : 0;
      const today = getTodayDate();
      const missionDoneToday = missionDoneRaw === today;

      const daysSinceLastMission = missionDoneRaw == null
        ? Infinity
        : Math.floor(
            (new Date(today).getTime() - new Date(missionDoneRaw).getTime()) /
            (1000 * 60 * 60 * 24)
          );

      const character = resolveCharacter(streak, daysSinceLastMission);

      // 재계산한 캐릭터 상태를 Storage에도 반영
      await Storage.setItem(KEYS.CHARACTER, character);

      setState({ streak, character, missionDoneToday });
      setLoading(false);
    }

    load();
  }, []);

  const completeMission = useCallback(async () => {
    const today = getTodayDate();

    // mission_done_date 로드해서 연속 일수 계산
    const prevMissionDoneRaw = await Storage.getItem(KEYS.MISSION_DONE);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const prevStreak = state.streak;
    const newStreak = prevMissionDoneRaw === yesterdayStr
      ? prevStreak + 1  // 어제 했으면 연속
      : prevMissionDoneRaw === today
        ? prevStreak     // 오늘 이미 했으면 유지
        : 1;             // 끊겼으면 리셋

    const newCharacter = resolveCharacter(newStreak, 0);

    await Promise.all([
      Storage.setItem(KEYS.STREAK, String(newStreak)),
      Storage.setItem(KEYS.CHARACTER, newCharacter),
      Storage.setItem(KEYS.MISSION_DONE, today),
    ]);

    setState({
      streak: newStreak,
      character: newCharacter,
      missionDoneToday: true,
    });
  }, [state.streak]);

  return { ...state, loading, completeMission };
}
