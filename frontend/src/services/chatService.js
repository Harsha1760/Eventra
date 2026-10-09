import { api } from './api';

export const chatService = {
  /**
   * Send a question to the Eventra AI Assistant
   * @param {string} message - Non-blank user question (max 500 characters)
   * @param {string} [conversationId] - Optional session tracking id
   * @returns {Promise<{reply: string, conversationId: string, referencedEventIds: number[], timestamp: string}>}
   */
  async sendMessage(message, conversationId = null) {
    return api.post('/api/chat', {
      message: message.trim(),
      conversationId: conversationId || undefined,
    });
  },
};

