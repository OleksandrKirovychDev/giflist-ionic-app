import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  map,
  scan,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { IGif } from '../interfaces/gif.interface';
import { IRedditPagination, IRedditPost, IRedditResponse } from '../interfaces';
import { FormControl } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class RedditService {
  private _pagination$ = new BehaviorSubject<IRedditPagination>({
    after: null,
    totalFound: 0,
    retries: 0,
    infiniteScroll: null,
  });

  constructor(private http: HttpClient) {}

  public getGifs(subredditFormControl: FormControl) {
    const subreddit$ = subredditFormControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      startWith(subredditFormControl.value),
      tap(() =>
        this._pagination$.next({
          after: null,
          totalFound: 0,
          retries: 0,
          infiniteScroll: null,
        })
      )
    );

    return subreddit$.pipe(
      switchMap((subreddit) => {
        const gifsForCurrentPage$ = this._pagination$.pipe(
          concatMap((pagination) =>
            this.fetchFromReddit(subreddit, 'hot', pagination.after)
          )
        );
        const allGifs$ = gifsForCurrentPage$.pipe(
          scan((previousGifs, currentGifs) => [...previousGifs, ...currentGifs])
        );

        return allGifs$;
      })
    );
  }

  private fetchFromReddit(
    subreddit: string,
    sort: string,
    after: string | null
  ) {
    return this.http
      .get<IRedditResponse>(
        `https://www.reddit.com/r/${subreddit}/${sort}/.json?limit=100` +
          (after ? `&after=${after}` : '')
      )
      .pipe(
        catchError(() => EMPTY),
        map((res) => this.convertRedditPostsToGifs(res.data.children))
      );
  }

  private convertRedditPostsToGifs(posts: IRedditPost[]): IGif[] {
    return posts
      .map((post) => ({
        src: this.getBestSrcForGif(post),
        author: post.data.author,
        name: post.data.name,
        permalink: post.data.permalink,
        title: post.data.title,
        thumbnail: post.data.thumbnail,
        comments: post.data.num_comments,
        loading: false,
      }))
      .filter((gifs) => gifs.src !== null);
  }

  private getBestSrcForGif(post: IRedditPost) {
    // If the source is in .mp4 format, leave unchanged
    if (post.data.url.indexOf('.mp4') > -1) {
      return post.data.url;
    }

    // If the source is in .gifv or .webm formats, convert to .mp4 and return
    if (post.data.url.indexOf('.gifv') > -1) {
      return post.data.url.replace('.gifv', '.mp4');
    }

    if (post.data.url.indexOf('.webm') > -1) {
      return post.data.url.replace('.webm', '.mp4');
    }

    // If the URL is not .gifv or .webm, check if media or secure media is available
    if (post.data.secure_media?.reddit_video) {
      return post.data.secure_media.reddit_video.fallback_url;
    }

    if (post.data.media?.reddit_video) {
      return post.data.media.reddit_video.fallback_url;
    }

    // If media objects are not available, check if a preview is available
    if (post.data.preview?.reddit_video_preview) {
      return post.data.preview.reddit_video_preview.fallback_url;
    }

    // No useable formats available
    return null;
  }

  nextPage(infiniteScrollEvent: Event, after: string) {
    this._pagination$.next({
      after,
      totalFound: 0,
      retries: 0,
      infiniteScroll:
        infiniteScrollEvent?.target as HTMLIonInfiniteScrollElement,
    });
  }
}
