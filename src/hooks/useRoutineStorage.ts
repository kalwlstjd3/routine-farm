import { useCallback, useEffect, useState } from 'react';
import { AppStorage as Storage } from '../utils/storage';

const KEYS = {
  STREAK: 'streak',
  CHARACTER: 'character',
  MISSION_DONE: 'mission_done',
  LAST_FED: 'last_fed',
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
      const [streakRaw, missionDoneRaw, lastFedRaw] = await Promise.all([
        Storage.getItem(KEYS.STREAK),
        Storage.getItem(KEYS.MISSION_DONE),
        Storage.getItem(KEYS.LAST_FED),
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
      const daysSinceFed = lastFedRaw == null
        ? Infinity
        : Math.floor(
            (new Date(today).getTime() - new Date(lastFedRaw).getTime()) /
            (1000 * 60 * 60 * 24)
          );
      // 미션 완료 또는 밥 주기 중 더 최근 활동 기준으로 캐릭터 상태 결정
      const daysSinceLastMission = Math.min(daysSinceMission, daysSinceFed);

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

  /**
   * 광고 시청 보상으로 캐릭터에게 밥을 줘요.
   * 스트릭은 유지하되 hungry/fainted 상태를 해제해요.
   */
  const feedCharacter = useCallback(async () => {
    const today = getTodayDate();
    const newCharacter = resolveCharacter(state.streak, 0);
    await Promise.all([
      Storage.setItem(KEYS.CHARACTER, newCharacter),
      Storage.setItem(KEYS.LAST_FED, today),
    ]);
    setState((prev) => ({ ...prev, character: newCharacter }));
  }, [state.streak]);

  return { ...state, loading, completeMission, feedCharacter };
}
