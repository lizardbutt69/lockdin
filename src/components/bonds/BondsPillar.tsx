import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useBonds } from '../../hooks/useBonds'
import BondsImportantDates from './BondsImportantDates'
import BondsSelfTab from './BondsSelfTab'
import BondsPartnerTab from './BondsPartnerTab'
import BondsCircleTab from './BondsCircleTab'
import BondsCommunityTab from './BondsCommunityTab'
import PillarGoals from '../pillars/PillarGoals'
import PillarHabitTracker from '../pillars/PillarHabitTracker'

const ACCENT = '#dc2626'

type Tab = 'partner' | 'circle' | 'community'
const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'partner',   label: 'Partner',   emoji: '💑' },
  { key: 'circle',    label: 'Circle',    emoji: '👥' },
  { key: 'community', label: 'Community', emoji: '🌎' },
]

export default function BondsPillar() {
  const [activeTab, setActiveTab] = useState<Tab>('partner')
  const bonds = useBonds()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
          <Heart className="w-3.5 h-3.5" style={{ color: ACCENT }} />
        </div>
        <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Relationships</span>
      </div>

      {/* 2/3 + 1/3 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* LEFT 2/3 — Self check-in + Partner/Circle/Community tabs */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <BondsSelfTab
            checkIn={bonds.checkIn}
            onSaveCheckIn={bonds.saveCheckIn}
          />

          {/* Partner / Circle / Community tabs */}
          <div className="card overflow-hidden">
            <div className="flex" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 py-2.5 text-xs font-semibold transition-all"
                  style={{
                    color: activeTab === tab.key ? ACCENT : 'var(--text-muted)',
                    background: activeTab === tab.key ? `${ACCENT}10` : 'transparent',
                    borderBottom: activeTab === tab.key ? `2px solid ${ACCENT}` : '2px solid transparent',
                  }}
                >
                  <span className="mr-1">{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-3">
              {activeTab === 'partner' && (
                <BondsPartnerTab
                  pulse={bonds.pulse}
                  onSavePulse={bonds.savePulse}
                  bucketList={bonds.bucketList}
                  onAddBucket={bonds.addBucketItem}
                  onToggleBucket={bonds.toggleBucketItem}
                  onDeleteBucket={bonds.deleteBucketItem}
                />
              )}
              {activeTab === 'circle' && (
                <BondsCircleTab
                  people={bonds.people}
                  moments={bonds.moments}
                  onAddPerson={bonds.addPerson}
                  onDeletePerson={bonds.deletePerson}
                  onMarkContacted={bonds.markContacted}
                  onAddMoment={bonds.addMoment}
                  onDeleteMoment={bonds.deleteMoment}
                />
              )}
              {activeTab === 'community' && (
                <BondsCommunityTab
                  groups={bonds.groups}
                  giving={bonds.giving}
                  onAddGroup={bonds.addGroup}
                  onToggleGroup={bonds.toggleGroup}
                  onDeleteGroup={bonds.deleteGroup}
                  onAddGiving={bonds.addGiving}
                  onDeleteGiving={bonds.deleteGiving}
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT 1/3 — Goals + Important Dates + Habits */}
        <div className="col-span-1 lg:col-span-1 space-y-4">
          <PillarGoals category="Relationships" accentColor="#dc2626" accentBg="rgba(220,38,38,0.06)" accentBorder="rgba(220,38,38,0.2)" />
          <BondsImportantDates
            dates={bonds.importantDates}
            onAdd={bonds.addImportantDate}
            onDelete={bonds.deleteImportantDate}
          />
          <PillarHabitTracker pillar="Relationships" accentColor="#dc2626" accentMuted="rgba(220,38,38,0.15)" compact />
        </div>
      </div>
    </div>
  )
}
