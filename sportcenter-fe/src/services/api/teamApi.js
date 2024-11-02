import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = '/api/team';

const teamApi = {
  // Create a new team
  create: async (teamData) => {
    try {
      const response = await axios.post(`${API_URL}/create`, teamData);
      toast.success("Team created successfully!");
      return response.data;
    } catch (error) {
      console.error("Failed to create team:", error);
      toast.error("Failed to create team. Please try again.");
      throw error;
    }
  },

  // Get a team by ID
  getById: async (teamId) => {
    try {
      const response = await axios.get(`${API_URL}/getById/${teamId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch team:", error);
      toast.error("Failed to fetch team. Please try again.");
      throw error;
    }
  },

  // Update a team by ID
  update: async (teamId, teamData) => {
    try {
      const response = await axios.put(`${API_URL}/update/${teamId}`, teamData);
      toast.success("Team updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Failed to update team:", error);
      toast.error("Failed to update team. Please try again.");
      throw error;
    }
  },

  // Soft delete a team by ID
  softDelete: async (teamId) => {
    try {
      const response = await axios.patch(`${API_URL}/softDelete/${teamId}`);
      toast.success("Team deleted successfully!");
      return response.data;
    } catch (error) {
      console.error("Failed to delete team:", error);
      toast.error("Failed to delete team. Please try again.");
      throw error;
    }
  },

  // Get all teams
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/getAll`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      toast.error("Failed to fetch teams. Please try again.");
      throw error;
    }
  },

  // Restore a team by ID
  restore: async (teamId) => {
    try {
      const response = await axios.patch(`${API_URL}/restore/${teamId}`);
      toast.success("Team restored successfully!");
      return response.data;
    } catch (error) {
      console.error("Failed to restore team:", error);
      toast.error("Failed to restore team. Please try again.");
      throw error;
    }
  },
  create(teamRequest) {
        const url = '/team/create';
        return axiosClient.post(url, teamRequest);
    },
    softDelete(teamId) {
        const url = `/team/softDelete/${teamId}`;
        return axiosClient.patch(url);
    },
    forceDelete(teamId) {
        const url = `/team/forceDelete/${teamId}`;
        return axiosClient.delete(url);
    },
};

export default teamApi;
