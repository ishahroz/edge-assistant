import './App.css'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Button } from '@mantine/core';

function App() {

  return (
    <MantineProvider>
      <Button variant="filled">Button</Button>
    </MantineProvider>
  )
}

export default App