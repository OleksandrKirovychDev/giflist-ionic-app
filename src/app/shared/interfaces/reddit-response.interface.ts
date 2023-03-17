import { IRedditPost } from './reddit-post.interface';

export interface IRedditResponse {
  data: IRedditResponseData;
}

interface IRedditResponseData {
  children: IRedditPost[];
}
