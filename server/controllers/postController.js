const Post = require('../models/Post');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, images, community } = req.body;
    
    console.log('📝 Creating post:', { content: content?.substring(0, 50), images: images?.length, community });
    
    // ✅ Validate content
    if (!content && (!images || images.length === 0)) {
      return res.status(400).json({ message: 'Content or images required' });
    }

    // ✅ Create post
    const post = await Post.create({
      user: req.user._id,
      content: content || '',
      images: images || [],
      community: community || null
    });

    await post.populate('user', 'name profileImage');
    
    console.log('✅ Post created:', post._id);
    
    // ✅ If posted in community, notify members
    if (community) {
      const communityData = await require('../models/Community').findById(community);
      if (communityData) {
        // Notify community members
        const members = communityData.members.filter(
          memberId => memberId.toString() !== req.user._id.toString()
        );
        
        for (const memberId of members) {
          await Notification.create({
            user: memberId,
            type: 'community_invite',
            message: `${req.user.name} posted in ${communityData.name}`,
            from: req.user._id,
            link: `/communities/${community}`
          });
        }
      }
    }

    res.status(201).json(post);
    
  } catch (error) {
    console.error('❌ Create post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get posts (feed)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    // ✅ Get user's friends
    const user = await User.findById(req.user._id);
    const friendIds = user?.friends || [];
    
    // ✅ Build query
    const query = {
      $or: [
        { user: { $in: friendIds } },
        { user: req.user._id }
      ]
    };
    
    const posts = await Post.find(query)
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts: posts || [],
      total: total || 0,
      page: parseInt(page) || 1,
      totalPages: Math.ceil((total || 0) / parseInt(limit)) || 1
    });
    
  } catch (error) {
    console.error('❌ Get posts error:', error);
    res.json({
      posts: [],
      total: 0,
      page: 1,
      totalPages: 1
    });
  }
};

// @desc    Like post
// @route   POST /api/posts/:postId/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);
    
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
      
      // ✅ Create notification if not liking own post
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: post.user,
          type: 'like',
          message: `${req.user.name} liked your post`,
          from: req.user._id,
          link: `/dashboard`
        });
      }
    }

    await post.save();
    res.json(post);
    
  } catch (error) {
    console.error('❌ Like post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Comment on post
// @route   POST /api/posts/:postId/comment
// @access  Private
const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text: text.trim()
    };

    post.comments.push(comment);
    await post.save();

    // ✅ Create notification if not commenting on own post
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.user,
        type: 'comment',
        message: `${req.user.name} commented on your post`,
        from: req.user._id,
        link: `/dashboard`
      });
    }

    await post.populate('comments.user', 'name profileImage');
    res.status(201).json(post);
    
  } catch (error) {
    console.error('❌ Comment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:postId
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // ✅ Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
    
  } catch (error) {
    console.error('❌ Delete post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment on post
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Author of comment OR author of post can delete the comment
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.user.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId.toString());
    await post.save();

    await post.populate('user', 'name profileImage');
    await post.populate('comments.user', 'name profileImage');

    res.json(post);
  } catch (error) {
    console.error('❌ Delete comment error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  commentOnPost,
  deletePost,
  deleteComment
};