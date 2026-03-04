import { Button } from '@/components/ui/button';
import type { BookingDate } from '@/lib/constants/movies';

interface TicketSummaryProps {
  readonly selectedSeats: string[];
  readonly selectedDate: BookingDate;
  readonly selectedTime: string;
  readonly totalPrice: number;
  readonly onBook: () => void;
  readonly isBooking?: boolean;
  readonly ticketType?: 'normal' | 'student';
  readonly isStudentEligible?: boolean;
  readonly onTicketTypeChange?: (type: 'normal' | 'student') => void;
  readonly endTime?: string;
}

export function TicketSummary({
  selectedSeats,
  selectedDate,
  selectedTime,
  totalPrice,
  onBook,
  isBooking = false,
  ticketType = 'normal',
  isStudentEligible = false,
  onTicketTypeChange,
  endTime,
}: TicketSummaryProps) {
const formatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: '2-digit',
  month: 'short'
});
  console.log("Selected Date", selectedDate)
  return (
    <div className="w-full space-y-4 sm:space-y-6 ">
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-neutral-300">
        <h3 className="text-black font-semibold text-base sm:text-lg mb-4 uppercase tracking-wider">
          Select Your Seats
        </h3>

        {/* Ticket Type Selector */}
        {/* {isStudentEligible && onTicketTypeChange && (
          <div className="mb-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Ticket Type</p>
            <div className="flex gap-2">
              <button
                onClick={() => onTicketTypeChange('normal')}
               className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${ticketType === 'normal' ? 'bg-black text-white border-black' : 'bg-white text-black border-neutral-300 hover:border-black'}`}
              >
                Normal
              </button>
              <button
                onClick={() => onTicketTypeChange('student')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${ticketType === 'student' ? 'bg-black text-white border-black' : 'bg-white text-black border-neutral-300 hover:border-black'}`}
              >
                Student
              </button>
            </div>
          </div>
        )} */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {selectedSeats.map((seat) => (
            <button key={seat} className="px-3 sm:px-4 py-2 bg-black text-white font-semibold rounded-lg text-xs sm:text-sm">
              {seat}
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-6 pb-6 border-b border-neutral-300">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-neutral-600">DATE & TIME</span>
            <span className="text-black font-medium">
              {formatter.format(new Date(selectedDate.date))}
            </span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-neutral-600">START TIME</span>
            <span className="text-black font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-neutral-600">END TIME</span>
            <span className="text-black font-medium">{endTime}</span>
          </div>
          {/* <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-neutral-600">TICKETS</span>
            <span className="text-black font-medium capitalize">{ticketType}</span>
          </div> */}
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-neutral-600">TOTAL</span>
            <span className="text-black font-medium">{totalPrice.toLocaleString()} THB</span>
          </div>
        </div>

      <div className="bg-neutral-100 rounded-xl p-4 sm:p-6 border border-neutral-300">
        <div className="space-y-2 mb-4 text-xs sm:text-sm">
          <div className="flex justify-between text-black">
            <span>TICKETS: {selectedSeats.join(', ')}</span>
            <span></span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-neutral-300 mb-6">
          <span className="text-black font-semibold text-base sm:text-lg">TOTAL PRICE</span>
          <span className="text-black font-bold text-xl sm:text-2xl">${totalPrice}</span>
        </div>
        <Button
          onClick={onBook}
          disabled={isBooking || selectedSeats.length === 0}
          className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-5 sm:py-6 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
          {isBooking ? 'PROCESSING...' : 'PAY NOW'}
        </Button>
      </div>
    </div>
    </div>
  );
}
