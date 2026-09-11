import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../../services/usuariosService";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  /* =========================================
     ACCESO DE DEMOSTRACIÓN
  ========================================= */

  const usarAccesoDemo = () => {
    setEmail("estudiante@frostflow.com");
    setPassword("123456");
    setError("");
  };

  /* =========================================
     INICIAR SESIÓN
  ========================================= */

  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setCargando(true);
      setError("");

      const usuario = await loginUsuario(email, password);

      iniciarSesion(usuario);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.message || "No se pudo iniciar sesión. Verifica tus datos."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-page">

      {/* =========================================
          PANEL VISUAL
      ========================================= */}

      <section className="login-visual">

        {/* BRAND */}

        <div className="login-brand">
          <div className="login-brand-mark">
            <span>F</span>
          </div>

          <div>
            <strong>FrostFlow</strong>
            <span>Academic Control</span>
          </div>
        </div>

        {/* CONTENIDO */}

        <div className="login-visual-content">

          <span className="login-eyebrow">
            SMART ACADEMIC CONTROL
          </span>

          <h1>
            Convierte tu carga
            <br />
            académica en <span>claridad.</span>
          </h1>

          <p>
            Organiza tus cursos, controla tus entregas y deja que
            FrostFlow detecte automáticamente qué necesita tu
            atención.
          </p>
        </div>

        {/* TARJETAS DECORATIVAS */}

        <div className="login-decoration">

          <div className="decoration-card decoration-card-main">

            <div className="decoration-card-header">
              <span>Carga académica</span>
              <strong>72%</strong>
            </div>

            <div className="decoration-progress">
              <span></span>
            </div>

            <small>
              Nivel de carga actual
            </small>

          </div>

          <div className="decoration-card decoration-card-small">

            <span>✦</span>

            <div>
              <strong>Automatización activa</strong>
              <small>
                Análisis ejecutándose
              </small>
            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="login-visual-footer">
          FrostFlow • Academic Control
        </div>

      </section>


      {/* =========================================
          PANEL FORMULARIO
      ========================================= */}

      <section className="login-form-section">

        <div className="login-form-container">

          {/* BRAND MOBILE */}

          <div className="login-mobile-brand">

            <div className="login-brand-mark">
              <span>F</span>
            </div>

            <div>
              <strong>FrostFlow</strong>
              <span>Academic Control</span>
            </div>

          </div>


          {/* ENCABEZADO */}

          <div className="login-heading">

            <span>
              BIENVENIDO DE NUEVO
            </span>

            <h2>
              Inicia sesión
            </h2>

            <p>
              Accede a tu espacio académico y continúa donde lo dejaste.
            </p>

          </div>


          {/* FORMULARIO */}

          <form
            className="login-form"
            onSubmit={manejarSubmit}
          >

            {/* CORREO */}

            <div className="login-field">

              <label htmlFor="email">
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                autoComplete="email"
              />

            </div>


            {/* CONTRASEÑA */}

            <div className="login-field">

              <label htmlFor="password">
                Contraseña
              </label>

              <div className="login-password">

                <input
                  id="password"
                  type={
                    mostrarPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setMostrarPassword(
                      (actual) => !actual
                    )
                  }
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarPassword ? "◉" : "○"}
                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div className="login-error">

                <span>!</span>

                <p>{error}</p>

              </div>
            )}


            {/* BOTÓN PRINCIPAL */}

            <button
              type="submit"
              className="login-submit"
              disabled={cargando}
            >

              {cargando ? (
                <>
                  <span className="login-spinner"></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <span>→</span>
                </>
              )}

            </button>

          </form>


          {/* =========================================
              ACCESO DEMO
          ========================================= */}

          <button
            type="button"
            className="login-demo"
            onClick={usarAccesoDemo}
            disabled={cargando}
          >

            <span>✦</span>

            <div>

              <strong>
                Usar acceso de demostración
              </strong>

              <small>
                Completar automáticamente las credenciales de prueba
              </small>

            </div>

          </button>


          {/* FOOTER */}

          <p className="login-footer">
            FrostFlow Academic Control • III 2026
          </p>

        </div>

      </section>

    </main>
  );
}

export default Login;