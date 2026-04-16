import { colors } from '@toss/tds-colors';
import { Button, List, ListRow, Tab, TextButton, Top } from '@toss/tds-mobile';
import { useState } from 'react';
import { CATEGORIES, DEFAULT_MISSIONS, type Category, type Mission } from '../data/missions';

interface MissionSelectPageProps {
  initialMission: Mission | null;
  onConfirm: (mission: Mission) => void;
  onBack: () => void;
}

export function MissionSelectPage({ initialMission, onConfirm, onBack }: MissionSelectPageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState<Mission | null>(initialMission);

  function handleRandom() {
    const pick = DEFAULT_MISSIONS[Math.floor(Math.random() * DEFAULT_MISSIONS.length)];
    setSelected(pick);
    const tabIndex = CATEGORIES.indexOf(pick.category as Category);
    if (tabIndex !== -1) setActiveTab(tabIndex);
  }

  const activeCategory: Category = CATEGORIES[activeTab];
  const missionsInTab = DEFAULT_MISSIONS.filter((m) => m.category === activeCategory);

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
        title={<Top.TitleParagraph size={22} style={{ lineHeight: 1.4 }}>오늘의 미션 선택</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15} style={{ color: colors.grey500, lineHeight: 1.6, marginTop: 4 }}>
            오늘 할 미션을 하나 골라보세요
          </Top.SubtitleParagraph>
        }
        right={
          <button
            onClick={handleRandom}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 12px',
              border: `1px solid ${colors.grey200}`,
              borderRadius: 20,
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              color: colors.grey700,
              fontWeight: 600,
              marginRight: 24,
            }}
          >
            🎲 랜덤
          </button>
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
          {missionsInTab.map((mission) => {
            const isSelected = selected?.id === mission.id;
            return (
              <ListRow
                key={mission.id}
                verticalPadding="large"
                onClick={() => setSelected(mission)}
                style={{
                  backgroundColor: isSelected ? '#F0F7FF' : undefined,
                  transition: 'background-color 0.15s',
                }}
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={mission.title}
                    topProps={{
                      color: isSelected ? colors.blue500 : colors.grey900,
                      fontWeight: 'bold',
                    }}
                    bottom={mission.description}
                    bottomProps={{ color: colors.grey500 }}
                  />
                }
                right={
                  isSelected ? (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: colors.blue500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </div>
                  ) : undefined
                }
              />
            );
          })}
        </List>
      </div>

      {/* 이 미션 선택 버튼 (하단 고정) */}
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
        {selected && (
          <div
            style={{
              fontSize: 13,
              color: colors.grey500,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            선택: <span style={{ color: colors.grey800, fontWeight: 600 }}>{selected.title}</span>
          </div>
        )}
        <Button
          size="large"
          style={{ width: '100%' }}
          disabled={selected == null}
          onClick={() => selected && onConfirm(selected)}
        >
          이 미션 선택
        </Button>
      </div>
    </>
  );
}
