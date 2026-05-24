import * as React from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

// Rewrite relative image src attributes to absolute /help/ paths so images
// resolve correctly regardless of which page the HelpPanel is opened on.
const defaultImageRenderer = md.renderer.rules.image!
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const srcIdx = token.attrIndex('src')
  if (srcIdx >= 0) {
    const src = token.attrs[srcIdx][1]
    if (!src.startsWith('http') && !src.startsWith('/')) {
      // Convert e.g. "../images/foo.png" → "/help/images/foo.png"
      token.attrs[srcIdx][1] = `/help/${src.replace(/^(\.\.\/)+/, '')}`
    }
  }
  return defaultImageRenderer(tokens, idx, options, env, self)
}

// Rewrite relative link href attributes to absolute /help/ paths, resolved
// relative to the current doc's directory (passed via md.render env.docPath).
const defaultLinkRenderer = md.renderer.rules.link_open ??
  function(tokens: any, idx: any, options: any, env: any, self: any) {
    return self.renderToken(tokens, idx, options)
  }
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const hrefIdx = token.attrIndex('href')
  if (hrefIdx >= 0) {
    const href = token.attrs[hrefIdx][1]
    if (!href.startsWith('http') && !href.startsWith('/') && !href.startsWith('#') && !href.startsWith('mailto:')) {
      // Resolve relative to the current doc's directory using URL resolution.
      // env.docPath is e.g. "pipelines/index", so its dir is "pipelines/".
      const docPath: string = env?.docPath ?? ''
      const dir = docPath.substring(0, docPath.lastIndexOf('/') + 1)
      const base = new URL(`/help/${dir}`, 'http://x')
      token.attrs[hrefIdx][1] = new URL(href, base).pathname
    }
  }
  return defaultLinkRenderer(tokens, idx, options, env, self)
}

const MIN_PANEL_WIDTH = 420
const MAIN_CONTENT_RESERVE = 400  // px to always leave for nav + main content
const KEYBOARD_STEP = 20
const KEYBOARD_STEP_LARGE = 100  // Shift+Arrow

interface HelpPanelProps {
  docPath: string  // relative path under /help/, e.g. "pipelines/index"
  title: string
  open: boolean
  onClose: () => void
}

const HelpPanel = ({ docPath, title, open, onClose }: HelpPanelProps) => {
  const [panelWidth, setPanelWidth] = React.useState(MIN_PANEL_WIDTH)
  const [currentDocPath, setCurrentDocPath] = React.useState(docPath)
  const [content, setContent] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)

  // Sync when the parent changes the docPath prop (e.g. user navigates to a new page)
  React.useEffect(() => {
    setCurrentDocPath(docPath)
  }, [docPath])

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(false)
    setContent(null)

    fetch(`/help/${currentDocPath}.md`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        setContent(md.render(text, { docPath: currentDocPath }))
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [open, currentDocPath])

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a')
    if (!anchor) return
    const href = anchor.getAttribute('href') ?? ''
    if (href.startsWith('/help/')) {
      e.preventDefault()
      setCurrentDocPath(href.replace(/^\/help\//, '').replace(/\.md$/, ''))
    }
  }

  const clampWidth = (w: number) =>
    Math.min(Math.max(w, MIN_PANEL_WIDTH), window.innerWidth - MAIN_CONTENT_RESERVE)

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = panelWidth
    const onMouseMove = (ev: MouseEvent) => {
      setPanelWidth(clampWidth(startWidth + (startX - ev.clientX)))
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const handleResizeKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setPanelWidth(prev => clampWidth(prev + step))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setPanelWidth(prev => clampWidth(prev - step))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setPanelWidth(MIN_PANEL_WIDTH)
    } else if (e.key === 'End') {
      e.preventDefault()
      setPanelWidth(window.innerWidth - MAIN_CONTENT_RESERVE)
    }
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: panelWidth, minWidth: MIN_PANEL_WIDTH, position: 'relative', p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Drag handle on left edge to resize the panel.
            role="separator" makes this a keyboard-operable splitter (ARIA 1.1).
            ArrowLeft/Right to resize; Shift+Arrow for larger steps; Home/End for min/max. */}
        <Box
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize help panel"
          aria-valuenow={panelWidth}
          aria-valuemin={MIN_PANEL_WIDTH}
          aria-valuemax={typeof window !== 'undefined' ? window.innerWidth - MAIN_CONTENT_RESERVE : 1024}
          tabIndex={0}
          onMouseDown={handleResizeMouseDown}
          onKeyDown={handleResizeKeyDown}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            cursor: 'ew-resize',
            zIndex: 1,
            '&:hover': { bgcolor: 'action.hover' },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '1px',
            },
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton aria-label="Close help panel" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="text.secondary">
            Help content could not be loaded. Please try again later.
          </Typography>
        )}

        {content && (
          <Box
            sx={{ overflow: 'auto', flex: 1, '& img': { maxWidth: '100%' } }}
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </Box>
    </Drawer>
  )
}

export default HelpPanel
