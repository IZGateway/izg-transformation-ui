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

interface HelpPanelProps {
  docPath: string  // relative path under /help/, e.g. "pipelines/index"
  title: string
  open: boolean
  onClose: () => void
}

const HelpPanel = ({ docPath, title, open, onClose }: HelpPanelProps) => {
  const [content, setContent] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(false)
    setContent(null)

    fetch(`/help/${docPath}.md`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        setContent(md.render(text))
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [open, docPath])

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </Box>
    </Drawer>
  )
}

export default HelpPanel
