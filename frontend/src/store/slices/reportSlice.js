import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  overview: null,
  appointmentReport: null,
  doctorReport: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchReportsOverview = createAsyncThunk(
  'report/fetchReportsOverview',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/overview', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports overview');
    }
  }
);

export const fetchAppointmentReport = createAsyncThunk(
  'report/fetchAppointmentReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/appointments', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment report');
    }
  }
);

export const fetchDoctorReport = createAsyncThunk(
  'report/fetchDoctorReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/doctors', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor report');
    }
  }
);

// Report slice
const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearReports: (state) => {
      state.overview = null;
      state.appointmentReport = null;
      state.doctorReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reports Overview
      .addCase(fetchReportsOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportsOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload;
        state.error = null;
      })
      .addCase(fetchReportsOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Appointment Report
      .addCase(fetchAppointmentReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointmentReport = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointmentReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Doctor Report
      .addCase(fetchDoctorReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctorReport = action.payload;
        state.error = null;
      })
      .addCase(fetchDoctorReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading, clearReports } = reportSlice.actions;

// Selectors
export const selectReport = (state) => state.report;
export const selectReportsOverview = (state) => state.report.overview;
export const selectAppointmentReport = (state) => state.report.appointmentReport;
export const selectDoctorReport = (state) => state.report.doctorReport;
export const selectReportLoading = (state) => state.report.isLoading;
export const selectReportError = (state) => state.report.error;

export default reportSlice.reducer;
