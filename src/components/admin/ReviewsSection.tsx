import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api';
import type { AdminReview } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const PAGE_SIZE = 20;

export function ReviewsSection() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (offset: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.listReviews({ limit: PAGE_SIZE, offset });
      setReviews(res.reviews);
      setTotal(res.total);
    } catch {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(page * PAGE_SIZE);
  }, [page, fetchReviews]);

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    try {
      setDeletingId(reviewId);
      await adminApi.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setTotal((prev) => prev - 1);
    } catch {
      alert('Failed to delete review.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Review Moderation</h2>
        <span className="text-sm text-gray-500">{total} total reviews</span>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Movie</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Review</th>
                <th className="px-4 py-3 text-left">Likes</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.movies?.title ?? `Movie #${r.movie_id}`}</td>
                  <td className="px-4 py-3 text-gray-600">{r.users?.user_name ?? r.user_id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{'★'.repeat(Math.round(r.rating))} {r.rating.toFixed(1)}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="line-clamp-2 text-gray-700">{r.review_text || <em className="text-gray-400">No text</em>}</span>
                  </td>
                  <td className="px-4 py-3">{r.like_count}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingId === r.id}
                      onClick={() => handleDelete(r.id)}
                    >
                      {deletingId === r.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">No reviews found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
