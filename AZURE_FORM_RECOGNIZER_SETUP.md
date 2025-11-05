# Azure Form Recognizer Integration

## Overview

dStudio now supports document text extraction using Azure Form Recognizer API. This enables users to upload various document formats (PDF, images, Office documents) and automatically extract text content for generating assessment questions.

## Supported File Formats

- **PDF** documents
- **Images**: PNG, JPG, JPEG, TIFF, BMP
- **Office Documents**: DOCX, XLSX, PPTX
- **Plain Text**: TXT (fallback without Azure)

## Setup Instructions

### 1. Create Azure Form Recognizer Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Form Recognizer** resource (also called Document Intelligence)
3. Choose your subscription, resource group, and region
4. Select pricing tier (Free tier available for testing)
5. After deployment, go to "Keys and Endpoint"

### 2. Configure Environment Variables

Add the following to your backend `.env` file:

```env
# Azure Form Recognizer
FORM_RECOGNIZER_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
FORM_RECOGNIZER_KEY=your-form-recognizer-key-here
```

Replace:
- `your-resource` with your Azure resource name
- `your-form-recognizer-key-here` with Key 1 or Key 2 from Azure Portal

### 3. Install Dependencies

```bash
cd backend
npm install
```

This will install the `@azure/ai-form-recognizer` package.

### 4. Restart Backend

```bash
npm run dev
# or
npm start
```

## Usage

### API Endpoint

**POST** `/api/assessments/:assessmentId/questions/upload`

### Request

- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body**:
  - `file`: The document file to upload
  - `numberOfQuestions`: Number of questions to generate (default: 10)

### Response

```json
{
  "message": "File processing started",
  "jobId": "job-uuid-here",
  "extractedLength": 5432
}
```

### Example with cURL

```bash
curl -X POST \
  http://localhost:5000/api/assessments/assessment-id/questions/upload \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'file=@/path/to/document.pdf' \
  -F 'numberOfQuestions=15'
```

## Features

### Text Extraction
- Extracts all readable text from documents
- Preserves structure and formatting
- Works with multi-page documents

### Table Detection
- Automatically detects and extracts tables
- Preserves table structure (rows/columns)
- Converts to readable markdown format

### Key-Value Pairs
- Extracts form fields and their values
- Useful for structured documents

### Fallback Support
- If Azure Form Recognizer is not configured, plain text files (.txt) can still be processed
- Other formats will return a clear error message

## Error Handling

### Common Errors

1. **"Azure Form Recognizer is not configured"**
   - Solution: Add FORM_RECOGNIZER_ENDPOINT and FORM_RECOGNIZER_KEY to .env

2. **"Unsupported file format"**
   - Solution: Use one of the supported formats (PDF, PNG, JPG, DOCX, etc.)

3. **"Failed to extract text from document"**
   - Check if the document is not corrupted
   - Verify Azure credentials are correct
   - Check Azure service status

## Architecture

```
User Upload → Backend API → Azure Form Recognizer → Text Extraction → Job Queue → AI Generation
```

### Components

1. **`services/formRecognizer.ts`**: Core service for Azure integration
   - `extractTextFromDocument()`: Main extraction function
   - `extractTextWithLayout()`: Advanced layout analysis
   - `isSupportedFormat()`: Format validation

2. **`controllers/questionController.ts`**: Upload handler
   - File validation
   - Azure API call
   - Job queue management

3. **Worker Process**: Processes extracted text asynchronously
   - Generates questions using AI
   - Updates job status

## Performance

- File size limit: 10MB
- Processing time: 5-30 seconds depending on document complexity
- Async processing: Results available via job polling

## Cost Considerations

### Azure Form Recognizer Pricing

- **Free Tier**: 500 pages/month
- **Standard**: ~$1.50 per 1,000 pages
- Read model: Lower cost for simple text extraction
- Layout model: Higher cost for complex documents

## Testing

### Manual Testing

1. Upload a PDF with text
2. Upload an image with text (e.g., screenshot)
3. Upload a Word document
4. Upload a document with tables
5. Verify extracted text accuracy

### Example Test Documents

- Simple text PDF
- Scanned document image
- Document with tables and charts
- Multi-page document

## Monitoring

Check backend logs for:
- File processing events
- Extraction success/failure
- Extracted text length
- Table/structure detection

## Security

- Files are processed in-memory (not saved to disk)
- Azure credentials stored in environment variables
- JWT authentication required for uploads
- File size limits prevent abuse

## Troubleshooting

### Document not extracting properly

1. Check document quality (OCR works better with clear text)
2. Verify file is not password-protected
3. Try `extractTextWithLayout()` for complex documents

### Azure connection issues

1. Verify endpoint URL is correct
2. Check API key is valid
3. Ensure resource is not deleted/disabled
4. Check Azure service region availability

## Future Enhancements

- [ ] Support for more document types
- [ ] OCR quality settings
- [ ] Language detection
- [ ] Custom model training
- [ ] Batch processing
- [ ] Document classification

## References

- [Azure Form Recognizer Documentation](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/)
- [Azure SDK for JavaScript](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/formrecognizer/ai-form-recognizer)
- [Supported file formats](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/concept-read)
