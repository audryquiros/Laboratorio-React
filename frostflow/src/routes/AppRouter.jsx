import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Cursos from "../pages/Cursos/Cursos";
import Entregas from "../pages/Entregas/Entregas";
import Calendario from "../pages/Calendario/Calendario";
import Automatizacion from "../pages/Automatizacion/Automatizacion";
import Perfil from "../pages/Perfil/Perfil";
import Configuracion from "../pages/Configuracion/Configuracion";

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
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/*"
          element={
            <RutaProtegida>
              <Layout>
                <Routes>
                  <Route
                    path="/dashboard"
                    element={<Dashboard />}
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
                    element={<Calendario />}
                  />

                  <Route
                    path="/automatizacion"
                    element={<Automatizacion />}
                  />

                  <Route
                    path="/configuracion"
                    element={<Configuracion />}
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