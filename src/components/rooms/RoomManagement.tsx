import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus, Pencil, Trash2, Search, Users } from "lucide-react";

interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'Lecture Hall' | 'Laboratory' | 'Seminar Room' | 'Auditorium';
  equipment?: string[];
  isAvailable: boolean;
}

const initialRooms: Room[] = [
  {
    id: "1",
    name: "LH-101",
    capacity: 150,
    type: "Lecture Hall",
    equipment: ["Projector", "Audio System", "Whiteboard"],
    isAvailable: true,
  },
  {
    id: "2", 
    name: "LAB-CS-01",
    capacity: 40,
    type: "Laboratory",
    equipment: ["Computers", "Network Setup", "Projector"],
    isAvailable: true,
  },
  {
    id: "3",
    name: "SR-205",
    capacity: 25,
    type: "Seminar Room",
    equipment: ["Projector", "Conference Table"],
    isAvailable: false,
  },
];

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    type: "" as Room['type'] | "",
    equipment: "",
  });
  const { toast } = useToast();

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: "", capacity: "", type: "", equipment: "" });
    setEditingRoom(null);
  };

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        capacity: room.capacity.toString(),
        type: room.type,
        equipment: room.equipment?.join(", ") || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const roomData: Omit<Room, 'id'> = {
      name: formData.name,
      capacity: parseInt(formData.capacity),
      type: formData.type as Room['type'],
      equipment: formData.equipment.split(",").map(item => item.trim()).filter(Boolean),
      isAvailable: true,
    };

    if (editingRoom) {
      setRooms(prev => prev.map(room => 
        room.id === editingRoom.id ? { ...roomData, id: editingRoom.id } : room
      ));
      toast({
        title: "Room Updated",
        description: `${roomData.name} has been updated successfully.`,
      });
    } else {
      const newRoom: Room = {
        ...roomData,
        id: (rooms.length + 1).toString(),
      };
      setRooms(prev => [...prev, newRoom]);
      toast({
        title: "Room Created",
        description: `${roomData.name} has been created successfully.`,
      });
    }

    handleCloseDialog();
  };

  const handleDelete = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    setRooms(prev => prev.filter(room => room.id !== roomId));
    toast({
      title: "Room Deleted",
      description: `${room?.name} has been deleted successfully.`,
      variant: "destructive",
    });
  };

  const getTypeColor = (type: Room['type']) => {
    const colors = {
      'Lecture Hall': 'bg-primary/10 text-primary',
      'Laboratory': 'bg-accent/10 text-accent',
      'Seminar Room': 'bg-warning/10 text-warning',
      'Auditorium': 'bg-success/10 text-success',
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Room Management</h2>
          <p className="text-muted-foreground">Manage classroom and laboratory spaces</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </DialogTitle>
                <DialogDescription>
                  {editingRoom ? "Update room details" : "Enter the details for the new room"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., LH-101, LAB-CS-01"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    required
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Room Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Room['type'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lecture Hall">Lecture Hall</SelectItem>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Seminar Room">Seminar Room</SelectItem>
                      <SelectItem value="Auditorium">Auditorium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                  <Input
                    id="equipment"
                    placeholder="e.g., Projector, Whiteboard, Audio System"
                    value={formData.equipment}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-gradient">
                  {editingRoom ? "Update Room" : "Create Room"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Rooms Directory</CardTitle>
          <CardDescription>
            Comprehensive list of all available rooms and their specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Type</TableHead> 
                <TableHead>Capacity</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(room.type)}>
                      {room.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {room.capacity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {room.equipment?.slice(0, 2).map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                      {room.equipment && room.equipment.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{room.equipment.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={room.isAvailable ? "default" : "destructive"}
                      className={room.isAvailable ? "status-approved" : "status-conflict"}
                    >
                      {room.isAvailable ? "Available" : "Occupied"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(room)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(room.id)}
                        className="text-destructive hover:text-destructive"
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
    </div>
  );
};

export default RoomManagement;