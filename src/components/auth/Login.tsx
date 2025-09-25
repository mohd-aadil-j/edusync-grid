import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Lock, User } from "lucide-react";

interface LoginProps {
  onLogin: (role: 'admin' | 'scheduler') => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Debug logging
      console.log("Login attempt:", { username: credentials.username, password: credentials.password });
      
      // Mock authentication - in real app, this would call your Spring Boot API
      if (credentials.username === "admin" && credentials.password === "admin123") {
        toast({
          title: "Login Successful",
          description: "Welcome back, Administrator!",
        });
        onLogin('admin');
      } else if (credentials.username === "scheduler" && credentials.password === "scheduler123") {
        toast({
          title: "Login Successful", 
          description: "Welcome back, Scheduler!",
        });
        onLogin('scheduler');
      } else {
        toast({
          title: "Login Failed",
          description: `Invalid credentials. You entered: "${credentials.username}" / "${credentials.password}"`,
          variant: "destructive",
        });
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ICSS</h1>
          <p className="text-muted-foreground mt-2">Intelligent Class Scheduling System</p>
        </div>

        {/* Login Card */}
        <Card className="card-gradient shadow-elevated">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the scheduling system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-gradient"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-semibold text-primary mb-3">🚀 Demo Credentials:</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCredentials({ username: "admin", password: "admin123" })}
                    className="justify-start text-left h-auto py-2"
                  >
                    <div>
                      <div className="font-medium">Administrator</div>
                      <div className="text-xs text-muted-foreground">admin / admin123</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCredentials({ username: "scheduler", password: "scheduler123" })}
                    className="justify-start text-left h-auto py-2"
                  >
                    <div>
                      <div className="font-medium">Scheduler</div>
                      <div className="text-xs text-muted-foreground">scheduler / scheduler123</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;