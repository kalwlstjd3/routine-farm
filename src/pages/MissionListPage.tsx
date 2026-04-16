import { colors } from '@toss/tds-colors';
import { AppStorage as Storage } from '../utils/storage';
import { BottomSheet, Button, List, ListRow, Tab, TextButton, TextField, Top } from '@toss/tds-mobile';
import { useEffect, useState } from 'react';
import { CATEGORIES, DEFAULT_MISSIONS, type Category, type Mission } from '../data/missions';

const STORAGE_KEY = 'custom_missions';

interface MissionListPageProps {
  onMissionSelect: (mission: Mission) => void;
  onBack: () => void;
}

export function MissionListPage({ onMissionSelect, onBack }: MissionListPageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [customMissions, setCustomMissions] = useState<Mission[]>([]);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    Storage.getItem(STORAGE_KEY).then((raw) => {
      if (raw != null) {
        try {
          setCustomMissions(JSON.parse(raw) as Mission[]);
        } catch {
          // 파싱 오류 시 무시
        }
      }
    });
  }, []);

  const activeCategory: Category = CATEGORIES[activeTab];
  const missionsInTab = [
    ...DEFAULT_MISSIONS.filter((m) => m.category === activeCategory),
    ...customMissions.filter((m) => m.category === activeCategory),
  ];

  async function handleAddMission() {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    const newMission: Mission = {
      id: `custom_${Date.now()}`,
      category: activeCategory,
      title: trimmed,
      description: '직접 추가한 미션이에요.',
      isCustom: true,
    };
    const updated = [...customMissions, newMission];
    setCustomMissions(updated);
    await Storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewTitle('');
    setBottomSheetOpen(false);
  }

  return (
    <>
      <Top
        upper={
          <TextButton
            size="medium"
            color={colors.grey700}
            onClick={onBack}
            style={{ padding: '16px 24px 0' }}
          >
            ← 뒤로
          </TextButton>
        }
        title={<Top.TitleParagraph size={22} style={{ lineHeight: 1.4 }}>미션 목록</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15} style={{ color: colors.grey500, lineHeight: 1.6, marginTop: 4 }}>
            오늘 할 미션을 선택하세요
          </Top.SubtitleParagraph>
        }
      />

      {/* 카테고리 탭 */}
      <Tab fluid onChange={(index) => setActiveTab(index)}>
        {CATEGORIES.map((cat, i) => (
          <Tab.Item key={cat} selected={activeTab === i}>
            {cat}
          </Tab.Item>
        ))}
      </Tab>

      {/* 미션 목록 */}
      <div style={{ paddingBottom: 100 }}>
        <List>
          {missionsInTab.map((mission) => (
            <ListRow
              key={mission.id}
              verticalPadding="large"
              onClick={() => onMissionSelect(mission)}
              contents={
                <ListRow.Texts
                  type="2RowTypeA"
                  top={mission.title}
                  topProps={{ color: colors.grey900, fontWeight: 'bold' }}
                  bottom={mission.description}
                  bottomProps={{ color: colors.grey500 }}
                />
              }
              right={
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    backgroundColor: '#E3F2FD',
                    fontSize: 12,
                    color: '#1565C0',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ▶ 시작
                </div>
              }
            />
          ))}
          {missionsInTab.length === 0 && (
            <div
              style={{
                padding: '40px 24px',
                textAlign: 'center',
                color: colors.grey400,
                fontSize: 14,
              }}
            >
              미션이 없어요. 아래 버튼으로 추가해 보세요!
            </div>
          )}
        </List>
      </div>

      {/* 미션 추가 버튼 (하단 고정) */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 24px 24px',
          backgroundColor: '#fff',
          borderTop: `1px solid ${colors.grey100}`,
        }}
      >
        <Button size="large" style={{ width: '100%' }} onClick={() => setBottomSheetOpen(true)}>
          미션 추가 +
        </Button>
      </div>

      {/* 미션 추가 BottomSheet */}
      <BottomSheet open={isBottomSheetOpen} onClose={() => setBottomSheetOpen(false)}>
        <BottomSheet.Header>미션 추가</BottomSheet.Header>
        <div style={{ padding: '16px 24px' }}>
          <TextField
            label="미션 이름"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="예) 물 2L 마시기"
          />
          <div style={{ marginTop: 8, fontSize: 13, color: colors.grey500 }}>
            카테고리: {activeCategory}
          </div>
        </div>
        <BottomSheet.CTA onClick={handleAddMission} disabled={!newTitle.trim()}>
          추가하기
        </BottomSheet.CTA>
      </BottomSheet>
    </>
  );
}
