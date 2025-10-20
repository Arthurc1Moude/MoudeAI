
'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!content) return null;

  // Avoid rendering complex markdown until after mount to prevent DOM
  // mutations from third-party plugins from interfering with React's
  // commit phase (can cause insertBefore errors). This introduces a
  // small client-side hydration delay for message content.
  if (!mounted) {
    return <div className="markdown-wrapper" />;
  }

  return (
    <div className="markdown-wrapper">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        className={cn("prose prose-sm dark:prose-invert prose-p:whitespace-pre-wrap max-w-full")}
        components={{
          a: ({ ...props }) => (
            <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <div className="relative">
                <pre className="p-4 bg-gray-800/50 rounded-lg overflow-x-auto text-sm">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="bg-muted text-muted-foreground rounded-sm px-1 py-0.5 font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
