import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { profilesApi, type UserProfile } from "@/services/api"
import { useEffect, useState } from "react"
import { Spinner } from '@/components/ui/spinner'


export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
  });

  // Fetch profile data on mount or when user changes
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await profilesApi.getProfile(user.id);
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      setError(null);
      const updatedProfile = await profilesApi.updateProfile(user.id, {
        full_name: formData.full_name || undefined,
      });
      setProfile(updatedProfile);
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
        full_name: profile.full_name || "",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 flex justify-center items-center p-6">
            <Spinner/>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/40 flex justify-center items-center p-6">
        <Card>
          <CardContent>
            <p className="text-center text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = formData.full_name || user.full_name || "User";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="bg-muted/40 flex justify-center p-6 bg-cover bg-center min-h-screen">
      <Card className="w-full max-w-3xl max-h-[45vh] overflow-y-auto">
        {/* Header Section */}
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-2xl">
              {displayName}
            </CardTitle>
            <p className="text-muted-foreground">
              {user.email}
            </p>
            <Badge className="mt-2">
              ID: {user.id.slice(0, 8)}...
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        {/* Account Info */}
        <CardContent className="space-y-6 pt-6">

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              disabled={saving}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={user.email} disabled />
          </div>

          {/* Loyalty Points Section */}
          <div className="bg-primary/10 rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Loyalty Points
              </p>
              <p className="text-3xl font-bold text-primary">
                {profile?.loyalty_points ?? 0}
              </p>
            </div>

            <Button variant="secondary" disabled>
              Redeem Points
            </Button>
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