import type { BookingDate } from '@/lib/constants/movies';

interface ShowtimeInfo {
  time: string;
  showtimeId: number;
  status: 'available' | 'selected' | 'sold_out' | 'past';
  raqs?: number;
  ttc?: number;
  demand_badge?: 'selling_fast' | 'filling_up' | 'available' | 'plenty_of_space';
  badge_label?: string | null;
}

const _BADGE_COLORS: Record<string, string> = {
  selling_fast:    'bg-red-100 text-red-700 border-red-200',
  filling_up:      'bg-violet-100 text-violet-700 border-violet-200',
  plenty_of_space: 'bg-green-100 text-green-700 border-green-200',
};

export function DemandBadge({ badge, label }: { badge?: string; label?: string | null }) {
  if (!badge || badge === 'available' || !label) return null;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${_BADGE_COLORS[badge] ?? ''}`}>
      {label}
    </span>
  );
}

// This type extends BookingDate with additional showtime detail - used for rendering
interface DateGroupShowtime extends Omit<BookingDate, 'showtimes'> {
  showtimes: ShowtimeInfo[];
}

interface DateTimeSelectionProps {
  readonly dates: BookingDate[];
  readonly times: string[];
  readonly selectedDate: number;
  readonly selectedTime: string;
  readonly onDateChange: (index: number) => void;
  readonly onTimeChange: (time: string) => void;
  readonly summarizedShowtimes?: DateGroupShowtime[];
}

export function DateTimeSelection({
  dates,
  times,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  summarizedShowtimes,
}: DateTimeSelectionProps) {
  const rawGroups: DateGroupShowtime[] = summarizedShowtimes ?? dates.map((date, index) => ({
    ...date,
    showtimes: times.map((time) => ({
      time,
      showtimeId: index,
      status: 'available',
    })),
  }));

  const formatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short'
});
  // Always derive selected state from props so clicking registers visually
  const groupedShowtimes = rawGroups.map((dateGroup, dateIndex) => ({
    ...dateGroup,
    showtimes: dateGroup.showtimes.map((showtime) => {
      const isSelected = selectedDate === dateIndex && selectedTime === showtime.time;
      let resolvedStatus: ShowtimeInfo['status'];
      if (isSelected) {
        resolvedStatus = 'selected';
      } else if (showtime.status === 'selected') {
        resolvedStatus = 'available';
      } else {
        resolvedStatus = showtime.status;
      }
      return { ...showtime, status: resolvedStatus };
    }),
  }));

  const selectedDateGroup = groupedShowtimes[selectedDate];
  const selectedShowtime = selectedDateGroup?.showtimes.find((s) => s.time === selectedTime);
  console.log(groupedShowtimes)
  return (
    <div className="bg-white rounded-lg p-4 border border-neutral-200 mb-6">
      {/* Compact Horizontal Date Selector */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Select Date</h4>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {groupedShowtimes.map((dateGroup, dateIndex) => (
            <button
              key={dateIndex}
              onClick={() => onDateChange(dateIndex)}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs whitespace-nowrap transition-all shrink-0 ${
                selectedDate === dateIndex
                  ? 'bg-violet-700 text-white'
                  : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              {formatter.format(new Date(dateGroup.date))}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Time Slots for Selected Date */}
      {selectedDateGroup && (
        <div>
          <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Select Time</h4>
          <div className="flex flex-wrap gap-2">
            {selectedDateGroup.showtimes.map((showtime) => {
              let btnClass = 'bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-50';
              if (showtime.status === 'selected') btnClass = 'bg-violet-700 text-white';
              else if (showtime.status === 'available') btnClass = 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200';
              return (
                <div key={`${selectedDate}-${showtime.time}`} className="flex flex-col items-start gap-1">
                  <button
                    onClick={() => onTimeChange(showtime.time)}
                    disabled={showtime.status === 'sold_out' || showtime.status === 'past'}
                    className={`px-3 py-1 rounded-md font-semibold text-xs transition-all ${btnClass}`}
                  >
                    {showtime.time}
                  </button>
                  <DemandBadge badge={showtime.demand_badge} label={showtime.badge_label} />
                </div>
              );
            })}
          </div>

          {/* Compact Info Display */}
          {selectedShowtime && (selectedShowtime.raqs != null || selectedShowtime.ttc != null) && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Showtime Info</h4>
              <div className="flex gap-4 text-xs">
                {selectedShowtime.raqs != null && (
                  <div className="flex items-center gap-1">
                    <span>⭐ {selectedShowtime.raqs.toFixed(1)}</span>
                  </div>
                )}
                {selectedShowtime.ttc != null && (
                  <div className="flex items-center gap-1">
                    <span>⏱ {Math.floor(selectedShowtime.ttc / 60)}h {selectedShowtime.ttc % 60}m</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
