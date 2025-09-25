import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  RefreshCw, 
  Filter, 
  Download, 
  Clock, 
  MapPin, 
  User, 
  BookOpen,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface ScheduleSlot {
  id: string;
  subject: string;
  faculty: string;
  room: string;
  batch: string;
  timeSlot: string;
  day: string;
  status: 'approved' | 'pending' | 'conflict';
  conflictReason?: string;
}

const timeSlots = [
  "8:00-9:00",
  "9:00-10:00", 
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const mockScheduleData: ScheduleSlot[] = [
  {
    id: "1",
    subject: "Data Structures",
    faculty: "Dr. Smith",
    room: "LH-101",
    batch: "CS-A",
    timeSlot: "9:00-10:00",
    day: "Monday",
    status: "approved"
  },
  {
    id: "2", 
    subject: "Database Systems",
    faculty: "Prof. Johnson",
    room: "LAB-CS-01",
    batch: "CS-B",
    timeSlot: "10:00-11:00",
    day: "Monday",
    status: "pending"
  },
  {
    id: "3",
    subject: "Web Development",
    faculty: "Dr. Brown",
    room: "LH-101",
    batch: "CS-A",
    timeSlot: "10:00-11:00",
    day: "Monday",
    status: "conflict",
    conflictReason: "Room double-booked"
  },
  {
    id: "4",
    subject: "Machine Learning",
    faculty: "Dr. Wilson",
    room: "SR-205",
    batch: "CS-C",
    timeSlot: "11:00-12:00",
    day: "Tuesday",
    status: "approved"
  },
];

const TimetableView = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleSlot[]>(mockScheduleData);
  const [filterBy, setFilterBy] = useState<'all' | 'batch' | 'faculty' | 'room'>('all');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to generate schedule
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Schedule Generated",
        description: "New timetable has been generated successfully with optimization score: 85%",
      });
      
      // In real app, this would fetch the new schedule from API
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: ScheduleSlot['status']) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'conflict': return 'status-conflict';
      default: return '';
    }
  };

  const getScheduleForSlot = (day: string, timeSlot: string) => {
    return scheduleData.filter(slot => slot.day === day && slot.timeSlot === timeSlot);
  };

  const calculateStats = () => {
    const total = scheduleData.length;
    const approved = scheduleData.filter(s => s.status === 'approved').length;
    const pending = scheduleData.filter(s => s.status === 'pending').length;
    const conflicts = scheduleData.filter(s => s.status === 'conflict').length;
    
    return { total, approved, pending, conflicts };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Schedule Management</h2>
          <p className="text-muted-foreground">Generate and manage class timetables</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={handleGenerateSchedule} 
            disabled={isGenerating}
            className="btn-gradient"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Schedule'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-success">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conflicts</p>
                <p className="text-2xl font-bold text-destructive">{stats.conflicts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterBy} onValueChange={(value) => setFilterBy(value as typeof filterBy)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="batch">By Batch</SelectItem>
                <SelectItem value="faculty">By Faculty</SelectItem>
                <SelectItem value="room">By Room</SelectItem>
              </SelectContent>
            </Select>
            
            {filterBy !== 'all' && (
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={`Select ${filterBy}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CS-A">CS-A</SelectItem>
                  <SelectItem value="CS-B">CS-B</SelectItem>
                  <SelectItem value="CS-C">CS-C</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Timetable
          </CardTitle>
          <CardDescription>
            Interactive schedule grid with real-time conflict detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="schedule-grid rounded-lg">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="schedule-cell bg-muted/50 font-semibold text-left">Time</th>
                    {days.map(day => (
                      <th key={day} className="schedule-cell bg-muted/50 font-semibold text-center min-w-[150px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(timeSlot => (
                    <tr key={timeSlot}>
                      <td className="schedule-cell bg-muted/30 font-medium text-sm">
                        {timeSlot}
                      </td>
                      {days.map(day => {
                        const slots = getScheduleForSlot(day, timeSlot);
                        return (
                          <td key={`${day}-${timeSlot}`} className="schedule-cell relative">
                            {slots.map(slot => (
                              <div
                                key={slot.id}
                                className={`
                                  p-2 mb-2 last:mb-0 rounded-md border text-xs
                                  ${slot.status === 'approved' ? 'schedule-approved' : ''}
                                  ${slot.status === 'pending' ? 'schedule-pending' : ''}
                                  ${slot.status === 'conflict' ? 'schedule-conflict' : ''}
                                  transition-all duration-200 hover:shadow-md cursor-pointer
                                `}
                              >
                                <div className="font-medium truncate">{slot.subject}</div>
                                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span className="truncate">{slot.faculty}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{slot.room}</span>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`mt-1 ${getStatusColor(slot.status)}`}
                                >
                                  {slot.status}
                                </Badge>
                                {slot.conflictReason && (
                                  <div className="mt-1 text-destructive text-xs font-medium">
                                    {slot.conflictReason}
                                  </div>
                                )}
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Actions</CardTitle>
          <CardDescription>
            Review and approve the generated schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex-1">
              Submit for Review
            </Button>
            <Button variant="outline" className="flex-1">
              Save as Draft
            </Button>
            <Button className="btn-gradient flex-1">
              Approve Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableView;