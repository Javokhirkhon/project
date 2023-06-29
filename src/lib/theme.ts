import { createTheme } from '@mui/material/styles'

// Create a theme instance.
const theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
})

export default theme
