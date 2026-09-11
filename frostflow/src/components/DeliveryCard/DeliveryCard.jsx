import TemperatureIndicator from "../TemperatureIndicator/TemperatureIndicator";
import { calcularEstadoAcademico } from "../../utils/academicRisk";
import "./DeliveryCard.css";

function DeliveryCard({
  entrega,
  cursoNombre = "Sin curso",
  onEditar,
  onEliminar,
  onCompletar,
  mostrarAcciones = true,
}) {
  if (!entrega) return null;

  const estadoAcademico = calcularEstadoAcademico(entrega);

  const temperatura =
    entrega.temperatura || estadoAcademico.temperatura;

  const riesgo =
    typeof entrega.riesgo === "number"
      ? entrega.riesgo
      : estadoAcademico.riesgo;

  const progreso = Math.min(
    100,
    Math.max(0, Number(entrega.progreso) || 0)
  );

  const fecha = entrega.fechaEntrega
    ? new Date(entrega.fechaEntrega)
    : null;

  const fechaValida =
    fecha && !Number.isNaN(fecha.getTime());

  const fechaFormateada = fechaValida
    ? fecha.toLocaleDateString("es-CR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Fecha no disponible";

  const horaFormateada = fechaValida
    ? fecha.toLocaleTimeString("es-CR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const estaCompletada =
    entrega.estado === "completada" ||
    temperatura === "completada";

  const claseRiesgo =
    riesgo >= 80
      ? "alto"
      : riesgo >= 50
        ? "medio"
        : "bajo";

  const manejarCompletar = () => {
    if (!estaCompletada && onCompletar) {
      onCompletar(entrega);
    }
  };

  return (
    <article className="delivery-card">
      <div className="delivery-card-header">
        <div className="delivery-card-title">
          <span className="delivery-card-eyebrow">
            {cursoNombre}
          </span>

          <h3>{entrega.titulo}</h3>
        </div>

        <TemperatureIndicator
          temperatura={temperatura}
          compacto
        />
      </div>

      {entrega.descripcion && (
        <p className="delivery-card-description">
          {entrega.descripcion}
        </p>
      )}

      <div className="delivery-card-date">
        <span className="delivery-date-icon">◷</span>

        <div>
          <span className="delivery-date-label">
            Fecha de entrega
          </span>

          <strong>
            {fechaFormateada}
            {horaFormateada && ` · ${horaFormateada}`}
          </strong>
        </div>
      </div>

      <div className="delivery-card-progress">
        <div className="delivery-progress-header">
          <span>Progreso</span>
          <strong>{progreso}%</strong>
        </div>

        <div
          className="delivery-progress-track"
          role="progressbar"
          aria-valuenow={progreso}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="delivery-progress-fill"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <div className="delivery-card-footer">
        <div className={`delivery-risk delivery-risk-${claseRiesgo}`}>
          <span>Riesgo</span>
          <strong>{riesgo}/100</strong>
        </div>

        {mostrarAcciones && (
          <div className="delivery-card-actions">
            {!estaCompletada && onCompletar && (
              <button
                type="button"
                className="delivery-action delivery-action-complete"
                onClick={manejarCompletar}
                title="Marcar como completada"
              >
                ✓
                <span>Completar</span>
              </button>
            )}

            {onEditar && (
              <button
                type="button"
                className="delivery-action"
                onClick={() => onEditar(entrega)}
              >
                Editar
              </button>
            )}

            {onEliminar && (
              <button
                type="button"
                className="delivery-action delivery-action-delete"
                onClick={() => onEliminar(entrega)}
              >
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default DeliveryCard;