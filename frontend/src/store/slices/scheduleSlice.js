import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  schedules: [],
  currentSchedule: null,
  availableSlots: [],
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSchedules = createAsyncThunk(
  'schedule/fetchSchedules',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/schedules', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedules');
    }
  }
);

export const fetchSchedule = createAsyncThunk(
  'schedule/fetchSchedule',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/${id}`);
      return response.data.data.schedule;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedule');
    }
  }
);

export const createSchedule = createAsyncThunk(
  'schedule/createSchedule',
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/schedules', scheduleData);
      return response.data.data.schedule;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create schedule');
    }
  }
);

export const updateSchedule = createAsyncThunk(
  'schedule/updateSchedule',
  async ({ id, scheduleData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/schedules/${id}`, scheduleData);
      return response.data.data.schedule;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update schedule');
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedule/deleteSchedule',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/schedules/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete schedule');
    }
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  'schedule/fetchAvailableSlots',
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/available/${doctorId}`, {
        params: { date }
      });
      return response.data.data.availableSlots;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available slots');
    }
  }
);

// Schedule slice
const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearCurrentSchedule: (state) => {
      state.currentSchedule = null;
    },
    clearAvailableSlots: (state) => {
      state.availableSlots = [];
    },
    updateScheduleInList: (state, action) => {
      const index = state.schedules.findIndex(schedule => schedule._id === action.payload._id);
      if (index !== -1) {
        state.schedules[index] = action.payload;
      }
    },
    removeScheduleFromList: (state, action) => {
      state.schedules = state.schedules.filter(schedule => schedule._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules = action.payload.schedules;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Single Schedule
      .addCase(fetchSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSchedule = action.payload;
        state.error = null;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Schedule
      .addCase(createSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules.unshift(action.payload);
        state.error = null;
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Schedule
      .addCase(updateSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.schedules.findIndex(schedule => schedule._id === action.payload._id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
        if (state.currentSchedule?._id === action.payload._id) {
          state.currentSchedule = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Schedule
      .addCase(deleteSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules = state.schedules.filter(schedule => schedule._id !== action.payload);
        if (state.currentSchedule?._id === action.payload) {
          state.currentSchedule = null;
        }
        state.error = null;
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Available Slots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableSlots = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setLoading,
  clearCurrentSchedule,
  clearAvailableSlots,
  updateScheduleInList,
  removeScheduleFromList,
} = scheduleSlice.actions;

// Selectors
export const selectSchedule = (state) => state.schedule;
export const selectSchedules = (state) => state.schedule.schedules;
export const selectCurrentSchedule = (state) => state.schedule.currentSchedule;
export const selectAvailableSlots = (state) => state.schedule.availableSlots;
export const selectSchedulePagination = (state) => state.schedule.pagination;
export const selectScheduleLoading = (state) => state.schedule.isLoading;
export const selectScheduleError = (state) => state.schedule.error;

export default scheduleSlice.reducer;
