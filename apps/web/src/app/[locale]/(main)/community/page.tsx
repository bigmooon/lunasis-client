'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { COMMUNITY_CATEGORIES } from '@repo/shared/features/community/constants';
import { CommunityCategory } from '@repo/shared/features/community/types';
import { SelectionGroup } from '@web/components/ui/selection-group';
import { RecentPostsSection } from '@web/features/community/components/recent-posts-section';
import { SearchBar } from '@web/features/community/components/search-bar';
import { usePostsQuery } from '@web/features/community/hooks';
import { BREAKPOINTS, ROUTES } from '@web/lib/constants';

import styles from './community.module.scss';

const CommunityPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory>(
    COMMUNITY_CATEGORIES[0].key,
  );

  // fetch posts by category
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
    refetch: refetchPosts,
  } = usePostsQuery({ category: selectedCategory });

  // Category change handler
  const handleCategoryChange = useCallback((category: CommunityCategory) => {
    setSelectedCategory(category);
  }, []);

  // Create post handler with preset category
  // Navigate to: /community/posts/create?category=PERIOD_CRAMPS
  const handleCreatePost = useCallback(
    (category: CommunityCategory) => {
      router.push(`${ROUTES.COMMUNITY_CREATE}?category=${category}`);
    },
    [router],
  );

  // See more handler - navigate to category page
  // Navigate to: /community/period_cramps (Products pattern!)
  const handleSeeMore = useCallback(
    (category: CommunityCategory) => {
      router.push(ROUTES.COMMUNITY_CATEGORY(category.toLowerCase()));
    },
    [router],
  );

  // Post click handler - navigate to post detail
  // Navigate to: /community/posts/abc123
  const handlePostClick = useCallback(
    (postId: string) => {
      router.push(ROUTES.COMMUNITY_POST(postId));
    },
    [router],
  );
  const posts = postsData?.data?.content || [];

  return (
    <div className={styles.container}>
      <SearchBar />
      <section className={styles.banner}>
        <h2>Today&apos;s Discussion</h2>
        <div className={styles.bannerImage}>
          <Image
            src="/banner.png"
            alt="banner"
            priority
            fill
            sizes={`(max-width: ${BREAKPOINTS.MOBILE_MAX}px) 90vw, 80vw`}
          />
        </div>
      </section>
      <section className={styles.topic}>
        <h2>Topic Categories</h2>
        <SelectionGroup
          options={COMMUNITY_CATEGORIES}
          selectedValue={selectedCategory}
          onSelect={handleCategoryChange}
          layout="grid"
          gridColumns={3}
          colorScheme="pink"
          ariaLabel="Select a topic category"
          className={styles.category}
        />
        <hr />
      </section>
      <RecentPostsSection
        category={selectedCategory}
        posts={posts}
        isLoading={isLoadingPosts}
        isError={isErrorPosts}
        onCreatePost={handleCreatePost}
        onSeeMore={handleSeeMore}
        onPostClick={handlePostClick}
        onRetry={() => refetchPosts()}
      />
    </div>
  );
};

CommunityPage.displayName = 'CommunityPage';

export default CommunityPage;
