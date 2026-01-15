import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import { Loader2, User, Mail, Coins, Calendar, LogOut, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const { user, loading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Refresh user data when component mounts
    if (user) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out', {
        description: 'You have been successfully logged out'
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed', {
        description: error.message || 'Failed to logout. Please try again.'
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">No user data found. Please login again.</p>
            <Button onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="font-bold text-xl gradient-text">AI Tooling Protocol</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold gradient-text">Profile</h1>
            <p className="text-muted-foreground">Manage your account and view your credits</p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Account Information</CardTitle>
                  <CardDescription>Your account details and statistics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {/* Credits */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <Coins className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Available Credits</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-primary">{user.credits.toLocaleString()}</p>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Free Credits
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Account Created */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Account Created</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              {/* Last Login */}
              {user.lastLogin && (
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">{formatDate(user.lastLogin)}</p>
                  </div>
                </div>
              )}

              {/* Credit Info */}
              <div className="p-4 bg-muted/30 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-2">Credit Usage</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Text Generation: <strong className="text-foreground">10 credits</strong> per request</li>
                  <li>• Image Creation: <strong className="text-foreground">50 credits</strong> per request</li>
                  <li>• Video Creation: <strong className="text-foreground">50 credits</strong> per request</li>
                  <li>• Voice Synthesis: <strong className="text-foreground">50 credits</strong> per request</li>
                </ul>
              </div>

              {/* Logout Button */}
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
