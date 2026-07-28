const Post = require('../models/Post');
const EngagementStat = require('../models/EngagementStat');

// Helper to check valid transitions
const isValidTransition = (currentStatus, newStatus) => {
  const transitions = {
    'Draft': ['Pending Approval'],
    'Pending Approval': ['Approved', 'Rejected'],
    'Approved': ['Scheduled'],
    'Rejected': ['Pending Approval', 'Draft'],
    'Scheduled': ['Published'],
    'Published': []
  };
  
  return transitions[currentStatus]?.includes(newStatus) || false;
};

const createPost = async (req, res) => {
  try {
    const { title, content, platforms, mediaUrl, templateRef, scheduledFor, status } = req.body;

    if (!title || !content || !platforms || !platforms.length) {
      return res.status(400).json({ message: 'Title, content, and at least one platform are required.' });
    }

    // Default status is 'Draft' or 'Pending Approval' based on creation action
    const postStatus = status === 'Pending Approval' ? 'Pending Approval' : 'Draft';

    const post = new Post({
      title,
      content,
      platforms,
      mediaUrl,
      templateRef: templateRef || null,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      status: postStatus,
      authorRef: req.user._id
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post.' });
  }
};

const getPosts = async (req, res) => {
  try {
    const { status, month } = req.query;
    const query = {};

    // Apply status filter
    if (status) {
      query.status = status;
    }

    // Apply month filter (e.g., month = 2026-07)
    if (month) {
      const date = new Date(month + '-01T00:00:00Z');
      if (!isNaN(date.getTime())) {
        const startOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
        const endOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
        query.scheduledFor = {
          $gte: startOfMonth,
          $lte: endOfMonth
        };
      }
    }

    // Admins see all posts. Coordinators see posts from their department/author or all. 
    // Let's populate the author details
    const posts = await Post.find(query)
      .populate('authorRef', 'name email role department')
      .populate('approvedBy', 'name email role')
      .populate('templateRef')
      .sort({ scheduledFor: 1, createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts.' });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorRef', 'name email role department')
      .populate('approvedBy', 'name email role')
      .populate('templateRef');

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Server error fetching post details.' });
  }
};

const updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus, rejectionComment, scheduledFor } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const currentStatus = post.status;

    // Enforce role checks
    // ONLY Admin/Faculty can transition to Approved, Rejected, Scheduled (if schedule changed by admin)
    if (['Approved', 'Rejected', 'Scheduled'].includes(newStatus) && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin/Faculty can approve, reject or schedule posts.' });
    }

    // Special Auto-Promotion:
    // If Admin approves a post, and it has a scheduledFor date, we can promote it directly to 'Scheduled' (or let it go to 'Approved' first).
    // Let's allow transitioning to Approved, and if scheduledFor is set, we will automatically set it to 'Scheduled'.
    let targetStatus = newStatus;
    if (newStatus === 'Approved') {
      const scheduleTime = scheduledFor ? new Date(scheduledFor) : post.scheduledFor;
      if (scheduleTime) {
        targetStatus = 'Scheduled';
        post.scheduledFor = scheduleTime;
      }
    }

    // Verify valid status transition
    if (currentStatus !== targetStatus && !isValidTransition(currentStatus, targetStatus)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${currentStatus} to ${targetStatus}.` 
      });
    }

    // Apply status-specific fields
    if (targetStatus === 'Rejected') {
      post.rejectionComment = rejectionComment || 'Rejected by faculty.';
    } else {
      post.rejectionComment = undefined; // clear comments if approved/resubmitted
    }

    if (targetStatus === 'Scheduled' || targetStatus === 'Approved') {
      post.approvedBy = req.user._id;
      if (scheduledFor) {
        post.scheduledFor = new Date(scheduledFor);
      }
      if (targetStatus === 'Scheduled' && !post.scheduledFor) {
        return res.status(400).json({ message: 'Post must have a scheduled date to be scheduled.' });
      }
    }

    // If student updates draft to Pending Approval
    if (targetStatus === 'Pending Approval') {
      // In case coordinator updated fields
      if (req.body.title) post.title = req.body.title;
      if (req.body.content) post.content = req.body.content;
      if (req.body.platforms) post.platforms = req.body.platforms;
      if (req.body.mediaUrl) post.mediaUrl = req.body.mediaUrl;
      if (req.body.templateRef) post.templateRef = req.body.templateRef;
      if (scheduledFor) post.scheduledFor = new Date(scheduledFor);
    }

    post.status = targetStatus;
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('authorRef', 'name email role department')
      .populate('approvedBy', 'name email role')
      .populate('templateRef');

    res.json(populatedPost);
  } catch (error) {
    console.error('Update post status error:', error);
    res.status(500).json({ message: 'Server error updating post status.' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Student can delete their own drafts or rejected posts. Admin can delete anything.
    if (req.user.role !== 'Admin' && post.authorRef.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this post.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    // Also delete any analytics stats linked
    await EngagementStat.deleteMany({ postRef: req.params.id });

    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error deleting post.' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const stats = await EngagementStat.find()
      .populate('postRef', 'title scheduledFor');
    res.json(stats);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics.' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePostStatus,
  deletePost,
  getAnalytics
};

