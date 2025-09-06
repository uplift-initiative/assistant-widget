export const API_CONFIG = {
  defaultBaseUrl: 'https://api.upliftai.org',
  endpoints: {
    createSession: '/v1/realtime-assistants/{assistantId}/createPublicSession'
  }
};

export const WIDGET_DEFAULTS = {
  position: 'bottom-right' as const,
  theme: 'light' as const,
  size: 'medium' as const,
  participantName: 'Anonymous'
};