import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Ticket } from "lucide-react";
// Helper functions for date/time formatting
function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
import { QRCodeSVG } from "qrcode.react";
import type { BookingDetail } from "@/types/api";

interface MovieTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingDetail;
}

function DashedStrip() {
  return (
    <div className="bg-green-500 px-4 py-[7px] flex items-center overflow-hidden">
      <div className="w-3.5 h-3.5 rounded-full bg-white/30 shrink-0" />
      <div className="flex-1 border-t-[3px] border-dashed border-white/50 mx-1" />
      <div className="w-3.5 h-3.5 rounded-full bg-white/30 shrink-0" />
    </div>
  );
}

function TearLine() {
  return (
    <div className="relative flex items-center">
      <div className="absolute -left-7 w-6 h-6 rounded-full bg-neutral-100 z-10" />
      <div className="flex-1 border-t-2 border-dashed border-gray-200" />
      <div className="absolute -right-7 w-6 h-6 rounded-full bg-neutral-100 z-10" />
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-bold tracking-[.15em] text-gray-400 uppercase">
        {label}
      </span>
      <span className="text-sm font-bold text-green-500 truncate">{value}</span>
    </div>
  );
}

export function MovieTicketModal({
  open,
  onOpenChange,
  booking,
}: MovieTicketModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/75 backdrop-blur-sm" />

      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[640px] w-[calc(100%-2rem)]">
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.55)]">

          <DashedStrip />

          <div className="px-6 pt-5 pb-3">
            <div className="flex gap-5">

              {/* Poster */}
              <div className="shrink-0 w-[116px] h-[162px] rounded-xl overflow-hidden shadow-md border border-gray-100">
                <img
                  src={booking.poster_url || '/assets/images/placeholder.png'}
                  alt={booking.movie_title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col">

                {/* Title + QR */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-xl font-black tracking-tight text-gray-900 leading-none">
                      {booking.movie_title}
                    </h2>
                  </div>
                  <div className="shrink-0 rounded-md border border-gray-200 overflow-hidden">
                    <QRCodeSVG value={String(booking.booking_id)} size={64} level="H" includeMargin={false} />
                  </div>
                </div>

                <Separator className="my-3" />

                {/* Cinema */}
                <div className="flex items-center gap-1 text-green-500 font-bold text-xs mb-3">
                  <MapPin size={12} />
                  {booking.screen_name}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                  <InfoCell label="Date" value={formatDate(booking.showtime_start)} />
                  <InfoCell label="Show Time" value={formatTime(booking.showtime_start)} />
                  <InfoCell label="Seat(s)" value={Array.isArray(booking.seats) ? booking.seats.join(', ') : (booking.seats ?? '')} />
                </div>
              </div>
            </div>

            {/* Transaction */}
            <p className="text-[10px] text-gray-400 tracking-widest mt-4 uppercase">
              Transaction No. {String(booking.booking_id)}
            </p>
          </div>

          {/* Tear line */}
          <div className="px-6 my-2">
            <TearLine />
          </div>

          {/* Paid badge */}
          <div className="px-6 py-3 flex justify-end">
            {booking.booking_status === 'confirmed' && (
              <Badge className="bg-green-500 hover:bg-green-500 text-white text-[13px] font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow">
                <Ticket size={14} />
                Paid
              </Badge>
            )}
          </div>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-5xl font-black text-green-500/[0.055] tracking-widest rotate-[-12deg] whitespace-nowrap">
              ©ABCINEPLEX
            </span>
          </div>

          <DashedStrip />
        </div>
      </DialogContent>
    </Dialog>
  );
}