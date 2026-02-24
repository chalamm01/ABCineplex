import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const user = {
  user_id: "12345",
  email: "john.doe@example.com",
  full_name: "John Doe",
  user_name: "johndoe",
  phone: "123-456-7890",
  loyalty_points: 1500,
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-muted/40 flex justify-center p-6">
      <Card className="w-full max-w-3xl">
        
        {/* Header Section */}
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback>
              {user.full_name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-2xl">
              {user.full_name}
            </CardTitle>
            <p className="text-muted-foreground">
              {user.email}
            </p>
            <Badge className="mt-2">
              ID: {user.user_id}
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        {/* Account Info */}
        <CardContent className="space-y-6 pt-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input defaultValue={user.user_name} />
            </div>

            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input defaultValue={user.phone} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input defaultValue={user.email} disabled />
          </div>

          {/* Loyalty Points Section */}
          <div className="bg-primary/10 rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Loyalty Points
              </p>
              <p className="text-3xl font-bold text-primary">
                {user.loyalty_points}
              </p>
            </div>

            <Button variant="secondary">
              Redeem Points
            </Button>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline">
              Cancel
            </Button>
            <Button>
              Save Changes
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}