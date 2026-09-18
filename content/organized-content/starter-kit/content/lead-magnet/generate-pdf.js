#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inputFile = path.join(__dirname, 'The-Autonomous-Operators-Prompt-Guide-combined.md');
const outputFile = path.join(__dirname, 'The-Autonomous-Operators-Prompt-Guide.pdf');
const htmlFile = path.join(__dirname, 'temp-pdf.html');

// Read the markdown file
const markdown = fs.readFileSync(inputFile, 'utf-8');

// Simple markdown to HTML conversion
function markdownToHTML(md) {
  let html = md;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Lists
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Tables
  html = html.replace(/\|(.*)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim());
    return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
  });
  html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in HTML template
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>The Autonomous Operator's Prompt Guide</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #e0e0e0;
      padding-bottom: 10px;
      page-break-before: always;
      text-align: center;
    }
    h1:first-of-type {
      page-break-before: auto;
    }
    h2 {
      color: #2a2a2a;
      margin-top: 30px;
      page-break-after: avoid;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 5px;
    }
    h3 {
      color: #3a3a3a;
      margin-top: 20px;
      page-break-after: avoid;
    }
    p {
      margin-bottom: 15px;
    }
    ul {
      margin: 15px 0;
      padding-left: 30px;
    }
    li {
      margin-bottom: 8px;
    }
    strong {
      color: #1a1a1a;
    }
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    pre code {
      background: none;
      padding: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    hr {
      border: none;
      border-top: 2px solid #e0e0e0;
      margin: 20px 0;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <p>${html}</p>
</body>
</html>`;
}

// Convert markdown to HTML
const html = markdownToHTML(markdown);

// Write HTML file
fs.writeFileSync(htmlFile, html);

// Convert HTML to PDF using wkhtmltopdf
try {
  execSync(`wkhtmltopdf --page-size Letter --margin-top 0.75in --margin-bottom 0.75in --margin-left 0.75in --margin-right 0.75in "${htmlFile}" "${outputFile}"`, { stdio: 'inherit' });
  console.log('PDF generated successfully:', outputFile);

  // Clean up temp HTML file
  fs.unlinkSync(htmlFile);
} catch (error) {
  console.error('Error generating PDF:', error);
  process.exit(1);
}
