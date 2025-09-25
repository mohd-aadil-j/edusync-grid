import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  maxWeeklyLoad: number;
  currentLoad: number;
  subjects: string[];
  preferences: string[];
  unavailableSlots: string[];
  status: 'active' | 'inactive';
}

interface SwapRequest {
  id: string;
  facultyId: string;
  facultyName: string;
  type: 'swap' | 'cancel';
  fromSlot: {
    day: string;
    time: string;
    subject: string;
    room: string;
    batch: string;
  };
  toSlot?: {
    day?: string;
    time?: string;
    room?: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const facultySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(255),
  department: z.string().min(1, "Department is required"),
  maxWeeklyLoad: z.number().min(1).max(40),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
});

  const requestSchema = z.object({
    type: z.enum(['swap', 'cancel']),
    reason: z.string().min(10, "Please provide a detailed reason (min 10 characters)").max(500),
    toSlot: z.object({
      day: z.string().optional(),
      time: z.string().optional(),
      room: z.string().optional(),
    }).optional(),
  });

// Mock data
const mockFacultyData: Faculty[] = [
  {
    id: "1",
    name: "Dr. Smith",
    email: "smith@university.edu",
    department: "Computer Science",
    maxWeeklyLoad: 20,
    currentLoad: 16,
    subjects: ["Data Structures", "Algorithms"],
    preferences: ["Morning slots preferred", "No Friday evening classes"],
    unavailableSlots: ["Friday 4:00-5:00 PM"],
    status: "active",
  },
  {
    id: "2", 
    name: "Prof. Johnson",
    email: "johnson@university.edu",
    department: "Computer Science",
    maxWeeklyLoad: 18,
    currentLoad: 15,
    subjects: ["Database Systems", "Software Engineering"],
    preferences: ["Afternoon slots", "Block scheduling preferred"],
    unavailableSlots: ["Monday 9:00-10:00 AM"],
    status: "active",
  },
  {
    id: "3",
    name: "Dr. Brown",
    email: "brown@university.edu", 
    department: "Information Technology",
    maxWeeklyLoad: 22,
    currentLoad: 18,
    subjects: ["Web Development", "Mobile Programming"],
    preferences: ["Lab sessions in afternoon"],
    unavailableSlots: [],
    status: "active",
  },
];

const mockRequests: SwapRequest[] = [
  {
    id: "1",
    facultyId: "1",
    facultyName: "Dr. Smith",
    type: "swap",
    fromSlot: {
      day: "Monday",
      time: "10:00-11:00 AM",
      subject: "Data Structures",
      room: "LH-101",
      batch: "CS-A",
    },
    toSlot: {
      day: "Tuesday", 
      time: "11:00-12:00 PM",
      room: "LH-102",
    },
    reason: "I have a medical appointment on Monday morning and would prefer to swap with Tuesday slot.",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    facultyId: "2",
    facultyName: "Prof. Johnson",
    type: "cancel",
    fromSlot: {
      day: "Friday",
      time: "4:00-5:00 PM", 
      subject: "Database Systems",
      room: "LAB-CS-01",
      batch: "CS-B",
    },
    reason: "Emergency faculty meeting scheduled at the same time. Need to cancel this class.",
    status: "pending",
    createdAt: "2024-01-15T09:15:00Z",
  },
];

interface FacultyManagementProps {
  userRole: 'admin' | 'scheduler' | 'faculty';
}

