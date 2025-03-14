export interface PlaylistItem {
  id: number;
  itemId: number;
  itemType: "LINK" | "CURATION";
  displayOrder: number;
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
  isPublic: boolean;
  createdAt: string;
  items?: PlaylistItem[];
  tags?: string[];
  viewCount: number;
  likeCount: number;
}
export interface LinkData {
  title: string;
  url: string;
  thumbnailUrl?: string;
  creator?: string;
  description?: string;
}

