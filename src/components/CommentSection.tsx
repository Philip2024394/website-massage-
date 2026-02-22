import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, Menu, ThumbsUp } from 'lucide-react';

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  postType: 'job' | 'therapist';
  initialComments?: Comment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, postType, initialComments = [] }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50) + 5);
  const [isLiked, setIsLiked] = useState(false);
  
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          avatar: 'https://ui-avatars.com/api/?name=You&background=f97316&color=fff'
        },
        text: newComment,
        timestamp: 'Just now',
        likes: 0
      };
      
      setComments([comment, ...comments]);
      setNewComment('');
      setIsLoading(false);
    }, 500);
  };

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      {/* Interaction Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all hover:bg-gray-200 ${
              isLiked ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likes}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 py-1 rounded-full transition-all hover:bg-gray-200 text-gray-600"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{comments.length} Comments</span>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-1 rounded-full transition-all hover:bg-gray-200 text-gray-600">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
        
        <button className="p-1 hover:bg-gray-200 rounded-full transition-all text-gray-500">
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 pb-4">
          {/* Add Comment */}
          <div className="flex items-start gap-3 py-4">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">Y</span>
            </div>
            <div className="flex-1">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={`Write a comment about this ${postType}...`}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isLoading}
                  className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{comment.user.name}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">{comment.text}</p>
                  </div>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center gap-4 mt-2 px-4">
                    <button className="text-xs text-gray-600 hover:text-amber-600 font-medium">
                      Like
                    </button>
                    <button className="text-xs text-gray-600 hover:text-amber-600 font-medium">
                      Reply
                    </button>
                    <span className="text-xs text-gray-500">{comment.likes} likes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;