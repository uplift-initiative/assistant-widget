import { Room, RoomEvent, Track, RemoteTrack, LocalAudioTrack, createLocalAudioTrack } from 'livekit-client';
import type { ConnectionState, SessionResponse } from '../types';

export class LiveKitConnection {
  private room: Room | null = null;
  private localAudioTrack: LocalAudioTrack | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private onStateChange: (state: ConnectionState) => void;
  private onVolumeChange?: (volume: number) => void;
  private onAgentAudioStream?: (stream: MediaStream | null) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(
    onStateChange: (state: ConnectionState) => void,
    onVolumeChange?: (volume: number) => void,
    onAgentAudioStream?: (stream: MediaStream | null) => void
  ) {
    this.onStateChange = onStateChange;
    this.onVolumeChange = onVolumeChange;
    this.onAgentAudioStream = onAgentAudioStream;
  }

  async connect(session: SessionResponse): Promise<void> {
    try {
      this.onStateChange('connecting');
      
      // Create a new room
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
        stopLocalTrackOnUnpublish: true,
      });

      // Set up event listeners
      this.setupEventListeners();

      // Connect to the room
      await this.room.connect(session.wsUrl, session.token);
      
      // Create and publish local audio track
      await this.publishAudio();
      
      this.onStateChange('connected');
    } catch (error) {
      console.error('Failed to connect to LiveKit:', error);
      this.onStateChange('error');
      throw error;
    }
  }

  private async publishAudio(): Promise<void> {
    if (!this.room) return;

    try {
      // Create local audio track with optimized settings
      this.localAudioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 48000,
      });

      // Publish the track
      await this.room.localParticipant.publishTrack(this.localAudioTrack);
    } catch (error) {
      console.error('Failed to publish audio:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.room) return;

    // Room connection events
    this.room.on(RoomEvent.Connected, () => {
      console.log('Connected to LiveKit room');
      this.reconnectAttempts = 0;
    });

    this.room.on(RoomEvent.Disconnected, (reason) => {
      console.log('Disconnected from room:', reason);
      this.onStateChange('disconnected');
      this.handleReconnect();
    });

    // Track events
    this.room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
      if (track.kind === Track.Kind.Audio && participant.identity.includes('agent')) {
        this.handleAgentAudio(track as RemoteTrack);
      }
    });

    // Active speaker detection
    this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      if (speakers.length > 0) {
        const activeSpeaker = speakers[0];
        if (activeSpeaker.identity.includes('agent')) {
          this.onStateChange('speaking');
        } else {
          this.onStateChange('listening');
        }
      } else {
        this.onStateChange('connected');
      }
    });

    // Audio level monitoring
    this.room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      if (this.room?.canPlaybackAudio === false) {
        console.warn('Audio playback blocked, user interaction required');
      }
    });
  }

  private handleAgentAudio(track: RemoteTrack): void {
    const audioTrack = track as any;
    
    // Attach the track to an audio element
    this.audioElement = audioTrack.attach();
    if (this.audioElement) {
      this.audioElement.autoplay = true;
      this.audioElement.style.display = 'none';
      document.body.appendChild(this.audioElement);
    }

    // Store and provide the agent's audio stream
    if (audioTrack.mediaStream) {
      if (this.onAgentAudioStream) {
        this.onAgentAudioStream(audioTrack.mediaStream);
      }
      
      // Monitor volume if callback provided
      if (this.onVolumeChange) {
        this.monitorVolume(audioTrack.mediaStream);
      }
    }
  }

  private monitorVolume(stream: MediaStream): void {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkVolume = () => {
      if (!this.room || this.room.state === 'disconnected') return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedVolume = average / 255;
      
      if (this.onVolumeChange) {
        this.onVolumeChange(normalizedVolume);
      }
      
      requestAnimationFrame(checkVolume);
    };
    
    checkVolume();
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onStateChange('error');
      return;
    }

    this.reconnectAttempts++;
    this.onStateChange('connecting');
    
    setTimeout(() => {
      if (this.room && this.room.state === 'disconnected') {
        // LiveKit will automatically attempt to reconnect
        // If it fails, we'll get another disconnected event
      }
    }, 2000 * this.reconnectAttempts);
  }

  async disconnect(): Promise<void> {
    try {
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack = null;
      }

      if (this.audioElement) {
        this.audioElement.remove();
        this.audioElement = null;
      }

      if (this.room) {
        await this.room.disconnect();
        this.room = null;
      }

      this.onStateChange('disconnected');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  async toggleMute(muted: boolean): Promise<void> {
    if (!this.room) return;
    
    try {
      await this.room.localParticipant.setMicrophoneEnabled(!muted);
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }

  get isMuted(): boolean {
    return this.room?.localParticipant.isMicrophoneEnabled === false;
  }

  get isConnected(): boolean {
    return this.room?.state === 'connected';
  }
}