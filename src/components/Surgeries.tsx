import { useState, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  alpha,
  useTheme,
  Fade,
  Skeleton,
  TextField,
  InputAdornment
} from "@mui/material";
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  LocalHospital as SurgeryIcon,
  ViewWeek as WeekIcon,
  ViewDay as DayIcon,
  ViewAgenda as AgendaIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from "@mui/icons-material";

import ConfirmationDialog from "./ConfirmationDialog";
import SurgeryDialog from "./SurgeryDialog";
import moment from "moment";

// Custom hooks imports
import { useSurgeries } from "../hooks/useSurgeries";
import { useDebounce } from "../hooks/useDebounce";
import { useToggle } from "../hooks/useToggle";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useWindowSize } from "../hooks/useWindowSize";
import type { Surgery } from "../types/surgery";

const localizer = momentLocalizer(moment);

const calendarStyles = {
  '& .rbc-calendar': {
    backgroundColor: 'transparent',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    color: (theme: any) => theme.palette.text.primary,
  },
  '& .rbc-header': {
    backgroundColor: (theme: any) => theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.15)
      : alpha(theme.palette.primary.main, 0.1),
    borderBottom: (theme: any) => `2px solid ${theme.palette.primary.main}`,
    padding: '16px 8px',
    fontWeight: 600,
    color: (theme: any) => theme.palette.primary.main,
    fontSize: '0.875rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  '& .rbc-today': {
    backgroundColor: (theme: any) => theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.1)
      : alpha(theme.palette.primary.main, 0.05),
    '&:hover': {
      backgroundColor: (theme: any) => theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.main, 0.15)
        : alpha(theme.palette.primary.main, 0.1),
    }
  },
  '& .rbc-day-bg': {
    borderColor: (theme: any) => theme.palette.mode === 'dark'
      ? alpha(theme.palette.divider, 0.12)
      : theme.palette.divider,
  },
  '& .rbc-month-row': {
    borderColor: (theme: any) => theme.palette.mode === 'dark'
      ? alpha(theme.palette.divider, 0.12)
      : theme.palette.divider,
  },
  '& .rbc-event': {
    backgroundColor: (theme: any) => theme.palette.primary.main,
    borderRadius: '8px',
    border: 'none',
    padding: '4px 8px',
    fontSize: '0.75rem',
    fontWeight: 500,
    boxShadow: (theme: any) => theme.palette.mode === 'dark'
      ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`
      : `0 2px 4px ${alpha(theme.palette.primary.main, 0.3)}`,
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: (theme: any) => theme.palette.primary.dark,
      transform: 'translateY(-1px)',
      boxShadow: (theme: any) => theme.palette.mode === 'dark'
        ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.5)}`
        : `0 4px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
    }
  },
  '& .rbc-selected': {
    backgroundColor: (theme: any) => theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: (theme: any) => theme.palette.secondary.dark,
    }
  },
  '& .rbc-toolbar': {
    marginBottom: '24px',
    padding: '0',
  },
  '& .rbc-btn-group': {
    '& button': {
      backgroundColor: 'transparent',
      border: (theme: any) => theme.palette.mode === 'dark'
        ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}`
        : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
      borderRadius: '8px',
      padding: '8px 16px',
      margin: '0 2px',
      color: (theme: any) => theme.palette.primary.main,
      fontWeight: 500,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: (theme: any) => theme.palette.mode === 'dark'
          ? alpha(theme.palette.primary.main, 0.15)
          : alpha(theme.palette.primary.main, 0.1),
        borderColor: (theme: any) => theme.palette.primary.main,
      },
      '&.rbc-active': {
        backgroundColor: (theme: any) => theme.palette.primary.main,
        color: (theme: any) => theme.palette.primary.contrastText,
        borderColor: (theme: any) => theme.palette.primary.main,
      }
    }
  },
  '& .rbc-month-view, & .rbc-time-view': {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: (theme: any) => theme.palette.background.paper,
    boxShadow: (theme: any) => theme.palette.mode === 'dark'
      ? `0 4px 6px -1px ${alpha('#000000', 0.3)}, 0 2px 4px -1px ${alpha('#000000', 0.18)}`
      : theme.shadows[2],
  },
  '& .rbc-off-range-bg': {
    backgroundColor: (theme: any) => theme.palette.mode === 'dark'
      ? alpha(theme.palette.action.disabled, 0.04)
      : alpha(theme.palette.action.disabled, 0.02),
  }
};

