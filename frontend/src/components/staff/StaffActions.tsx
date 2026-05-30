import React, { useState, useEffect } from "react";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Tab, TextField, Typography } from "@mui/material";
import { insuranceService } from "@/services/insuranceService";
import type { IncidentReport, CustomerPolicy } from "@/services/insuranceService";
import { useAuthStore } from "@/services/authStore";
import { adminService } from "@/services/adminService";

export const StaffActions: React.FC<{ onActionComplete: () => void }> = ({ onActionComplete }) => {
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
      adminService.getAssignedCustomers(user.id).then(customers => {
        setAssignedCustomers(customers);
        const custIds = customers.map(c => c.id);
        import('@/services/apiClient').then(m => m.default.get('/policies')).then(res => {
          if (res.data?.data) {
            setPolicies(res.data.data.filter((p: any) => custIds.includes(p.customerId)));
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
      await insuranceService.createNote(user.id, Number(selectedCustomer), newNote);
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
      <Button variant="contained" onClick={() => setOpen(true)}>Manage Staff Workload</Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Staff Workspace</DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
            <Tab label="Policies" />
            <Tab label="Incidents" />
            <Tab label="Consultation Notes" />
          </Tabs>
        </Box>
        <DialogContent sx={{ pt: 2, minHeight: 400 }}>
          
          {tabValue === 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Process Step</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {policies.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>#{p.id}</TableCell>
                    <TableCell>{(p as any).customerName}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell><b>{p.processStep || 'RECEIVING'}</b></TableCell>
                    <TableCell>
                      {p.status !== 'ACTIVE' && (
                        <Button size="small" variant="outlined" onClick={() => handleAdvanceStep(p.id)}>
                          Advance Step
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
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incidents.map(i => (
                  <TableRow key={i.id}>
                    <TableCell>#{i.id}</TableCell>
                    <TableCell>{i.description}</TableCell>
                    <TableCell>{i.status}</TableCell>
                    <TableCell>
                      <Select 
                        size="small" 
                        value={i.status} 
                        onChange={e => handleUpdateStatus(i.id, e.target.value)}
                      >
                        <MenuItem value="PENDING">PENDING</MenuItem>
                        <MenuItem value="PROCESSING">PROCESSING</MenuItem>
                        <MenuItem value="RESOLVED">RESOLVED</MenuItem>
                        <MenuItem value="REJECTED">REJECTED</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Select
                  size="small"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value as number)}
                  displayEmpty
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="" disabled>Select Customer</MenuItem>
                  {assignedCustomers.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.fullName}</MenuItem>
                  ))}
                </Select>
                <TextField 
                  size="small" fullWidth placeholder="Enter consultation note..." 
                  value={newNote} onChange={e => setNewNote(e.target.value)}
                />
                <Button variant="contained" onClick={handleCreateNote} disabled={!selectedCustomer || !newNote}>Add</Button>
              </Box>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notes?.map((n: any) => (
                    <TableRow key={n.id}>
                      <TableCell>{new Date(n.notedAt).toLocaleString()}</TableCell>
                      <TableCell>{n.customerName}</TableCell>
                      <TableCell>{n.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
