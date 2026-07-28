const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Template = require('./models/Template');
const Post = require('./models/Post');
const EngagementStat = require('./models/EngagementStat');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuspulse';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Clearing existing collections...');
    
    await User.deleteMany({});
    await Template.deleteMany({});
    await Post.deleteMany({});
    await EngagementStat.deleteMany({});
    
    console.log('Collections cleared. Seeding users...');
    
    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const studentPasswordHash = await bcrypt.hash('student123', 10);

    const adminUser = new User({
      name: 'Dr. Sarah Jenkins',
      email: 'admin@campus.edu',
      passwordHash: adminPasswordHash,
      role: 'Admin',
      department: 'Computer Science'
    });

    const studentUser = new User({
      name: 'Alex Rivera',
      email: 'student@campus.edu',
      passwordHash: studentPasswordHash,
      role: 'Student',
      department: 'Computer Science'
    });

    await adminUser.save();
    await studentUser.save();
    console.log(`Users seeded. \nAdmin: admin@campus.edu / admin123\nStudent: student@campus.edu / student123`);

    console.log('Seeding templates...');
    const templates = [
      {
        title: 'Weekly Seminar Announcement',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60',
        category: 'Announcement',
        createdBy: adminUser._id
      },
      {
        title: 'Coding Competition Challenge',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60',
        category: 'Event',
        createdBy: adminUser._id
      },
      {
        title: 'Student Spotlight & Achievement',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=60',
        category: 'Achievement',
        createdBy: adminUser._id
      }
    ];

    const seededTemplates = await Template.insertMany(templates);
    console.log('Templates seeded successfully.');

    console.log('Seeding posts...');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const posts = [
      {
        title: 'AI in Medicine Seminar',
        content: 'Join us this Wednesday for an insightful talk by Dr. Emily Vance on how Deep Learning is transforming radiology. Room 402, 4:00 PM.',
        platforms: ['LinkedIn', 'Twitter'],
        mediaUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60',
        templateRef: seededTemplates[0]._id,
        scheduledFor: new Date(currentYear, currentMonth, 5, 10, 0, 0),
        status: 'Published',
        authorRef: studentUser._id,
        approvedBy: adminUser._id,
        publishLogs: [
          {
            platform: 'LinkedIn',
            status: 'Success',
            timestamp: new Date(currentYear, currentMonth, 5, 10, 0, 5),
            mockResponse: { message: 'Posted successfully', transactionId: 'tx_li_98239a' }
          },
          {
            platform: 'Twitter',
            status: 'Success',
            timestamp: new Date(currentYear, currentMonth, 5, 10, 0, 8),
            mockResponse: { message: 'Posted successfully', transactionId: 'tx_tw_88716b' }
          }
        ]
      },
      {
        title: 'Announcing HackCS 2026',
        content: 'Registration is now OPEN for the annual department hackathon. Over $5,000 in prizes and direct recruiting from top sponsors!',
        platforms: ['Instagram', 'LinkedIn', 'Twitter'],
        mediaUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=60',
        templateRef: seededTemplates[1]._id,
        scheduledFor: new Date(currentYear, currentMonth, 12, 9, 0, 0),
        status: 'Published',
        authorRef: studentUser._id,
        approvedBy: adminUser._id,
        publishLogs: [
          {
            platform: 'Instagram',
            status: 'Success',
            timestamp: new Date(currentYear, currentMonth, 12, 9, 0, 4),
            mockResponse: { message: 'Posted successfully', transactionId: 'tx_ig_11239c' }
          },
          {
            platform: 'LinkedIn',
            status: 'Success',
            timestamp: new Date(currentYear, currentMonth, 12, 9, 0, 6),
            mockResponse: { message: 'Posted successfully', transactionId: 'tx_li_33216d' }
          },
          {
            platform: 'Twitter',
            status: 'Success',
            timestamp: new Date(currentYear, currentMonth, 12, 9, 0, 9),
            mockResponse: { message: 'Posted successfully', transactionId: 'tx_tw_44901e' }
          }
        ]
      },
      {
        title: 'Congrats to Robotics Club!',
        content: 'Our department robotics team secured 2nd place in the National RoboCon Competition! Incredible dedication paid off.',
        platforms: ['Instagram', 'LinkedIn'],
        mediaUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=60',
        templateRef: seededTemplates[2]._id,
        scheduledFor: new Date(currentYear, currentMonth, 18, 14, 30, 0),
        status: 'Published',
        authorRef: studentUser._id,
        approvedBy: adminUser._id,
        publishLogs: [
          {
            platform: 'Instagram',
            status: 'Success',
            timestamp: new Date(currentYear, currentMonth, 18, 14, 30, 5),
            mockResponse: { message: 'Posted successfully', transactionId: 'tx_ig_55611f' }
          },
          {
            platform: 'LinkedIn',
            status: 'Success',
            timestamp: new Date(currentYear, currentMonth, 18, 14, 30, 10),
            mockResponse: { message: 'Posted successfully', transactionId: 'tx_li_66723g' }
          }
        ]
      },
      {
        title: 'New Cybersecurity Lab',
        content: 'Thrilled to open our fully upgraded Cyber Range Lab, sponsored by TechCorp. Students can now practice red-team blue-team exercises in real time.',
        platforms: ['LinkedIn'],
        mediaUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=60',
        scheduledFor: new Date(currentYear, currentMonth, 22, 11, 0, 0),
        status: 'Published',
        authorRef: adminUser._id,
        approvedBy: adminUser._id,
        publishLogs: [
          {
            platform: 'LinkedIn',
            status: 'Success',
            timestamp: new Date(currentYear, currentMonth, 22, 11, 0, 3),
            mockResponse: { message: 'Posted successfully', transactionId: 'tx_li_77812h' }
          }
        ]
      },
      {
        title: 'Python for Beginners Workshop',
        content: 'Starting next week, our peer tutors will run a 3-part crash course on Python scripting and data science basics. Sign up now.',
        platforms: ['Instagram', 'Twitter'],
        mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60',
        templateRef: seededTemplates[1]._id,
        scheduledFor: new Date(currentYear, currentMonth, 28, 15, 0, 0),
        status: 'Scheduled',
        authorRef: studentUser._id,
        approvedBy: adminUser._id
      },
      {
        title: 'Welcome New Assistant Professors',
        content: 'We are excited to welcome Dr. Liam Carter and Dr. Priya Sharma to our teaching and research faculty this upcoming semester.',
        platforms: ['LinkedIn'],
        mediaUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=60',
        templateRef: seededTemplates[0]._id,
        scheduledFor: new Date(currentYear, currentMonth, 29, 10, 0, 0),
        status: 'Scheduled',
        authorRef: studentUser._id,
        approvedBy: adminUser._id
      },
      {
        title: 'Fall Semester Registration Reminder',
        content: 'Undergraduates: Course add/drop closes on August 15. Make sure to consult your faculty advisor to clear holds.',
        platforms: ['Twitter'],
        scheduledFor: new Date(currentYear, currentMonth, 30, 9, 30, 0),
        status: 'Approved',
        authorRef: adminUser._id,
        approvedBy: adminUser._id
      },
      {
        title: 'Distinguished Alumni Panel',
        content: 'Hear from our alumni working at Google, Microsoft, and Meta. They will share career navigation strategies and answer your Qs.',
        platforms: ['LinkedIn', 'Twitter'],
        mediaUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=60',
        scheduledFor: new Date(currentYear, currentMonth, 26, 17, 0, 0),
        status: 'Pending Approval',
        authorRef: studentUser._id
      },
      {
        title: 'Unpaid Research Assistant Request',
        content: 'We need student volunteers to clean CSV datasets for a faculty paper. No coding required, just data entry.',
        platforms: ['Twitter'],
        status: 'Rejected',
        rejectionComment: 'We should ensure student research assistants are paid or receiving credit. Please reframe or coordinate with department office.',
        authorRef: studentUser._id
      },
      {
        title: 'Draft Post: Study Tips',
        content: 'Some useful tips for surviving the midterms: start early, make cheat sheets, and take breaks!',
        platforms: ['Instagram'],
        status: 'Draft',
        authorRef: studentUser._id
      }
    ];

    const seededPosts = await Post.insertMany(posts);
    console.log('Posts seeded successfully.');

    console.log('Seeding engagement analytics...');
    // Seed engagement metrics for the published posts
    for (const post of seededPosts) {
      if (post.status === 'Published') {
        for (const platform of post.platforms) {
          await EngagementStat.create({
            postRef: post._id,
            platform,
            likes: Math.floor(Math.random() * 300) + 40,
            comments: Math.floor(Math.random() * 50) + 8,
            shares: Math.floor(Math.random() * 20) + 3,
            fetchedAt: new Date(post.scheduledFor.getTime() + 1000 * 60 * 60 * 2) // 2 hours after post
          });
        }
      }
    }
    console.log('Engagement analytics seeded.');
    console.log('Database seeding complete!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// If run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
