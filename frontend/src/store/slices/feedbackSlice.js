import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  feedback: [],
  currentFeedback: null,
  statistics: null,
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
export const fetchFeedback = createAsyncThunk(
  'feedback/fetchFeedback',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/feedback', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feedback');
    }
  }
);

export const fetchSingleFeedback = createAsyncThunk(
  'feedback/fetchSingleFeedback',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/feedback/${id}`);
      return response.data.data.feedback;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feedback');
    }
  }
);

export const updateFeedbackStatus = createAsyncThunk(
  'feedback/updateFeedbackStatus',
  async ({ id, status, adminMessage }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/feedback/${id}/status`, { status, adminMessage });
      return response.data.data.feedback;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update feedback status');
    }
  }
);

export const updateFeedbackVisibility = createAsyncThunk(
  'feedback/updateFeedbackVisibility',
  async ({ id, isPublic }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/feedback/${id}/visibility`, { isPublic });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update feedback visibility');
    }
  }
);

export const fetchDoctorFeedbackStats = createAsyncThunk(
  'feedback/fetchDoctorFeedbackStats',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/feedback/doctor/${doctorId}/stats`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor feedback stats');
    }
  }
);

export const deleteFeedback = createAsyncThunk(
  'feedback/deleteFeedback',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/feedback/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete feedback');
    }
  }
);

// Feedback slice
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearCurrentFeedback: (state) => {
      state.currentFeedback = null;
    },
    updateFeedbackInList: (state, action) => {
      const index = state.feedback.findIndex(fb => fb._id === action.payload._id);
      if (index !== -1) {
        state.feedback[index] = action.payload;
      }
    },
    removeFeedbackFromList: (state, action) => {
      state.feedback = state.feedback.filter(fb => fb._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Feedback
      .addCase(fetchFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedback = action.payload.feedback;
        state.statistics = action.payload.statistics;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Single Feedback
      .addCase(fetchSingleFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSingleFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFeedback = action.payload;
        state.error = null;
      })
      .addCase(fetchSingleFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Feedback Status
      .addCase(updateFeedbackStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFeedbackStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.feedback.findIndex(fb => fb._id === action.payload._id);
        if (index !== -1) {
          state.feedback[index] = action.payload;
        }
        if (state.currentFeedback?._id === action.payload._id) {
          state.currentFeedback = action.payload;
        }
        state.error = null;
      })
      .addCase(updateFeedbackStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Feedback Visibility
      .addCase(updateFeedbackVisibility.fulfilled, (state, action) => {
        const index = state.feedback.findIndex(fb => fb._id === action.payload.feedbackId);
        if (index !== -1) {
          state.feedback[index].isPublic = action.payload.isPublic;
        }
      })

      // Delete Feedback
      .addCase(deleteFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedback = state.feedback.filter(fb => fb._id !== action.payload);
        if (state.currentFeedback?._id === action.payload) {
          state.currentFeedback = null;
        }
        state.error = null;
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setLoading,
  clearCurrentFeedback,
  updateFeedbackInList,
  removeFeedbackFromList,
} = feedbackSlice.actions;

// Selectors
export const selectFeedback = (state) => state.feedback;
export const selectFeedbackList = (state) => state.feedback.feedback;
export const selectCurrentFeedback = (state) => state.feedback.currentFeedback;
export const selectFeedbackStatistics = (state) => state.feedback.statistics;
export const selectFeedbackPagination = (state) => state.feedback.pagination;
export const selectFeedbackLoading = (state) => state.feedback.isLoading;
export const selectFeedbackError = (state) => state.feedback.error;

export default feedbackSlice.reducer;
