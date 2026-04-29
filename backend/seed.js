const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');
const Project = require('./src/models/project.model');
const Task = require('./src/models/task.model');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    const adminPassword = await bcrypt.hash('admin123', 12);
    const memberPassword = await bcrypt.hash('member123', 12);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: adminPassword,
      role: 'admin'
    });

    const member = await User.create({
      name: 'Member User',
      email: 'member@demo.com',
      password: memberPassword,
      role: 'member'
    });

    const member2 = await User.create({
      name: 'John Developer',
      email: 'john@demo.com',
      password: memberPassword,
      role: 'member'
    });

    const project = await Project.create({
      name: 'Web App Redesign',
      description: 'Complete redesign of the company web application with modern UI/UX',
      createdBy: admin._id,
      members: [admin._id, member._id, member2._id],
      color: '#3B82F6',
      status: 'active'
    });

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Build iOS and Android apps using React Native',
      createdBy: admin._id,
      members: [admin._id, member2._id],
      color: '#10B981',
      status: 'active'
    });

    const tasks = await Task.insertMany([
      {
        title: 'Design Homepage Layout',
        description: 'Create wireframes and high-fidelity mockups for the new homepage',
        status: 'done',
        priority: 'high',
        project: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Implement Authentication Flow',
        description: 'Build JWT-based login/signup with protected routes',
        status: 'in-progress',
        priority: 'urgent',
        project: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Set Up Database Schema',
        description: 'Design and implement MongoDB schemas for users, projects, and tasks',
        status: 'done',
        priority: 'high',
        project: project._id,
        assignedTo: member2._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Write API Documentation',
        description: 'Document all REST endpoints with request/response examples',
        status: 'todo',
        priority: 'medium',
        project: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Build Task Dashboard',
        description: 'Create statistics dashboard with charts and filters',
        status: 'in-progress',
        priority: 'high',
        project: project._id,
        assignedTo: member2._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Mobile App Push Notifications',
        description: 'Implement Firebase push notifications for task updates',
        status: 'todo',
        priority: 'medium',
        project: project2._id,
        assignedTo: member2._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'App Store Deployment',
        description: 'Prepare and submit apps to Apple App Store and Google Play',
        status: 'todo',
        priority: 'low',
        project: project2._id,
        assignedTo: member2._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log(`
    ✅ Database seeded successfully!

    Demo Accounts:
    ─────────────────────────────────────────────
    Admin:    admin@demo.com  /  admin123
    Member:   member@demo.com /  member123
    Member:   john@demo.com   /  member123
    ─────────────────────────────────────────────

    Created:
    - 2 Projects (Web App Redesign, Mobile App Dev)
    - 7 Tasks (2 done, 2 in-progress, 3 todo)
    - 1 Overdue task for demo
    `);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
