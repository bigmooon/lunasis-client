import { fireEvent, render, screen } from '@testing-library/react';

import { RecentPostsSection } from '../components/recent-posts-section/recent-posts-section';

jest.mock('../components/recent-post/recent-post-card', () => ({ RecentPostCard: () => null }));

const baseProps = {
  category: 'PERIOD' as never,
  posts: [],
  isLoading: false,
  isError: false,
  onCreatePost: jest.fn(),
  onSeeMore: jest.fn(),
  onPostClick: jest.fn(),
  onRetry: jest.fn(),
};

describe('RecentPostsSection', () => {
  it('불러오기 실패 시 빈 상태 대신 오류와 다시 시도를 보여준다', () => {
    const onRetry = jest.fn();
    render(<RecentPostsSection {...baseProps} isError onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load posts.");
    expect(screen.queryByText(/No posts yet/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('로딩 중에는 빈 상태를 보여주지 않는다', () => {
    render(<RecentPostsSection {...baseProps} isLoading />);
    expect(screen.queryByText(/No posts yet/)).not.toBeInTheDocument();
  });

  it('성공했지만 글이 없으면 빈 상태를 보여준다', () => {
    render(<RecentPostsSection {...baseProps} />);
    expect(screen.getByText(/No posts yet/)).toBeInTheDocument();
  });
});
