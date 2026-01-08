const axios = require('axios');
const config = require('./config');

const apiClient = axios.create({
  baseURL: config.backofficeUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = {
  /**
   * Ensure a contact exists in the backoffice.
   * @param {string} waId - The WhatsApp ID (phone number).
   * @param {string} name - The user's profile name.
   */
  async ensureContact(waId, name) {
    try {
      const response = await apiClient.post('/api/whatsapp/contacts/ensure/', {
        wa_id: waId,
        name: name,
      });
      return response.data;
    } catch (error) {
      console.error('Error ensuring contact:', error.message);
      throw error;
    }
  },

  /**
   * Get list of active raffles.
   */
  async getActiveRaffles() {
    try {
      const response = await apiClient.get('/api/raffles/', {
        params: { is_active: true }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching raffles:', error.message);
      throw error;
    }
  },

  /**
   * Get availability for a specific raffle.
   * @param {number} raffleId 
   */
  async getRaffleAvailability(raffleId) {
    try {
      const response = await apiClient.get(`/api/raffles/${raffleId}/availability/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching availability:', error.message);
      throw error;
    }
  },

  /**
   * Reserve random tickets.
   * @param {number} raffleId 
   * @param {string} waId 
   * @param {number} qty 
   */
  async reserveRandom(raffleId, waId, qty) {
    try {
      const response = await apiClient.post(`/api/raffles/${raffleId}/reserve/`, {
        wa_id: waId,
        type: 'random',
        qty: parseInt(qty),
      });
      return response.data;
    } catch (error) {
      console.error('Error reserving random:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Reserve specific tickets.
   * @param {number} raffleId 
   * @param {string} waId 
   * @param {Array<number>} numbers 
   */
  async reserveSpecific(raffleId, waId, numbers) {
    try {
      const response = await apiClient.post(`/api/raffles/${raffleId}/reserve/`, {
        wa_id: waId,
        type: 'specific',
        numbers: numbers,
      });
      return response.data;
    } catch (error) {
      console.error('Error reserving specific:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Confirm payment.
   * @param {number} orderId 
   * @param {string} mediaId 
   */
  async confirmPayment(orderId, mediaId) {
    try {
      const response = await apiClient.post(`/api/orders/${orderId}/confirm_payment/`, {
        payment_proof_media_id: mediaId,
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error.response?.data || error.message);
      throw error;
    }
  }
};
