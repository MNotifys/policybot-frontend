import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import type DOMPurify from 'dompurify'
import type Hljs from 'highlight.js'

let purify: typeof DOMPurify | null = null
let hljs: typeof Hljs | null = null

if (import.meta.client) {
  Promise.all([
    import('dompurify'),
    import('highlight.js'),
  ]).then(([dompurifyModule, highlightjs]) => {
    purify = dompurifyModule.default
    hljs = highlightjs.default
  })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function codeRenderer(code: string, lang: string | undefined): string {
  const language = (lang && hljs?.getLanguage(lang)) ? lang : 'plaintext'
  const highlighted = hljs
    ? hljs.highlight(code, { language }).value
    : escapeHtml(code)

  const label = lang || 'text'
  const encoded = encodeURIComponent(code)

  return `<div class="code-block">
  <div class="code-block__header">
    <span class="code-block__lang">${label}</span>
    <button class="code-block__copy" data-code="${encoded}">Copy</button>
  </div>
  <pre><code class="hljs language-${language}">${highlighted}</code></pre>
</div>`
}

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (!hljs) return escapeHtml(code)
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  }),
  {
    gfm: true,
    breaks: true,
    renderer: {
      code({ text, lang }) {
        return codeRenderer(text, lang)
      },
    },
  }
)

export function useMarkdown() {
  function render(raw: string): string {
    if (!raw) return ''

    const html = marked.parse(raw) as string

    if (!import.meta.client || !purify) return html

    return purify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'del', 'code', 'pre', 'blockquote',
        'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr',
        'img', 'span', 'div', 'button',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'target', 'rel',
        'data-code',
      ],
    })
  }

  return { render }
}
