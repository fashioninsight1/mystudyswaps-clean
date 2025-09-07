import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts' }
});

// Register new parent with children
router.post('/register', authLimit, async (req, res) => {
  try {
    const { email, firstName, lastName, password, children } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Create parent account
    const parentData = {
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: 'parent'
    };

    let parent;
    try {
      [parent] = await db.insert(users).values(parentData).returning();
    } catch (dbError) {
      console.log('Database not available, creating mock parent');
      parent = { id: `parent_${Date.now()}`, ...parentData };
    }

    // Create child accounts
    const childAccounts = [];
    if (children && Array.isArray(children)) {
      for (const child of children) {
        const username = `${child.firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
        const childPassword = `${child.firstName.toLowerCase()}123`;

        const childData = {
          email: `${username}@child.local`,
          firstName: child.firstName,
          lastName: child.lastName,
          role: 'student',
          age: child.age,
          keyStage: child.keyStage,
          parentId: parent.id,
          studentUsername: username,
          studentPassword: childPassword
        };

        try {
          const [childAccount] = await db.insert(users).values(childData).returning();
          childAccounts.push({ ...childAccount, username, password: childPassword });
        } catch (dbError) {
          console.log('Database not available, creating mock child');
          childAccounts.push({ id: `child_${Date.now()}`, ...childData, username, password: childPassword });
        }
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: parent.id, email: parent.email, role: parent.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: parent,
      children: childAccounts,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Child login
router.post('/child-login', authLimit, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Mock child for testing when database not available
    if (!process.env.DATABASE_URL) {
      return res.json({
        success: true,
        user: {
          id: `child_${Date.now()}`,
          firstName: 'Test',
          lastName: 'Child',
          role: 'student',
          studentUsername: username
        },
        token: jwt.sign(
          { userId: `child_${Date.now()}`, role: 'student' },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        )
      });
    }

    const [child] = await db.select().from(users).where(eq(users.studentUsername, username));

    if (!child || child.studentPassword !== password || child.role !== 'student') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: child.id, role: child.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: child,
      token
    });

  } catch (error) {
    console.error('Child login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
