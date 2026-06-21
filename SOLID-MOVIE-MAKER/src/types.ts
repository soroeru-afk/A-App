export type Category = {
  id: string;
  name: string;
};

export type VideoInfo = {
  id: string;
  title: string;
  categoryId: string;
  url: string;
  originalName: string;
  createdAt: number;
  type?: string; 
  localPath?: string;
};

export type Theme = 'onyxblack' | 'paperlight';
export type Language = 'en' | 'ja';
