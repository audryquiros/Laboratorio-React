import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCursos } from "../../services/cursosService";
import { getEntregas } from "../../services/entregasService";
import "./Perfil.css";

function Perfil() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();

  const [cursos, setCursos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const [cursosData, entregasData] = await Promise.all([
          getCursos(),
          getEntregas(),
        ]);

        setCursos(cursosData);
        setEntregas(entregasData);
      } catch (error) {
        console.error("No se pudo cargar el resumen del perfil:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarResumen();
  }, []);

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  const cursosActivos = cursos.filter(
    (curso) => curso.estado === "activo"
  ).length;

  const entregasPendientes = entregas.filter(
    (entrega) => entrega.estado !== "completada"
  ).length;

  const entregasCompletadas = entregas.filter(
    (entrega) => entrega.estado === "completada"
  ).length;

  const porcentajeCompletado =
    entregas.length > 0
      ? Math.round((entregasCompletadas / entregas.length) * 100)
      : 0;

  const inicial =
    usuario?.nombre?.charAt(0).toUpperCase() || "A";

  return (
    <main className="perfil-page">
      <section className="perfil-intro">
        <div>
          <span className="page-eyebrow">Cuenta personal</span>

          <p className="page-description">
            Administra tu información y consulta un resumen
            de tu actividad académica.
          </p>
        </div>
      </section>

      <section className="perfil-layout">
        {/* PERFIL PRINCIPAL */}
        <article className="perfil-card perfil-principal">
          <div className="perfil-cover">
            <div className="perfil-avatar">
              {inicial}
            </div>
          </div>

          <div className="perfil-main-info">
            <span className="perfil-label">
              PERFIL
            </span>

            <h2>
              {usuario?.nombre || "Estudiante"}
            </h2>

            <p>
              {usuario?.email ||
                "estudiante@frostflow.com"}
            </p>

            <span className="perfil-status">
              <i></i>
              Cuenta activa
            </span>
          </div>

          <div className="perfil-details">
            <div className="perfil-detail">
              <span>Nombre</span>
              <strong>
                {usuario?.nombre || "Estudiante"}
              </strong>
            </div>

            <div className="perfil-detail">
              <span>Correo electrónico</span>
              <strong>
                {usuario?.email ||
                  "estudiante@frostflow.com"}
              </strong>
            </div>

            <div className="perfil-detail">
              <span>Periodo académico</span>
              <strong>III 2026</strong>
            </div>

            <div className="perfil-detail">
              <span>Tipo de cuenta</span>
              <strong>Cuenta personal</strong>
            </div>
          </div>
        </article>

        {/* COLUMNA DERECHA */}
        <div className="perfil-side">
          <article className="perfil-card resumen-academico">
            <div className="perfil-card-header">
              <div>
                <span className="section-eyebrow">
                  Actividad
                </span>

                <h2>Resumen académico</h2>
              </div>

              <span className="resumen-icon">
                ✦
              </span>
            </div>

            {cargando ? (
              <div className="perfil-loading">
                <div className="perfil-spinner"></div>
              </div>
            ) : (
              <div className="perfil-stats">
                <div className="perfil-stat">
                  <span>Cursos activos</span>
                  <strong>{cursosActivos}</strong>
                </div>

                <div className="perfil-stat">
                  <span>Entregas pendientes</span>
                  <strong>
                    {entregasPendientes}
                  </strong>
                </div>

                <div className="perfil-stat">
                  <span>Entregas completadas</span>
                  <strong>
                    {entregasCompletadas}
                  </strong>
                </div>

                <div className="perfil-stat">
                  <span>Avance general</span>
                  <strong>
                    {porcentajeCompletado}%
                  </strong>
                </div>
              </div>
            )}
          </article>

          {/* SESIÓN */}
          <article className="perfil-card perfil-sesion">
            <div className="perfil-card-header">
              <div>
                <span className="section-eyebrow">
                  Cuenta
                </span>

                <h2>Sesión actual</h2>
              </div>

              <span className="sesion-icon">
                ◉
              </span>
            </div>

            <div className="sesion-info">
              <div className="sesion-indicador">
                <span></span>
              </div>

              <div>
                <strong>Sesión activa</strong>
                <p>
                  Estás conectado como{" "}
                  {usuario?.nombre || "Estudiante"}.
                </p>
              </div>
            </div>

            <button
              className="btn-cerrar-sesion"
              onClick={manejarCerrarSesion}
            >
              <span>↪</span>
              Cerrar sesión
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Perfil;