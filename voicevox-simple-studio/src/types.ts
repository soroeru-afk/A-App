export interface SpeakerStyle {
  name: string;
  id: number;
}

export interface Speaker {
  name: string;
  speaker_uuid: string;
  styles: SpeakerStyle[];
  version: string;
}

export interface TextBlock {
  id: string;
  text: string;
  speakerId: number;
  status: 'idle' | 'generating' | 'done' | 'error';
  audioUrl?: string;
  audioBlob?: Blob;
  errorMessage?: string;
  speedScale?: number;
  pitchScale?: number;
  intonationScale?: number;
}
