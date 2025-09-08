// components/CustomMarkdownRenderer.tsx

import React from "react";

// The component now accepts a 'colors' prop
type Props = {
  content: string;
  colors: {
    textPrimary: string;
    accent1: string;
    // Add other color types if needed inside the renderer
  };
};

const parseInlineElements = (line: string, colors: Props['colors']): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /(\*\*(.*?)\*\*)|(\*(.*?)\*)|(__(.*?)__)|(\[(.*?)\]\((.*?)\))/g;

  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      elements.push(line.substring(lastIndex, match.index));
    }
    if (match[1]) elements.push(<strong key={match.index}>{match[2]}</strong>);
    else if (match[3]) elements.push(<em key={match.index}>{match[4]}</em>);
    else if (match[5]) elements.push(<u key={match.index}>{match[6]}</u>);
    else if (match[7]) {
      elements.push(
        <a key={match.index} href={match[9]} target="_blank" rel="noopener noreferrer" 
           // Use inline styles for the link color
           style={{ color: colors.accent1, textDecoration: 'underline' }}>
          {match[8]}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < line.length) {
    elements.push(line.substring(lastIndex));
  }
  return elements;
};

export default function CustomMarkdownRenderer({ content, colors }: Props) {
  if (!content) return null;
  const lines = content.split("\n");

  return (
    <div>
      {lines.map((line, index) => {
        // Pass the colors object to the parser
        if (line.startsWith("# ")) return <h1 key={index} style={{ fontSize: '2em', fontWeight: 'bold', margin: '0.67em 0' }}>{parseInlineElements(line.substring(2), colors)}</h1>;
        if (line.startsWith("## ")) return <h2 key={index} style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0.83em 0' }}>{parseInlineElements(line.substring(3), colors)}</h2>;
        if (line.startsWith("### ")) return <h3 key={index} style={{ fontSize: '1.17em', fontWeight: 'bold', margin: '1em 0' }}>{parseInlineElements(line.substring(4), colors)}</h3>;
        if (line.startsWith("#### ")) return <h4 key={index} style={{ fontSize: '1em', fontWeight: 'bold', margin: '1.33em 0' }}>{parseInlineElements(line.substring(5), colors)}</h4>;
        if (line.startsWith("##### ")) return <h5 key={index} style={{ fontSize: '0.83em', fontWeight: 'bold', margin: '1.67em 0' }}>{parseInlineElements(line.substring(6), colors)}</h5>;
        if (line.startsWith("###### ")) return <h6 key={index} style={{ fontSize: '0.67em', fontWeight: 'bold', margin: '2em 0' }}>{parseInlineElements(line.substring(7), colors)}</h6>;
        if (line.trim() === "") return <br key={index} />;
        return <p key={index} style={{ lineHeight: 1.6 }}>{parseInlineElements(line, colors)}</p>;
      })}
    </div>
  );
}