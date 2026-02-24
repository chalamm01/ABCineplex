import { useState } from 'react';
import { Link } from 'react-router-dom';

interface PromotionalEvent {
  readonly id: number;
  readonly image: string;
  readonly title: string;
  readonly category?: 'news' | 'promo';
}

interface PromotionalSectionProps {
  readonly events: readonly PromotionalEvent[];
}

type TabType = 'news' | 'promo';

export function PromotionalSection({ events }: PromotionalSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('news');

  const filteredEvents = events.filter((event) => {
    if (!event.category) return activeTab === 'news';
    return event.category === activeTab;
  });

  const displayEvents = events.some((e) => e.category) ? filteredEvents : events;

  return (
    <section className="mt-6 px-6 bg-white/40 py-6 rounded-2xl">
      <div className="max-w-400 mx-auto p-6">
        {/* Section Header */}
        <div className="mb-12">
        <p className="text-xs tracking-widest text-neutral-500 uppercase mb-4">
          Featured
        </p>
        <div className="flex gap-8 border-b border-neutral-200">
          {(['news', 'promo'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-3xl font-semibold tracking-tight border-b-2 -mb-0.5 transition-all ${
                activeTab === tab
                  ? 'text-black border-black'
                  : 'text-neutral-400 border-transparent hover:text-neutral-600'
              }`}
              aria-pressed={activeTab === tab}
              aria-label={`Show ${tab === 'news' ? 'news' : 'promotions'}`}
            >
              {tab === 'news' ? 'News' : 'Promotional'}
            </button>
          ))}
        </div>
      </div>

      {/* Promo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayEvents.length > 0 ? (
          displayEvents.map((event) => (
            <Link key={event.id} to={`/event/${event.id}`}>
              <div className="group cursor-pointer h-full">
                <div className="relative overflow-hidden rounded-lg mb-4 aspect-video bg-neutral-200 shadow-md">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 tracking-tight line-clamp-2 group-hover:text-black transition-colors">
                  {event.title}
                </h3>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center">
            <p className="text-lg text-neutral-600">No {activeTab === 'news' ? 'news' : 'promotional'} events available</p>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
