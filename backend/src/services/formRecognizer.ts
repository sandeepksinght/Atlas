import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';

const endpoint = process.env.FORM_RECOGNIZER_ENDPOINT;
const key = process.env.FORM_RECOGNIZER_KEY;

let client: DocumentAnalysisClient | null = null;

// Initialize client only if credentials are provided
if (endpoint && key) {
  try {
    client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    console.log('Azure Form Recognizer initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Azure Form Recognizer:', error);
  }
}

export interface ExtractedContent {
  text: string;
  tables?: Array<{
    rowCount: number;
    columnCount: number;
    cells: Array<{
      content: string;
      rowIndex: number;
      columnIndex: number;
    }>;
  }>;
  keyValuePairs?: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Extract text and structured data from a document using Azure Form Recognizer
 * Supports PDFs, images (PNG, JPEG, TIFF, BMP), and Office documents
 */
export async function extractTextFromDocument(
  fileBuffer: Buffer,
  fileName: string
): Promise<ExtractedContent> {
  if (!client) {
    throw new Error('Azure Form Recognizer is not configured. Please set FORM_RECOGNIZER_ENDPOINT and FORM_RECOGNIZER_KEY.');
  }

  try {
    console.log(`Processing file: ${fileName} (${fileBuffer.length} bytes)`);

    // Use prebuilt-read model for general document text extraction
    // This model is optimized for reading text from any document
    const poller = await client.beginAnalyzeDocument('prebuilt-read', fileBuffer);

    console.log('Waiting for Form Recognizer to process document...');
    const result = await poller.pollUntilDone();

    if (!result || !result.content) {
      throw new Error('No content extracted from document');
    }

    console.log(`Extracted ${result.content.length} characters from document`);

    // Extract text content
    const extractedContent: ExtractedContent = {
      text: result.content,
    };

    // Extract tables if present
    if (result.tables && result.tables.length > 0) {
      extractedContent.tables = result.tables.map(table => ({
        rowCount: table.rowCount,
        columnCount: table.columnCount,
        cells: table.cells.map(cell => ({
          content: cell.content,
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
        })),
      }));
      console.log(`Extracted ${result.tables.length} tables from document`);
    }

    // Extract key-value pairs if present
    if (result.keyValuePairs && result.keyValuePairs.length > 0) {
      extractedContent.keyValuePairs = result.keyValuePairs
        .filter(kvp => kvp.key && kvp.value)
        .map(kvp => ({
          key: kvp.key!.content || '',
          value: kvp.value!.content || '',
        }));
      console.log(`Extracted ${extractedContent.keyValuePairs.length} key-value pairs from document`);
    }

    return extractedContent;
  } catch (error: any) {
    console.error('Form Recognizer error:', error);
    throw new Error(`Failed to extract text from document: ${error.message}`);
  }
}

/**
 * Extract text from document using layout analysis
 * Better for documents with complex layouts, tables, and structure
 */
export async function extractTextWithLayout(
  fileBuffer: Buffer,
  fileName: string
): Promise<ExtractedContent> {
  if (!client) {
    throw new Error('Azure Form Recognizer is not configured. Please set FORM_RECOGNIZER_ENDPOINT and FORM_RECOGNIZER_KEY.');
  }

  try {
    console.log(`Processing file with layout analysis: ${fileName}`);

    // Use prebuilt-layout model for better structure extraction
    const poller = await client.beginAnalyzeDocument('prebuilt-layout', fileBuffer);
    const result = await poller.pollUntilDone();

    if (!result || !result.content) {
      throw new Error('No content extracted from document');
    }

    const extractedContent: ExtractedContent = {
      text: result.content,
    };

    // Extract tables with better structure
    if (result.tables && result.tables.length > 0) {
      extractedContent.tables = result.tables.map(table => ({
        rowCount: table.rowCount,
        columnCount: table.columnCount,
        cells: table.cells.map(cell => ({
          content: cell.content,
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
        })),
      }));
    }

    return extractedContent;
  } catch (error: any) {
    console.error('Form Recognizer layout error:', error);
    throw new Error(`Failed to extract text with layout: ${error.message}`);
  }
}

/**
 * Check if Form Recognizer is configured and available
 */
export function isFormRecognizerConfigured(): boolean {
  return client !== null;
}

/**
 * Get supported file formats for Form Recognizer
 */
export function getSupportedFormats(): string[] {
  return [
    'pdf',
    'png',
    'jpg',
    'jpeg',
    'tiff',
    'bmp',
    'docx',
    'xlsx',
    'pptx',
  ];
}

/**
 * Check if a file is supported by Form Recognizer
 */
export function isSupportedFormat(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return getSupportedFormats().includes(extension);
}