const FacultyManagement = ({ userRole }: FacultyManagementProps) => {
  const [facultyData, setFacultyData] = useState<Faculty[]>(mockFacultyData);
  const [requests, setRequests] = useState<SwapRequest[]>(mockRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  
  const { toast } = useToast();
  
  const facultyForm = useForm<z.infer<typeof facultySchema>>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      maxWeeklyLoad: 20,
      subjects: [],
    },
  });

  const requestForm = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type: "swap",
      reason: "",
    },
  });

  // Mock current user faculty ID (in real app, get from auth context)
  const currentFacultyId = "1";

  const filteredFaculty = facultyData.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFaculty = async (values: z.infer<typeof facultySchema>) => {
    try {
      const newFaculty: Faculty = {
        id: Date.now().toString(),
        name: values.name,
        email: values.email,
        department: values.department,
        maxWeeklyLoad: values.maxWeeklyLoad,
        subjects: values.subjects,
        currentLoad: 0,
        preferences: [],
        unavailableSlots: [],
        status: 'active',
      };
      
      setFacultyData([...facultyData, newFaculty]);
      setIsDialogOpen(false);
      facultyForm.reset();
      
      toast({
        title: "Faculty Added",
        description: "New faculty member has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add faculty member.",
        variant: "destructive",
      });
    }
  };

  const handleEditFaculty = async (values: z.infer<typeof facultySchema>) => {
    if (!editingFaculty) return;
    
    try {
      const updatedFaculty = facultyData.map(faculty =>
        faculty.id === editingFaculty.id
          ? { ...faculty, ...values }
          : faculty
      );
      
      setFacultyData(updatedFaculty);
      setIsDialogOpen(false);
      setEditingFaculty(null);
      facultyForm.reset();
      
      toast({
        title: "Faculty Updated",
        description: "Faculty member has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update faculty member.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    try {
      const updatedFaculty = facultyData.filter(faculty => faculty.id !== facultyId);
      setFacultyData(updatedFaculty);
      
      toast({
        title: "Faculty Deleted",
        description: "Faculty member has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete faculty member.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitRequest = async (values: z.infer<typeof requestSchema>) => {
    try {
      const newRequest: SwapRequest = {
        id: Date.now().toString(),
        facultyId: currentFacultyId,
        facultyName: "Dr. Smith", // Get from current user
        type: values.type,
        fromSlot: selectedSlot,
        toSlot: values.type === 'swap' ? values.toSlot : undefined,
        reason: values.reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      
      setRequests([...requests, newRequest]);
      setIsRequestDialogOpen(false);
      requestForm.reset();
      
      toast({
        title: "Request Submitted",
        description: `Your ${values.type} request has been submitted to the scheduler.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request.",
        variant: "destructive",
      });
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const updatedRequests = requests.map(request =>
        request.id === requestId
          ? { ...request, status: (action === 'approve' ? 'approved' : 'rejected') as 'approved' | 'rejected' }
          : request
      );
      
      setRequests(updatedRequests);
      
      toast({
        title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The ${action === 'approve' ? 'request has been approved and will be processed' : 'request has been rejected'}.`,
      });
      
      if (action === 'approve') {
        // In real app, trigger OptaPlanner rescheduling here
        console.log("Triggering OptaPlanner rescheduling...");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} request.`,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    facultyForm.reset({
      name: faculty.name,
      email: faculty.email,
      department: faculty.department,
      maxWeeklyLoad: faculty.maxWeeklyLoad,
      subjects: faculty.subjects,
    });
    setIsDialogOpen(true);
  };

  // Faculty view (read-only with request functionality)
  if (userRole === 'faculty') {
    const currentFaculty = facultyData.find(f => f.id === currentFacultyId);
    const myRequests = requests.filter(r => r.facultyId === currentFacultyId);
    
    // Mock schedule for the current faculty
    const mySchedule = [
      {
        day: "Monday",
        time: "10:00-11:00 AM",
        subject: "Data Structures", 
        room: "LH-101",
        batch: "CS-A",
      },
      {
        day: "Tuesday",
        time: "2:00-3:00 PM",
        subject: "Algorithms",
        room: "LH-102", 
        batch: "CS-B",
      },
      {
        day: "Wednesday",
        time: "11:00-12:00 PM",
        subject: "Data Structures",
        room: "LH-101",
        batch: "CS-C",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Faculty Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentFaculty && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {currentFaculty.name}</p>
                  <p><strong>Email:</strong> {currentFaculty.email}</p>
                  <p><strong>Department:</strong> {currentFaculty.department}</p>
                </div>
                <div>
                  <p><strong>Weekly Load:</strong> {currentFaculty.currentLoad}/{currentFaculty.maxWeeklyLoad} hours</p>
                  <p><strong>Subjects:</strong> {currentFaculty.subjects.join(", ")}</p>
                  <p><strong>Status:</strong> <Badge variant="secondary">{currentFaculty.status}</Badge></p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mySchedule.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{slot.subject}</div>
                    <div className="text-sm text-muted-foreground">
                      {slot.day} • {slot.time} • {slot.room} • {slot.batch}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSlot(slot);
                      setIsRequestDialogOpen(true);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Change
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              My Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No requests submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {myRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={request.type === 'swap' ? 'default' : 'destructive'}>
                        {request.type.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><strong>From:</strong> {request.fromSlot.day} • {request.fromSlot.time} • {request.fromSlot.subject}</p>
                      {request.toSlot && (
                        <p><strong>To:</strong> {request.toSlot.day} • {request.toSlot.time}</p>
                      )}
                      <p><strong>Reason:</strong> {request.reason}</p>
                      <p className="text-muted-foreground">
                        <strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Dialog */}
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Submit Change Request</DialogTitle>
              <DialogDescription>
                Request to swap or cancel your class. The scheduler will review your request.
              </DialogDescription>
            </DialogHeader>
            <Form {...requestForm}>
              <form onSubmit={requestForm.handleSubmit(handleSubmitRequest)} className="space-y-4">
                {selectedSlot && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Selected Class:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSlot.day} • {selectedSlot.time} • {selectedSlot.subject}
                    </p>
                  </div>
                )}
                
                <FormField
                  control={requestForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select request type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="swap">Swap Class</SelectItem>
                          <SelectItem value="cancel">Cancel Class</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a detailed reason for your request..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Scheduler/Admin view (full CRUD access)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Faculty Management</h2>
          <p className="text-muted-foreground">
            Manage faculty members, their schedules, and review change requests.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Faculty</p>
              <p className="text-2xl font-bold">{facultyData.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-accent" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Avg Load</p>
              <p className="text-2xl font-bold">
                {Math.round(facultyData.reduce((acc, f) => acc + f.currentLoad, 0) / facultyData.length)}h
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-bold">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active Faculty</p>
              <p className="text-2xl font-bold">
                {facultyData.filter(f => f.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests Section */}
      {requests.filter(r => r.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Requests
            </CardTitle>
            <CardDescription>
              Review and approve/reject faculty change requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.filter(r => r.status === 'pending').map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={request.type === 'swap' ? 'default' : 'destructive'}>
                          {request.type.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{request.facultyName}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><strong>From:</strong> {request.fromSlot.day} • {request.fromSlot.time} • {request.fromSlot.subject}</p>
                        {request.toSlot && (
                          <p><strong>To:</strong> {request.toSlot.day} • {request.toSlot.time}</p>
                        )}
                        <p><strong>Reason:</strong> {request.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleRequestAction(request.id, 'approve')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRequestAction(request.id, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Faculty Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Faculty Members</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Load</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.map((faculty) => (
                <TableRow key={faculty.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{faculty.name}</div>
                      <div className="text-sm text-muted-foreground">{faculty.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{faculty.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        {faculty.currentLoad}/{faculty.maxWeeklyLoad}h
                      </div>
                      <div className="w-20 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min((faculty.currentLoad / faculty.maxWeeklyLoad) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {faculty.subjects.slice(0, 2).map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {faculty.subjects.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{faculty.subjects.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={faculty.status === 'active' ? 'default' : 'secondary'}
                    >
                      {faculty.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(faculty)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFaculty(faculty.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Faculty Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingFaculty ? "Edit Faculty Member" : "Add New Faculty Member"}
            </DialogTitle>
            <DialogDescription>
              {editingFaculty
                ? "Update the faculty member's information."
                : "Add a new faculty member to the system."}
            </DialogDescription>
          </DialogHeader>
          <Form {...facultyForm}>
            <form
              onSubmit={facultyForm.handleSubmit(
                editingFaculty ? handleEditFaculty : handleAddFaculty
              )}
              className="space-y-4"
            >
              <FormField
                control={facultyForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter faculty name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={facultyForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={facultyForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={facultyForm.control}
                name="maxWeeklyLoad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Weekly Load (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter max weekly load"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingFaculty(null);
                    facultyForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingFaculty ? "Update" : "Add"} Faculty
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyManagement;