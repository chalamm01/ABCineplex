import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { reviewApi } from "@/services/api";

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="text-2xl leading-none transition-colors"
        >
          <span className={(hovered || value) >= star ? "text-amber-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}

interface WriteReviewModalProps {
  movieId: number;
  bookingId: string;
  movieTitle?: string;
  showtimeLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WriteReviewModal({
  movieId,
  bookingId,
  movieTitle,
  showtimeLabel,
  isOpen,
  onClose,
  onSuccess,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(4);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please select a rating.");
      return;
    }
    setSubmitting(true);
    try {
      await reviewApi.createReview({ movie_id: movieId, rating, review_text: reviewText, booking_id: bookingId });
      toast.success("+20 points earned!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-1">{movieTitle ?? "Write a Review"}</h2>
        {showtimeLabel && (
          <p className="text-sm text-gray-500 mb-4">You watched: {showtimeLabel}</p>
        )}

        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Rating</p>
          <StarRatingInput value={rating} onChange={setRating} />
        </div>

        <Textarea
          placeholder="Share your thoughts (optional)..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="resize-none bg-gray-100 border-none text-sm min-h-[100px] rounded-lg mb-4"
        />

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating < 1}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 rounded-full"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
