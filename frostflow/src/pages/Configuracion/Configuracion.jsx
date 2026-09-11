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

      {/* ENCABEZADO */}

      <section className="configuracion-header">
        <div>
          <span className="page-eyebrow">
            Preferencias del sistema
          </span>

          <p className="page-description">
            Personaliza la apariencia de FrostFlow y adapta
            tu espacio académico a tus preferencias.
          </p>
        </div>
      </section>


      {/* CONTENIDO */}

      <section className="configuracion-grid">

        {/* =========================================
            APARIENCIA
        ========================================= */}

        <article className="configuracion-card">

          <div className="configuracion-card-header">

            <div>
              <span className="configuracion-eyebrow">
                Apariencia
              </span>

              <h2>
                Tema de la interfaz
              </h2>

              <p>
                Selecciona el modo visual que prefieras
                para trabajar con FrostFlow.
              </p>
            </div>

            <div className="configuracion-icon">
              {modoOscuro ? "☾" : "☀"}
            </div>

          </div>


          {/* SWITCH */}

          <div className="configuracion-option">

            <div className="configuracion-option-icon">
              {modoOscuro ? "☾" : "☀"}
            </div>

            <div className="configuracion-option-info">

              <strong>
                {modoOscuro
                  ? "Modo oscuro"
                  : "Modo claro"}
              </strong>

              <span>
                {modoOscuro
                  ? "Tema Arctic para ambientes oscuros."
                  : "Tema claro con tonos suaves y limpios."}
              </span>

            </div>

            <button
              type="button"
              className={`theme-switch ${
                modoOscuro
                  ? "theme-switch-active"
                  : ""
              }`}
              onClick={cambiarTema}
              aria-label={
                modoOscuro
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
              aria-pressed={modoOscuro}
            >
              <span></span>
            </button>

          </div>


          {/* PREVISUALIZACIONES */}

          <div className="configuracion-preview-title">
            Vista previa
          </div>

          <div className="configuracion-tema-preview">

            {/* CLARO */}

            <button
              type="button"
              className={`preview-card ${
                tema === "light"
                  ? "preview-card-active"
                  : ""
              }`}
              onClick={() => establecerTema("light")}
            >

              <div className="preview-light">

                <div className="preview-light-sidebar">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="preview-light-content">
                  <span></span>
                  <span></span>

                  <div className="preview-light-card"></div>
                </div>

              </div>

              <strong>
                Claro
              </strong>

              {tema === "light" && (
                <span className="preview-selected">
                  ✓
                </span>
              )}

            </button>


            {/* OSCURO */}

            <button
              type="button"
              className={`preview-card ${
                tema === "dark"
                  ? "preview-card-active"
                  : ""
              }`}
              onClick={() => establecerTema("dark")}
            >

              <div className="preview-dark">

                <div className="preview-dark-sidebar">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="preview-dark-content">
                  <span></span>
                  <span></span>

                  <div className="preview-dark-card"></div>
                </div>

              </div>

              <strong>
                Oscuro
              </strong>

              {tema === "dark" && (
                <span className="preview-selected">
                  ✓
                </span>
              )}

            </button>

          </div>

        </article>


        {/* =========================================
            ESTADO DEL SISTEMA
        ========================================= */}

        <article className="configuracion-card">

          <div className="configuracion-card-header">

            <div>
              <span className="configuracion-eyebrow">
                Preferencia actual
              </span>

              <h2>
                Estado de la interfaz
              </h2>

              <p>
                FrostFlow conserva automáticamente tu
                preferencia para futuras sesiones.
              </p>
            </div>

            <div className="configuracion-icon">
              ✓
            </div>

          </div>


          {/* ESTADO */}

          <div className="configuracion-status">

            <div className="configuracion-status-dot"></div>

            <div>
              <strong>
                {modoOscuro
                  ? "Modo oscuro activo"
                  : "Modo claro activo"}
              </strong>

              <span>
                Tema seleccionado:{" "}
                {tema === "dark"
                  ? "Oscuro"
                  : "Claro"}
              </span>
            </div>

          </div>


          {/* INFORMACIÓN */}

          <div className="configuracion-note">

            <div className="configuracion-note-icon">
              ✦
            </div>

            <div>
              <strong>
                Preferencia guardada
              </strong>

              <p>
                El tema seleccionado se almacena
                automáticamente en este dispositivo.
              </p>
            </div>

          </div>


          {/* RESUMEN */}

          <div className="configuracion-summary">

            <div className="configuracion-summary-item">

              <span>
                Tema actual
              </span>

              <strong>
                {modoOscuro
                  ? "Oscuro"
                  : "Claro"}
              </strong>

            </div>

            <div className="configuracion-summary-item">

              <span>
                Estado
              </span>

              <strong className="summary-active">
                Activo
              </strong>

            </div>

          </div>

        </article>

      </section>

    </main>
  );
}

export default Configuracion;