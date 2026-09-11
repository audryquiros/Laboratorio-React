import { useTheme } from "../../context/ThemeContext";
import "./Configuracion.css";

function Configuracion() {
  const {
    tema,
    modoOscuro,
    cambiarTema,
    establecerTema,
  } = useTheme();

  return (
    <main className="configuracion-page">
      <section className="configuracion-header">
        <div>
          <span className="configuracion-eyebrow">
            Preferencias
          </span>

          <p className="configuracion-description">
            Personaliza la experiencia de FrostFlow y consulta el estado de sus automatizaciones.
          </p>
        </div>
      </section>

      <section className="configuracion-grid">
        {/* APARIENCIA */}
        <article className="config-card">
          <div className="config-card-header">
            <div>
              <span className="config-section-eyebrow">
                Interfaz
              </span>

              <h2>Apariencia</h2>

              <p>
                Selecciona el tema visual de FrostFlow.
              </p>
            </div>

            <div className="config-icon">
              ◐
            </div>
          </div>

          <div className="tema-options">
            <button
              type="button"
              className={`tema-option ${
                tema === "light"
                  ? "tema-option-activo"
                  : ""
              }`}
              onClick={() => establecerTema("light")}
            >
              <div className="tema-preview tema-preview-light">
                <div></div>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="tema-info">
                <strong>Claro</strong>
                <span>Interfaz clara</span>
              </div>

              {tema === "light" && (
                <span className="tema-check">
                  ✓
                </span>
              )}
            </button>

            <button
              type="button"
              className={`tema-option ${
                tema === "dark"
                  ? "tema-option-activo"
                  : ""
              }`}
              onClick={() => establecerTema("dark")}
            >
              <div className="tema-preview tema-preview-dark">
                <div></div>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="tema-info">
                <strong>Oscuro</strong>
                <span>Interfaz oscura</span>
              </div>

              {tema === "dark" && (
                <span className="tema-check">
                  ✓
                </span>
              )}
            </button>
          </div>

          <div className="tema-actual">
            <span>Preferencia actual</span>

            <strong>
              {modoOscuro
                ? "Modo oscuro"
                : "Modo claro"}
            </strong>
          </div>

          <button
            type="button"
            className="tema-toggle"
            onClick={cambiarTema}
          >
            Cambiar a{" "}
            {modoOscuro
              ? "modo claro"
              : "modo oscuro"}
          </button>
        </article>

        {/* AUTOMATIZACIÓN */}
        <article className="config-card">
          <div className="config-card-header">
            <div>
              <span className="config-section-eyebrow">
                FrostFlow Engine
              </span>

              <h2>Automatización</h2>

              <p>
                Estado actual de los procesos automáticos.
              </p>
            </div>

            <div className="config-icon">
              ✦
            </div>
          </div>

          <div className="config-list">
            <div className="config-row">
              <div>
                <strong>
                  Análisis automático
                </strong>

                <span>
                  Analiza periódicamente la carga académica.
                </span>
              </div>

              <span className="config-status activo">
                Activo
              </span>
            </div>

            <div className="config-row">
              <div>
                <strong>
                  Detección de riesgo
                </strong>

                <span>
                  Identifica entregas próximas a vencer.
                </span>
              </div>

              <span className="config-status activo">
                Activo
              </span>
            </div>

            <div className="config-row">
              <div>
                <strong>
                  Alertas académicas
                </strong>

                <span>
                  Genera alertas cuando aumenta el riesgo.
                </span>
              </div>

              <span className="config-status activo">
                Activo
              </span>
            </div>
          </div>
        </article>

        {/* SISTEMA */}
        <article className="config-card config-card-full">
          <div className="config-card-header">
            <div>
              <span className="config-section-eyebrow">
                Sistema
              </span>

              <h2>
                Información de FrostFlow
              </h2>

              <p>
                Información general de la aplicación.
              </p>
            </div>

            <div className="config-icon">
              ℹ
            </div>
          </div>

          <div className="sistema-info">
            <div>
              <span>Aplicación</span>
              <strong>FrostFlow</strong>
            </div>

            <div>
              <span>Versión</span>
              <strong>1.0.0</strong>
            </div>

            <div>
              <span>Frontend</span>
              <strong>React + Vite</strong>
            </div>

            <div>
              <span>Datos</span>
              <strong>JSON Server</strong>
            </div>

            <div>
              <span>Automatización</span>
              <strong>n8n</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default Configuracion;