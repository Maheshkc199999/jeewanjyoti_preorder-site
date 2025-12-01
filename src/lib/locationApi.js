import { apiRequest } from './api';

/**
 * Get location/GPS trail data
 * @param {string} userId - Optional user ID
 * @returns {Promise<Array>} List of location data records
 */
export async function getLocationData(userId = null) {
    try {
        let url = '/api/location/';
        const params = new URLSearchParams();

        if (userId) params.append('user', userId);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await apiRequest(url);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Error fetching location data:', error);
            throw new Error(error.detail || 'Failed to fetch location data');
        }

        const data = await response.json();

        // Handle both paginated and non-paginated responses
        if (Array.isArray(data)) {
            return data;
        } else if (data && data.results && Array.isArray(data.results)) {
            return data.results;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error in getLocationData:', error);
        throw error;
    }
}
