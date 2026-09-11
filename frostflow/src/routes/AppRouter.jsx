import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Cursos from "../pages/Cursos/Cursos";
import Entregas from "../pages/Entregas/Entregas";

function Placeholder({ titulo }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        color: "#303543",
      }}
    >
      <h1>FrostFlow</h1>
      <p>{titulo}</p>
    </div>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<Placeholder titulo="Dashboard" />}
        />

        <Route
          path="/cursos"
          element={<Cursos />}
        />

        <Route
          path="/entregas"
          element={<Entregas />}
        />

        <Route
          path="/calendario"
          element={<Placeholder titulo="Calendario" />}
        />

        <Route
          path="/automatizacion"
          element={
            <Placeholder titulo="Automatización" />
          }
        />

        <Route
          path="/configuracion"
          element={
            <Placeholder titulo="Configuración" />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;