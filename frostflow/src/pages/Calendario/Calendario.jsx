import { useEffect, useMemo, useState } from "react";
import { getCursos } from "../../services/cursosService";
import { getEntregas } from "../../services/entregasService";
import { obtenerTemperatura } from "../../utils/academicRisk";
import TemperatureIndicator from "../../components/TemperatureIndicator/TemperatureIndicator";
import "./Calendario.css";

function Calendario() {
  const [entregas, setEntregas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [mesActual, setMesActual] = useState(() => {
    const fecha = new Date();

    return new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      1
    );
  });

  const cargarCalendario = async () => {
    try {
      setCargando(true);
      setError("");

      const [entregasData, cursosData] =
        await Promise.all([
          getEntregas(),
          getCursos(),
        ]);

      setEntregas(
        Array.isArray(entregasData)
          ? entregasData
          : []
      );

      setCursos(
        Array.isArray(cursosData)
          ? cursosData
          : []
      );
    } catch (err) {
      console.error(
        "Error cargando calendario:",
        err
      );

      setError(
        "No fue posible cargar las entregas."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCalendario();
  }, []);

  const nombreMes = mesActual.toLocaleDateString(
    "es-CR",
    {
      month: "long",
      year: "numeric",
    }
  );

  const primerDia = new Date(
    mesActual.getFullYear(),
    mesActual.getMonth(),
    1
  );

  const ultimoDia = new Date(
    mesActual.getFullYear(),
    mesActual.getMonth() + 1,
    0
  );

  const diasDelMes = ultimoDia.getDate();

  const desplazamiento =
    primerDia.getDay();

  const diasCalendario = useMemo(() => {
    const dias = [];

    for (let i = 0; i < desplazamiento; i += 1) {
      dias.push(null);
    }

    for (let dia = 1; dia <= diasDelMes; dia += 1) {
      dias.push(dia);
    }

    return dias;
  }, [
    diasDelMes,
    desplazamiento,
  ]);

  const obtenerEntregasDelDia = (dia) => {
    if (!dia) return [];

    return entregas.filter((entrega) => {
      if (!entrega.fechaEntrega) {
        return false;
      }

      const fecha = new Date(
        entrega.fechaEntrega
      );

      return (
        fecha.getFullYear() ===
          mesActual.getFullYear() &&
        fecha.getMonth() ===
          mesActual.getMonth() &&
        fecha.getDate() === dia
      );
    });
  };

  const obtenerNombreCurso = (cursoId) => {
    const curso = cursos.find(
      (item) =>
        String(item.id) === String(cursoId)
    );

    return curso?.nombre || "Sin curso";
  };

  const hoy = new Date();

  const esHoy = (dia) => {
    if (!dia) return false;

    return (
      hoy.getFullYear() ===
        mesActual.getFullYear() &&
      hoy.getMonth() ===
        mesActual.getMonth() &&
      hoy.getDate() === dia
    );
  };

  const cambiarMes = (cantidad) => {
    setMesActual(
      (actual) =>
        new Date(
          actual.getFullYear(),
          actual.getMonth() + cantidad,
          1
        )
    );
  };

  const irAlMesActual = () => {
    const fecha = new Date();

    setMesActual(
      new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        1
      )
    );
  };

  const entregasDelMes = useMemo(() => {
    return entregas
      .filter((entrega) => {
        if (!entrega.fechaEntrega) {
          return false;
        }

        const fecha = new Date(
          entrega.fechaEntrega
        );

        return (
          fecha.getFullYear() ===
            mesActual.getFullYear() &&
          fecha.getMonth() ===
            mesActual.getMonth()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.fechaEntrega) -
          new Date(b.fechaEntrega)
      );
  }, [entregas, mesActual]);

  if (cargando) {
    return (
      <section className="calendario-page">
        <div className="calendario-heading">
          <span className="calendario-eyebrow">
            Frost Timeline
          </span>

          <h2>Calendario académico</h2>

          <p>
            Cargando tus fechas de entrega...
          </p>
        </div>

        <div className="calendario-loading">
          <div className="calendario-spinner" />

          <span>
            Organizando tus entregas...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="calendario-page">
      <div className="calendario-heading">
        <div>
          <span className="calendario-eyebrow">
            Frost Timeline
          </span>

          <h2>Calendario académico</h2>

          <p>
            Visualiza tus entregas y fechas
            importantes en una línea temporal.
          </p>
        </div>

        <button
          type="button"
          className="calendario-refresh"
          onClick={cargarCalendario}
        >
          ↻
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="calendario-error">
          <strong>
            No se pudo cargar el calendario
          </strong>

          <span>{error}</span>
        </div>
      )}

      <div className="calendario-layout">
        <section className="calendario-card">
          <div className="calendario-toolbar">
            <div className="calendario-month">
              <h3>
                {nombreMes.charAt(0).toUpperCase() +
                  nombreMes.slice(1)}
              </h3>

              <span>
                {entregasDelMes.length}{" "}
                {entregasDelMes.length === 1
                  ? "entrega"
                  : "entregas"}
              </span>
            </div>

            <div className="calendario-navigation">
              <button
                type="button"
                onClick={() => cambiarMes(-1)}
                aria-label="Mes anterior"
              >
                ‹
              </button>

              <button
                type="button"
                className="calendario-today"
                onClick={irAlMesActual}
              >
                Hoy
              </button>

              <button
                type="button"
                onClick={() => cambiarMes(1)}
                aria-label="Mes siguiente"
              >
                ›
              </button>
            </div>
          </div>

          <div className="calendario-weekdays">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          <div className="calendario-grid">
            {diasCalendario.map(
              (dia, indice) => {
                const entregasDia =
                  obtenerEntregasDelDia(dia);

                return (
                  <div
                    key={
                      dia
                        ? `dia-${dia}`
                        : `vacio-${indice}`
                    }
                    className={`calendario-day ${
                      !dia
                        ? "calendario-day-empty"
                        : ""
                    } ${
                      esHoy(dia)
                        ? "calendario-day-today"
                        : ""
                    }`}
                  >
                    {dia && (
                      <>
                        <div className="calendario-day-number">
                          <span>{dia}</span>

                          {esHoy(dia) && (
                            <small>Hoy</small>
                          )}
                        </div>

                        <div className="calendario-day-deliveries">
                          {entregasDia.map(
                            (entrega) => {
                              const temperatura =
                                obtenerTemperatura(
                                  entrega.fechaEntrega,
                                  entrega.estado
                                );

                              return (
                                <div
                                  key={entrega.id}
                                  className={`calendario-event calendario-event-${temperatura}`}
                                  title={
                                    entrega.titulo
                                  }
                                >
                                  <span>
                                    {entrega.titulo}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </section>

        <aside className="calendario-sidebar">
          <div className="calendario-side-header">
            <span className="calendario-section-eyebrow">
              Este mes
            </span>

            <h3>Próximas entregas</h3>
          </div>

          {entregasDelMes.length === 0 ? (
            <div className="calendario-empty">
              <span>✓</span>

              <strong>
                No hay entregas este mes
              </strong>

              <p>
                Tu calendario está libre por ahora.
              </p>
            </div>
          ) : (
            <div className="calendario-timeline">
              {entregasDelMes.map(
                (entrega) => {
                  const fecha = new Date(
                    entrega.fechaEntrega
                  );

                  const temperatura =
                    obtenerTemperatura(
                      entrega.fechaEntrega,
                      entrega.estado
                    );

                  return (
                    <article
                      className="calendario-timeline-item"
                      key={entrega.id}
                    >
                      <div className="timeline-date">
                        <strong>
                          {fecha.getDate()}
                        </strong>

                        <span>
                          {fecha.toLocaleDateString(
                            "es-CR",
                            {
                              month: "short",
                            }
                          )}
                        </span>
                      </div>

                      <div className="timeline-content">
                        <strong>
                          {entrega.titulo}
                        </strong>

                        <span>
                          {obtenerNombreCurso(
                            entrega.cursoId
                          )}
                        </span>

                        <TemperatureIndicator
                          temperatura={temperatura}
                          compacto
                        />
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default Calendario;