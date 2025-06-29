import db from './init.js';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  try {
    // Check if data already exists
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (existingUsers.count > 0) {
      console.log('Database already has data, skipping seed...');
      return;
    }

    console.log('Seeding database with sample data...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: hashedPassword
      },
      {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        password: hashedPassword
      },
      {
        email: 'mike.johnson@example.com',
        name: 'Mike Johnson',
        password: hashedPassword
      },
      {
        email: 'sarah.wilson@example.com',
        name: 'Sarah Wilson',
        password: hashedPassword
      }
    ];

    // Insert users
    const insertUser = db.prepare('INSERT INTO users (email, name, password) VALUES (?, ?, ?)');
    for (const user of users) {
      insertUser.run(user.email, user.name, user.password);
    }

    // Create sample documents
    const documents = [
      {
        title: 'Welcome to Our Knowledge Base',
        content: `<h1>Welcome to Our Knowledge Base</h1>
        <p>This is your central hub for all company documentation, processes, and shared knowledge.</p>
        <h2>Getting Started</h2>
        <ul>
          <li>Create new documents using the "New Document" button</li>
          <li>Use @mentions to collaborate with team members</li>
          <li>Search across all documents using the search bar</li>
          <li>Share documents publicly or keep them private</li>
        </ul>
        <p>Happy documenting! 📚</p>`,
        author_id: 1,
        is_public: 1
      },
      {
        title: 'Company Onboarding Guide',
        content: `<h1>Company Onboarding Guide</h1>
        <p>Welcome to the team! This guide will help you get started.</p>
        <h2>First Week Checklist</h2>
        <ul>
          <li>Complete HR paperwork</li>
          <li>Set up your development environment</li>
          <li>Meet with your manager</li>
          <li>Join team Slack channels</li>
          <li>Review company policies</li>
        </ul>
        <h2>Resources</h2>
        <p>Don't hesitate to reach out to @jane.smith for any questions about the onboarding process.</p>`,
        author_id: 2,
        is_public: 0
      },
      {
        title: 'API Documentation',
        content: `<h1>API Documentation</h1>
        <p>This document outlines our REST API endpoints and usage guidelines.</p>
        <h2>Authentication</h2>
        <p>All API requests require a valid JWT token in the Authorization header:</p>
        <pre><code>Authorization: Bearer your-jwt-token</code></pre>
        <h2>Endpoints</h2>
        <h3>Documents</h3>
        <ul>
          <li><code>GET /api/documents</code> - List all accessible documents</li>
          <li><code>POST /api/documents</code> - Create a new document</li>
          <li><code>PUT /api/documents/:id</code> - Update a document</li>
          <li><code>DELETE /api/documents/:id</code> - Delete a document</li>
        </ul>
        <p>For questions about the API, contact @mike.johnson</p>`,
        author_id: 3,
        is_public: 1
      },
      {
        title: 'Team Meeting Notes - Q1 2024',
        content: `<h1>Team Meeting Notes - Q1 2024</h1>
        <h2>January 15, 2024</h2>
        <p><strong>Attendees:</strong> John, Jane, Mike, Sarah</p>
        <h3>Agenda Items</h3>
        <ul>
          <li>Q4 retrospective</li>
          <li>Q1 planning and goals</li>
          <li>New project kickoff</li>
        </ul>
        <h3>Action Items</h3>
        <ul>
          <li>@john.doe to finalize project timeline</li>
          <li>@sarah.wilson to prepare design mockups</li>
          <li>@mike.johnson to set up development environment</li>
        </ul>
        <p>Next meeting: January 29, 2024</p>`,
        author_id: 1,
        is_public: 0
      },
      {
        title: 'Development Best Practices',
        content: `<h1>Development Best Practices</h1>
        <p>Guidelines for maintaining code quality and consistency across our projects.</p>
        <h2>Code Style</h2>
        <ul>
          <li>Use meaningful variable and function names</li>
          <li>Write clear comments for complex logic</li>
          <li>Follow consistent indentation (2 spaces)</li>
          <li>Keep functions small and focused</li>
        </ul>
        <h2>Git Workflow</h2>
        <ul>
          <li>Create feature branches for new work</li>
          <li>Write descriptive commit messages</li>
          <li>Request code reviews before merging</li>
          <li>Keep commits atomic and focused</li>
        </ul>
        <p>Questions? Ask @mike.johnson or @jane.smith</p>`,
        author_id: 3,
        is_public: 1
      },
      {
        title: 'Project Roadmap 2024',
        content: `<h1>Project Roadmap 2024</h1>
        <p>Our strategic plan for the upcoming year.</p>
        <h2>Q1 Goals</h2>
        <ul>
          <li>Launch new knowledge base platform</li>
          <li>Improve user authentication system</li>
          <li>Implement real-time collaboration features</li>
        </ul>
        <h2>Q2 Goals</h2>
        <ul>
          <li>Mobile app development</li>
          <li>Advanced search capabilities</li>
          <li>Integration with third-party tools</li>
        </ul>
        <p>Project leads: @sarah.wilson (Design), @mike.johnson (Backend), @jane.smith (Frontend)</p>`,
        author_id: 4,
        is_public: 0
      }
    ];

    // Insert documents
    const insertDocument = db.prepare('INSERT INTO documents (title, content, author_id, is_public) VALUES (?, ?, ?, ?)');
    const insertVersion = db.prepare('INSERT INTO document_versions (document_id, title, content, author_id, version_number) VALUES (?, ?, ?, ?, 1)');
    
    for (const doc of documents) {
      const result = insertDocument.run(doc.title, doc.content, doc.author_id, doc.is_public);
      
      // Create first version for each document
      insertVersion.run(result.lastInsertRowid, doc.title, doc.content, doc.author_id);
    }

    // Create some document permissions (sharing)
    const permissions = [
      { document_id: 2, user_id: 1, permission: 'view' }, // John can view onboarding guide
      { document_id: 2, user_id: 3, permission: 'edit' }, // Mike can edit onboarding guide
      { document_id: 4, user_id: 2, permission: 'edit' }, // Jane can edit meeting notes
      { document_id: 4, user_id: 3, permission: 'view' }, // Mike can view meeting notes
      { document_id: 6, user_id: 1, permission: 'view' }, // John can view roadmap
      { document_id: 6, user_id: 2, permission: 'edit' }, // Jane can edit roadmap
    ];

    const insertPermission = db.prepare('INSERT INTO document_permissions (document_id, user_id, permission) VALUES (?, ?, ?)');
    for (const perm of permissions) {
      insertPermission.run(perm.document_id, perm.user_id, perm.permission);
    }

    // Create some mentions
    const mentions = [
      { document_id: 2, mentioned_user_id: 2, mentioning_user_id: 1 }, // Jane mentioned in onboarding
      { document_id: 3, mentioned_user_id: 3, mentioning_user_id: 1 }, // Mike mentioned in API docs
      { document_id: 4, mentioned_user_id: 1, mentioning_user_id: 2 }, // John mentioned in meeting notes
      { document_id: 4, mentioned_user_id: 4, mentioning_user_id: 2 }, // Sarah mentioned in meeting notes
      { document_id: 4, mentioned_user_id: 3, mentioning_user_id: 2 }, // Mike mentioned in meeting notes
      { document_id: 5, mentioned_user_id: 3, mentioning_user_id: 1 }, // Mike mentioned in best practices
      { document_id: 5, mentioned_user_id: 2, mentioning_user_id: 1 }, // Jane mentioned in best practices
      { document_id: 6, mentioned_user_id: 4, mentioning_user_id: 1 }, // Sarah mentioned in roadmap
      { document_id: 6, mentioned_user_id: 3, mentioning_user_id: 1 }, // Mike mentioned in roadmap
      { document_id: 6, mentioned_user_id: 2, mentioning_user_id: 1 }, // Jane mentioned in roadmap
    ];

    const insertMention = db.prepare('INSERT INTO mentions (document_id, mentioned_user_id, mentioning_user_id) VALUES (?, ?, ?)');
    for (const mention of mentions) {
      insertMention.run(mention.document_id, mention.mentioned_user_id, mention.mentioning_user_id);
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Sample user accounts:');
    console.log('Email: john.doe@example.com | Password: password123');
    console.log('Email: jane.smith@example.com | Password: password123');
    console.log('Email: mike.johnson@example.com | Password: password123');
    console.log('Email: sarah.wilson@example.com | Password: password123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};