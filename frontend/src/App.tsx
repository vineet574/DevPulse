import Login from "./components/Login"
import Dashboard from "./components/Dashboard"

function App() {

  const token = localStorage.getItem("token")

  return (
    <>
      {
        token
          ? <Dashboard />
          : <Login />
      }
    </>
  )

}

export default App