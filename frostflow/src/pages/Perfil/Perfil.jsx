import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCursos } from "../../services/cursosService";
import { getEntregas } from "../../services/entregasService";
import "./Perfil.css";

function Perfil() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

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
        console.error("No se pudo cargar el resumen del perfil.", error);
      } finally {
        setCargando(false);
      }
    };

    cargarResumen();
  }, []);

  const nombre = usuario?.nombre || "Estudiante";
  const email = usuario?.email || "estudiante@frostflow.com";
  const inicial = nombre.charAt(0).toUpperCase();

  const cursosActivos = cursos.filter(
    (curso) => curso.estado === "activo"
  ).length;

  const entregasCompletadas = entregas.filter(
    (entrega) => entrega.estado === "completada"
  ).length;

  const entregasPendientes = entregas.filter(
    (entrega) => entrega.estado !== "completada"
  ).length;

  const porcentaje =
    entregas.length > 0
      ? Math.round(
          (entregasCompletadas / entregas.length) * 100
        )
      : 0;

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  return (
    <main className="perfil-page">
      <section className="perfil-header">
        <div>
          <span className="perfil-eyebrow">
            Cuenta personal
          </span>

          <p className="perfil-description">
            Consulta tu información y el estado general de tu actividad académica.
          </p>
        </div>
      </section>

      <section className="perfil-grid">
        {/* PERFIL PRINCIPAL */}
        <article className="perfil-card perfil-identidad">
          <div className="perfil-avatar-grande">
            {inicial}
          </div>

          <div className="perfil-identidad-info">
            <h2>{nombre}</h2>

            <p>{email}</p>

            <span className="perfil-estado">
              <span></span>
              Cuenta activa
            </span>
          </div>
        </article>

        {/* RESUMEN ACADÉMICO */}
        <article className="perfil-card perfil-resumen">
          <div className="perfil-card-header">
            <div>
              <span className="perfil-section-eyebrow">
                Actividad académica
              </span>

              <h2>Resumen</h2>
            </div>

            <div className="perfil-card-icon">
              ◇
            </div>
          </div>

          {cargando ? (
            <div className="perfil-cargando">
              <div className="perfil-spinner"></div>
              <span>Cargando información...</span>
            </div>
          ) : (
            <div className="perfil-estadisticas">
              <div className="perfil-estadistica">
                <span>Cursos activos</span>
                <strong>{cursosActivos}</strong>
              </div>

              <div className="perfil-estadistica">
                <span>Entregas pendientes</span>
                <strong>{entregasPendientes}</strong>
              </div>

              <div className="perfil-estadistica">
                <span>Completadas</span>
                <strong>{entregasCompletadas}</strong>
              </div>

              <div className="perfil-estadistica">
                <span>Progreso general</span>
                <strong>{porcentaje}%</strong>
              </div>
            </div>
          )}
        </article>

        {/* INFORMACIÓN */}
        <article className="perfil-card">
          <div className="perfil-card-header">
            <div>
              <span className="perfil-section-eyebrow">
                Información
              </span>

              <h2>Datos personales</h2>
            </div>

            <div className="perfil-card-icon">
              ◇
            </div>
          </div>

          <div className="perfil-datos">
            <div className="perfil-dato">
              <span>Nombre</span>
              <strong>{nombre}</strong>
            </div>

            <div className="perfil-dato">
              <span>Correo electrónico</span>
              <strong>{email}</strong>
            </div>

            <div className="perfil-dato">
              <span>Tipo de cuenta</span>
              <strong>Cuenta personal</strong>
            </div>

            <div className="perfil-dato">
              <span>Estado</span>
              <strong className="dato-activo">
                Activa
              </strong>
            </div>
          </div>
        </article>

        {/* SESIÓN */}
        <article className="perfil-card perfil-sesion">
          <div className="perfil-card-header">
            <div>
              <span className="perfil-section-eyebrow">
                Seguridad
              </span>

              <h2>Sesión</h2>
            </div>

            <div className="perfil-card-icon">
              ↗
            </div>
          </div>

          <div className="perfil-sesion-content">
            <div>
              <strong>Sesión actual</strong>

              <p>
                Tu cuenta está actualmente conectada a FrostFlow.
              </p>
            </div>

            <button
              className="perfil-btn-logout"
              onClick={manejarCerrarSesion}
            >
              <span>↪</span>
              Cerrar sesión
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

export default Perfil;