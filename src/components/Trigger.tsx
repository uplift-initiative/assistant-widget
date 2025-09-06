import type { ConnectionState } from '../types';

interface TriggerProps {
  state: ConnectionState;
  size: 'small' | 'medium' | 'large';
  onClick: () => void;
  onEnd: () => void;
}

export function Trigger({ state, size, onClick, onEnd }: TriggerProps) {
  const isActive = state !== 'idle' && state !== 'disconnected';
  const isConnecting = state === 'connecting';

  const handleClick = () => {
    if (isActive) {
      onEnd();
    } else {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        upliftai-trigger
        upliftai-${size}
        ${isActive ? 'upliftai-active' : ''}
      `}
      aria-label={isActive ? 'End call' : 'Start call'}
    >
      {isConnecting ? (
        <svg
          className={`upliftai-icon upliftai-${size} upliftai-icon-spin`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            opacity="0.25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            opacity="0.75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : isActive ? (
        <svg
          className={`upliftai-icon upliftai-${size} upliftai-icon-end-call`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ) : (
        <svg
          className={`upliftai-icon upliftai-${size}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      )}
    </button>
  );
}