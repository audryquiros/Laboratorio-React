import "./AutomationStatus.css";

const ESTADOS = {
  inactiva: {
    etiqueta: "Inactiva",
    descripcion: "La automatización está desactivada.",
    icono: "○",
  },
  ejecutando: {
    etiqueta: "Ejecutando",
    descripcion: "FrostFlow está analizando la información académica.",
    icono: "↻",
  },
  exito: {
    etiqueta: "Ejecución exitosa",
    descripcion: "La última ejecución terminó correctamente.",
    icono: "✓",
  },
  error: {
    etiqueta: "Error",
    descripcion: "Ocurrió un problema durante la última ejecución.",
    icono: "!",
  },
};

function AutomationStatus({
  estado = "inactiva",
  ultimaEjecucion = null,
  siguienteEjecucion = null,
  ejecuciones = 0,
}) {
  const estadoActual = ESTADOS[estado] || ESTADOS.inactiva;

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin registro";

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return "Sin registro";
    }

    return fechaConvertida.toLocaleString("es-CR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className={`automation-status automation-status-${estado}`}>
      <div className="automation-status-main">
        <div className="automation-status-icon">
          {estadoActual.icono}
        </div>

        <div className="automation-status-content">
          <span className="automation-status-eyebrow">
            Estado de automatización
          </span>

          <h3>{estadoActual.etiqueta}</h3>

          <p>{estadoActual.descripcion}</p>
        </div>
      </div>

      <div className="automation-status-details">
        <div className="automation-detail">
          <span>Última ejecución</span>
          <strong>
            {formatearFecha(ultimaEjecucion)}
          </strong>
        </div>

        <div className="automation-detail">
          <span>Próxima ejecución</span>
          <strong>
            {formatearFecha(siguienteEjecucion)}
          </strong>
        </div>

        <div className="automation-detail">
          <span>Ejecuciones</span>
          <strong>{ejecuciones}</strong>
        </div>
      </div>
    </section>
  );
}

export default AutomationStatus;