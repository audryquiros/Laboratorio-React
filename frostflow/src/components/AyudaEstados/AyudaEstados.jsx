import { useEffect, useRef, useState } from "react";
import "./AyudaEstados.css";

function AyudaEstados() {
  const [abierto, setAbierto] = useState(false);
  const ayudaRef = useRef(null);

  useEffect(() => {
    const manejarClickFuera = (event) => {
      if (
        ayudaRef.current &&
        !ayudaRef.current.contains(event.target)
      ) {
        setAbierto(false);
      }
    };

    const manejarTecla = (event) => {
      if (event.key === "Escape") {
        setAbierto(false);
      }
    };

    document.addEventListener(
      "mousedown",
      manejarClickFuera
    );

    document.addEventListener(
      "keydown",
      manejarTecla
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        manejarClickFuera
      );

      document.removeEventListener(
        "keydown",
        manejarTecla
      );
    };
  }, []);

  const estados = [
    {
      clase: "estable",
      icono: "❄",
      nombre: "Estable",
      descripcion:
        "Faltan más de 7 días para la entrega.",
    },
    {
      clase: "proximo",
      icono: "◌",
      nombre: "Próximo",
      descripcion:
        "Faltan entre 4 y 7 días para la entrega.",
    },
    {
      clase: "urgente",
      icono: "◉",
      nombre: "Urgente",
      descripcion:
        "Faltan entre 1 y 3 días para la entrega.",
    },
    {
      clase: "critico",
      icono: "▲",
      nombre: "Crítico",
      descripcion:
        "La entrega está programada para hoy.",
    },
    {
      clase: "vencido",
      icono: "!",
      nombre: "Vencido",
      descripcion:
        "La fecha de entrega ya pasó.",
    },
    {
      clase: "completada",
      icono: "✓",
      nombre: "Completada",
      descripcion:
        "La entrega fue marcada como entregada.",
    },
  ];

  return (
    <div
      className="ayuda-estados"
      ref={ayudaRef}
    >
      <button
        type="button"
        className={`ayuda-estados-boton ${
          abierto
            ? "ayuda-estados-boton-activo"
            : ""
        }`}
        onClick={() =>
          setAbierto(
            (actual) => !actual
          )
        }
        aria-label="Ayuda sobre los estados"
        aria-expanded={abierto}
      >
        ?
      </button>

      {abierto && (
        <div
          className="ayuda-estados-panel"
          role="dialog"
          aria-label="Significado de los estados"
        >
          <div className="ayuda-estados-header">
            <div>
              <span>
                Referencia
              </span>

              <h3>
                Estados de entrega
              </h3>
            </div>

            <button
              type="button"
              className="ayuda-estados-cerrar"
              onClick={() =>
                setAbierto(false)
              }
              aria-label="Cerrar ayuda"
            >
              ×
            </button>
          </div>

          <p className="ayuda-estados-intro">
            FrostFlow calcula automáticamente
            el nivel de urgencia según el
            tiempo restante.
          </p>

          <div className="ayuda-estados-lista">
            {estados.map(
              (estado) => (
                <div
                  className="ayuda-estado"
                  key={estado.clase}
                >
                  <div
                    className={`ayuda-estado-icono ayuda-estado-${estado.clase}`}
                  >
                    <span>
                      {estado.icono}
                    </span>
                  </div>

                  <div className="ayuda-estado-info">
                    <strong>
                      {estado.nombre}
                    </strong>

                    <p>
                      {estado.descripcion}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AyudaEstados;