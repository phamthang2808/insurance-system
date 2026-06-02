import { adminService } from "@/services/adminService";
import { useAuthStore } from "@/services/authStore";
import type {
  CustomerPolicy,
  IncidentReport,
} from "@/services/insuranceService";
import { insuranceService } from "@/services/insuranceService";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";

export const StaffActions: React.FC<{ onActionComplete: () => void }> = ({
  onActionComplete,
}) => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [assignedCustomers, setAssignedCustomers] = useState<any[]>([]);
  const [policies, setPolicies] = useState<CustomerPolicy[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<number | "">("");

  useEffect(() => {
    if (open && user?.id) {
      loadData();
    }
  }, [open, user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      insuranceService.getAllIncidents().then(setIncidents);
      adminService.getAssignedCustomers(user.id).then((customers) => {
        setAssignedCustomers(customers);
        const custIds = customers.map((c) => c.id);
        import("@/services/apiClient")
          .then((m) => m.default.get("/policies"))
          .then((res) => {
            if (res.data?.data) {
              setPolicies(
                res.data.data.filter((p: any) =>
                  custIds.includes(p.customerId),
                ),
              );
            }
          });
      });
      insuranceService.getNotesByStaff?.(user.id).then(setNotes);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    await insuranceService.updateIncidentStatus(id, status);
    loadData();
    onActionComplete();
  };

  const handleCreateNote = async () => {
    if (user && selectedCustomer && newNote) {
      await insuranceService.createNote(
        user.id,
        Number(selectedCustomer),
        newNote,
      );
      setNewNote("");
      loadData();
    }
  };

  const handleAdvanceStep = async (id: number) => {
    await insuranceService.advancePolicyStep(id);
    loadData();
    onActionComplete();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Quản Lý Khối Lượng Công Việc
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Không Gian Làm Việc Nhân Viên</DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
            <Tab label="Hợp Đồng" />
            <Tab label="Sự Cố" />
            <Tab label="Ghi Chú Tư Vấn" />
          </Tabs>
        </Box>
        <DialogContent sx={{ pt: 2, minHeight: 400 }}>
          {tabValue === 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Khách Hàng</TableCell>
                  <TableCell>Gói Bảo Hiểm</TableCell>
                  <TableCell>Trạng Thái</TableCell>
                  <TableCell>Bước Xử Lý</TableCell>
                  <TableCell>Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {policies.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>#{p.id}</TableCell>
                    <TableCell>{(p as any).customerName}</TableCell>
                    <TableCell><b>{(p as any).packageName}</b></TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>
                      <b>{{ 'RECEIVING': 'Tiếp nhận', 'APPRAISING': 'Thẩm định', 'SIGNING': 'Ký hợp đồng', 'ACTIVE': 'Đã kích hoạt', 'COMPLETED': 'Hoàn thành' }[p.processStep || "RECEIVING"] || p.processStep}</b>
                    </TableCell>
                    <TableCell>
                      {p.status !== "ACTIVE" && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAdvanceStep(p.id)}
                        >
                          Chuyển Bước
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tabValue === 1 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Mô Tả</TableCell>
                  <TableCell>Trạng Thái</TableCell>
                  <TableCell>Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incidents.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>#{i.id}</TableCell>
                    <TableCell>{i.description}</TableCell>
                    <TableCell>{i.status}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={i.status}
                        onChange={(e) =>
                          handleUpdateStatus(i.id, e.target.value)
                        }
                      >
                        <MenuItem value="PENDING">CHỜ XỬ LÝ</MenuItem>
                        <MenuItem value="PROCESSING">ĐANG XỬ LÝ</MenuItem>
                        <MenuItem value="RESOLVED">ĐÃ GIẢI QUYẾT</MenuItem>
                        <MenuItem value="REJECTED">BỊ TỪ CHỐI</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Select
                  size="small"
                  value={selectedCustomer}
                  onChange={(e) =>
                    setSelectedCustomer(e.target.value as number)
                  }
                  displayEmpty
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="" disabled>
                    Chọn Khách Hàng
                  </MenuItem>
                  {assignedCustomers.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.fullName}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Nhập ghi chú tư vấn..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleCreateNote}
                  disabled={!selectedCustomer || !newNote}
                >
                  Thêm
                </Button>
              </Box>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Khách Hàng</TableCell>
                    <TableCell>Ghi Chú</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notes?.map((n: any) => {
                    let parsedDate = n.notedAt;
                    if (Array.isArray(n.notedAt)) {
                      parsedDate = new Date(n.notedAt[0], n.notedAt[1] - 1, n.notedAt[2], n.notedAt[3] || 0, n.notedAt[4] || 0, n.notedAt[5] || 0);
                    } else {
                      parsedDate = new Date(n.notedAt);
                    }
                    const dateStr = !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleString("vi-VN") : 'N/A';
                    
                    return (
                      <TableRow key={n.id}>
                        <TableCell>{dateStr}</TableCell>
                        <TableCell>{n.customerName}</TableCell>
                        <TableCell>{n.note}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
