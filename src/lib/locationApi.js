import { apiRequest } from './api';

/**
 * Get live location/GPS trail data
 * @param {string} userId - Optional user ID
 * @returns {Promise<Array>} List of location data records
 */
export async function getLocationData(userId = null) {
    try {
        let url = '/api/live_location/';
        const params = new URLSearchParams();

        if (userId) params.append('user_id', userId);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await apiRequest(url);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Error fetching live location data:', error);
            throw new Error(error.detail || 'Failed to fetch live location data');
        }

        const data = await response.json();

        const extractRecords = (payload) => {
            if (Array.isArray(payload)) {
                return payload;
            }

            if (payload && Array.isArray(payload.live_location)) {
                return payload.live_location;
            }

            if (payload && payload.live_location && Array.isArray(payload.live_location.results)) {
                return payload.live_location.results;
            }

            if (payload && payload.results && Array.isArray(payload.results)) {
                return payload.results;
            }

            return [];
        };

        const records = extractRecords(data);
        return Array.isArray(records) ? records : [];
    } catch (error) {
        console.error('Error in getLocationData:', error);
        throw error;
    }
}
