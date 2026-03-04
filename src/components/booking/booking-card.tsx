import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from 'qrcode.react';
import { Ticket } from "lucide-react";
import { MovieTicketModal } from "./ticket-modal";
import type { BookingDetail } from "@/types/api";
interface BookingCardProps {
  booking: BookingDetail;
  onChangeShowtime?: () => void;
}

export function BookingCard({
  booking,
  onChangeShowtime,
}: BookingCardProps) {
  const [ticketOpen, setTicketOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex gap-4 content-between">

          {/* Poster */}
          <div className="relative aspect-2/3 max-h-75 max-w-50 shrink-0 overflow-hidden rounded-xl">
            <img
              src={booking.posterUrl || '/assets/images/placeholder.png'}
              alt={booking.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col content-between w-full">
            <div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 truncate">
                {booking.title}
              </h1>
              <p className="mt-0.5 text-lg font-medium text-gray-400">{booking.cinema}</p>
            </div>

            <div className="mt-4 flex justify-between">
              <div>
                <p className="text-lg font-medium uppercase text-gray-400">Date</p>
                <p className="text-xl font-bold text-gray-900">{booking.date}</p>
              </div>
              <div>
                <p className="text-lg font-medium uppercase text-gray-400">Show Time</p>
                <p className="text-xl font-bold text-gray-900">{booking.showTime}</p>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between">
              <div className="flex-col content-between">
                <div className="mb-4">
                  <p className="text-lg font-medium uppercase text-gray-400">Seat</p>
                  <p className="text-xl font-bold text-gray-900">{booking.seats}</p>
                </div>

                <div className="flex w-full justify-start gap-2">
                  <Button
                    className="rounded-2xl bg-gray-900 text-white hover:bg-gray-700"
                    size="sm"
                    onClick={() => setTicketOpen(true)}
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    View Ticket
                  </Button>

                  {onChangeShowtime && booking.status === 'confirmed' && (
                    <Button
                      variant="outline"
                      className="rounded-2xl border-blue-300 text-blue-600 hover:bg-blue-50"
                      size="sm"
                      onClick={onChangeShowtime}
                    >
                      Change Showtime
                    </Button>
                  )}
                </div>
              </div>

              <div className="w-32 h-32">
                <QRCodeSVG value={booking.id} size={128} level="H" includeMargin={true} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MovieTicketModal
        open={ticketOpen}
        onOpenChange={setTicketOpen}
        booking={booking}
      />
    </>
  );
}