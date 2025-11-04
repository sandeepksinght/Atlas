import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import dotenv from 'dotenv';

dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
const apiKey = process.env.AZURE_OPENAI_API_KEY || '';
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';

let client: OpenAIClient | null = null;

const getClient = () => {
  if (!client && endpoint && apiKey) {
    client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
  }
  return client;
};

export const generateQuestionsFromContent = async (
  content: string,
  assessmentType: string,
  numberOfQuestions: number = 10
): Promise<any[]> => {
  const openAIClient = getClient();

  if (!openAIClient) {
    throw new Error('Azure OpenAI is not configured. Please set the required environment variables.');
  }

  const systemPrompt = `You are an expert at creating ${assessmentType}s. Generate high-quality questions based on the provided content.`;

  const userPrompt = `Create ${numberOfQuestions} ${assessmentType === 'quiz' ? 'quiz questions with correct answers' : 'survey questions'} based on the following content:

${content}

Return the questions in the following JSON format:
[
  {
    "question_text": "Question text here?",
    "question_type": "single_choice" or "multiple_choice" or "text" or "rating",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correct_answer": ${assessmentType === 'quiz' ? '"correct option" or ["option1", "option2"] for multiple choice' : 'null'},
    "points": ${assessmentType === 'quiz' ? '10' : '0'}
  }
]

Important:
- For ${assessmentType}, ${assessmentType === 'quiz' ? 'always include correct_answer and points' : 'set correct_answer to null and points to 0'}
- Use "single_choice" for single answer, "multiple_choice" for multiple answers, "text" for open-ended, "rating" for scale questions
- Ensure questions are clear, relevant, and well-structured
- Return only valid JSON, no additional text`;

  try {
    const response = await openAIClient.getChatCompletions(
      deploymentName,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    const content = response.choices[0]?.message?.content || '[]';

    // Extract JSON from the response (handle code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.substring(7);
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.substring(3);
    }
    if (jsonContent.endsWith('```')) {
      jsonContent = jsonContent.substring(0, jsonContent.length - 3);
    }

    const questions = JSON.parse(jsonContent.trim());
    return questions;
  } catch (error: any) {
    console.error('Error generating questions:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

export const generateQuestionsFromFile = async (
  fileContent: string,
  fileName: string,
  assessmentType: string,
  numberOfQuestions: number = 10
): Promise<any[]> => {
  // For structured files (CSV, JSON), parse and use directly
  // For text files, use AI to generate questions
  return generateQuestionsFromContent(fileContent, assessmentType, numberOfQuestions);
};
