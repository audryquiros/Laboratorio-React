import { useEffect } from "react";
import "./ConfirmacionModal.css";

function ConfirmacionModal({
  titulo = "Confirmar acción",
  descripcion = "¿Deseas continuar con esta acción?",
  elemento = "",
  detalle = "",
  textoCancelar = "Cancelar",
  textoConfirmar = "Confirmar",
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    const manejarTecla = (event) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener(
      "keydown",
      manejarTecla
    );

    return () => {
      document.removeEventListener(
        "keydown",
        manejarTecla
      );
    };
  }, [onCancel]);

  return (
    <div
      className="confirmacion-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onCancel();
        }
      }}
    >
      <section
        className="confirmacion-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmacion-titulo"
        aria-describedby="confirmacion-descripcion"
      >
        <div className="confirmacion-icono">
          <span>⌫</span>
        </div>

        <div className="confirmacion-contenido">
          <h2 id="confirmacion-titulo">
            {titulo}
          </h2>

          <p
            id="confirmacion-descripcion"
            className="confirmacion-descripcion"
          >
            {descripcion}
          </p>

          {elemento && (
            <div className="confirmacion-elemento">
              <span>Entrega</span>

              <strong>
                {elemento}
              </strong>
            </div>
          )}

          {detalle && (
            <p className="confirmacion-detalle">
              {detalle}
            </p>
          )}
        </div>

        <div className="confirmacion-acciones">
          <button
            type="button"
            className="confirmacion-cancelar"
            onClick={onCancel}
          >
            {textoCancelar}
          </button>

          <button
            type="button"
            className="confirmacion-eliminar"
            onClick={onConfirm}
          >
            {textoConfirmar}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmacionModal;