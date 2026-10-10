export type Category = {
  id: string;
  name: string;
};

export type VideoInfo = {
  id: string;
  title: string;
  categoryId: string;
  url?: string;
  localPath?: string;
  originalName: string;
  createdAt: number;
  type?: string; 
  file?: File;
  fileSize?: string;
  extension?: string;
  playCount?: number;
  lastPlayed?: number;
  order?: number;
  exists?: boolean;
};

export type SortField = 'order' | 'title' | 'category' | 'format' | 'date';
export type SortOrder = 'asc' | 'desc';

export type Theme = 'onyxblack' | 'paperlight';
export type Language = 'en' | 'ja';
export type PreferredPlayer = 'potplayer' | 'kmplayer' | 'auto';
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';
