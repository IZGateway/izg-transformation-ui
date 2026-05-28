import { Box, Button, Typography } from '@mui/material'
import { useRouter } from 'next/router'

interface ServiceUnavailablePageProps {
  message?: string
  retryUrl?: string
}

const ServiceUnavailablePage = ({
  message,
  retryUrl,
}: ServiceUnavailablePageProps) => {
  const router = useRouter()

  const handleRetry = () => {
    if (retryUrl && retryUrl !== router.asPath) {
      void router.push(retryUrl)
      return
    }

    router.reload()
  }

  return (
    <Box justifyContent="center" paddingLeft={2} paddingTop={10} maxWidth="48rem">
      <Typography
        variant="h1"
        display="flex"
        flexGrow={1}
        fontWeight={'700'}
        lineHeight={'auto'}
        sx={{
          width: {
            xs: '8em',
            sm: '10em',
            md: '10em',
            lg: '12em',
            xl: '12em',
          },
          fontSize: {
            xs: '2rem',
            sm: '3rem',
            md: '4rem',
            lg: '4rem',
            xl: '4rem',
          },
        }}
      >
        Transformation Service Unavailable
      </Typography>
      <Typography
        paddingTop={2}
        variant="h2"
        flexGrow={1}
        display="flex"
        fontWeight={'400'}
        fontSize={'24px'}
        lineHeight={'32px'}
      >
        The backend service is not responding. Please try again in a few minutes or
        contact your administrator.
      </Typography>
      {message ? (
        <Typography paddingTop={2} color="text.secondary">
          {message}
        </Typography>
      ) : null}
      <Button
        variant="contained"
        color="primary"
        disableElevation
        sx={{
          marginTop: 4,
          width: '15em',
          borderRadius: '30px',
          textTransform: 'none',
        }}
        onClick={handleRetry}
      >
        Try Again
      </Button>
    </Box>
  )
}

export default ServiceUnavailablePage
