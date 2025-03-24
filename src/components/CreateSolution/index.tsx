import Container from '../../components/Container'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, ChangeEvent } from 'react'
import Close from '../Close'
import EditIcon from '@mui/icons-material/Edit'
import {
  Typography,
  Tooltip,
  Box,
  IconButton,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  AlertTitle,
  Collapse,
} from '@mui/material'
import RuleInfo from './ruleInfo'
import palette from '../../styles/theme/palette'
import React from 'react'
import CreateRule from './createRule'
import _ from 'lodash'

const CreateSolution = ({
  solutionData,
  requestOperations,
  responseOperations,
}) => {
  return (
    <Container title="Solution">
      <ErrorBoundary>
        <Close />
        <Box
          sx={{
            display: 'flex',
            position: 'relative',
            gap: 4,
            alignItems: 'flex-start',
            marginTop: 4,
          }}
        >
          <Box sx={{ position: 'relative', width: '35%' }}>
            <RuleInfo solutionData={solutionData} />
          </Box>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
              sx={[
                {
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '1em',
                  height: '5em',
                  background: `linear-gradient(to top, rgb(from ${palette.background} r g b / 0) 0%,rgb(from ${palette.background} r g b / 1) 100%)`,
                  // opacity: isScrollable ? (showTopGradient ? 0 : 1) : 0,
                  // transition: showTopGradient
                  //   ? 'opacity 100ms ease-in'
                  //   : 'opacity 100ms ease-out',
                  pointerEvents: 'none',
                  zIndex: 50,
                },
                { zoom: '100% / ' },
              ]}
            />
            <Box
              // onScroll={handleScroll}
              // ref={(element) =>
              //   element && checkScrollability(element as HTMLDivElement)
              // }
              sx={{
                width: '-webkit-fill-available',
                position: 'relative',
                paddingLeft: 1,
                paddingRight: 1,
                paddingBottom: 1,
                maxHeight: 'calc(100vh - 275px)',
                overflowY: 'auto',
              }}
            >
              <CreateRule
                requestOperations={requestOperations}
                responseOperations={responseOperations}
              />
            </Box>
          </Box>
        </Box>
      </ErrorBoundary>
    </Container>
  )
}

export default CreateSolution
