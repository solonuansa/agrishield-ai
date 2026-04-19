/**
 * API calls untuk modul Community (forum posts dan komentar).
 */
import { apiClient } from "./client";

export type PostCategory = "question" | "experience" | "tips" | "alert";

export interface AuthorInfo {
  id: string;
  full_name: string;
}

export interface Comment {
  id: string;
  body: string;
  author: AuthorInfo;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  category: PostCategory;
  crop_type: string | null;
  comment_count: number;
  like_count: number;
  is_pinned: boolean;
  author: AuthorInfo;
  created_at: string;
  is_liked: boolean;
}

export interface PostDetail extends Post {
  comments: Comment[];
}

export interface PostListMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface CreatePostPayload {
  title: string;
  body: string;
  category: PostCategory;
  crop_type?: string;
}

export interface CreateCommentPayload {
  body: string;
}

export interface ListPostsParams {
  page?: number;
  per_page?: number;
  category?: PostCategory;
  crop_type?: string;
}

export const communityApi = {
  listPosts: async (params?: ListPostsParams): Promise<{ posts: Post[]; meta: PostListMeta }> => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: Post[];
      meta: PostListMeta;
    }>("/community/posts", { params });
    return { posts: data.data, meta: data.meta };
  },

  getPost: async (postId: string): Promise<PostDetail> => {
    const { data } = await apiClient.get<{ success: boolean; data: PostDetail }>(
      `/community/posts/${postId}`
    );
    return data.data;
  },

  createPost: async (payload: CreatePostPayload): Promise<Post> => {
    const { data } = await apiClient.post<{ success: boolean; data: Post }>(
      "/community/posts",
      payload
    );
    return data.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/community/posts/${postId}`);
  },

  createComment: async (postId: string, payload: CreateCommentPayload): Promise<Comment> => {
    const { data } = await apiClient.post<{ success: boolean; data: Comment }>(
      `/community/posts/${postId}/comments`,
      payload
    );
    return data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/community/comments/${commentId}`);
  },

  toggleLike: async (postId: string): Promise<{ liked: boolean }> => {
    const { data } = await apiClient.post<{ success: boolean; data: { liked: boolean } }>(
      `/community/posts/${postId}/like`
    );
    return data.data;
  },
};
