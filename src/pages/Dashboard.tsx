import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Calendar, 
  Building2, 
  Users, 
  BookOpen, 
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  userRole: 'admin' | 'scheduler';
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const navigate = useNavigate();

  const quickStats = [
    {
      title: "Total Rooms",
      value: "24",
      change: "+2",
      changeType: "positive" as const,
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Faculty Members",
      value: "45", 
      change: "+3",
      changeType: "positive" as const,
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Active Batches",
      value: "12",
      change: "0",
      changeType: "neutral" as const,
      icon: BookOpen,
      color: "text-success",
    },
    {
      title: "Scheduled Classes",
      value: "180",
      change: "+15",
      changeType: "positive" as const,
      icon: Calendar,
      color: "text-warning",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      action: "Schedule Generated",
      description: "Weekly timetable for CS Department",
      time: "2 hours ago",
      status: "success" as const,
    },
    {
      id: "2", 
      action: "Room Added",
      description: "LAB-EE-03 added to Electronics block",
      time: "4 hours ago",
      status: "info" as const,
    },
    {
      id: "3",
      action: "Conflict Detected",
      description: "Double booking in LH-101 on Monday 10:00",
      time: "6 hours ago", 
      status: "warning" as const,
    },
    {
      id: "4",
      action: "Schedule Approved",
      description: "Mathematics Department timetable approved",
      time: "1 day ago",
      status: "success" as const,
    },
  ];

  const pendingTasks = [
    {
      id: "1",
      title: "Review CS Department Schedule",
      description: "Pending approval with 2 conflicts to resolve",
      priority: "high" as const,
      dueDate: "Today",
    },
    {
      id: "2",
      title: "Update Room Capacities",
      description: "3 rooms need capacity updates after renovation",
      priority: "medium" as const,
      dueDate: "Tomorrow",
    },
    {
      id: "3",
      title: "Faculty Preference Updates",
      description: "5 faculty members updated their preferences",
      priority: "low" as const,
      dueDate: "This Week",
    },
  ];

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Clock className="h-4 w-4 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'status-conflict';
      case 'medium': return 'status-pending'; 
      case 'low': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {userRole === 'admin' ? 'Administrator' : 'Scheduler'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your scheduling system today.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/schedule')} className="btn-gradient">
          <Calendar className="h-4 w-4 mr-2" />
          View Schedule
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="card-gradient card-interactive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    {stat.change !== "0" && (
                      <Badge 
                        variant="outline" 
                        className={stat.changeType === 'positive' ? 'status-approved' : 'status-conflict'}
                      >
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-primary/10 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and changes in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Tasks
            </CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {task.dueDate}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/rooms')}
            >
              <Building2 className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-medium">Manage Rooms</div>
                <div className="text-xs text-muted-foreground">Add or edit classroom information</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/faculty')}
            >
              <Users className="h-6 w-6 text-accent" />
              <div className="text-center">
                <div className="font-medium">Manage Faculty</div>
                <div className="text-xs text-muted-foreground">Update teacher preferences and loads</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/schedule')}
            >
              <Calendar className="h-6 w-6 text-success" />
              <div className="text-center">
                <div className="font-medium">Generate Schedule</div>
                <div className="text-xs text-muted-foreground">Create optimized timetables</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;