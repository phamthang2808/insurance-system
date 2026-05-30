import React, { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import {
  Box, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, FormControl, InputLabel,
  ToggleButton, ToggleButtonGroup, Typography, Chip
} from "@mui/material";

export const StaffAssignment: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [filter, setFilter] = useState<"unassigned" | "all">("unassigned");

  const loadData = async () => {
    try {
      const allUsers = await adminService.getAllUsers();
      setUsers(allUsers.filter((u: any) => u.role === "USER"));
      setStaffs(allUsers.filter((u: any) => u.role === "STAFF"));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async () => {
    if (selectedCustomer && selectedStaff) {
      await adminService.assignStaff(selectedCustomer, selectedStaff);
      setOpen(false);
      loadData();
    }
  };

  const getStaffName = (assignedStaff: any) => {
    if (!assignedStaff) return null;
    const staff = staffs.find((s) => s.id === assignedStaff.id);
    return staff ? staff.fullName : `Staff #${assignedStaff.id}`;
  };

  const filteredUsers =
    filter === "unassigned"
      ? users.filter((u) => !u.assignedStaff)
      : users;

  const unassignedCount = users.filter((u) => !u.assignedStaff).length;

  return (
    <Box>
      {/* Filter toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => { if (val) setFilter(val); }}
          size="small"
        >
          <ToggleButton value="unassigned">
            Chưa giao phó
            {unassignedCount > 0 && (
              <Chip
                label={unassignedCount}
                size="small"
                color="warning"
                sx={{ ml: 1, height: 18, fontSize: "0.7rem" }}
              />
            )}
          </ToggleButton>
          <ToggleButton value="all">
            Tất cả ({users.length})
          </ToggleButton>
        </ToggleButtonGroup>

        {filter === "unassigned" && unassignedCount === 0 && (
          <Typography variant="body2" color="success.main" sx={{ fontStyle: "italic" }}>
            ✅ Tất cả khách hàng đã được giao phó!
          </Typography>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Khách hàng</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Staff phụ trách</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  {filter === "unassigned"
                    ? "Không còn khách hàng nào chưa được giao phó 🎉"
                    : "Không có khách hàng nào"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const staffName = getStaffName(user.assignedStaff);
                const isAssigned = !!user.assignedStaff;
                return (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {isAssigned ? (
                        <Chip
                          label={staffName}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          — Chưa có
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant={isAssigned ? "text" : "outlined"}
                        color={isAssigned ? "secondary" : "primary"}
                        onClick={() => {
                          setSelectedCustomer(user.id);
                          setOpen(true);
                        }}
                      >
                        {isAssigned ? "Đổi Staff" : "Giao phó"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Giao phó Staff cho khách hàng</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <FormControl fullWidth>
            <InputLabel>Chọn Staff</InputLabel>
            <Select
              value={selectedStaff || ""}
              label="Chọn Staff"
              onChange={(e) => setSelectedStaff(e.target.value as number)}
            >
              {staffs.map((staff) => (
                <MenuItem key={staff.id} value={staff.id}>
                  {staff.fullName} ({staff.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleAssign}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
