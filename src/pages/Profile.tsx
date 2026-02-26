import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { usersApi, type UserProfile, type ProfileUpdateData } from "@/services/api"
import { useEffect, useState } from "react"
import { Spinner } from '@/components/ui/spinner'

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileUpdateData>({
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        // Using the getCurrentUser method from your API
        const data = await usersApi.getCurrentUser();
        setProfile(data);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          date_of_birth: data.date_of_birth || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      const updatedProfile = await usersApi.updateProfile(formData);
      setProfile(updatedProfile);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 flex justify-center items-center p-6">
        <Spinner />
      </div>
    );
  }

  // Fallback if no profile is found
  if (!profile) {
    return (
      <div className="min-h-screen bg-muted/40 flex justify-center items-center p-6">
        <p>Profile not found. Please log in.</p>
      </div>
    );
  }

  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div className="bg-muted/40 flex justify-center p-6 min-h-screen">
      <Card className="w-full max-w-3xl h-fit">
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <CardTitle className="text-2xl">
              {profile.first_name} {profile.last_name}
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
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
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

            <div className="bg-orange-500/5 rounded-xl p-4 flex flex-col justify-center border border-orange-200">
              <p className="text-xs text-orange-600 uppercase tracking-wider font-semibold">
                Attendance Streak
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {profile.attendance_streak} Days 🔥
              </p>
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
    </div>
  )
}