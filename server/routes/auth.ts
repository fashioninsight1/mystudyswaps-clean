import { Router } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/database.js';
import { users } from '../../shared/schema.js';
import { generateToken } from '../config/auth.js';
import { eq } from 'drizzle-orm';
import { emailService } from '../services/email.js';

const router = Router();

// Parent registration
router.post('/register', async (req, res) => {
  try {
    const { email, firstName, lastName, password, children } = req.body;

    // Create parent account
    const [parent] = await db.insert(users).values({
      email,
      firstName,
      lastName,
      role: 'parent'
    }).returning();

    // Create child accounts
    const childAccounts = [];
    for (const child of children || []) {
      const username = `${child.firstName.toLowerCase()}${child.lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
      const childPassword = `${child.firstName.toLowerCase()}123`;

      const [childAccount] = await db.insert(users).values({
        email: null,
        firstName: child.firstName,
        lastName: child.lastName,
        role: 'student',
        age: child.age,
        keyStage: child.keyStage,
        parentId: parent.id,
        studentUsername: username,
        studentPassword: childPassword
      }).returning();

      childAccounts.push({
        ...childAccount,
        username,
        password: childPassword
      });
    }

    // Send credentials email
    if (childAccounts.length > 0) {
      await emailService.sendChildCredentials(email, firstName, childAccounts);
    }

    const token = generateToken({ userId: parent.id });
    
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
router.post('/child-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [child] = await db.select().from(users).where(eq(users.studentUsername, username));

    if (!child || child.studentPassword !== password || child.role !== 'student') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ userId: child.id });
    
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
