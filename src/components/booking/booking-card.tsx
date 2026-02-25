import { Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BookingCardProps {
  id: string;
  title: string;
  cinema: string;
  date: string;
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
}: BookingCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex gap-4 p-4">
        {/* Poster */}
        <div className="relative h-44 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-900">
          <img
            src={posterUrl}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <h2 className="text-lg font-extrabold uppercase leading-tight tracking-tight text-gray-900">
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">{cinema}</p>
          </div>

          <div className="mt-3 flex gap-6">
            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Date</p>
              <p className="text-sm font-bold text-gray-900">{date}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Show Time</p>
              <p className="text-sm font-bold text-gray-900">{showTime}</p>
            </div>
          </div>

          <Separator className="my-3" />

          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Transaction No: {transactionNo}
          </p>

          <Button
            className="rounded-2xl bg-gray-900 text-white hover:bg-gray-700"
            size="sm"
          >
            <Ticket className="mr-2 h-4 w-4" />
            View Ticket
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
