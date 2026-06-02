import { useAuthStore } from "@/services/authStore";
import type { InsurancePackage } from "@/services/insuranceService";
import { insuranceService } from "@/services/insuranceService";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import React, { useEffect, useState } from "react";

export const CustomerActions: React.FC<{ onActionComplete: () => void }> = ({
  onActionComplete,
}) => {
  const { user } = useAuthStore();
  const [openPolicy, setOpenPolicy] = useState(false);
  const [openIncident, setOpenIncident] = useState(false);
  const [packages, setPackages] = useState<InsurancePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<number | "">("");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    insuranceService.getAllPackages().then(setPackages);
  }, []);

  const handleBuyPolicy = async () => {
    if (user && selectedPackage) {
      try {
        setErrorMsg("");
        await insuranceService.createPolicy({
          customerId: user.id,
          packageId: Number(selectedPackage),
        });
        setOpenPolicy(false);
        onActionComplete();
      } catch (e: any) {
        setErrorMsg(e.response?.data?.message || e.response?.data || "Có lỗi xảy ra, vui lòng thử lại!");
      }
    }
  };

  const handleReportIncident = async () => {
    if (user && incidentDesc) {
      await insuranceService.createIncident({
        customerId: user.id,
        description: incidentDesc,
      });
      setOpenIncident(false);
      setIncidentDesc("");
      onActionComplete();
    }
  };

  return (
    <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
      <Button variant="contained" onClick={() => { setOpenPolicy(true); setErrorMsg(""); setSelectedPackage(""); }}>
        Mua Bảo Hiểm
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={() => setOpenIncident(true)}
      >
        Báo Cáo Sự Cố
      </Button>

      {/* Buy Policy Dialog */}
      <Dialog
        open={openPolicy}
        onClose={() => setOpenPolicy(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mua Bảo Hiểm</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
          <Typography sx={{ mb: 2 }}>Chọn gói bảo hiểm:</Typography>
          {packages.length === 0 ? (
            <Typography color="text.secondary">
              Không có gói bảo hiểm nào
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {packages.map((p) => (
                <Box
                  key={p.id}
                  onClick={() => setSelectedPackage(p.id)}
                  sx={{
                    p: 2,
                    border:
                      selectedPackage === p.id
                        ? "2px solid #3b82f6"
                        : "1px solid #e5e7eb",
                    borderRadius: 1,
                    cursor: "pointer",
                    backgroundColor:
                      selectedPackage === p.id ? "#eff6ff" : "white",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#3b82f6",
                      backgroundColor: "#f0f9ff",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {p.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {p.description}
                      </Typography>
                      {p.terms && (
                        <Typography
                          variant="caption"
                          sx={{ mt: 1, display: "block", color: "#666" }}
                        >
                          <b>Điều khoản:</b> {p.terms}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#3b82f6", ml: 2 }}
                    >
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                    </Typography>
                  </Box>
                  {p.status && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 1, display: "block" }}
                    >
                      Trạng thái: <b>{p.status}</b>
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPolicy(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleBuyPolicy}
            disabled={!selectedPackage}
          >
            Mua Ngay
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Incident Dialog */}
      <Dialog open={openIncident} onClose={() => setOpenIncident(false)}>
        <DialogTitle>Báo Cáo Sự Cố</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <TextField
            fullWidth
            label="Mô Tả"
            multiline
            rows={4}
            value={incidentDesc}
            onChange={(e) => setIncidentDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIncident(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReportIncident}
            disabled={!incidentDesc}
          >
            Gửi Báo Cáo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
