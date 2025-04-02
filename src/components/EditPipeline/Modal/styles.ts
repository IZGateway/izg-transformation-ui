const styles = {
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '50vw',
    borderRadius: '16px',
    position: 'relative',
  },
  contentContainer: {
    margin: 4,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  title: {
    fontWeight: 700,
    fontSize: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
    width: '75%',
  },
  solutionName: { marginTop: 4, marginBottom: 2 },
  solutionDescription: { marginTop: 0, marginBottom: 4 },
  formControl: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  preconditionToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  preconditionsContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  preconditionRow: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: '#FFF',
    border: '1px solid #E0E0E0',
    paddingX: 4,
    paddingY: 2,
    marginBottom: 3,
    borderRadius: '64px',
    animation: 'fadeIn & fadeOut 0.3s ease-in-out',
    '@media (max-width:600px)': {
      borderRadius: '32px',
      alignItems: 'flex-end',
      gap: 2,
      paddingX: 2,
    },
  },
  divider: { marginBottom: 3 },
  saveButtonContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 'auto',
  },
  saveButton: {
    borderRadius: '30px',
    width: '100%',
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  '@keyframes fadeOut': {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
}

export default styles
