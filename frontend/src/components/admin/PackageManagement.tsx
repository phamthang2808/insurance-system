import React, { useEffect, useState } from "react";
import { insuranceService } from "@/services/insuranceService";
import type { InsurancePackage } from "@/services/insuranceService";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

// Modern SVG Icons for a premium look
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18, marginRight: 6 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.72 0L9 9m5 4v6m4-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 20, height: 20, marginRight: 8, color: "#0284c7" }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

// Currency formatter for VND
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Sub-component for Collapsible Table Row
interface RowProps {
  row: InsurancePackage;
  onEdit: (pkg: InsurancePackage) => void;
  onDelete: (id: number) => void;
}

const CollapsibleRow: React.FC<RowProps> = ({ row, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  // Parse process steps
  const steps = row.processSteps
    ? row.processSteps.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }} hover>
        <TableCell width="50">
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)} sx={{ color: "#4f46e5" }}>
            {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}>
          {row.name}
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: "#0f766e" }}>{formatPrice(row.price)}</TableCell>
        <TableCell>
          <Chip
            label={row.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngưng"}
            color={row.status === "ACTIVE" ? "success" : "default"}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              borderRadius: "6px",
              px: 0.5,
              backgroundColor: row.status === "ACTIVE" ? "#d1fae5" : "#f1f5f9",
              color: row.status === "ACTIVE" ? "#065f46" : "#64748b",
            }}
          />
        </TableCell>
        <TableCell align="right">
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onEdit(row)}
              startIcon={<EditIcon />}
              sx={{
                textTransform: "none",
                borderColor: "#cbd5e1",
                color: "#475569",
                "&:hover": {
                  borderColor: "#3b82f6",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                },
                fontSize: "0.8rem",
                py: 0.5,
                px: 1.5,
              }}
            >
              Sửa
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => onDelete(row.id)}
              startIcon={<DeleteIcon />}
              sx={{
                textTransform: "none",
                borderColor: "#fee2e2",
                color: "#ef4444",
                "&:hover": {
                  borderColor: "#ef4444",
                  backgroundColor: "#fef2f2",
                },
                fontSize: "0.8rem",
                py: 0.5,
                px: 1.5,
              }}
            >
              Xóa
            </Button>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, padding: 2, backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                {/* Left part: Details */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", mb: 1, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                    📝 Mô tả chi tiết
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#334155", mb: 2, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {row.description || "Chưa có mô tả chi tiết cho gói bảo hiểm này."}
                  </Typography>

                  <Divider sx={{ my: 2, borderColor: "#e2e8f0" }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", mb: 1, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                    📜 Điều khoản & Điều kiện
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {row.terms || "Chưa cấu hình điều khoản và điều kiện."}
                  </Typography>
                </Box>

                {/* Right part: Steps Stepper */}
                <Box sx={{ width: { xs: "100%", md: "300px" }, borderLeft: { md: "1px solid #e2e8f0" }, pl: { md: 3 } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", mb: 2, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                    🔄 Quy trình duyệt hồ sơ
                  </Typography>
                  {steps.length > 0 ? (
                    <Stepper
                      orientation="vertical"
                      activeStep={-1}
                      sx={{
                        mt: 1,
                        "& .MuiStepIcon-root": { color: "#6366f1" },
                        "& .MuiStepIcon-text": { fill: "#ffffff" },
                      }}
                    >
                      {steps.map((step: string, index: number) => (
                        <Step key={index} completed={false}>
                          <StepLabel>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                              {step}
                            </Typography>
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1, p: 1.5, backgroundColor: "#fff", borderRadius: "6px", border: "1px dashed #cbd5e1" }}>
                      <InfoIcon />
                      <Typography variant="body2" sx={{ color: "#64748b", fontStyle: "italic" }}>
                        Chưa thiết lập quy trình duyệt hồ sơ.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const PackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<InsurancePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<Partial<InsurancePackage>>({
    name: "",
    description: "",
    terms: "",
    price: 0,
    status: "ACTIVE",
    processSteps: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await insuranceService.getAllPackages();
      setPackages(data);
    } catch (e) {
      console.error(e);
      setMessageType("error");
      setMessage("Không thể tải danh sách gói bảo hiểm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleSave = async () => {
    if (!currentPackage.name || !currentPackage.price) {
      setMessageType("error");
      setMessage("Vui lòng nhập đầy đủ Tên gói và Giá gói.");
      return;
    }

    try {
      if (currentPackage.id) {
        await insuranceService.updatePackage(currentPackage.id, currentPackage);
        setMessageType("success");
        setMessage("Cập nhật gói bảo hiểm thành công!");
      } else {
        await insuranceService.createPackage(currentPackage);
        setMessageType("success");
        setMessage("Tạo mới gói bảo hiểm thành công!");
      }
      setOpen(false);
      loadPackages();
    } catch (e: any) {
      console.error(e);
      setMessageType("error");
      setMessage("Có lỗi xảy ra khi lưu thông tin gói bảo hiểm.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa gói bảo hiểm này không? Hành động này không thể hoàn tác.")) {
      try {
        await insuranceService.deletePackage(id);
        setMessageType("success");
        setMessage("Xóa gói bảo hiểm thành công!");
        loadPackages();
      } catch (e) {
        console.error(e);
        setMessageType("error");
        setMessage("Không thể xóa gói bảo hiểm này (có thể do đang có khách hàng sử dụng).");
      }
    }
  };

  const handleOpenCreate = () => {
    setCurrentPackage({
      name: "",
      description: "",
      terms: "",
      price: 0,
      status: "ACTIVE",
      processSteps: "Nộp hồ sơ, Thẩm định, Ký hợp đồng, Kích hoạt", // default suggestion
    });
    setOpen(true);
  };

  const handleOpenEdit = (pkg: InsurancePackage) => {
    setCurrentPackage({
      ...pkg,
    });
    setOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
          📦 Danh sách Gói Bảo hiểm
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenCreate}
          startIcon={<PlusIcon />}
          sx={{
            textTransform: "none",
            backgroundColor: "#4f46e5",
            fontWeight: 600,
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(79 70 229 / 0.1), 0 2px 4px -2px rgb(79 70 229 / 0.1)",
            "&:hover": {
              backgroundColor: "#4338ca",
              boxShadow: "0 10px 15px -3px rgb(79 70 229 / 0.2), 0 4px 6px -4px rgb(79 70 229 / 0.2)",
            },
            px: 2,
            py: 1,
          }}
        >
          Thêm Gói Bảo hiểm Mới
        </Button>
      </Box>

      {message && (
        <Alert severity={messageType} onClose={() => setMessage("")} sx={{ mb: 3, borderRadius: "8px" }}>
          {message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#4f46e5" }} />
        </Box>
      ) : packages.length === 0 ? (
        <Paper sx={{ textAlign: "center", p: 6, borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <Typography variant="h6" sx={{ color: "#64748b", mb: 1, fontWeight: 600 }}>
            Không tìm thấy gói bảo hiểm nào
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            Bắt đầu bằng cách tạo gói bảo hiểm đầu tiên của bạn trong hệ thống.
          </Typography>
          <Button variant="outlined" onClick={handleOpenCreate} startIcon={<PlusIcon />} sx={{ textTransform: "none", borderRadius: "8px", borderColor: "#6366f1", color: "#6366f1" }}>
            Tạo gói bảo hiểm
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}>
          <Table aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
              <TableRow>
                <TableCell width="50" />
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Tên gói</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Giá gói</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "#475569", pr: 3 }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.map((pkg) => (
                <CollapsibleRow key={pkg.id} row={pkg} onEdit={handleOpenEdit} onDelete={handleDelete} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for Create/Edit */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: "12px", p: 1 } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1e293b", pb: 2 }}>
          {currentPackage.id ? "✏️ Chỉnh sửa Gói Bảo hiểm" : "➕ Thêm Gói Bảo hiểm Mới"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 3, pb: 3 }}>
          <TextField
            sx={{ mt: 1 }}
            label="Tên gói bảo hiểm"
            fullWidth
            required
            placeholder="Ví dụ: Bảo hiểm sức khỏe gia đình"
            value={currentPackage.name || ""}
            onChange={(e) => setCurrentPackage({ ...currentPackage, name: e.target.value })}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Giá tiền (VNĐ)"
                type="number"
                fullWidth
                required
                placeholder="Ví dụ: 1500000"
                value={currentPackage.price || ""}
                onChange={(e) => setCurrentPackage({ ...currentPackage, price: parseFloat(e.target.value) || 0 })}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-select-label"
                  label="Trạng thái"
                  value={currentPackage.status || "ACTIVE"}
                  onChange={(e) => setCurrentPackage({ ...currentPackage, status: e.target.value })}
                >
                  <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Tạm ngưng</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TextField
            label="Mô tả gói bảo hiểm"
            fullWidth
            multiline
            rows={4}
            placeholder="Mô tả quyền lợi, ưu đãi và đối tượng tham gia bảo hiểm..."
            value={currentPackage.description || ""}
            onChange={(e) => setCurrentPackage({ ...currentPackage, description: e.target.value })}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <TextField
            label="Điều khoản & Điều kiện"
            fullWidth
            multiline
            rows={4}
            placeholder="Quy định ràng buộc, loại trừ trách nhiệm, độ tuổi tham gia..."
            value={currentPackage.terms || ""}
            onChange={(e) => setCurrentPackage({ ...currentPackage, terms: e.target.value })}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <TextField
            label="Quy trình duyệt hồ sơ"
            fullWidth
            placeholder="Nhập các bước, phân cách bằng dấu phẩy"
            helperText="Ví dụ: Nộp hồ sơ, Thẩm định, Ký hợp đồng, Kích hoạt"
            value={currentPackage.processSteps || ""}
            onChange={(e) => setCurrentPackage({ ...currentPackage, processSteps: e.target.value })}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none", color: "#64748b", fontWeight: 600 }}>
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              textTransform: "none",
              backgroundColor: "#4f46e5",
              fontWeight: 600,
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#4338ca" },
              px: 3,
            }}
          >
            Lưu gói
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
