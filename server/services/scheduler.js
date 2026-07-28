const cron = require('node-cron');
const Post = require('../models/Post');
const EngagementStat = require('../models/EngagementStat');

// Mock publish logic
const mockPublishPost = async (post) => {
  console.log(`[Scheduler] Publishing post ID: ${post._id} - "${post.title}"`);
  
  const platforms = post.platforms || [];
  const logs = [];

  for (const platform of platforms) {
    console.log(`[Scheduler] Simulating publication of post ${post._id} to platform: ${platform}`);
    
    // Simulate API call latency / response
    const mockTransactionId = `tx_${platform.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`;
    const success = true; // Always succeed in mock publisher

    logs.push({
      platform,
      status: success ? 'Success' : 'Failed',
      timestamp: new Date(),
      mockResponse: {
        message: `Successfully posted to ${platform} via CampusPulse API Gateway.`,
        transactionId: mockTransactionId,
        apiVersion: 'v1.0.0',
        responseCode: 200,
        contentChecksum: Buffer.from(post.content).toString('base64').substring(0, 12)
      }
    });

    // Generate mock engagement data for this published post
    // This feeds the analytics page charts
    const randomLikes = Math.floor(Math.random() * 500) + 50;
    const randomComments = Math.floor(Math.random() * 80) + 10;
    const randomShares = Math.floor(Math.random() * 40) + 5;

    await EngagementStat.create({
      postRef: post._id,
      platform,
      likes: randomLikes,
      comments: randomComments,
      shares: randomShares,
      fetchedAt: new Date()
    });
  }

  // Update post in the DB
  post.status = 'Published';
  post.publishLogs = logs;
  await post.save();
  
  console.log(`[Scheduler] Successfully published post ID: ${post._id}`);
};

const initScheduler = () => {
  console.log('[Scheduler] Initializing CampusPulse Auto-Publish Cron Worker (every 60s)...');
  
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Find posts that are Scheduled and scheduledFor time is past or present
      const duePosts = await Post.find({
        status: 'Scheduled',
        scheduledFor: { $lte: now }
      });

      if (duePosts.length > 0) {
        console.log(`[Scheduler] Found ${duePosts.length} post(s) due for publishing.`);
        for (const post of duePosts) {
          await mockPublishPost(post);
        }
      }
    } catch (error) {
      console.error('[Scheduler] Error in publish cron job:', error);
    }
  });
};

module.exports = {
  initScheduler
};
