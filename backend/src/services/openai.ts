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

export const chatAboutResponses = async (
  responsesData: any,
  userQuestion: string,
  chatHistory: Array<{role: string; content: string}> = []
): Promise<string> => {
  const openAIClient = getClient();

  if (!openAIClient) {
    throw new Error('Azure OpenAI is not configured. Please set the required environment variables.');
  }

  const systemPrompt = `You are a helpful data analyst assistant. You have access to assessment response data and can answer questions about it.
The responses data includes questions, answers, scores, and respondent information.
Provide clear, concise, and insightful answers based on the data provided.

IMPORTANT FORMATTING RULES:
- Do NOT use markdown tables (with | symbols)
- Use bullet points (•, -, *) for lists
- Use numbered lists (1., 2., 3.) for sequential items
- Use bold text (**text**) for emphasis
- Use headers (##, ###) for sections
- Present data using simple text formatting like "Score: 4.5/5" or "Response Rate: 85%"`;

  const dataContext = `Here is the responses data you can analyze:
${JSON.stringify(responsesData, null, 2)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: dataContext },
    ...chatHistory,
    { role: 'user', content: userQuestion }
  ];

  try {
    const response = await openAIClient.getChatCompletions(
      deploymentName,
      messages,
      {
        temperature: 0.7,
        maxTokens: 1000,
      }
    );

    return response.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
  } catch (error: any) {
    console.error('Error in chat about responses:', error);
    throw new Error(`Failed to process chat request: ${error.message}`);
  }
};

export const generateResponsesSummary = async (
  responsesData: any,
  summaryType: string,
  customInstructions?: string
): Promise<string> => {
  const openAIClient = getClient();

  if (!openAIClient) {
    throw new Error('Azure OpenAI is not configured. Please set the required environment variables.');
  }

  const summaryPrompts: Record<string, string> = {
    'overview': 'Provide a comprehensive overview of the responses, including key statistics and general insights.',
    'key-insights': 'Identify and explain the top 5 key insights from the responses. Focus on patterns, trends, and notable findings.',
    'trends': 'Analyze trends in the responses. Look for patterns over time, common themes, and emerging topics.',
    'recommendations': 'Based on the responses, provide actionable recommendations and next steps.',
    'detailed': 'Create a detailed analysis of the responses, including question-by-question breakdown, statistical analysis, and comprehensive insights.',
  };

  const basePrompt = summaryPrompts[summaryType] || summaryPrompts['overview'];
  const finalPrompt = customInstructions
    ? `${basePrompt}\n\nAdditional instructions: ${customInstructions}\n\nStrictly follow these additional instructions.`
    : basePrompt;

  const systemPrompt = `You are an expert data analyst specializing in survey and assessment analysis.
Provide professional, well-structured summaries with clear headings, bullet points, and actionable insights.

CRITICAL FORMATTING RULES:
- NEVER use markdown tables with pipe (|) symbols
- Use bullet points (•, -, *) for lists and data presentation
- Use numbered lists (1., 2., 3.) for sequential information
- Use bold text (**text**) for emphasis and labels
- Use headers (##, ###) for sections
- Present statistics using simple inline format: "Average: 4.5/5 (90%)" or "Count: 45 responses"
- For comparisons, use bullet points like:
  • Option A: 60% (30 responses)
  • Option B: 40% (20 responses)`;

  const dataContext = `Here is the responses data to analyze:
${JSON.stringify(responsesData, null, 2)}`;

  try {
    const response = await openAIClient.getChatCompletions(
      deploymentName,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: dataContext },
        { role: 'user', content: finalPrompt }
      ],
      {
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    return response.choices[0]?.message?.content || 'Unable to generate summary.';
  } catch (error: any) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};