const Surgeries = () => {
  const theme = useTheme();
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    surgeries,
    loading,
    refetch,
    operations: { delete: deleteSurgery },
    operationStates: { creating, updating }
  } = useSurgeries();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [openDialog, toggleOpenDialog] = useToggle(false);
  const [confirmDelete, toggleConfirmDelete] = useToggle(false);

  const [view, setView] = useLocalStorage<string>('calendar-view', 'month');
  const [date, setDate] = useLocalStorage<Date | null>('calendar-date', null);
  const [editingSurgery, setEditingSurgery] = useLocalStorage<Surgery | null>('editing-surgery', null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { width } = useWindowSize();
  const isMobile = width < 768;

  const filteredSurgeries = surgeries.filter(surgery => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      surgery.patient_name?.toLowerCase().includes(searchLower) ||
      surgery.surgery_type?.toLowerCase().includes(searchLower) ||
      surgery.surgeon_name?.toLowerCase().includes(searchLower) ||
      surgery.patient_age?.toString().includes(searchLower)
    );
  });

  // Transform surgeries to calendar events
  const events = filteredSurgeries.map((surgery, index) => {
    const startDate = new Date(surgery.date_time);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    return {
      id: surgery._id || `surgery-${index}`,
      title: `${surgery.surgery_type || 'Surgery'} - ${surgery.patient_name || 'Patient'} - Age ${surgery.patient_age || 'N/A'}`,
      start: startDate,
      end: startDate,
      allDay: false,
      resource: surgery,
    };
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteSurgery(id);
      setConfirmDeleteId(null);
      toggleConfirmDelete();
      await refetch();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleEditClick = (surgery: Surgery) => {
    setEditingSurgery(surgery);
    toggleOpenDialog()
  };

  const handleAddClick = () => {
    setEditingSurgery(null);
    toggleOpenDialog();
  };

  const handleDeleteClick = (e: React.MouseEvent, surgeryId: string) => {
    e.stopPropagation();
    setConfirmDeleteId(surgeryId);
    toggleConfirmDelete();
  };

  const MonthEvent = ({ event }: any) => (
    <div
      style={{
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        padding: '1px 3px',
        borderRadius: '3px',
        fontSize: isMobile ? '10px' : '11px',
        fontWeight: 500,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        height: '18px',
        lineHeight: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      <span style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
        marginRight: '2px'
      }}>
        {event.title}
      </span>
      <IconButton
        size="small"
        onClick={(e) => handleDeleteClick(e, event.id)}
        sx={{
          padding: '0',
          minWidth: '14px',
          width: '14px',
          height: '14px',
          color: 'white',
          opacity: 0.7,
          '&:hover': {
            opacity: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <CloseIcon sx={{ fontSize: '10px' }} />
      </IconButton>
    </div>
  );

  const CustomEvent = ({ event }: any) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        overflow: 'hidden',
        gap: 0.5,
        position: 'relative'
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        flex: 1,
        overflow: 'hidden'
      }}>
        <SurgeryIcon sx={{ fontSize: '12px', flexShrink: 0 }} />
        <Typography variant="caption" sx={{
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {event.title}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={(e) => handleDeleteClick(e, event.id)}
        sx={{
          padding: '2px',
          minWidth: '16px',
          width: '16px',
          height: '16px',
          color: 'white',
          opacity: 0.7,
          flexShrink: 0,
          '&:hover': {
            opacity: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <DeleteIcon sx={{ fontSize: '12px' }} />
      </IconButton>
    </Box>
  );

  const CustomToolbar = ({ label, onNavigate, onView, view }: any) => (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      flexWrap: 'wrap',
      gap: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => onNavigate('PREV')}
          sx={{
            minWidth: '40px',
            borderRadius: '10px',
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.4)
              : alpha(theme.palette.primary.main, 0.3),
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          ‹
        </Button>

        <Button
          variant="outlined"
          onClick={() => onNavigate('TODAY')}
          sx={{
            borderRadius: '10px',
            fontWeight: 500,
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.4)
              : alpha(theme.palette.primary.main, 0.3),
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          Today
        </Button>

        <Button
          variant="outlined"
          onClick={() => onNavigate('NEXT')}
          sx={{
            minWidth: '40px',
            borderRadius: '10px',
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.4)
              : alpha(theme.palette.primary.main, 0.3),
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          ›
        </Button>
      </Box>

      <Typography
        variant={isMobile ? "h6" : "h5"}
        sx={{
          fontWeight: 600,
          color: theme.palette.primary.main,
          textAlign: 'center',
          flex: 1
        }}
      >
        {label}
      </Typography>

      <Stack direction="row" spacing={1}>
        {[
          { key: 'month', label: 'Month', icon: <CalendarIcon /> },
          { key: 'week', label: 'Week', icon: <WeekIcon /> },
          { key: 'day', label: 'Day', icon: <DayIcon /> },
          { key: 'agenda', label: 'Agenda', icon: <AgendaIcon /> },
        ].map(({ key, label, icon }) => (
          <Tooltip key={key} title={label}>
            <Button
              variant={view === key ? "contained" : "outlined"}
              onClick={() => onView(key)}
              sx={{
                minWidth: isMobile ? '36px' : '44px',
                borderRadius: '10px',
                px: 1,
                borderColor: (theme) => theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.4)
                  : alpha(theme.palette.primary.main, 0.3),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: view === key
                    ? theme.palette.primary.dark
                    : (theme) => theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              {icon}
            </Button>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );

  const transformEventsForView = (events: any[], currentView: string) => {
    return events.map((event) => {
      if (currentView === 'month') {
        return {
          ...event,
          allDay: true,
          start: new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate()),
          end: new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate() + 1),
        };
      }
      return event;
    });
  };

  const renderLoadingState = () => (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      px: 3,
      py: 3,
      boxSizing: 'border-box',
      margin: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Card elevation={0} sx={{
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1400px'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Skeleton variant="text" width="30%" height={40} />
            </Box>
            <Skeleton variant="rectangular" height={600} sx={{ borderRadius: '12px' }} />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );

  const renderEmptyState = () => (
    <Fade in timeout={500}>
      <Box sx={{
        width: '100vw',
        minHeight: '100vh',
        px: 3,
        py: 3,
        boxSizing: 'border-box',
        margin: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Card elevation={0} sx={{
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
        }}>
          <CardContent sx={{ p: 6 }}>
            <SurgeryIcon
              sx={{
                fontSize: 80,
                color: (theme) => theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.4)
                  : alpha(theme.palette.primary.main, 0.3),
                mb: 2
              }}
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              {debouncedSearch ? 'No Matching Surgeries' : 'No Surgeries Scheduled'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '400px', mx: 'auto' }}>
              {debouncedSearch
                ? `No surgeries found matching "${debouncedSearch}". Try adjusting your search.`
                : 'Get started by scheduling your first surgery. You can manage all surgical procedures from this calendar view.'
              }
            </Typography>
            {!debouncedSearch && (
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                    : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`
                      : `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Schedule First Surgery
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );

  const renderCalendar = () => (
    <Fade in timeout={500}>
      <Box sx={{
        width: '100vw',
        minHeight: '100vh',
        px: isMobile ? 2 : 3,
        py: 3,
        boxSizing: 'border-box',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          width: '100%',
          maxWidth: '1400px',
          alignItems: 'center'
        }}>
          <Card elevation={0} sx={{
            border: (theme) => theme.palette.mode === 'dark'
              ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: '16px',
            backgroundColor: (theme) => theme.palette.background.paper,
            background: (theme) => theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.01)} 0%, ${alpha(theme.palette.secondary.main, 0.01)} 100%)`,
            width: '100%'
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      backgroundColor: (theme) => theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.15)
                        : alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    <SurgeryIcon sx={{
                      fontSize: isMobile ? 24 : 32,
                      color: theme.palette.primary.main
                    }} />
                  </Paper>
                  <Box>
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      mb: 0.5
                    }}>
                      Surgery Calendar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage and schedule surgical procedures
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box ref={searchRef}>
                    <TextField
                      size="small"
                      placeholder="Search surgeries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: '1.2rem' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        minWidth: isMobile ? '200px' : '250px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    />
                  </Box>

                  <Chip
                    icon={<CalendarIcon />}
                    label={`${filteredSurgeries.length} Surgeries`}
                    variant="outlined"
                    sx={{
                      borderColor: (theme) => theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.4)
                        : alpha(theme.palette.primary.main, 0.3),
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                    }}
                  />

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                    disabled={creating}
                    sx={{
                      borderRadius: '12px',
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                        : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: (theme) => theme.palette.mode === 'dark'
                          ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`
                          : `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    {creating ? 'Adding...' : 'Add Surgery'}
                  </Button>
                </Box>
              </Box>

              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}>
                <Paper
                  elevation={0}
                  sx={{
                    border: (theme) => theme.palette.mode === 'dark'
                      ? `1px solid ${alpha(theme.palette.divider, 0.2)}`
                      : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: (theme) => theme.palette.background.paper,
                    width: '100%',
                    ...calendarStyles
                  }}
                >
                  <Box sx={{ p: 2, width: '100%' }}>
                    <Calendar
                      localizer={localizer}
                      events={transformEventsForView(events, view)}
                      startAccessor="start"
                      endAccessor="end"
                      titleAccessor="title"
                      style={{
                        height: isMobile ? 500 : 600,
                        width: '100%',
                        minWidth: 0
                      }}
                      date={date}
                      onNavigate={(newDate) => setDate(newDate)}
                      view={view}
                      onView={(newView) => setView(newView)}
                      views={['month', 'week', 'day', 'agenda']}
                      defaultView="month"
                      onSelectEvent={(event: any) => {
                        const surgery = surgeries.find((s) => s._id === event.id);
                        if (surgery && !updating) {
                          handleEditClick(surgery);
                        }
                      }}
                      components={{
                        toolbar: CustomToolbar,
                        event: view === 'month' ? MonthEvent : CustomEvent,
                      }}
                      eventPropGetter={() => ({
                        style: {
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }
                      })}
                      popup={view === 'month'}
                      popupOffset={30}
                      showMultiDayTimes={view !== 'month'}
                      step={60}
                      timeslots={2}
                      key={`calendar-${view}-${events.length}-${debouncedSearch}`}
                    />
                  </Box>
                </Paper>
              </Box>
            </CardContent>
          </Card>

          <SurgeryDialog
            open={openDialog}
            onClose={async () => {
              toggleOpenDialog();
              setEditingSurgery(null);
              await refetch();
            }}
            editingSurgery={editingSurgery}
          />

          <ConfirmationDialog
            open={!!confirmDeleteId}
            onClose={() => setConfirmDeleteId(null)}
            onConfirm={() => handleDelete(confirmDeleteId!)}
            title="Confirm Deletion"
            message="Are you sure you want to cancel this surgery?"
          />
        </Box>
      </Box>
    </Fade>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (!loading && surgeries.length === 0) {
    return renderEmptyState();
  }

  return renderCalendar();
};

export default Surgeries;