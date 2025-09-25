import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Building2,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Home,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'scheduler';
  onLogout: () => void;
}

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, roles: ['admin', 'scheduler'] },
  { title: "Rooms", url: "/dashboard/rooms", icon: Building2, roles: ['admin', 'scheduler'] },
  { title: "Faculty", url: "/dashboard/faculty", icon: Users, roles: ['admin', 'scheduler'] },
  { title: "Batches", url: "/dashboard/batches", icon: BookOpen, roles: ['admin', 'scheduler'] },
  { title: "Subjects", url: "/dashboard/subjects", icon: Calendar, roles: ['admin', 'scheduler'] },
  { title: "Schedule", url: "/dashboard/schedule", icon: Calendar, roles: ['admin', 'scheduler'] },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, roles: ['admin'] },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, roles: ['admin'] },
];

const AppSidebar = ({ userRole, onLogout }: { userRole: 'admin' | 'scheduler'; onLogout: () => void }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const filteredItems = navigationItems.filter(item => item.roles.includes(userRole));
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-foreground">ICSS</h2>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium border border-primary/20"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userRole === 'admin' ? 'A' : 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">
                {userRole === 'admin' ? 'Administrator' : 'Scheduler'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

const DashboardLayout = ({ children, userRole, onLogout }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar userRole={userRole} onLogout={onLogout} />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">
                Intelligent Class Scheduling System
              </h1>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;