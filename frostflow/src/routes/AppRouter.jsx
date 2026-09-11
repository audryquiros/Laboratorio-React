import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login/Login";
import Cursos from "../pages/Cursos/Cursos";
import Entregas from "../pages/Entregas/Entregas";
import Perfil from "../pages/Perfil/Perfil";

function Placeholder({ titulo }) {
  return (
    <div className="placeholder-page">
      <h2>{titulo}</h2>
      <p>Esta sección estará disponible próximamente.</p>
    </div>
  );
}

function RutaProtegida({ children }) {
  const { autenticado, cargando } = useAuth();

  if (cargando) {
    return null;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* APLICACIÓN PROTEGIDA */}
        <Route
          path="/*"
          element={
            <RutaProtegida>
              <Layout>
                <Routes>
                  <Route
                    path="/dashboard"
                    element={
                      <Placeholder titulo="Dashboard" />
                    }
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
                    element={
                      <Placeholder titulo="Calendario" />
                    }
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
                    path="/perfil"
                    element={<Perfil />}
                  />

                  <Route
                    path="/"
                    element={
                      <Navigate
                        to="/dashboard"
                        replace
                      />
                    }
                  />

                  <Route
                    path="*"
                    element={
                      <Navigate
                        to="/dashboard"
                        replace
                      />
                    }
                  />
                </Routes>
              </Layout>
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;