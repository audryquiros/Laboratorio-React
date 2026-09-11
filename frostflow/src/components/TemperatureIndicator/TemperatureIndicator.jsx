const TEMPERATURAS = {
  estable: {
    etiqueta: "Estable",
    icono: "❄️",
    descripcion: "Hay suficiente tiempo para completar la entrega.",
  },
  proximo: {
    etiqueta: "Próximo",
    icono: "🌫️",
    descripcion: "La fecha de entrega se está acercando.",
  },
  urgente: {
    etiqueta: "Urgente",
    icono: "🌡️",
    descripcion: "Quedan pocos días para completar la entrega.",
  },
  critico: {
    etiqueta: "Crítico",
    icono: "🔥",
    descripcion: "La entrega requiere atención inmediata.",
  },
  vencido: {
    etiqueta: "Vencido",
    icono: "⚠️",
    descripcion: "La fecha de entrega ya pasó.",
  },
  completada: {
    etiqueta: "Completada",
    icono: "✓",
    descripcion: "La entrega fue completada.",
  },
};

function TemperatureIndicator({
  temperatura = "estable",
  mostrarDescripcion = false,
  compacto = false,
}) {
  const temperaturaNormalizada =
    TEMPERATURAS[temperatura] || TEMPERATURAS.estable;

  return (
    <div
      className={`temperature-indicator temperature-${temperatura} ${
        compacto ? "temperature-compact" : ""
      }`}
      title={temperaturaNormalizada.descripcion}
    >
      <span className="temperature-icon" aria-hidden="true">
        {temperaturaNormalizada.icono}
      </span>

      <div className="temperature-content">
        <span className="temperature-label">
          {temperaturaNormalizada.etiqueta}
        </span>

        {mostrarDescripcion && (
          <span className="temperature-description">
            {temperaturaNormalizada.descripcion}
          </span>
        )}
      </div>
    </div>
  );
}

export default TemperatureIndicator;