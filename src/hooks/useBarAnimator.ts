import { useEffect, useState, useRef } from 'preact/hooks';
import type { ConnectionState } from '../types';

const generateSequence = (
  state: ConnectionState,
  columns: number
): number[][] => {
  const center = Math.floor(columns / 2);
  
  switch (state) {
    case 'connecting':
    case 'initializing':
      // Wave from center outward - one ring at a time
      const connectingSequence: number[][] = [];
      
      // Expand from center - highlight only the current ring
      for (let radius = 0; radius <= center; radius++) {
        const frame: number[] = [];
        
        // Add center bar when radius is 0
        if (radius === 0) {
          frame.push(center);
        } else {
          // Add bars at exactly this radius from center
          const leftBar = center - radius;
          const rightBar = center + radius;
          
          if (leftBar >= 0) frame.push(leftBar);
          if (rightBar < columns) frame.push(rightBar);
        }
        
        connectingSequence.push(frame);
      }
      
      // Contract back to center
      for (let radius = center - 1; radius > 0; radius--) {
        const frame: number[] = [];
        
        const leftBar = center - radius;
        const rightBar = center + radius;
        
        if (leftBar >= 0) frame.push(leftBar);
        if (rightBar < columns) frame.push(rightBar);
        
        connectingSequence.push(frame);
      }
      
      // End at center
      connectingSequence.push([center]);
      
      return connectingSequence;

    case 'listening':
      // Subtle center breathing - only center 3-5 bars
      const listeningSequence: number[][] = [];
      const breathFrames = 30;
      
      for (let f = 0; f < breathFrames; f++) {
        const frame: number[] = [];
        const phase = (f / breathFrames) * Math.PI * 2;
        const intensity = (Math.sin(phase) + 1) / 2; // 0 to 1
        
        // Always include center
        frame.push(center);
        
        // Sometimes include immediate neighbors
        if (intensity > 0.3) {
          if (center - 1 >= 0) frame.push(center - 1);
          if (center + 1 < columns) frame.push(center + 1);
        }
        
        // Rarely include further neighbors
        if (intensity > 0.7) {
          if (center - 2 >= 0) frame.push(center - 2);
          if (center + 2 < columns) frame.push(center + 2);
        }
        
        listeningSequence.push(frame);
      }
      return listeningSequence;

    case 'thinking':
      // Fast random flashing centered around middle
      const thinkingSequence: number[][] = [];
      for (let f = 0; f < 15; f++) {
        const frame: number[] = [];
        
        // Always have some activity in center
        if (Math.random() > 0.3) frame.push(center);
        
        // Random bars, weighted towards center
        for (let i = 0; i < columns; i++) {
          const distance = Math.abs(i - center);
          const probability = 0.6 - (distance / columns); // Higher probability near center
          
          if (Math.random() < probability) {
            frame.push(i);
          }
        }
        thinkingSequence.push(frame);
      }
      return thinkingSequence;

    case 'speaking':
      // All bars active for audio visualization
      return [new Array(columns).fill(0).map((_, idx) => idx)];

    default:
      // Idle state - all bars slightly visible
      return [new Array(columns).fill(0).map((_, idx) => idx)];
  }
};

export function useBarAnimator(
  state: ConnectionState,
  columns: number = 15
): number[] {
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const [sequence, setSequence] = useState<number[][]>([[]]);
  const [frameIndex, setFrameIndex] = useState(0);
  const animationFrameRef = useRef<number>();

  // Generate sequence when state or columns change
  useEffect(() => {
    const newSequence = generateSequence(state, columns);
    setSequence(newSequence);
    setFrameIndex(0);
  }, [state, columns]);

  // Animate through the sequence
  useEffect(() => {
    if (sequence.length === 0) return;

    let lastTime = performance.now();
    const interval = state === 'thinking' ? 100 : state === 'connecting' ? 150 : 200;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastTime;

      if (elapsed >= interval) {
        setFrameIndex((prev) => (prev + 1) % sequence.length);
        lastTime = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sequence, state]);

  // Update highlighted indices based on current frame
  useEffect(() => {
    const currentFrame = sequence[frameIndex] || [];
    setHighlightedIndices(currentFrame.filter(idx => idx >= 0));
  }, [frameIndex, sequence]);

  return highlightedIndices;
}