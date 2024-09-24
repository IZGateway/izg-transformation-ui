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
    flexGrow: 1, // Allow it to grow to take up remaining space
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
    flexGrow: 1, // Allow it to grow to take up remaining space
  },
  preconditionToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  preconditionsContainer: {
    flexGrow: 1, // Allow it to grow to take up remaining space
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: 'calc(100vh - 459px)', // Adjust this value based on the actual height of the bottom section
  },
  preconditionRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  divider: { marginBottom: 3 },
  saveButtonContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 'auto', // Push it to the bottom of the flex container
  },
  saveButton: {
    borderRadius: '30px',
    width: '100%',
  },
}

export default styles
