import "./AutomationStatus.css";

const ESTADOS = {
  inactiva: {
    etiqueta: "Inactiva",
    icono: "○",
    descripcion: "La automatización está desactivada.",
  },

  espera: {
    etiqueta: "En espera",
    icono: "◌",
    descripcion: "La automatización está activa y esperando su próxima ejecución.",
  },

  ejecutando: {
    etiqueta: "Ejecutando",
    icono: "↻",
    descripcion: "El sistema está analizando las entregas.",
  },

  exito: {
    etiqueta: "Éxito",
    icono: "✓",
    descripcion: "La última ejecución terminó correctamente.",
  },

  error: {
    etiqueta: "Error",
    icono: "!",
    descripcion: "La última ejecución presentó un error.",
  },
};

function AutomationStatus({
  estado = "inactiva",
  ultimaEjecucion = "Sin registro",
  proximaEjecucion = "Pendiente",
  ejecuciones = 0,
}) {
  const estadoActual =
    ESTADOS[estado] || ESTADOS.inactiva;

  return (
    <div
      className={`automation-status automation-status-${estado}`}
    >
      <div className="automation-status-icon">
        {estadoActual.icono}
      </div>

      <div className="automation-status-main">
        <span className="automation-status-eyebrow">
          Estado del motor
        </span>

        <strong className="automation-status-label">
          {estadoActual.etiqueta}
        </strong>

        <span className="automation-status-description">
          {estadoActual.descripcion}
        </span>
      </div>

      <div className="automation-status-info">
        <div>
          <span>Última ejecución</span>
          <strong>{ultimaEjecucion}</strong>
        </div>

        <div>
          <span>Próxima ejecución</span>
          <strong>{proximaEjecucion}</strong>
        </div>

        <div>
          <span>Ejecuciones</span>
          <strong>{ejecuciones}</strong>
        </div>
      </div>
    </div>
  );
}

export default AutomationStatus;