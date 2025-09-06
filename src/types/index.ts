export type ConnectionState = 
  | 'idle'
  | 'connecting'
  | 'initializing'
  | 'connected'
  | 'speaking'
  | 'listening'
  | 'thinking'
  | 'error'
  | 'disconnected';

export interface WidgetConfig {
  assistantId: string;
  participantName?: string;
  baseUrl?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'custom';
  primaryColor?: string;
  size?: 'small' | 'medium' | 'large';
  autoConnect?: boolean;
}

export interface SessionResponse {
  token: string;
  wsUrl: string;
  roomName: string;
}

export interface CustomAttributes {
  'assistant-id': string;
  'base-url'?: string;
  'participant-name'?: string;
  'position'?: string;
  'theme'?: string;
  'primary-color'?: string;
  'size'?: string;
  'auto-connect'?: string;
}

export const CustomAttributeList = [
  'assistant-id',
  'base-url',
  'participant-name',
  'position',
  'theme',
  'primary-color',
  'size',
  'auto-connect'
] as const;