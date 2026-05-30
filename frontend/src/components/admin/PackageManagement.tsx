import React, { useEffect, useState } from "react";
import { insuranceService } from "@/services/insuranceService";
import type { InsurancePackage } from "@/services/insuranceService";
import {
  Box, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert
} from "@mui/material";

export const PackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<InsurancePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<Partial<InsurancePackage>>({
    name: "", description: "", terms: "", price: 0, status: "ACTIVE"
  });
  const [message, setMessage] = useState("");

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await insuranceService.getAllPackages();
      setPackages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleSave = async () => {
    try {
      if (currentPackage.id) {
        await insuranceService.updatePackage(currentPackage.id, currentPackage);
      } else {
        await insuranceService.createPackage(currentPackage);
      }
      setOpen(false);
      setMessage("Saved successfully!");
      loadPackages();
    } catch (e: any) {
      setMessage("Error saving package");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure?")) {
      await insuranceService.deletePackage(id);
      loadPackages();
    }
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => { setCurrentPackage({}); setOpen(true); }} sx={{ mb: 2 }}>
        ➕ Create New Package
      </Button>
      {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
      
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.map(pkg => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.name}</TableCell>
                  <TableCell>{pkg.price}</TableCell>
                  <TableCell>{pkg.status}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => { setCurrentPackage(pkg); setOpen(true); }}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(pkg.id)}>Del</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{currentPackage.id ? "Edit Package" : "New Package"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField label="Name" value={currentPackage.name || ""} onChange={e => setCurrentPackage({...currentPackage, name: e.target.value})} />
          <TextField label="Description" value={currentPackage.description || ""} onChange={e => setCurrentPackage({...currentPackage, description: e.target.value})} multiline rows={3} />
          <TextField label="Terms" value={currentPackage.terms || ""} onChange={e => setCurrentPackage({...currentPackage, terms: e.target.value})} multiline rows={3} />
          <TextField label="Process Steps (comma separated)" placeholder="RECEIVING,APPRAISING,SIGNING,ACTIVE" value={currentPackage.processSteps || ""} onChange={e => setCurrentPackage({...currentPackage, processSteps: e.target.value})} />
          <TextField label="Price" type="number" value={currentPackage.price || 0} onChange={e => setCurrentPackage({...currentPackage, price: parseFloat(e.target.value)})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
