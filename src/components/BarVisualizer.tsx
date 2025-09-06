import { useBarAnimator } from '../hooks/useBarAnimator';
import { useMultibandVolume } from '../hooks/useMultibandVolume';
import type { ConnectionState } from '../types';

interface BarVisualizerProps {
  state: ConnectionState;
  audioStream?: MediaStream | null;
  barCount?: number;
}

export function BarVisualizer({ 
  state, 
  audioStream, 
  barCount = 15 
}: BarVisualizerProps) {
  const volumes = useMultibandVolume(audioStream || null, { bands: barCount });
  const highlightedIndices = useBarAnimator(state, barCount);
  
  // Show audio visualization when agent is speaking and we have audio stream
  const showAudioVisualization = state === 'speaking' && audioStream;
  // Show animation for other states or when no audio
  const showAnimation = !showAudioVisualization;

  return (
    <div className="upliftai-bars-container">
      {Array.from({ length: barCount }).map((_, index) => {
        const isHighlighted = highlightedIndices.includes(index);
        const volume = volumes[index] || 0;
        
        // Calculate height based on state and audio
        let heightPixels = 6; // minimum height in pixels
        
        if (showAudioVisualization) {
          // Use actual audio volume when agent is speaking
          heightPixels = Math.max(6, Math.min(28, volume * 70));
        } else if (state === 'listening') {
          // Very subtle pulse when listening
          heightPixels = isHighlighted ? 14 : 6;
        } else if (state === 'connecting' || state === 'initializing') {
          // Wave animation for connecting/initializing
          heightPixels = isHighlighted ? 22 : 6;
        } else if (state === 'thinking') {
          // Fast random animation for thinking
          heightPixels = isHighlighted ? 24 : 6;
        } else {
          // Idle state - all bars at minimum
          heightPixels = 6;
        }


        // Determine state-based classes
        let stateClass = '';
        if (state === 'speaking' || state === 'listening') {
          stateClass = isHighlighted || showAudioVisualization ? 'upliftai-bar-active' : 'upliftai-bar-inactive';
        } else if (state === 'connecting' || state === 'initializing') {
          stateClass = isHighlighted ? 'upliftai-bar-connecting' : 'upliftai-bar-inactive-light';
        } else if (state === 'thinking') {
          stateClass = isHighlighted ? 'upliftai-bar-thinking' : 'upliftai-bar-inactive-light';
        } else {
          stateClass = 'upliftai-bar-idle';
        }

        return (
          <div
            key={index}
            className={`upliftai-bar ${showAnimation ? 'upliftai-animated' : 'upliftai-audio'} ${stateClass}`}
            style={{
              height: `${heightPixels}px`
            }}
          />
        );
      })}
    </div>
  );
}