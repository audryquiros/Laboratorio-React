import { useEffect, useMemo, useState } from "react";
import { getCursos } from "../../services/cursosService";
import { getEntregas } from "../../services/entregasService";
import { getAlertas } from "../../services/alertasService";
import {
  calcularEstadoAcademico,
  obtenerTemperatura,
} from "../../utils/academicRisk";

import SummaryCard from "../../components/SummaryCard/SummaryCard";
import DeliveryCard from "../../components/DeliveryCard/DeliveryCard";
import TemperatureIndicator from "../../components/TemperatureIndicator/TemperatureIndicator";
import AutomationStatus from "../../components/AutomationStatus/AutomationStatus";

import "./Dashboard.css";

function Dashboard() {
  const [cursos, setCursos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [alertas, setAlertas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [estadoAutomatizacion, setEstadoAutomatizacion] =
    useState("ejecutando");

  const [ultimaEjecucion, setUltimaEjecucion] = useState(null);
  const [siguienteEjecucion, setSiguienteEjecucion] = useState(null);
  const [ejecuciones, setEjecuciones] = useState(0);

  const cargarDashboard = async () => {
    try {
      setError("");

      const [cursosData, entregasData, alertasData] =
        await Promise.all([
          getCursos(),
          getEntregas(),
          getAlertas(),
        ]);

      setCursos(Array.isArray(cursosData) ? cursosData : []);
      setEntregas(Array.isArray(entregasData) ? entregasData : []);
      setAlertas(Array.isArray(alertasData) ? alertasData : []);

      setEstadoAutomatizacion("exito");

      const ahora = new Date();

      setUltimaEjecucion(ahora.toISOString());

      setEjecuciones((actual) => actual + 1);

      const siguiente = new Date(
        ahora.getTime() + 10 * 60 * 1000
      );

      setSiguienteEjecucion(siguiente.toISOString());
    } catch (err) {
      console.error("Error cargando Dashboard:", err);

      setError(
        "No fue posible cargar la información académica."
      );

      setEstadoAutomatizacion("error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cursosActivos = useMemo(() => {
    return cursos.filter((curso) => {
      const estado = String(curso.estado || "").toLowerCase();

      return (
        estado === "activo" ||
        estado === "en_curso" ||
        estado === "en curso"
      );
    });
  }, [cursos]);

  const entregasCompletadas = useMemo(() => {
    return entregas.filter(
      (entrega) =>
        entrega.estado === "completada" ||
        entrega.progreso >= 100
    );
  }, [entregas]);

  const entregasPendientes = useMemo(() => {
    return entregas.filter(
      (entrega) =>
        entrega.estado !== "completada" &&
        Number(entrega.progreso) < 100
    );
  }, [entregas]);

  const entregasCriticas = useMemo(() => {
    return entregas.filter((entrega) => {
      if (entrega.estado === "completada") {
        return false;
      }

      const temperatura = obtenerTemperatura(
        entrega.fechaEntrega,
        entrega.estado
      );

      return (
        temperatura === "critico" ||
        temperatura === "vencido"
      );
    });
  }, [entregas]);

  const entregasUrgentes = useMemo(() => {
    return entregas.filter((entrega) => {
      if (entrega.estado === "completada") {
        return false;
      }

      const temperatura = obtenerTemperatura(
        entrega.fechaEntrega,
        entrega.estado
      );

      return temperatura === "urgente";
    });
  }, [entregas]);

  const indiceCarga = useMemo(() => {
    if (entregas.length === 0) {
      return 0;
    }

    const riesgos = entregas.map((entrega) => {
      const resultado = calcularEstadoAcademico(entrega);

      return resultado.riesgo;
    });

    const promedio =
      riesgos.reduce((total, riesgo) => total + riesgo, 0) /
      riesgos.length;

    return Math.round(promedio);
  }, [entregas]);

  const nivelCarga = useMemo(() => {
    if (indiceCarga >= 80) {
      return {
        texto: "Crítica",
        tipo: "danger",
      };
    }

    if (indiceCarga >= 60) {
      return {
        texto: "Alta",
        tipo: "warning",
      };
    }

    if (indiceCarga >= 35) {
      return {
        texto: "Moderada",
        tipo: "accent",
      };
    }

    return {
      texto: "Estable",
      tipo: "success",
    };
  }, [indiceCarga]);

  const entregasRecientes = useMemo(() => {
    return [...entregas]
      .filter((entrega) => entrega.estado !== "completada")
      .sort((a, b) => {
        const fechaA = new Date(a.fechaEntrega).getTime();
        const fechaB = new Date(b.fechaEntrega).getTime();

        return fechaA - fechaB;
      })
      .slice(0, 4);
  }, [entregas]);

  const obtenerNombreCurso = (cursoId) => {
    const curso = cursos.find(
      (item) => String(item.id) === String(cursoId)
    );

    return curso?.nombre || "Curso no encontrado";
  };

  const alertasPendientes = useMemo(() => {
    return alertas.filter(
      (alerta) =>
        alerta.leida !== true &&
        alerta.estado !== "leida"
    ).length;
  }, [alertas]);

  const mensajeCarga = useMemo(() => {
    if (indiceCarga >= 80) {
      return "Tu carga académica requiere atención inmediata.";
    }

    if (indiceCarga >= 60) {
      return "Tienes varias actividades que requieren seguimiento.";
    }

    if (indiceCarga >= 35) {
      return "Tu carga académica se mantiene bajo seguimiento.";
    }

    return "Tu carga académica se encuentra estable.";
  }, [indiceCarga]);

  if (cargando) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-heading">
          <span className="dashboard-eyebrow">
            Resumen académico
          </span>

          <h2>Cargando información...</h2>

          <p>
            Estamos preparando tu panorama académico.
          </p>
        </div>

        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner" />

          <span>
            Analizando cursos y entregas...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            Resumen académico
          </span>

          <h2>Tu panorama académico</h2>

          <p>
            Consulta el estado de tus cursos, entregas y
            carga académica desde un solo lugar.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={cargarDashboard}
        >
          ↻
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          <strong>No se pudo actualizar el Dashboard</strong>

          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-summary">
        <SummaryCard
          etiqueta="Cursos activos"
          valor={cursosActivos.length}
          detalle="Cursos en progreso"
          icono="▣"
          tipo="accent"
        />

        <SummaryCard
          etiqueta="Entregas pendientes"
          valor={entregasPendientes.length}
          detalle="Actividades por completar"
          icono="□"
          tipo="neutral"
        />

        <SummaryCard
          etiqueta="Atención inmediata"
          valor={entregasCriticas.length}
          detalle="Entregas críticas o vencidas"
          icono="!"
          tipo="danger"
        />

        <SummaryCard
          etiqueta="Completadas"
          valor={entregasCompletadas.length}
          detalle="Entregas finalizadas"
          icono="✓"
          tipo="success"
        />
      </div>

      <AutomationStatus
        estado={estadoAutomatizacion}
        ultimaEjecucion={ultimaEjecucion}
        siguienteEjecucion={siguienteEjecucion}
        ejecuciones={ejecuciones}
      />

      <div className="dashboard-main-grid">
        <section className="dashboard-section dashboard-load">
          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-section-eyebrow">
                Análisis automático
              </span>

              <h3>Índice de carga académica</h3>
            </div>

            <span
              className={`dashboard-load-badge dashboard-load-${nivelCarga.tipo}`}
            >
              {nivelCarga.texto}
            </span>
          </div>

          <div className="dashboard-load-content">
            <div className="dashboard-load-score">
              <strong>{indiceCarga}</strong>
              <span>/ 100</span>
            </div>

            <div className="dashboard-load-info">
              <div className="dashboard-load-track">
                <div
                  className={`dashboard-load-fill dashboard-load-fill-${nivelCarga.tipo}`}
                  style={{
                    width: `${indiceCarga}%`,
                  }}
                />
              </div>

              <p>{mensajeCarga}</p>
            </div>
          </div>

          <div className="dashboard-load-breakdown">
            <div>
              <span>Urgentes</span>
              <strong>{entregasUrgentes.length}</strong>
            </div>

            <div>
              <span>Críticas</span>
              <strong>{entregasCriticas.length}</strong>
            </div>

            <div>
              <span>Pendientes</span>
              <strong>{entregasPendientes.length}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-section dashboard-alerts">
          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-section-eyebrow">
                Seguimiento
              </span>

              <h3>Estado académico</h3>
            </div>

            <span className="dashboard-alert-count">
              {alertasPendientes}
            </span>
          </div>

          {entregasCriticas.length === 0 &&
          entregasUrgentes.length === 0 ? (
            <div className="dashboard-empty">
              <span className="dashboard-empty-icon">
                ✓
              </span>

              <div>
                <strong>
                  Todo bajo control
                </strong>

                <p>
                  No tienes entregas críticas o urgentes.
                </p>
              </div>
            </div>
          ) : (
            <div className="dashboard-temperature-list">
              {[
                ...entregasCriticas,
                ...entregasUrgentes,
              ]
                .slice(0, 3)
                .map((entrega) => {
                  const temperatura =
                    obtenerTemperatura(
                      entrega.fechaEntrega,
                      entrega.estado
                    );

                  return (
                    <div
                      className="dashboard-temperature-item"
                      key={entrega.id}
                    >
                      <div>
                        <strong>
                          {entrega.titulo}
                        </strong>

                        <span>
                          {obtenerNombreCurso(
                            entrega.cursoId
                          )}
                        </span>
                      </div>

                      <TemperatureIndicator
                        temperatura={temperatura}
                        compacto
                      />
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-section dashboard-deliveries">
        <div className="dashboard-section-header">
          <div>
            <span className="dashboard-section-eyebrow">
              Próximos compromisos
            </span>

            <h3>Entregas por atender</h3>
          </div>

          <span className="dashboard-section-counter">
            {entregasPendientes.length} pendientes
          </span>
        </div>

        {entregasRecientes.length === 0 ? (
          <div className="dashboard-empty dashboard-empty-large">
            <span className="dashboard-empty-icon">
              ✓
            </span>

            <div>
              <strong>
                No hay entregas pendientes
              </strong>

              <p>
                Tu lista de actividades está al día.
              </p>
            </div>
          </div>
        ) : (
          <div className="dashboard-delivery-grid">
            {entregasRecientes.map((entrega) => (
              <DeliveryCard
                key={entrega.id}
                entrega={entrega}
                cursoNombre={obtenerNombreCurso(
                  entrega.cursoId
                )}
                mostrarAcciones={false}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default Dashboard;