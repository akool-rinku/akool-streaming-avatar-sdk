import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { AvatarChat } from './components/AvatarChat'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AvatarChat />
    </ThemeProvider>
  )
}

export default App
