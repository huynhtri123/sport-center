import axios from 'axios';
import axiosClient from './axiosClient';
import { toast } from 'react-toastify';

const API_URL = '/api/team';

const teamApi = {
    // Create a new team
    create: async (teamData) => {
        try {
            const response = await axios.post(`${API_URL}/create`, teamData);
            toast.success('Team created successfully!');
            return response.data;
        } catch (error) {
            console.error('Failed to create team:', error);
            toast.error('Failed to create team. Please try again.');
            throw error;
        }
    },

    // Get a team by ID
    getById: async (teamId) => {
        try {
            const response = await axios.get(`${API_URL}/getById/${teamId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch team:', error);
            toast.error('Failed to fetch team. Please try again.');
            throw error;
        }
    },

    // Update a team by ID
    update: async (teamId, teamData) => {
        try {
            const response = await axios.put(`${API_URL}/update/${teamId}`, teamData);
            toast.success('Team updated successfully!');
            return response.data;
        } catch (error) {
            console.error('Failed to update team:', error);
            toast.error('Failed to update team. Please try again.');
            throw error;
        }
    },

    // Soft delete a team by ID
    softDelete: async (teamId) => {
        try {
            const response = await axios.patch(`${API_URL}/softDelete/${teamId}`);
            toast.success('Team deleted successfully!');
            return response.data;
        } catch (error) {
            console.error('Failed to delete team:', error);
            toast.error('Failed to delete team. Please try again.');
            throw error;
        }
    },

    // Get all teams
    getAll: () => {
        const url = '/team/all';
        return axiosClient.get(url);
    },

    // Restore a team by ID
    restore: async (teamId) => {
        try {
            const response = await axios.patch(`${API_URL}/restore/${teamId}`);
            toast.success('Team restored successfully!');
            return response.data;
        } catch (error) {
            console.error('Failed to restore team:', error);
            toast.error('Failed to restore team. Please try again.');
            throw error;
        }
    },

    // dùng axiosClient đã tạo
    // eslint-disable-next-line no-dupe-keys
    create(teamRequest) {
        const url = '/team/create';
        return axiosClient.post(url, teamRequest);
    },
    // eslint-disable-next-line no-dupe-keys
    softDelete(teamId) {
        const url = `/team/soft-delete/${teamId}`;
        return axiosClient.patch(url);
    },
    forceDelete(teamId) {
        const url = `/team/force-delete/${teamId}`;
        return axiosClient.delete(url);
    },

    checkExistedName(teamName) {
        const url = `/team/check-existed-name?teamName=${teamName}`;
        return axiosClient.get(url);
    },
};

export default teamApi;
