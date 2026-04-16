import { useCallback, useEffect, useState } from 'react';
import { type Mission } from '../data/missions';
import { AppStorage } from '../utils/storage';

const TODAY_MISSION_KEY = 'today_mission';

interface StoredMission {
  mission: Mission;
  date: string; // YYYY-MM-DD
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useTodayMission() {
  const [todayMission, setTodayMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const raw = await AppStorage.getItem(TODAY_MISSION_KEY);
      if (raw != null) {
        try {
          const stored: StoredMission = JSON.parse(raw);
          // 오늘 날짜와 다르면 초기화 (새로운 하루)
          if (stored.date === getTodayDate()) {
            setTodayMission(stored.mission);
          }
        } catch {
          // 파싱 오류 시 무시
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const saveTodayMission = useCallback(async (mission: Mission) => {
    const stored: StoredMission = { mission, date: getTodayDate() };
    await AppStorage.setItem(TODAY_MISSION_KEY, JSON.stringify(stored));
    setTodayMission(mission);
  }, []);

  return { todayMission, saveTodayMission, loading };
}
