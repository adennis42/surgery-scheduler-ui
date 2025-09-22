import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  Divider,
  alpha,
  useTheme,
  Slide,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalHospital as SurgeryIcon,
  Person as PatientIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import type { Surgery } from '../types/surgery';
import { useSurgeries } from '../hooks/useSurgeries';

interface SurgeryDialogProps {
  open: boolean;
  onClose: () => void;
  editingSurgery: Surgery | null;
}

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SurgeryDialog = ({ open, onClose, editingSurgery }: SurgeryDialogProps) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    date_time: '',
    surgery_type: '',
    surgeon_name: '',
    patient_name: '',
    patient_birthdate: '',
  });

  const [loading, setLoading] = useState(false);

  const {
    operations: { create: createSurgery, update: updateSurgery },
  } = useSurgeries();

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
  }, [editingSurgery, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingSurgery) {
        await updateSurgery(editingSurgery._id, formData)
        toast.success('Surgery updated successfully');
      } else {
        await createSurgery(formData);
        toast.success('Surgery scheduled successfully');
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save surgery:', error);
      toast.error('Failed to save surgery');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      date_time: '',
      surgery_type: '',
      surgeon_name: '',
      patient_name: '',
      patient_birthdate: '',
    });
    onClose();
  };

  const isFormValid = formData.patient_name && formData.surgeon_name && formData.surgery_type && formData.date_time && formData.patient_birthdate;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.palette.mode === 'dark'
            ? `0 24px 32px ${alpha('#000000', 0.8)}`
            : `0 24px 32px ${alpha(theme.palette.common.black, 0.2)}`,
          overflow: 'visible',
          position: 'relative',
        }
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.common.black, 0.8)
            : alpha(theme.palette.common.black, 0.6),
          backdropFilter: 'blur(8px)',
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{
        p: 0,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        borderRadius: '16px 16px 0 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          position: 'relative',
          zIndex: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                backdropFilter: 'blur(10px)'
              }}
            >
              <SurgeryIcon sx={{ fontSize: 28, color: 'white' }} />
            </Paper>
            <Box>
              <Typography variant="h5" sx={{
                fontWeight: 700,
                mb: 0.5
              }}>
                {editingSurgery ? 'Edit Surgery' : 'Schedule New Surgery'}
              </Typography>
              <Typography variant="body2" sx={{
                opacity: 0.9,
                fontSize: '0.875rem'
              }}>
                {editingSurgery ? 'Update surgery details' : 'Add a new surgical procedure to the calendar'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'white',
              backgroundColor: alpha(theme.palette.common.white, 0.2),
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.3),
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
            zIndex: 1
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -10,
            left: -10,
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.secondary.main, 0.15),
            zIndex: 1
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Patient Information Section */}
            <Grid item xs={12}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2
              }}>
                <PatientIcon sx={{
                  color: theme.palette.primary.main,
                  fontSize: 20
                }} />
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main
                }}>
                  Patient Information
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="patient_name"
                    label="Patient Name"
                    value={formData.patient_name}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="patient_birthdate"
                    label="Patient Birthdate"
                    type="date"
                    value={formData.patient_birthdate}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Surgery Details Section */}
            <Grid item xs={12}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2
              }}>
                <SurgeryIcon sx={{
                  color: theme.palette.primary.main,
                  fontSize: 20
                }} />
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main
                }}>
                  Surgery Details
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="surgery_type"
                    label="Surgery Type"
                    value={formData.surgery_type}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="surgeon_name"
                    label="Surgeon Name"
                    value={formData.surgeon_name}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Schedule Section */}
            <Grid item xs={12}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2
              }}>
                <ScheduleIcon sx={{
                  color: theme.palette.primary.main,
                  fontSize: 20
                }} />
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main
                }}>
                  Schedule
                </Typography>
              </Box>
              <TextField
                name="date_time"
                label="Date and Time"
                type="datetime-local"
                value={formData.date_time}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                      }
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.primary.main,
                    fontWeight: 500
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{
        p: 3,
        pt: 0,
        gap: 2,
        justifyContent: 'flex-end',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            px: 3,
            py: 1,
            fontWeight: 500,
            borderColor: alpha(theme.palette.text.primary, 0.3),
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.text.primary, 0.04),
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || loading}
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: theme.palette.mode === 'dark'
              ? `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`
              : `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              boxShadow: theme.palette.mode === 'dark'
                ? `0 12px 20px ${alpha(theme.palette.primary.main, 0.5)}`
                : `0 12px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              transform: 'translateY(-1px)',
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            },
            '&:disabled': {
              background: alpha(theme.palette.action.disabled, 0.12),
              color: alpha(theme.palette.action.disabled, 0.38),
              boxShadow: 'none',
              transform: 'none',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {loading ? 'Saving...' : (editingSurgery ? 'Update Surgery' : 'Schedule Surgery')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurgeryDialog;