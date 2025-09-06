import { useEffect, useState, useRef } from 'preact/hooks';

interface MultibandOptions {
  bands?: number;
  updateInterval?: number;
  fftSize?: number;
}


export function useMultibandVolume(
  stream: MediaStream | null,
  options: MultibandOptions = {}
): number[] {
  const { 
    bands = 15, 
    updateInterval = 50,
    fftSize = 1024
  } = options;

  const [volumes, setVolumes] = useState<number[]>(new Array(bands).fill(0));
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const previousVolumesRef = useRef<number[]>(new Array(bands).fill(0));

  useEffect(() => {
    if (!stream) {
      setVolumes(new Array(bands).fill(0));
      return;
    }

    try {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = fftSize;
      
      source.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      let lastUpdate = 0;

      const updateVolumes = (timestamp: number) => {
        if (!analyserRef.current) return;
        
        if (timestamp - lastUpdate >= updateInterval) {
          // Use time domain data for waveform (like LiveKit example)
          const timeDataArray = new Float32Array(bufferLength);
          analyserRef.current.getFloatTimeDomainData(timeDataArray);
          
          // Calculate RMS (root mean square) for overall volume
          let sum = 0;
          for (let i = 0; i < timeDataArray.length; i++) {
            sum += timeDataArray[i] * timeDataArray[i];
          }
          const rms = Math.sqrt(sum / timeDataArray.length);
          const overallVolume = Math.min(1, rms * 5); // Balanced scaling for visibility
          
          // Create a center-based symmetric visualization
          const bandVolumes: number[] = [];
          const center = Math.floor(bands / 2);
          
          for (let i = 0; i < bands; i++) {
            const distanceFromCenter = Math.abs(i - center);
            const normalizedDistance = distanceFromCenter / center;
            
            // Create a wave effect that's strongest at center and fades outward
            const waveIntensity = Math.max(0, 1 - normalizedDistance * 0.5);
            
            // Less randomness for smoother feel
            const randomVariation = 0.9 + Math.random() * 0.2;
            
            const targetVolume = overallVolume * waveIntensity * randomVariation;
            
            // Smooth the volume changes (interpolate with previous values)
            const smoothingFactor = 0.7; // Higher = smoother, less reactive
            const smoothedVolume = previousVolumesRef.current[i] * smoothingFactor + targetVolume * (1 - smoothingFactor);
            
            bandVolumes.push(smoothedVolume);
          }
          
          previousVolumesRef.current = bandVolumes;
          setVolumes(bandVolumes);
          lastUpdate = timestamp;
        }
        
        animationFrameRef.current = requestAnimationFrame(updateVolumes);
      };

      animationFrameRef.current = requestAnimationFrame(updateVolumes);
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stream, bands, updateInterval, fftSize]);

  return volumes;
}