export interface IRedditPagination {
  after: string | null;
  totalFound: number;
  retries: number;
  infiniteScroll: HTMLIonInfiniteScrollElement | null;
}
