import { Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BookingCardProps {
  id: string;
  title: string;
  cinema: string;
  date: string;
  seats: string;
  showTime: string;
  transactionNo: string;
  posterUrl: string;
}

export function BookingCard({
  title,
  cinema,
  date,
  showTime,
  transactionNo,
  posterUrl,
  seats,
}: BookingCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md max-w-3xl mx-auto">
      <CardContent className="flex flex-wrap gap-4 items-start">
        {/* Poster */}
        <div className="relative max-h-75 max-w-50 shrink-0 overflow-hidden rounded-xl">
          <img
            src={posterUrl}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <div className="flex flex-col content-between h-full">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-gray-900">
              {title}
            </h1>
            <p className="mt-0.5 text-lg font-medium text-gray-400">{cinema}</p>
          </div>

          <div className="mt-4 flex gap-8">
            <div>
              <p className="text-sm font-medium uppercase text-gray-400">Date</p>
              <p className="text-lg font-bold text-gray-900">{date}</p>
            </div>
            <div>
              <p className="text-sm font-medium uppercase text-gray-400">Show Time</p>
              <p className="text-lg font-bold text-gray-900">{showTime}</p>
            </div>
          </div>

          <Separator className="my-3" />
          <div className="flex gap-8 items-center">
            <div>
              <p className="text-sm font-medium uppercase text-gray-400">Seat</p>
              <p className="text-lg font-bold text-gray-900">{seats}</p>
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                Transaction No: {transactionNo}
              </p>
              <Button
                className="rounded-2xl bg-gray-900 text-white hover:bg-gray-700 mt-2"
                size="sm"
              >
                <Ticket className="mr-2 h-4 w-4" />
                View Ticket
              </Button>
            </div>
            <div className="w-32 h-32 flex items-center justify-center">
              <img src="qr.jpg" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
