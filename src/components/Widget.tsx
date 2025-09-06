import { Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { Trigger } from './Trigger';
import { BarVisualizer } from './BarVisualizer';
import { LiveKitConnection } from '../services/livekitConnection';
import { createSession } from '../services/upliftApi';
import type { ConnectionState, WidgetConfig } from '../types';
import { WIDGET_DEFAULTS } from '../utils/constants';
import widgetStyles from '../styles/widget.css?inline';

export function Widget(config: WidgetConfig) {
  const [state, setState] = useState<ConnectionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const connectionRef = useRef<LiveKitConnection | null>(null);

  const position = config.position || WIDGET_DEFAULTS.position;
  const theme = config.theme || WIDGET_DEFAULTS.theme;
  const size = config.size || WIDGET_DEFAULTS.size;
  const participantName = config.participantName || WIDGET_DEFAULTS.participantName;


  useEffect(() => {
    // Auto-connect if configured
    if (config.autoConnect) {
      handleConnect();
    }

    return () => {
      if (connectionRef.current) {
        connectionRef.current.disconnect();
      }
    };
  }, []);

  const handleConnect = async () => {
    if (!config.assistantId) {
      setError('Assistant ID is required');
      return;
    }

    try {
      setState('connecting');
      setError(null);

      // Create session with Uplift AI
      const session = await createSession(
        config.assistantId,
        participantName,
        config.baseUrl
      );

      // Initialize LiveKit connection
      connectionRef.current = new LiveKitConnection(
        (newState) => setState(newState),
        () => {
          // Volume callback for future use
        },
        (agentStream) => {
          // Set the agent's audio stream for visualization
          setAudioStream(agentStream);
        }
      );

      await connectionRef.current.connect(session);
    } catch (err) {
      console.error('Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setState('error');
    }
  };

  const handleDisconnect = async () => {
    if (connectionRef.current) {
      await connectionRef.current.disconnect();
      connectionRef.current = null;
    }
    // Clear the audio stream (no need to stop tracks as it's the agent's stream)
    setAudioStream(null);
    setState('idle');
    setError(null);
  };

  const isExpanded = state !== 'idle' && state !== 'disconnected';

  return (
    <Fragment>
      <style>{`
        ${widgetStyles}
        
        :host {
          --upliftai-primary: ${config.primaryColor || '#3B82F6'};
          --upliftai-secondary: #6B7280;
          --upliftai-bg: #FFFFFF;
          --upliftai-text: #1F2937;
          --upliftai-accent: #10B981;
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
      
      <div className={`upliftai-widget-container upliftai-${position}`}>
        {/* Expanded visualizer container */}
        <div
          className={`
            upliftai-visualizer
            upliftai-theme-${theme}
            ${isExpanded ? `upliftai-expanded upliftai-${size}` : ''}
          `}
        >
          {isExpanded && (
            <div className="upliftai-content">
              {error ? (
                <div className="upliftai-error">
                  {error}
                </div>
              ) : (
                <BarVisualizer 
                  state={state} 
                  audioStream={audioStream}
                  barCount={15}
                />
              )}
            </div>
          )}
        </div>

        {/* Trigger button */}
        <div className="upliftai-trigger-wrapper">
          <Trigger
            state={state}
            size={size}
            onClick={handleConnect}
            onEnd={handleDisconnect}
          />
        </div>
      </div>
    </Fragment>
  );
}