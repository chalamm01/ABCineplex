import type { BookingDate } from '@/lib/constants/movies';

interface ShowtimeInfo {
  time: string;
  showtimeId: number;
  status: 'available' | 'selected' | 'sold_out' | 'past';
}

interface DateGroupShowtime extends BookingDate {
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
  const groupedShowtimes: DateGroupShowtime[] = summarizedShowtimes || dates.map((date, index) => ({
    ...date,
    showtimes: times.map((time) => ({
      time,
      showtimeId: index,
      status:
        selectedDate === index && selectedTime === time
          ? 'selected'
          : 'available',
    })),
  }));

  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-300 mb-8">
      <h3 className="text-black font-bold text-2xl sm:text-3xl uppercase tracking-wider mb-8">
        SELECT DATE & TIME
      </h3>

      {/* Vertical Chronological Layout */}
      <div className="space-y-8">
        {groupedShowtimes.map((dateGroup, dateIndex) => (
          <div key={dateIndex}>
            {/* Date Header */}
            <div
              onClick={() => onDateChange(dateIndex)}
              className="cursor-pointer mb-4 transition-all hover:opacity-80"
            >
              <h4 className="text-black font-bold text-lg sm:text-xl uppercase tracking-wider">
                {dateGroup.dayName} {dateGroup.day} {dateGroup.month}
              </h4>
            </div>

            {/* Time Slots */}
            <div className="flex flex-wrap gap-3">
              {dateGroup.showtimes.map((showtime) => (
                <button
                  key={`${dateIndex}-${showtime.time}`}
                  onClick={() => {
                    onDateChange(dateIndex);
                    onTimeChange(showtime.time);
                  }}
                  disabled={showtime.status === 'sold_out' || showtime.status === 'past'}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base uppercase tracking-wide transition-all ${
                    showtime.status === 'selected'
                      ? 'bg-black text-white border-2 border-black'
                      : showtime.status === 'available'
                        ? 'bg-white text-black border-2 border-neutral-300 hover:border-black'
                        : 'bg-neutral-200 text-neutral-500 border-2 border-neutral-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  {showtime.time}
                </button>
              ))}
            </div>

            {/* Divider between date groups */}
            {dateIndex < groupedShowtimes.length - 1 && (
              <div className="mt-8 border-t border-neutral-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
