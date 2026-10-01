import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { CommunityCategory, type Post } from '@repo/shared/features/community/types';
import { Button } from '@web/components/ui/button';

import { RecentPostCard } from '../recent-post/recent-post-card';

import clsx from 'clsx';
import styles from './recent-posts-section.module.scss';

interface RecentPostsSectionProps {
  category: CommunityCategory;
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  onCreatePost: (category: CommunityCategory) => void;
  onSeeMore: (category: CommunityCategory) => void;
  onPostClick: (postId: string) => void;
  onRetry: () => void;
  className?: string;
}

export const RecentPostsSection = ({
  category,
  posts,
  isLoading,
  isError,
  onCreatePost,
  onSeeMore,
  onPostClick,
  onRetry,
  className,
}: RecentPostsSectionProps) => {
  if (isError) {
    return (
      <section className={clsx(styles.section, className)}>
        <div className={styles.emptyState} role="alert">
          <p className={styles.emptyMessage}>Couldn&apos;t load posts.</p>
          <Button
            variant="outline"
            colorScheme="pink"
            onClick={onRetry}
            className={clsx(styles.button, styles.write)}
          >
            Try again
          </Button>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return <section className={clsx(styles.section, className)} aria-busy="true" />;
  }

  if (posts.length === 0) {
    return (
      <section className={clsx(styles.section, className)}>
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            No posts yet in this category.
            <br />
            Be the first to share your story!
          </p>
          <Button
            variant="outline"
            colorScheme="pink"
            onClick={() => onCreatePost(category)}
            aria-label="Write first post"
            className={clsx(styles.button, styles.write)}
          >
            Write a Post ✏️
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <Button
        variant="outline"
        colorScheme="pink"
        onClick={() => onCreatePost(category)}
        aria-label="Write a post"
        className={clsx(styles.button, styles.write)}
      >
        Write a Post ✏️
      </Button>

      {/* posts list */}
      <div className={styles.list}>
        {posts.map((post) => (
          <RecentPostCard key={post.postId} post={post} onClick={() => onPostClick(post.postId)} />
        ))}
      </div>

      <Button
        colorScheme="pink"
        onClick={() => onSeeMore(category)}
        aria-label="See more posts"
        className={clsx(styles.button, styles.more)}
      >
        See more stories
        <ArrowForwardIosIcon className={styles.arrowIcon} />
      </Button>
    </section>
  );
};

RecentPostsSection.displayName = 'RecentPostsSection';
