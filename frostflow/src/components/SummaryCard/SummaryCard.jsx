import "./SummaryCard.css";

function SummaryCard({
  etiqueta,
  valor,
  detalle,
  icono = "•",
  tipo = "neutral",
}) {
  return (
    <article className={`summary-card summary-card-${tipo}`}>
      <div className="summary-card-top">
        <span className="summary-card-icon" aria-hidden="true">
          {icono}
        </span>

        <span className="summary-card-label">
          {etiqueta}
        </span>
      </div>

      <div className="summary-card-value">
        {valor}
      </div>

      {detalle && (
        <p className="summary-card-detail">
          {detalle}
        </p>
      )}
    </article>
  );
}

export default SummaryCard;