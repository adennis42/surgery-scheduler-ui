import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box
} from '@mui/material';
import { createSurgery, updateSurgery, type Surgery } from '../services/api';
import toast from 'react-hot-toast';

interface SurgeryDialogProps {
  open: boolean;
  onClose: () => void;
  editingSurgery: Surgery | null;
  onSave: () => void;
}

const SurgeryDialog = ({ open, onClose, editingSurgery, onSave }: SurgeryDialogProps) => {
  const [formData, setFormData] = useState({
    date_time: '',
    surgery_type: '',
    surgeon_name: '',
    patient_name: '',
    patient_birthdate: '',
  });

  useEffect(() => {
    if (editingSurgery) {
      setFormData({
        date_time: new Date(editingSurgery.date_time).toISOString().slice(0, 16),
        surgery_type: editingSurgery.surgery_type,
        surgeon_name: editingSurgery.surgeon_name,
        patient_name: editingSurgery.patient_name,
        patient_birthdate: new Date(editingSurgery.patient_birthdate).toISOString().slice(0, 10),
      });
    } else {
      setFormData({
        date_time: '',
        surgery_type: '',
        surgeon_name: '',
        patient_name: '',
        patient_birthdate: '',
      });
    }
  }, [editingSurgery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editingSurgery) {
        await updateSurgery(editingSurgery._id, formData);
      } else {
        await createSurgery(formData);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save surgery:', error);
      toast.error('Failed to save surgery');
    } finally {
      if (editingSurgery) {
        toast.success('Surgery updated successfully');
      } else {
        toast.success('Surgery scheduled successfully');
      }
      setFormData({
        date_time: '',
        surgery_type: '',
        surgeon_name: '',
        patient_name: '',
        patient_birthdate: '',
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editingSurgery ? 'Edit Surgery' : 'Schedule New Surgery'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            name="patient_name"
            label="Patient Name"
            value={formData.patient_name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="surgeon_name"
            label="Surgeon Name"
            value={formData.surgeon_name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="surgery_type"
            label="Surgery Type"
            value={formData.surgery_type}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="date_time"
            label="Date and Time"
            type="datetime-local"
            value={formData.date_time}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="patient_birthdate"
            label="Patient Birthdate"
            type="date"
            value={formData.patient_birthdate}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {editingSurgery ? 'Update' : 'Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurgeryDialog;
