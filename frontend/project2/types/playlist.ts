export interface PlaylistItem {
  id: number;
  url: string;
  title: string;
  thumbnailUrl?: string;
  creator?: string;
  description?: string;
}
export interface Playlist {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  createdAt: string;
  items?: PlaylistItem[];
  category?: string;
}
