import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Spinner } from '@/components/ui/spinner'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { userApi, reviewApi } from '@/services/api'
import type { UserProfile, UserUpdate, ReviewWithMovie } from '@/types/api'

export default function ProfilePage() {
  const { data: profile, loading, error: fetchError, execute: fetchProfile } = useApi<UserProfile>(null);
  const { mutate: updateProfile, loading: saving, error: saveError } = useApiMutation<UserProfile, UserUpdate>();

  const [formData, setFormData] = useState<UserUpdate>({
    full_name: "",
    phone: "",
    date_of_birth: "",
  });

  useEffect(() => {
    // Fetch user profile on component mount
    fetchProfile(() => userApi.getProfile()).then((loadedProfile) => {
      if (loadedProfile) {
        setFormData({
          full_name: loadedProfile.full_name || "",
          phone: loadedProfile.phone || "",
          date_of_birth: loadedProfile.date_of_birth || "",
        });
      }
    });
  }, [fetchProfile]);

  // Split full_name for display
  const nameParts = (formData.full_name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      full_name: e.target.value + (lastName ? " " + lastName : "")
    }));
  };
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      full_name: firstName + (e.target.value ? " " + e.target.value : "")
    }));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const updatedProfile = await updateProfile(
        (payload) => userApi.updateProfile(payload),
        formData
      );
      if (updatedProfile) {
        // Refresh profile data
        fetchProfile(() => userApi.getProfile());
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
      });
    }
  };

  const error = fetchError?.message || saveError?.message;

  // My Reviews
  const [myReviews, setMyReviews] = useState<ReviewWithMovie[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  useEffect(() => {
    setReviewsLoading(true);
    reviewApi.getMyReviews()
      .then(res => setMyReviews(res.items ?? []))
      .catch(() => setMyReviews([]))
      .finally(() => setReviewsLoading(false));
  }, []);

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setDeletingReviewId(reviewId);
    try {
      await reviewApi.deleteReview(reviewId);
      setMyReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch {
      alert('Failed to delete review.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex justify-center items-center p-6 bg-white/70 backdrop-blur-md">
          <Spinner />
        </div>
      </div>
    );
  }

  // Fallback if no profile is found
  if (!profile) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex justify-center items-center p-6 bg-white/70 backdrop-blur-md">
          <p>Profile not found. Please log in.</p>
        </div>
      </div>
    );
  }

  const profileNameParts = (profile.full_name || "").split(" ");
  const initials = (
    (profileNameParts[0]?.[0] || "") + (profileNameParts[1]?.[0] || "")
  ).toUpperCase() || "U";

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen flex flex-col items-center gap-6 p-6 bg-white/70 backdrop-blur-md">
      <Card className="w-full max-w-3xl h-fit">
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <CardTitle className="text-2xl">
              {profile.full_name}
            </CardTitle>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">@{profile.user_name}</Badge>
              <Badge variant="secondary" className="capitalize">
                {profile.membership_tier} Member
              </Badge>
              {profile.is_student && <Badge variant="default">Student</Badge>}
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                name="first_name"
                value={firstName}
                onChange={handleFirstNameChange}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                name="last_name"
                value={lastName}
                onChange={handleLastNameChange}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth</label>
              <Input
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-xl p-4 flex flex-col justify-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Reward Points
              </p>
              <p className="text-3xl font-bold text-primary">
                {profile.reward_points.toLocaleString()}
              </p>
            </div>

            <div className="bg-violet-500/5 rounded-xl p-4 flex flex-col justify-center border border-violet-200">
              <p className="text-xs text-violet-700 uppercase tracking-wider font-semibold">
                Attendance Streak
              </p>
              <p className="text-3xl font-bold text-violet-700">
                {profile.attendance_streak} Days 🔥
              </p>
            </div>

            <div className="md:col-span-2 bg-violet-50 rounded-xl p-4 border border-violet-200">
              <p className="text-xs text-violet-600 uppercase tracking-wider font-semibold mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold text-violet-900 tracking-widest">{profile.user_name}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(profile.user_name || '');
                    alert('Referral code copied!');
                  }}
                  className="text-xs bg-violet-900 hover:bg-violet-800 text-white px-3 py-1 rounded-lg"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Share this code. You’ll earn 50 bonus points when they confirm their first booking.</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Reviews */}
      <Card className="w-full max-w-3xl h-fit">
        <CardHeader>
          <CardTitle className="text-lg">My Reviews</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {reviewsLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : myReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">You haven't written any reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {myReviews.map(r => (
                <div key={r.id} className="flex gap-4 border border-gray-100 rounded-xl p-4">
                  {r.movie?.poster_url && (
                    <img
                      src={r.movie.poster_url}
                      alt={r.movie.title ?? ''}
                      className="w-12 h-16 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{r.movie?.title ?? `Movie #${r.movie_id}`}</p>
                    <p className="text-yellow-500 text-xs">{'★'.repeat(Math.round(r.rating))} {r.rating.toFixed(1)}</p>
                    {r.review_text && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{r.review_text}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at ?? '').toLocaleDateString()}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deletingReviewId === r.id}
                    onClick={() => handleDeleteReview(r.id)}
                    className="shrink-0 self-start"
                  >
                    {deletingReviewId === r.id ? 'Deleting…' : 'Delete'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}