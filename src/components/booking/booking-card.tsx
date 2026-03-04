import { Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from 'qrcode.react';

interface BookingCardProps {
  id: string;
  title: string;
  cinema: string;
  date: string;
  seats: string;
  showTime: string;
  transactionNo: string;
  posterUrl: string;
  status?: string;
  onCancel?: () => void;
  onChangeShowtime?: () => void;
}

export function BookingCard({
  id,
  title,
  cinema,
  date,
  showTime,
  transactionNo,
  posterUrl,
  seats,
  status,
  onCancel,
  onChangeShowtime,
}: BookingCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex gap-4 content-between">
        {/* Poster */}
        <div className="relative aspect-2/3 max-h-75 max-w-50 shrink-0 overflow-hidden rounded-xl">
          <img
            src={posterUrl || '/assets/images/placeholder.png'}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col content-between w-full">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 truncate">
              {title}
            </h1>
            <p className="mt-0.5 text-lg font-medium text-gray-400">{cinema}</p>
          </div>

          <div className="mt-4 flex justify-between">
            <div>
              <p className="text-lg font-medium uppercase text-gray-400">Date</p>
              <p className="text-xl font-bold text-gray-900">{date}</p>
            </div>
            <div>
              <p className="text-lg font-medium uppercase text-gray-400">Show Time</p>
              <p className="text-xl font-bold text-gray-900">{showTime}</p>
            </div>
          </div>

          <Separator className="my-3" />
          <div className="flex justify-between">
          <div className="flex-col content-between">
            <div className="mb-4">
              <p className="text-lg font-medium uppercase text-gray-400">Seat</p>
              <p className="text-xl font-bold text-gray-900">{seats}</p>
            </div>
          {/* <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Transaction No: {transactionNo}
          </p> */}
        <div className="flex w-full justify-start gap-2">
          {/* <Button
            className="rounded-2xl bg-gray-900 text-white hover:bg-gray-700"
            size="sm"
          >
            <Ticket className="mr-2 h-4 w-4" />
            View Ticket
          </Button> */}
          {/* {onCancel && status === 'confirmed' && (
            <Button
              variant="outline"
              className="rounded-2xl border-red-300 text-red-600 hover:bg-red-50"
              size="sm"
              onClick={onCancel}
            >
              Cancel Booking
            </Button>
          )} */}
          {onChangeShowtime && status === 'confirmed' && (
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
          <QRCodeSVG value={id} size={128} level="H" includeMargin={true} />
        </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
