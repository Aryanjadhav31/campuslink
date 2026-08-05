import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon, 
  BookmarkIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  FlagIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PostImageGrid from './PostImageGrid';

const PostCard = ({ post, onLike, onComment, onDeletePost, onDeleteComment }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  const [likesCount, setLikesCount] = useState(post?.likes?.length || 0);
  const [comments, setComments] = useState(post?.comments || []);
  const [isLoading, setIsLoading] = useState(false);

  // Deletion UI State
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox UI State
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      } else if (e.key === 'ArrowLeft' && post?.images?.length > 1) {
        setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : post.images.length - 1));
      } else if (e.key === 'ArrowRight' && post?.images?.length > 1) {
        setSelectedImageIndex(prev => (prev < post.images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, post?.images]);

  // Guard against missing post
  if (!post || !post._id) {
    return null;
  }

  // Ownership checks
  const postAuthorId = post.user?._id || post.user;
  const isPostOwner = postAuthorId && user?._id && postAuthorId.toString() === user._id.toString();

  const handleLike = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(`http://localhost:5000/api/posts/${post._id}/like`);
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
      if (onLike) onLike(post._id);
    } catch (error) {
      toast.error('Failed to like post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setIsLoading(true);
      const { data } = await axios.post(`http://localhost:5000/api/posts/${post._id}/comment`, { 
        text: comment 
      });
      
      // The response should contain the updated post with the new comment
      const newComment = data.comments[data.comments.length - 1];
      setComments([...comments, newComment]);
      setComment('');
      toast.success('Comment added!');
      if (onComment) onComment(post._id);
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeletePost = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:5000/api/posts/${post._id}`);
      toast.success('Post deleted');
      setShowDeletePostModal(false);
      if (onDeletePost) onDeletePost(post._id);
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error(error.response?.data?.message || "You can't delete this post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:5000/api/posts/${post._id}/comments/${commentToDelete._id}`);
      setComments(prev => prev.filter(c => c._id !== commentToDelete._id));
      toast.success('Comment deleted');
      setCommentToDelete(null);
      if (onDeleteComment) onDeleteComment(post._id, commentToDelete._id);
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error(error.response?.data?.message || "You can't delete this comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Recent';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="p-4 sm:p-5 mb-4 transition-all duration-200 bg-white dark:bg-[#111111] border border-gray-100/80 dark:border-[#1F1F1F] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] rounded-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <Link to={`/students/${post.user?._id}`} className="relative block group shrink-0">
            <div className="p-0.5 bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 rounded-full shadow-sm">
              <img
                src={post.user?.profileImage || 'https://via.placeholder.com/40'}
                alt={post.user?.name}
                className="object-cover border-2 border-white dark:border-[#121212] rounded-full h-10 w-10 transition-transform group-hover:scale-105"
                onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
              />
            </div>
          </Link>
          <div className="min-w-0">
            <Link to={`/students/${post.user?._id}`} className="font-bold text-base text-gray-900 dark:text-white transition-colors hover:text-blue-600 truncate block">
              {post.user?.name || 'Unknown User'}
            </Link>
            <p className="text-xs text-gray-400 dark:text-zinc-400 font-medium leading-none mt-0.5">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {/* Top Right "..." Menu */}
        <div className="relative">
          <button
            onClick={() => setShowPostMenu(!showPostMenu)}
            className="p-1.5 hover:bg-gray-100/80 dark:hover:bg-[#1A1A1A] rounded-full transition-colors cursor-pointer"
          >
            <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-white" />
          </button>

          {showPostMenu && (
            <div className="absolute right-0 top-9 z-30 w-44 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-xl shadow-2xl py-1.5 transition-all">
              {isPostOwner ? (
                <button
                  onClick={() => {
                    setShowPostMenu(false);
                    setShowDeletePostModal(true);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <TrashIcon className="w-4 h-4 mr-2.5 text-red-500" />
                  Delete Post
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowPostMenu(false);
                    toast('Post reported for review', { icon: '🚩' });
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                >
                  <FlagIcon className="w-4 h-4 mr-2.5 text-gray-400 dark:text-zinc-400" />
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="mb-3 text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-normal text-sm sm:text-[15px]">{post.content || ''}</p>

      {/* Post Images */}
      <PostImageGrid images={post.images} onImageClick={setSelectedImageIndex} />

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100/80 dark:border-[#1F1F1F]">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center space-x-2 transition-all p-1.5 rounded-full hover:bg-red-50/60 cursor-pointer ${
              liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            {liked ? (
              <HeartSolidIcon className="w-5 h-5 animate-pulse" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">{likesCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-all p-1.5 rounded-full hover:bg-blue-50/60 cursor-pointer"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">{comments.length}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-500 hover:text-emerald-600 transition-all p-1.5 rounded-full hover:bg-emerald-50/60 cursor-pointer">
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
        
        <button className="p-1.5 text-gray-400 transition-all hover:text-blue-600 hover:bg-blue-50/60 rounded-full cursor-pointer">
          <BookmarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="pt-3 mt-4 border-t border-gray-100 dark:border-[#1F1F1F]">
          <div className="pr-2 space-y-3 overflow-y-auto max-h-60">
            {comments.length === 0 ? (
              <p className="py-2 text-sm text-center text-gray-400 dark:text-zinc-500">No comments yet</p>
            ) : (
              comments.map((commentItem) => {
                const commentAuthorId = commentItem.user?._id || commentItem.user;
                const canDeleteComment = isPostOwner || (commentAuthorId && user?._id && commentAuthorId.toString() === user._id.toString());

                return (
                  <div key={commentItem._id} className="flex items-start justify-between group/comment py-1">
                    <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                      <img
                        src={commentItem.user?.profileImage || 'https://via.placeholder.com/32'}
                        alt={commentItem.user?.name}
                        className="flex-shrink-0 object-cover w-8 h-8 rounded-full border border-gray-200 dark:border-[#262626]"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/32'}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-100 dark:bg-[#161616] border border-gray-200/80 dark:border-[#242424] rounded-xl px-3.5 py-2">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {commentItem.user?.name || 'Student'}
                          </p>
                          <p className="text-xs text-gray-800 dark:text-zinc-300 mt-0.5 whitespace-pre-wrap">
                            {commentItem.text}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 pl-1">
                          {formatDate(commentItem.createdAt)}
                        </p>
                      </div>
                    </div>

                    {canDeleteComment && (
                      <button
                        onClick={() => setCommentToDelete(commentItem)}
                        className="opacity-0 group-hover/comment:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all rounded-lg ml-2 cursor-pointer"
                        title="Delete comment"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleComment} className="flex items-center mt-3 space-x-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 text-sm bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!comment.trim() || isLoading}
              className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      )}

      {/* Delete Post Modal */}
      {showDeletePostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
              <TrashIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Post?</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowDeletePostModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#242424] text-gray-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePost}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
              <TrashIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Comment?</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                Are you sure you want to delete this comment?
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setCommentToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#242424] text-gray-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteComment}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImageIndex !== null && post.images && post.images[selectedImageIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          {/* Lightbox Close Button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-5 right-5 z-50 p-2.5 text-white bg-white/10 hover:bg-white/25 backdrop-blur-md rounded-full transition-all cursor-pointer shadow-lg"
            title="Close image"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Previous Image Arrow */}
          {post.images.length > 1 && (
            <button
              onClick={() => setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : post.images.length - 1))}
              className="absolute left-5 z-50 p-3 text-white bg-white/10 hover:bg-white/25 backdrop-blur-md rounded-full transition-all cursor-pointer shadow-lg"
              title="Previous image"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}

          {/* Expanded Image */}
          <div className="max-w-4xl max-h-[85vh] p-2 flex items-center justify-center">
            <img
              src={post.images[selectedImageIndex]}
              alt={`Full view ${selectedImageIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Next Image Arrow */}
          {post.images.length > 1 && (
            <button
              onClick={() => setSelectedImageIndex(prev => (prev < post.images.length - 1 ? prev + 1 : 0))}
              className="absolute right-5 z-50 p-3 text-white bg-white/10 hover:bg-white/25 backdrop-blur-md rounded-full transition-all cursor-pointer shadow-lg"
              title="Next image"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          )}

          {/* Counter Badge */}
          {post.images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/10">
              {selectedImageIndex + 1} / {post.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;