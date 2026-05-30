import React, { useState, useEffect } from "react";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { insuranceService } from "@/services/insuranceService";
import type { InsurancePackage } from "@/services/insuranceService";
import { useAuthStore } from "@/services/authStore";

export const CustomerActions: React.FC<{ onActionComplete: () => void }> = ({ onActionComplete }) => {
  const { user } = useAuthStore();
  const [openPolicy, setOpenPolicy] = useState(false);
  const [openIncident, setOpenIncident] = useState(false);
  const [packages, setPackages] = useState<InsurancePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<number | "">("");
  const [incidentDesc, setIncidentDesc] = useState("");

  useEffect(() => {
    insuranceService.getAllPackages().then(setPackages);
  }, []);

  const handleBuyPolicy = async () => {
    if (user && selectedPackage) {
      await insuranceService.createPolicy({
        customerId: user.id,
        packageId: Number(selectedPackage)
      });
      setOpenPolicy(false);
      onActionComplete();
    }
  };

  const handleReportIncident = async () => {
    if (user && incidentDesc) {
      await insuranceService.createIncident({
        customerId: user.id,
        description: incidentDesc
      });
      setOpenIncident(false);
      setIncidentDesc("");
      onActionComplete();
    }
  };

  return (
    <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
      <Button variant="contained" onClick={() => setOpenPolicy(true)}>Buy Insurance Policy</Button>
      <Button variant="outlined" color="error" onClick={() => setOpenIncident(true)}>Report Incident</Button>

      {/* Buy Policy Dialog */}
      <Dialog open={openPolicy} onClose={() => setOpenPolicy(false)}>
        <DialogTitle>Buy Insurance</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <FormControl fullWidth>
            <InputLabel>Select Package</InputLabel>
            <Select value={selectedPackage} onChange={e => setSelectedPackage(e.target.value as number)}>
              {packages.map(p => <MenuItem key={p.id} value={p.id}>{p.name} - ${p.price}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPolicy(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBuyPolicy} disabled={!selectedPackage}>Buy</Button>
        </DialogActions>
      </Dialog>

      {/* Report Incident Dialog */}
      <Dialog open={openIncident} onClose={() => setOpenIncident(false)}>
        <DialogTitle>Report an Incident</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <TextField 
            fullWidth label="Description" multiline rows={4} 
            value={incidentDesc} onChange={e => setIncidentDesc(e.target.value)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIncident(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReportIncident} disabled={!incidentDesc}>Submit Report</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
