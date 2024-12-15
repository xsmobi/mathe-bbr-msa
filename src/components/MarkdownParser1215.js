import React from "react";

const MarkdownParser = ({ text }) => {
  const parseMarkdown = (input) => {
    if (!input) return "";

    // Repair unmatched '**', '*', '__', '_'
    const repairedText = input
      .replace(/(\*\*[^*]*)(?!\*\*)/g, "$1**")
      .replace(/(\*[^*]*)(?!\*)/g, "$1*")
      .replace(/(__[^_]*)(?!__)/g, "$1__")
      .replace(/(_[^_]*)(?!_)/g, "$1_");

    // Handle bold (** and __)
    let html = repairedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/__(.*?)__/g, "<strong>$1</strong>");

    // Handle italic (* and _)
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/_(.*?)_/g, "<em>$1</em>");

    // Handle line breaks (\n or //)
    html = html.replace(/(?:\r?\n|\/\/)/g, "<br />");

    // Wrap lines in <p> except inside lists
    html = html
      .split("<br />")
      .map((line) => `<p>${line.trim()}</p>`)
      .join("<br />");

    return html;
  };

  return <div dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }} />;
};

export default MarkdownParser;

