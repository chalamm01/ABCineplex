import type { BookingDate } from '@/lib/constants/movies';

interface ShowtimeInfo {
  time: string;
  showtimeId: number;
  status: 'available' | 'selected' | 'sold_out' | 'past';
  raqs?: number;
  ttc?: number;
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
                  ? 'bg-orange-600 text-white'
                  : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              {dateGroup.dayName} {dateGroup.day} {dateGroup.month}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Time Slots for Selected Date */}
      {selectedDateGroup && (
        <div>
          <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Select Time</h4>
          <div className="flex flex-wrap gap-2">
            {selectedDateGroup.showtimes.map((showtime) => (
              <button
                key={`${selectedDate}-${showtime.time}`}
                onClick={() => onTimeChange(showtime.time)}
                disabled={showtime.status === 'sold_out' || showtime.status === 'past'}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-all ${
                  showtime.status === 'selected'
                    ? 'bg-orange-600 text-white'
                    : showtime.status === 'available'
                      ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-50'
                }`}
              >
                {showtime.time}
              </button>
            ))}
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
