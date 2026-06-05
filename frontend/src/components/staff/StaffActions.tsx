import { adminService } from "@/services/adminService";
import { useAuthStore } from "@/services/authStore";
import type {
  CustomerPolicy,
  IncidentReport,
  Appointment,
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
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const parseJacksonDate = (val: any): Date | null => {
  if (!val) return null;
  if (Array.isArray(val)) {
    return new Date(
      val[0],
      val[1] - 1,
      val[2],
      val[3] || 0,
      val[4] || 0,
      val[5] || 0
    );
  }
  return new Date(val);
};

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [meetingLinks, setMeetingLinks] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open && user?.id) {
      loadData();
    }
  }, [open, user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      adminService.getAssignedCustomers(user.id).then((customers) => {
        setAssignedCustomers(customers);
        const custIds = customers.map((c) => c.id);

        // Load and filter incidents by assigned customer IDs
        insuranceService.getAllIncidents().then((allIncidents) => {
          setIncidents(
            allIncidents.filter((i: any) =>
              custIds.includes(i.customerId),
            ),
          );
        });

        // Load and filter policies
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
      insuranceService.getStaffAppointments(user.id).then(setAppointments);
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

  const handleUpdateAppointmentStatus = async (id: number, status: string) => {
    const link = meetingLinks[id] || "";
    await insuranceService.updateAppointmentStatus(id, status, link);
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
            <Tab label="Lịch Hẹn" />
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

          {tabValue === 3 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Khách Hàng</TableCell>
                  <TableCell>Lý Do</TableCell>
                  <TableCell>Thời Gian</TableCell>
                  <TableCell>Trạng Thái</TableCell>
                  <TableCell>Link Cuộc Họp</TableCell>
                  <TableCell>Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((app) => {
                  const date = parseJacksonDate(app.scheduledTime);
                  const dateStr = date && !isNaN(date.getTime())
                    ? date.toLocaleString("vi-VN", {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "N/A";

                  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                    'PENDING': { label: 'Chờ duyệt', color: '#d97706', bg: '#fffbeb' },
                    'APPROVED': { label: 'Đã duyệt', color: '#16a34a', bg: '#ecfdf5' },
                    'CANCELLED': { label: 'Đã hủy', color: '#dc2626', bg: '#fef2f2' }
                  };
                  const statusInfo = statusMap[app.status] || { label: app.status || 'Chờ duyệt', color: '#4b5563', bg: '#f3f4f6' };

                  return (
                    <TableRow key={app.id}>
                      <TableCell>#{app.id}</TableCell>
                      <TableCell>
                        <strong>{app.customerName || `Khách hàng #${app.customerId}`}</strong>
                      </TableCell>
                      <TableCell>{app.reason}</TableCell>
                      <TableCell>{dateStr}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: statusInfo.color,
                            bgcolor: statusInfo.bg,
                            border: `1px solid ${statusInfo.color}20`
                          }}
                        >
                          {statusInfo.label}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {app.status === 'PENDING' ? (
                          <TextField
                            size="small"
                            placeholder="Nhập link Google Meet/Zoom..."
                            value={meetingLinks[app.id] || ""}
                            onChange={(e) =>
                              setMeetingLinks({
                                ...meetingLinks,
                                [app.id]: e.target.value,
                              })
                            }
                            sx={{ minWidth: 200 }}
                          />
                        ) : app.meetingLink ? (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <a
                              href={app.meetingLink.startsWith('http') ? app.meetingLink : `https://${app.meetingLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold", fontSize: "0.85rem" }}
                            >
                              🎥 Tham gia
                            </a>
                            <span style={{ fontSize: "0.75rem", color: "#6b7280", wordBreak: "break-all" }}>
                              {app.meetingLink}
                            </span>
                          </Box>
                        ) : (
                          <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Không có link</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {app.status === 'PENDING' ? (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 1.5 }}
                              onClick={() => handleUpdateAppointmentStatus(app.id, 'APPROVED')}
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 1.5 }}
                              onClick={() => handleUpdateAppointmentStatus(app.id, 'CANCELLED')}
                            >
                              Từ Chối
                            </Button>
                          </Box>
                        ) : (
                          <span style={{ color: "#9ca3af" }}>-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {appointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography sx={{ py: 3, color: "text.secondary" }}>
                        Không có lịch hẹn nào được đăng ký với bạn.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
