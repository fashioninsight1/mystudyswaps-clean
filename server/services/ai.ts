import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class AIService {
  async generateAssessment(subject: string, topic: string, keyStage: string, numQuestions: number = 10) {
    const prompt = `Generate ${numQuestions} multiple choice questions for ${subject} - ${topic} suitable for ${keyStage} students. 
    Return as JSON with this structure:
    {
      "questions": [
        {
          "id": "q1",
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "correct": 0,
          "explanation": "Why this is correct"
        }
      ]
    }`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content || '{}');
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error('Failed to generate assessment');
    }
  }

  async generateRevisionGuide(subject: string, topic: string, keyStage: string, sourceText?: string) {
    const prompt = `Create a comprehensive revision guide for ${subject} - ${topic} for ${keyStage} students.
    ${sourceText ? `Base it on this content: ${sourceText}` : ''}
    
    Include:
    - Key concepts and definitions
    - Important facts and figures
    - Practice questions
    - Memory techniques
    
    Format as clear, structured content suitable for students.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }]
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error('Failed to generate revision guide');
    }
  }
}

export const aiService = new AIService();
