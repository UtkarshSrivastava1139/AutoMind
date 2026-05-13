import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface TutorStore {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  setError: (error: string | null) => void;
}

export const useTutorStore = create<TutorStore>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,

      sendMessage: async (content) => {
        const { messages } = get();
        
        // Add user message
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'user',
          content,
          timestamp: Date.now(),
        };

        set({
          messages: [...messages, userMessage],
          isLoading: true,
          error: null,
        });

        try {
          // Call the chat API
          const response = await fetch('/api/tutor/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get response from AI tutor');
          }

          const data = await response.json();
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: data.message,
            timestamp: Date.now(),
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.message || 'An error occurred while communicating with the tutor',
            isLoading: false,
          });
        }
      },

      clearChat: () => {
        set({
          messages: [],
          error: null,
        });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'tutor-store',
    }
  )
);