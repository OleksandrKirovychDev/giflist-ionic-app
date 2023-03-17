export interface IGif {
  src: string | null;
  author: string;
  name: string;
  permalink: string;
  title: string;
  thumbnail: string;
  comments: number;
  loading?: boolean;
  dataLoaded?: boolean;
}
