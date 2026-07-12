import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon, 
  BookmarkIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onLike, onComment }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  const [likesCount, setLikesCount] = useState(post?.likes?.length || 0);
  const [comments, setComments] = useState(post?.comments || []);
  const [isLoading, setIsLoading] = useState(false);

  // Guard against missing post
  if (!post || !post._id) {
    return null;
  }

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
    <div className="p-5 mb-4 transition-shadow bg-white shadow-sm rounded-xl hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/students/${post.user?._id}`}>
            <img
              src={post.user?.profileImage || 'https://via.placeholder.com/40'}
              alt={post.user?.name}
              className="object-cover border-2 border-gray-100 rounded-full h-11 w-11"
              onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
            />
          </Link>
          <div>
            <Link to={`/students/${post.user?._id}`} className="font-semibold transition-colors hover:text-blue-600">
              {post.user?.name || 'Unknown User'}
            </Link>
            <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <p className="mb-4 text-gray-800 whitespace-pre-wrap">{post.content || ''}</p>

      {post.images && post.images.length > 0 && (
        <div className={`grid gap-1.5 mb-4 ${
          post.images.length === 1 ? 'grid-cols-1' : 
          post.images.length === 2 ? 'grid-cols-2' : 
          'grid-cols-3'
        }`}>
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className={`rounded-lg object-cover w-full ${
                post.images.length === 1 ? 'max-h-96' : 'h-48'
              }`}
              onError={(e) => e.target.style.display = 'none'}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center space-x-1.5 transition-colors ${
              liked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
            }`}
          >
            {liked ? (
              <HeartSolidIcon className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{likesCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1.5 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{comments.length}</span>
          </button>
          
          <button className="flex items-center space-x-1.5 text-gray-500 hover:text-green-600 transition-colors">
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
        
        <button className="text-gray-400 transition-colors hover:text-blue-600">
          <BookmarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="pt-3 mt-4 border-t border-gray-100">
          <div className="pr-2 space-y-3 overflow-y-auto max-h-60">
            {comments.length === 0 ? (
              <p className="py-2 text-sm text-center text-gray-400">No comments yet</p>
            ) : (
              comments.map((comment, index) => (
                <div key={index} className="flex items-start space-x-2.5">
                  <img
                    src={comment.user?.profileImage || 'https://via.placeholder.com/32'}
                    alt={comment.user?.name}
                    className="flex-shrink-0 object-cover w-8 h-8 rounded-full"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/32'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg px-3 py-1.5">
                      <p className="text-sm">
                        <span className="font-semibold">{comment.user?.name || 'Unknown'}</span>
                        {' '}
                        <span className="text-gray-700">{comment.text}</span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleComment} className="flex items-center mt-3 space-x-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!comment.trim() || isLoading}
              className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;