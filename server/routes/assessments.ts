import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../config/database.js';
import { assessments, userStats } from '../../shared/schema.js';
import { aiService } from '../services/ai.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.use(requireAuth);

// Generate new assessment
router.post('/generate', async (req: AuthenticatedRequest, res) => {
  try {
    const { subject, topic, keyStage, numQuestions } = req.body;
    const userId = req.user!.id;

    const assessmentData = await aiService.generateAssessment(subject, topic, keyStage, numQuestions);

    const [assessment] = await db.insert(assessments).values({
      userId,
      subject,
      topic,
      questions: assessmentData.questions
    }).returning();

    res.json(assessment);
  } catch (error) {
    console.error('Assessment generation error:', error);
    res.status(500).json({ error: 'Failed to generate assessment' });
  }
});

// Submit assessment
router.post('/:id/submit', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { userAnswers } = req.body;
    const userId = req.user!.id;

    // Get assessment
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    
    if (!assessment || assessment.userId !== userId) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Calculate score
    const questions = assessment.questions as any[];
    const correctAnswers = userAnswers.filter((answer: number, index: number) => 
      answer === questions[index].correct
    ).length;
    
    const score = (correctAnswers / questions.length) * 100;

    // Update assessment
    await db.update(assessments)
      .set({
        userAnswers,
        score: score.toString(),
        isCompleted: true,
        completedAt: new Date()
      })
      .where(eq(assessments.id, id));

    // Update user stats
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    if (stats) {
      const newTotal = stats.assessmentsCompleted + 1;
      const newAverage = ((parseFloat(stats.averageScore) * stats.assessmentsCompleted) + score) / newTotal;
      
      await db.update(userStats)
        .set({
          assessmentsCompleted: newTotal,
          averageScore: newAverage.toString(),
          totalPoints: stats.totalPoints + Math.floor(score)
        })
        .where(eq(userStats.userId, userId));
    } else {
      await db.insert(userStats).values({
        userId,
        assessmentsCompleted: 1,
        averageScore: score.toString(),
        totalPoints: Math.floor(score)
      });
    }

    res.json({
      score,
      correctAnswers,
      totalQuestions: questions.length,
      pointsEarned: Math.floor(score)
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

// Get user assessments
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const userAssessments = await db.select().from(assessments).where(eq(assessments.userId, userId));
    res.json(userAssessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

export default router;
