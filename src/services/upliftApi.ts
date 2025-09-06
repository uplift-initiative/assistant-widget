import { API_CONFIG } from '../utils/constants';
import type { SessionResponse } from '../types';

export async function createSession(
  assistantId: string,
  participantName: string = 'Anonymous',
  baseUrl: string = API_CONFIG.defaultBaseUrl
): Promise<SessionResponse> {
  const endpoint = API_CONFIG.endpoints.createSession.replace('{assistantId}', assistantId);
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participantName
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as SessionResponse;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}