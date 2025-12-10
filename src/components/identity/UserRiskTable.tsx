import { useState } from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ShieldAlert, ShieldCheck, ShieldX, Search, Filter } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { User } from "@/hooks/useMockApi";

interface UserRiskTableProps {
  users: User[];
}

const statusConfig = {
  safe: { color: 'text-status-healthy', bgColor: 'bg-status-healthy/10', icon: ShieldCheck, label: 'Safe' },
  medium: { color: 'text-status-warning', bgColor: 'bg-status-warning/10', icon: ShieldAlert, label: 'Medium Risk' },
  risky: { color: 'text-status-critical', bgColor: 'bg-status-critical/10', icon: ShieldX, label: 'High Risk' },
};

export function UserRiskTable({ users }: UserRiskTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [mfaFilter, setMfaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesMfa = mfaFilter === "all" || 
      (mfaFilter === "enabled" && user.mfaEnabled) || 
      (mfaFilter === "disabled" && !user.mfaEnabled);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesMfa && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={mfaFilter} onValueChange={setMfaFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="MFA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All MFA</SelectItem>
            <SelectItem value="enabled">MFA Enabled</SelectItem>
            <SelectItem value="disabled">MFA Disabled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="risky">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>MFA</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const status = statusConfig[user.status];
              const StatusIcon = status.icon;
              
              return (
                <TableRow key={user.id} className={cn(
                  user.status === 'risky' && "bg-status-critical/5"
                )}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-medium">
                        {user.displayName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        user.mfaEnabled 
                          ? "bg-status-healthy/10 text-status-healthy" 
                          : "bg-status-critical/10 text-status-critical"
                      )}
                    >
                      {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-16 rounded-full bg-muted overflow-hidden"
                      )}>
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            user.riskScore < 30 ? "bg-status-healthy" :
                            user.riskScore < 60 ? "bg-status-warning" : "bg-status-critical"
                          )}
                          style={{ width: `${user.riskScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono w-8">{user.riskScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(user.lastLogin), 'MMM d, HH:mm')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "flex items-center gap-2 px-2.5 py-1 rounded-full w-fit",
                      status.bgColor
                    )}>
                      <StatusIcon className={cn("h-4 w-4", status.color)} />
                      <span className={cn("text-sm font-medium", status.color)}>
                        {status.label}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </p>
    </div>
  );
}
