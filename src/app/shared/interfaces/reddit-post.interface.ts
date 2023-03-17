export interface IRedditPost {
  data: IRedditPostData;
}

interface IRedditPostData {
  author: string;
  name: string;
  permalink: string;
  preview: IRedditPreview;
  secure_media: IRedditMedia;
  title: string;
  media: IRedditMedia;
  url: string;
  thumbnail: string;
  num_comments: number;
}

interface IRedditPreview {
  reddit_video_preview: IRedditVideoPreview;
}

interface IRedditVideoPreview {
  is_gif: boolean;
  fallback_url: string;
}

interface IRedditMedia {
  reddit_video: IRedditVideoPreview;
}
