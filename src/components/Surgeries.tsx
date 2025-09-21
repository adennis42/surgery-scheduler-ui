import { useState, useEffect } from "react";
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { Box, Button, Typography, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { getSurgeries, deleteSurgery, type Surgery } from "../services/api";
import SurgeryDialog from "./SurgeryDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import toast from "react-hot-toast";

const Surgeries = () => {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchSurgeries = async () => {
    try {
      const data = await getSurgeries();
      setSurgeries(data);
    } catch (error) {
      console.error("Failed to fetch surgeries:", error);
      toast.error("Failed to fetch surgeries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurgeries();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteSurgery(id);
      setConfirmDeleteId(null);
      fetchSurgeries(); // Refresh the list
      toast.success("Surgery deleted successfully");  
    } catch (error) {
      console.error("Failed to delete surgery:", error);
      toast.error("Failed to delete surgery");
    }
  };

  const handleEditClick = (surgery: Surgery) => {
    setEditingSurgery(surgery);
    setOpenDialog(true);
  };

  const handleAddClick = () => {
    setEditingSurgery(null);
    setOpenDialog(true);
  };

  const columns: GridColDef[] = [
    { field: "patient_name", headerName: "Patient", width: 150 },
    { field: "surgeon_name", headerName: "Surgeon", width: 150 },
    { field: "surgery_type", headerName: "Type", width: 150 },
    {
      field: "date_time",
      headerName: "Date & Time",
      width: 200,
      type: "dateTime",
      valueGetter: (params) => {
        console.log("ValueGetter params:", params);
        return params ? new Date(params) : null;
      },
      valueFormatter: (params) =>
        params ? new Date(params).toLocaleString() : "",
    },
    {
      field: "patient_birthdate",
      headerName: "Patient DOB",
      width: 150,
      type: "date",
      valueFormatter: (params) =>
        params ? new Date(params).toLocaleDateString() : "",
    },
    { field: "patient_age", headerName: "Age", type: "number", width: 80 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: (params) => {
        const surgery = params.row as Surgery;
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEditClick(surgery)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => setConfirmDeleteId(surgery._id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const rows = surgeries.map((s) => ({ ...s, id: s._id }));

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Surgery Schedule
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{ mb: 2 }}
        >
          Schedule New Surgery
        </Button>
      </Paper>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[5, 10, 25]}
        autoHeight
      />
      <SurgeryDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingSurgery(null);
        }}
        editingSurgery={editingSurgery}
        onSave={() => {
          fetchSurgeries();
          setOpenDialog(false);
          setEditingSurgery(null);
        }}
      />
      <ConfirmationDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId!)}
        title="Confirm Deletion"
        message="Are you sure you want to cancel this surgery?"
      />
    </Box>
  );
};

export default Surgeries;
