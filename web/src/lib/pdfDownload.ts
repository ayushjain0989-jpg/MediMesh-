function latin(text: string) {
  return text.normalize('NFKD').replace(/[^\x20-\x7E]/g, ' ')
}

function pdfEscape(text: string) {
  return latin(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function wrapLine(text: string, width = 88) {
  const words = latin(text).split(/\s+/).filter(Boolean)
  const out: string[] = []
  let row = ''
  for (const word of words) {
    const next = row ? `${row} ${word}` : word
    if (next.length > width) {
      if (row) out.push(row)
      row = word
    } else row = next
  }
  if (row) out.push(row)
  return out.length ? out : ['']
}

function buildPdf(lines: string[]) {
  const wrapped = lines.flatMap((line) => wrapLine(line))
  const chunks: string[][] = []
  const perPage = 44
  for (let i = 0; i < wrapped.length; i += perPage) chunks.push(wrapped.slice(i, i + perPage))
  if (!chunks.length) chunks.push([''])

  const objs: string[] = []
  const kids: string[] = []
  const contentIds: number[] = []

  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objs[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

  chunks.forEach((pageLines, i) => {
    const content = [
      'BT',
      '/F1 11 Tf',
      '15 TL',
      '50 800 Td',
      ...pageLines.map((line, idx) => (idx === 0 ? `(${pdfEscape(line)}) Tj` : `T* (${pdfEscape(line)}) Tj`)),
      'ET',
    ].join('\n')
    const contentId = 6 + i * 2
    const pageId = contentId + 1
    objs[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
    objs[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentId} 0 R /Resources << /Font << /F1 5 0 R >> >> >>`
    kids.push(`${pageId} 0 R`)
    contentIds.push(contentId, pageId)
  })

  objs[2] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${chunks.length} >>`

  const ids = [1, 2, 5, ...contentIds]
  let body = '%PDF-1.4\n'
  const offsets = [0]
  for (const id of ids) {
    offsets[id] = body.length
    body += `${id} 0 obj\n${objs[id]}\nendobj\n`
  }
  const xrefAt = body.length
  const maxId = Math.max(...ids)
  body += `xref\n0 ${maxId + 1}\n`
  body += '0000000000 65535 f \n'
  for (let i = 1; i <= maxId; i++) {
    const off = offsets[i]
    body += off === undefined ? '0000000000 65535 f \n' : `${String(off).padStart(10, '0')} 00000 n \n`
  }
  body += `trailer << /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`
  return body
}

export function downloadTextPdf(fileName: string, lines: string[]) {
  const bytes = new TextEncoder().encode(buildPdf(lines))
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
