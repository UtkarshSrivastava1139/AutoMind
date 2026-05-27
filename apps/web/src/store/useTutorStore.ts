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
  abortController: AbortController | null;

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
      abortController: null,

      sendMessage: async (content) => {
        const { messages, abortController } = get();
        
        // Abort previous request if any is running
        if (abortController) {
          abortController.abort();
        }

        const activeController = new AbortController();

        const userMessage: ChatMessage = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          role: 'user',
          content,
          timestamp: Date.now(),
        };

        const updatedMessages = [...messages, userMessage];

        set({
          messages: updatedMessages,
          isLoading: true,
          error: null,
          abortController: activeController,
        });

        try {
          // Call the chat API with all messages including the new user message
          const response = await fetch('/api/tutor/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: updatedMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            }),
            signal: activeController.signal,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get response from AI tutor');
          }

          const data = await response.json();
          const assistantMessage: ChatMessage = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            role: 'assistant',
            content: data.markdown || data.message || '',
            timestamp: Date.now(),
          };

          // Check if this request is still the latest one before updating state
          if (get().abortController === activeController) {
            set((state) => ({
              messages: [...state.messages, assistantMessage],
              isLoading: false,
              abortController: null,
            }));
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            // Ignored because request was aborted
            return;
          }
          if (get().abortController === activeController) {
            set({
              error: error.message || 'An error occurred while communicating with the tutor',
              isLoading: false,
              abortController: null,
            });
          }
        }
      },

      clearChat: () => {
        const { abortController } = get();
        if (abortController) {
          abortController.abort();
        }
        set({
          messages: [],
          error: null,
          abortController: null,
        });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'tutor-store',
      // Non-serializable elements like abortController should not be persisted
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);