import { BookingCard } from "@/components/booking-card";

const bookings = [
  {
    id: "1",
    title: "Human Resources",
    cinema: "ABCineplex",
    date: "29/01/2026",
    showTime: "20:00",
    transactionNo: "20260129767771",
    posterUrl: "/posters/human-resources.jpg",
  },
  {
    id: "2",
    title: "It Was Just an Accident",
    cinema: "ABCineplex",
    date: "29/01/2026",
    showTime: "20:00",
    transactionNo: "20260129767771",
    posterUrl: "/posters/it-was-just-an-accident.jpg",
  },
  {
    id: "3",
    title: "Human Resources",
    cinema: "ABCineplex",
    date: "29/01/2026",
    showTime: "20:00",
    transactionNo: "20260129767771",
    posterUrl: "/posters/human-resources.jpg",
  },
  {
    id: "4",
    title: "Human Resources",
    cinema: "ABCineplex",
    date: "29/01/2026",
    showTime: "20:00",
    transactionNo: "20260129767771",
    posterUrl: "/posters/human-resources.jpg",
  },
  {
    id: "5",
    title: "Human Resources",
    cinema: "ABCineplex",
    date: "29/01/2026",
    showTime: "20:00",
    transactionNo: "20260129767771",
    posterUrl: "/posters/human-resources.jpg",
  },
  {
    id: "6",
    title: "Human Resources",
    cinema: "ABCineplex",
    date: "29/01/2026",
    showTime: "20:00",
    transactionNo: "20260129767771",
    posterUrl: "/posters/human-resources.jpg",
  },
];

export default function BookingHistoryPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-12 lg:px-20">
      <h1 className="mb-8 border-b-2 border-black pb-2 text-3xl font-extrabold uppercase tracking-tight text-black">
        Booking History
      </h1>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} {...booking} />
        ))}
      </div>
    </main>
  );
}
