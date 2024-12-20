import React from "react";

const MarkdownParser = ({ text }) => {
  const parseMarkdown = (input) => {
    if (!input) return "";

    // Regular expressions for different Markdown elements
    const headerRegex = /^#+(?=\s)/;
    //const listRegex = /^(\d+\.|\-|\+)\s/;
    const listRegex = /^(\d+\.|-|\+)\s/;
    const blockquoteRegex = /^>\s/;

    // Split the input into lines
    const lines = input.split(/\r?\n/);

    let currentBlock = "";
    let html = "";

    for (const line of lines) {
      // Handle headers
      const headerMatch = line.match(headerRegex);
      if (headerMatch) {
        const level = headerMatch[0].length;
        html += `<h${level}>${line.slice(level).trim()}</h${level}>`;
        continue;
      }

      // Handle lists
      const listMatch = line.match(listRegex);
      if (listMatch) {
        if (!currentBlock || currentBlock !== "list") {
          currentBlock = "list";
          html += "<ul>";
        }
        const item = line.slice(listMatch[0].length).trim();
        html += `<li>${item}</li>`;
        continue;
      }

      // Handle blockquotes
      const blockquoteMatch = line.match(blockquoteRegex);
      if (blockquoteMatch) {
        if (!currentBlock || currentBlock !== "blockquote") {
          currentBlock = "blockquote";
          html += "<blockquote>";
        }
        html += `<p>${line.slice(1).trim()}</p>`;
        continue;
      }

      // Handle paragraphs and inline formatting
      if (currentBlock) {
        html += `${line}<br>`;
      } else {
        // Handle bold, italic, and line breaks within paragraphs
        html += `<p>${line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/__(.*?)__/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/_(.*?)_/g, "<em>$1</em>")
          .replace(/\r?\n/, "<br />")}</p>`;
      }

      // End current block if necessary
      if (currentBlock && !line.trim()) {
        if (currentBlock === "list") {
          html += "</ul>";
        } else if (currentBlock === "blockquote") {
          html += "</blockquote>";
        }
        currentBlock = "";
      }
    }

    return html;
  };

  return <div dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }} />;
};

export default MarkdownParser;