type TabType = 'now' | 'soon';

interface TabNavigationProps {
  readonly activeTab: TabType;
  readonly onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'now', label: 'NOW SCREENING' },
    { id: 'soon', label: 'COMING SOON' }
  ];

  return (
    <div className="">
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="flex justify-start items-center gap-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`text-3xl font-semibold tracking-tight transition-all ${
                activeTab === tab.id
                  ? 'text-black border-b-4 border-black pb-2'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
              aria-pressed={activeTab === tab.id}
              aria-label={`Show ${tab.label}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
