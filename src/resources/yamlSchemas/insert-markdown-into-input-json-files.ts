/**
 * This TypeScript script is designed to read a JSON file and replace specific placeholders within it
 * with the content of Markdown files located in a specified directory.
 *
 * Run with `npm exec ts-node src/resources/yamlSchemas/insert-markdown-into-input-json-files.ts`
 *
 * Why? For the JSON Schema's to render Markdown descriptions when being used for autocompletion,
 * the field { "markdownDescription": "..." } must be filled out. The markdown strings must be
 * flattened to a single line which made them very hard to read and debug.
 *
 * This script allows us to place long descriptions in JSON files instead.
 *
 * The placeholders are expected
 * to be in the format `{{ filename.md }}`, where `filename.md` is the name of the Markdown file whose
 * content should replace the placeholder. The script processes each string value in the JSON object,
 * detects placeholders, reads the corresponding Markdown files, converts their content into a specific
 * string format, and then replaces the placeholder with this content.
 *
 * The transformed JSON is then written to a new file.
 *
 * Example:
 * - Input JSON file content: `{"description": "{{ service.md }}"}`
 * - Contents of `service.md`: `# Service Description\nThis is a service.`
 * - Output JSON file content: `{"description": "# Service Description \n\nThis is a service. "}`
 *
 * The script requires specifying paths to the input JSON file, the output JSON file, and the directory
 * containing the Markdown files. These paths are set at the bottom of the script and can be adjusted
 * according to the user's directory structure.
 */

import * as fs from 'fs';
import * as path from 'path';

// Function to convert Markdown content to the required string format
function convertMarkdownToString(markdownContent: string): string {
  return markdownContent.replace(/\n/g, ' \n');
}

// Function to replace template placeholders with Markdown content
function replacePlaceholdersWithMarkdown(jsonData: any, markdownDirectory: string): any {
  for (const key in jsonData) {
    const value = jsonData[key];
    if (typeof value === 'string') {
      jsonData[key] = processStringForMarkdown(value, markdownDirectory);
    } else if (typeof value === 'object' && value !== null) {
      // Ensure null is not treated as an object
      jsonData[key] = replacePlaceholdersWithMarkdown(value, markdownDirectory);
    }
  }
  return jsonData;
}

// Helper function to process each string in the JSON for Markdown content
function processStringForMarkdown(value: string, markdownDirectory: string): string {
  if (value.startsWith('{{') && value.endsWith('}}')) {
    const markdownFileName = extractMarkdownFileName(value);
    const markdownFilePath = path.join(markdownDirectory, markdownFileName);
    return readAndConvertMarkdownFile(markdownFilePath);
  }
  return value;
}

// Helper function to extract the Markdown file name from a placeholder string
function extractMarkdownFileName(placeholder: string): string {
  // Adjust the slice method to capture the entire filename including the extension
  return placeholder.slice(2, -2).trim(); // Removes '{{' and '}}' and trims any extra spaces
}

// Helper function to read a Markdown file and convert its contents
function readAndConvertMarkdownFile(filePath: string): string {
  if (fs.existsSync(filePath)) {
    const markdownContent = fs.readFileSync(filePath, { encoding: 'utf8' });
    return convertMarkdownToString(markdownContent);
  }
  console.warn(`File not found: ${filePath}`); // Use console.warn for better visibility
  return '[Markdown content not found]'; // Indicate missing content explicitly
}

// Main function to process and transform the JSON file
async function transformJsonFile(
  inputFilePath: string,
  outputFilePath: string,
  markdownDirectory: string
): Promise<void> {
  try {
    const rawData = fs.readFileSync(inputFilePath, { encoding: 'utf8' });
    let jsonData = JSON.parse(rawData);

    // Replace placeholders in the JSON object
    jsonData = replacePlaceholdersWithMarkdown(jsonData, markdownDirectory);

    // Check if the file already exists and is read-only
    const fileExists = fs.existsSync(outputFilePath);
    const fileStats = fs.statSync(outputFilePath);
    const isReadOnly = !(fileStats.mode & fs.constants.W_OK);

    if (fileExists && isReadOnly) {
      fs.unlinkSync(outputFilePath);
    }

    // Write the transformed JSON to the output file
    fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));

    // Make the file read-only as an extra reminder to contributors not to edit it directly
    fs.chmodSync(outputFilePath, '444');
    console.log('File transformed and saved successfully.');
  } catch (error) {
    console.error('An error occurred while transforming the file:', error);
  }
}

// Example usage
const inputFilePathBentofileSchema = path.join(__dirname, 'bentofileSchema.in.json');
const outputFilePathBentofileSchema = path.join(__dirname, 'bentofileSchema.out.json');
const markdownDirectoryBentofileSchemaDescriptions = path.join(__dirname, 'bentofileSchemaDescriptions');
transformJsonFile(
  inputFilePathBentofileSchema,
  outputFilePathBentofileSchema,
  markdownDirectoryBentofileSchemaDescriptions
);

const inputFilePathBentoConfigurationSchema = path.join(__dirname, 'bentoConfigurationSchema.in.json');
const outputFilePathBentoConfigurationSchema = path.join(__dirname, 'bentoConfigurationSchema.out.json');
const markdownDirectoryBentoConfigurationSchemaDescriptions = path.join(
  __dirname,
  'bentoConfigurationSchemaDescriptions'
);
transformJsonFile(
  inputFilePathBentoConfigurationSchema,
  outputFilePathBentoConfigurationSchema,
  markdownDirectoryBentofileSchemaDescriptions
);
