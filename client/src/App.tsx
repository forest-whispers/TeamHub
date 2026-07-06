import { RouterProvider } from "react-router-dom"
import { AppProviders } from "./shared/providers/AppProviders"
import { router } from "./shared/router"

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

export default App