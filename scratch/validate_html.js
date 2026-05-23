const fs = require('fs');
const path = require('path');

try {
  let html = fs.readFileSync('index.html', 'utf8');
  
  // Strip out data URIs from href or src attributes since they contain XML tags
  html = html.replace(/href="data:[^"]*"/g, 'href=""');
  html = html.replace(/src="data:[^"]*"/g, 'src=""');

  // Custom simple stack-based parser to check tag balancing
  const tagRegex = /<\/?([a-zA-Z0-9:-]+)(?:\s+[^>]*?)?(\/?)>/g;
  let match;
  const stack = [];
  const selfClosing = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  let lineNum = 1;
  let lastIndex = 0;

  console.log("Analyzing index.html for tag nesting mismatches (with normal HTML self-closing tags)...");

  while ((match = tagRegex.exec(html)) !== null) {
    const tagText = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = tagText.startsWith('</');
    const isSelfClosing = tagText.endsWith('/>') || (selfClosing.has(tagName) && !isClosing);

    // Calculate line number
    const prefix = html.substring(lastIndex, match.index);
    const newlines = (prefix.match(/\n/g) || []).length;
    lineNum += newlines;
    lastIndex = match.index;

    if (isSelfClosing) {
      continue;
    }

    if (!isClosing) {
      stack.push({ name: tagName, line: lineNum, text: tagText });
    } else {
      if (stack.length === 0) {
        console.error(`Error: Found closing tag </${tagName}> on line ${lineNum} but stack is empty.`);
        process.exit(1);
      }
      const last = stack.pop();
      if (last.name !== tagName) {
        console.error(`Error: Mismatched tag on line ${lineNum}. Found </${tagName}>, but expected </${last.name}> (which was opened on line ${last.line} as ${last.text})`);
        process.exit(1);
      }
    }
  }

  if (stack.length > 0) {
    console.error(`Error: Unclosed tags remaining at end of file:`);
    stack.forEach(t => console.error(`  - <${t.name}> opened on line ${t.line}`));
    process.exit(1);
  }

  console.log("HTML structure is perfectly balanced and well-formed!");
} catch (err) {
  console.error("Parser error:", err);
  process.exit(1);
}
