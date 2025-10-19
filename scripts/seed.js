import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Article from '../models/Article.js';
import Award from '../models/Award.js';
import Champion from '../models/Champion.js';

dotenv.config({ path: '../config.env' });

const DB = process.env.MONGO_URI.replace(
  '<PASSWORD>',
  process.env.MONGO_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Course.deleteMany();
    await Article.deleteMany();
    await Award.deleteMany();
    await Champion.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.error('Error deleting data:', err);
  }
  process.exit();
};

const importData = async () => {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      passwordConfirm: hashedPassword,
      role: 'admin',
      isVerified: true,
      phone: '+1234567890',
    });

    console.log('Admin user created:', admin.email);

    // Create sample courses
    const courses = [
      {
        title: 'Introduction to AI',
        description: 'Learn the basics of Artificial Intelligence',
        shortDescription: 'Get started with AI concepts and applications',
        price: 0,
        duration: 4, // weeks
        level: 'beginner',
        category: 'Artificial Intelligence',
        instructor: admin._id,
        isPublished: true,
        requirements: ['Basic programming knowledge', 'High school math'],
        learningOutcomes: [
          'Understand AI fundamentals',
          'Learn about machine learning algorithms',
          'Build simple AI models',
        ],
        syllabus: [
          {
            week: 1,
            title: 'Introduction to AI',
            topics: ['What is AI?', 'History of AI', 'AI applications'],
            resources: [
              {
                title: 'Introduction to AI',
                type: 'video',
                url: 'https://example.com/video1',
                duration: 30,
              },
            ],
          },
        ],
      },
      // Add more sample courses as needed
    ];

    const createdCourses = await Course.create(courses);
    console.log(`${createdCourses.length} courses created`);

    // Create sample articles
    const articles = [
      {
        title: 'The Future of AI in 2023',
        content: 'Artificial Intelligence is rapidly evolving...',
        summary: 'Exploring the latest trends in AI for 2023',
        author: admin._id,
        tags: ['AI', 'Machine Learning', 'Technology'],
        isPublished: true,
        publishedAt: new Date(),
      },
      // Add more sample articles as needed
    ];

    const createdArticles = await Article.create(articles);
    console.log(`${createdArticles.length} articles created`);

    // Create sample awards
    const awards = [
      {
        title: 'Best AI Education Platform 2023',
        description: 'Awarded for excellence in AI education',
        date: new Date('2023-01-15'),
        issuedBy: 'AI Education Foundation',
        category: 'academic',
        isFeatured: true,
      },
      // Add more sample awards as needed
    ];

    const createdAwards = await Award.create(awards);
    console.log(`${createdAwards.length} awards created`);

    // Create initial champions (from TestimonialsSection)
    const champions = [
      {
        name: 'Dhanush',
        company: 'Career Redefine',
        beforeRole: 'Aspiring Data Professional',
        afterRole: 'Data Science Innovator (1st Batch)',
        image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200',
        testimonial:
          "Career Redefine's Data Science course transformed my career. Their dedication, invaluable guidance, ATS resume & job strategies, plus direct referral led me to a great opportunity. In my current company in just 5 months, I learned a year's worth! Grateful for their wisdom. In this challenging market, I hope you continue guiding & inspiring those who've lost hope, showing them the way forward, just as you did for me. Thank you again.",
        rating: 5,
        isFeatured: true,
        order: 1,
      },
      {
        name: 'Rakshith S R',
        company: 'Career Redefine',
        beforeRole: '6-year Career Gap',
        afterRole: 'Full Stack Developer (Selected)',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
        testimonial:
          'After a 6-year gap, switching to IT felt impossible — until I joined Career Redefine. I recently got selected as a Full Stack Developer! The Python and Data Science foundation, practical approach, and Siddu Sir’s mentorship truly changed my journey. Grateful for the support and mindset this platform gave me!',
        rating: 5,
        isFeatured: true,
        order: 2,
      },
      {
        name: 'Manoj Kumar',
        company: 'Career Redefine',
        beforeRole: 'Non-technical Background',
        afterRole: 'Data Analyst (Top MNC) — 3rd Batch Data Science Innovator',
        image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200',
        testimonial:
          'Coming from a non-technical background, I always thought a career in AI & Data Science was out of reach. But joining Career Redefine completely changed my perspective. The structured learning path, hands-on projects, and constant mentor support gave me the confidence to crack multiple interviews. Today, I am working as a Data Analyst in a top MNC, and it feels like a dream come true. I’m grateful to the team for showing me the right direction and helping me believe in myself.',
        rating: 5,
        isFeatured: true,
        order: 3,
      },
    ];

    const createdChampions = await Champion.create(champions);
    console.log(`${createdChampions.length} champions created`);

    console.log('Data successfully imported!');
  } catch (err) {
    console.error('Error importing data:', err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Please specify --import or --delete');
  process.exit(1);
}
