import katex from 'katex';

export function BlockMath({ math }) {
  if (!math) return null;
  try {
    const html = katex.renderToString(String(math), {
      displayMode: true,
      throwOnError: false,
      output: 'html',
      trust: true,
    });
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <code style={{ color: '#cc0000', fontSize: 13, wordBreak: 'break-all' }}>{math}</code>;
  }
}

export function InlineMath({ math }) {
  if (!math) return null;
  try {
    const html = katex.renderToString(String(math), {
      displayMode: false,
      throwOnError: false,
      output: 'html',
      trust: true,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <code style={{ color: '#cc0000', fontSize: 13 }}>{math}</code>;
  }
}
