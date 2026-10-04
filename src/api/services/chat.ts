import axiosInstance from '@/helpers/https'

export interface ChatConversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export const ChatService = {
  async createConversation(): Promise<ChatConversation> {
    const response = await axiosInstance.post<ChatConversation>('/chat/conversations')
    return response.data
  },

  async getConversations(): Promise<ChatConversation[]> {
    const response = await axiosInstance.get<ChatConversation[]>('/chat/conversations')
    return response.data
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const response = await axiosInstance.get<ChatMessage[]>(
      `/chat/conversations/${conversationId}/messages`,
    )
    return response.data
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await axiosInstance.delete(`/chat/conversations/${conversationId}`)
  },
}
