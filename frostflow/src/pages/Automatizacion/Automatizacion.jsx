import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getConfiguracion,
  updateConfiguracion,
} from "../../services/configuracionService";

import {
  getEjecuciones,
  createEjecucion,
} from "../../services/ejecucionesService";

import { getEntregas, updateEntrega } from "../../services/entregasService";
import { calcularEstadoAcademico } from "../../utils/academicRisk";

import AutomationStatus from "../../components/AutomationStatus/AutomationStatus";

import "./Automatizacion.css";

const INTERVALOS = [
  {
    valor: 5,
    etiqueta: "Cada 5 minutos",
  },
  {
    valor: 10,
    etiqueta: "Cada 10 minutos",
  },
  {
    valor: 15,
    etiqueta: "Cada 15 minutos",
  },
  {
    valor: 30,
    etiqueta: "Cada 30 minutos",
  },
  {
    valor: 60,
    etiqueta: "Cada hora",
  },
];

const obtenerFechaActual = () => new Date();

const formatearFecha = (fecha) => {
  if (!fecha) return "Sin registros";

  const fechaFormateada = new Date(fecha);

  if (Number.isNaN(fechaFormateada.getTime())) {
    return "Sin registros";
  }

  return fechaFormateada.toLocaleString("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatearHora = (fecha) => {
  if (!fecha) return "—";

  const fechaFormateada = new Date(fecha);

  if (Number.isNaN(fechaFormateada.getTime())) {
    return "—";
  }

  return fechaFormateada.toLocaleTimeString("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calcularProximaEjecucion = (ultimaEjecucion, intervalo) => {
  if (!ultimaEjecucion || !intervalo) return null;

  const fecha = new Date(ultimaEjecucion);

  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  fecha.setMinutes(fecha.getMinutes() + Number(intervalo));

  return fecha.toISOString();
};

function Automatizacion() {
  const [configuracion, setConfiguracion] = useState(null);
  const [ejecuciones, setEjecuciones] = useState([]);

  const [estado, setEstado] = useState("inactiva");
  const [cargando, setCargando] = useState(true);
  const [ejecutando, setEjecutando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [ultimaEjecucion, setUltimaEjecucion] = useState(null);
  const [proximaEjecucion, setProximaEjecucion] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);

      const [configuracionData, ejecucionesData] =
        await Promise.all([
          getConfiguracion(),
          getEjecuciones(),
        ]);

      let configuracionActual = null;

      if (Array.isArray(configuracionData)) {
        configuracionActual = configuracionData[0] || null;
      } else {
        configuracionActual = configuracionData || null;
      }

      setConfiguracion(configuracionActual);

      const ejecucionesArray = Array.isArray(ejecucionesData)
        ? [...ejecucionesData]
        : [];

      ejecucionesArray.sort(
        (a, b) =>
          new Date(b.fechaEjecucion || b.fecha || 0) -
          new Date(a.fechaEjecucion || a.fecha || 0)
      );

      setEjecuciones(ejecucionesArray);

      const ultima =
        ejecucionesArray[0]?.fechaEjecucion ||
        ejecucionesArray[0]?.fecha ||
        null;

      setUltimaEjecucion(ultima);

      if (!configuracionActual?.automatizacionActiva) {
        setEstado("inactiva");
      }

      if (
        configuracionActual?.automatizacionActiva &&
        ultima
      ) {
        setProximaEjecucion(
          calcularProximaEjecucion(
            ultima,
            configuracionActual.intervalo
          )
        );
      } else {
        setProximaEjecucion(null);
      }
    } catch (error) {
      console.error(
        "Error cargando configuración de automatización:",
        error
      );

      setEstado("error");
      setMensaje(
        "No fue posible cargar la configuración de automatización."
      );
      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const ejecutarAnalisis = useCallback(
    async (origen = "automatica") => {
      if (ejecutando) return;

      const inicio = obtenerFechaActual();

      try {
        setEjecutando(true);
        setEstado("ejecutando");
        setMensaje("");
        setTipoMensaje("");

        const entregas = await getEntregas();

        if (!Array.isArray(entregas)) {
          throw new Error(
            "No se encontraron entregas para analizar."
          );
        }

        let actualizadas = 0;

        for (const entrega of entregas) {
          if (!entrega?.id) continue;

          const resultado =
            calcularEstadoAcademico(entrega);

          const temperaturaActual =
            entrega.temperatura || "";

          const riesgoActual =
            Number(entrega.riesgo ?? -1);

          const necesitaActualizacion =
            temperaturaActual !== resultado.temperatura ||
            riesgoActual !== resultado.riesgo;

          if (necesitaActualizacion) {
            await updateEntrega(entrega.id, {
              temperatura: resultado.temperatura,
              riesgo: resultado.riesgo,
              ultimaActualizacion:
                obtenerFechaActual().toISOString(),
            });

            actualizadas += 1;
          }
        }

        const fin = obtenerFechaActual();

        const duracion =
          fin.getTime() - inicio.getTime();

        const registro = {
          id: crypto.randomUUID(),
          fechaEjecucion: fin.toISOString(),
          estado: "exito",
          origen,
          entregasAnalizadas: entregas.length,
          entregasActualizadas: actualizadas,
          duracion,
          mensaje:
            actualizadas > 0
              ? `Se analizaron ${entregas.length} entregas y se actualizaron ${actualizadas}.`
              : `Se analizaron ${entregas.length} entregas. No se requirieron cambios.`,
        };

        await createEjecucion(registro);

        setEstado("exito");
        setUltimaEjecucion(registro.fechaEjecucion);

        if (configuracion?.automatizacionActiva) {
          setProximaEjecucion(
            calcularProximaEjecucion(
              registro.fechaEjecucion,
              configuracion.intervalo
            )
          );
        } else {
          setProximaEjecucion(null);
        }

        setMensaje(registro.mensaje);
        setTipoMensaje("success");

        await cargarDatos();
      } catch (error) {
        console.error(
          "Error ejecutando análisis académico:",
          error
        );

        const fechaError = obtenerFechaActual();

        const registroError = {
          id: crypto.randomUUID(),
          fechaEjecucion: fechaError.toISOString(),
          estado: "error",
          origen,
          entregasAnalizadas: 0,
          entregasActualizadas: 0,
          duracion:
            fechaError.getTime() - inicio.getTime(),
          mensaje:
            error?.message ||
            "La ejecución no pudo completarse.",
        };

        try {
          await createEjecucion(registroError);
        } catch (registroErrorException) {
          console.error(
            "No fue posible registrar el error:",
            registroErrorException
          );
        }

        setEstado("error");
        setMensaje(
          error?.message ||
            "La automatización encontró un error durante la ejecución."
        );
        setTipoMensaje("error");
      } finally {
        setEjecutando(false);
      }
    },
    [
      ejecutando,
      configuracion,
      cargarDatos,
    ]
  );

  useEffect(() => {
    if (
      !configuracion?.automatizacionActiva ||
      !configuracion?.intervalo
    ) {
      return undefined;
    }

    const intervaloMilisegundos =
      Number(configuracion.intervalo) *
      60 *
      1000;

    const intervalo = setInterval(() => {
      ejecutarAnalisis("automatica");
    }, intervaloMilisegundos);

    return () => {
      clearInterval(intervalo);
    };
  }, [
    configuracion?.automatizacionActiva,
    configuracion?.intervalo,
    ejecutarAnalisis,
  ]);

  const cambiarEstadoAutomatizacion = async () => {
    if (!configuracion?.id || guardando) return;

    try {
      setGuardando(true);

      const nuevoEstado =
        !configuracion.automatizacionActiva;

      const nuevaConfiguracion = {
        ...configuracion,
        automatizacionActiva: nuevoEstado,
      };

      await updateConfiguracion(
        configuracion.id,
        nuevaConfiguracion
      );

      setConfiguracion(nuevaConfiguracion);

      if (nuevoEstado) {
        setEstado("espera");

        setMensaje(
          "La automatización quedó activa y ejecutará análisis según el intervalo configurado."
        );
        setTipoMensaje("success");

        if (ultimaEjecucion) {
          setProximaEjecucion(
            calcularProximaEjecucion(
              ultimaEjecucion,
              nuevaConfiguracion.intervalo
            )
          );
        }
      } else {
        setEstado("inactiva");
        setProximaEjecucion(null);

        setMensaje(
          "La automatización fue desactivada."
        );
        setTipoMensaje("success");
      }
    } catch (error) {
      console.error(
        "Error actualizando automatización:",
        error
      );

      setEstado("error");

      setMensaje(
        "No fue posible cambiar el estado de la automatización."
      );

      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarIntervalo = async (event) => {
    const nuevoIntervalo = Number(event.target.value);

    if (!configuracion?.id || !nuevoIntervalo) {
      return;
    }

    try {
      setGuardando(true);

      const nuevaConfiguracion = {
        ...configuracion,
        intervalo: nuevoIntervalo,
      };

      await updateConfiguracion(
        configuracion.id,
        nuevaConfiguracion
      );

      setConfiguracion(nuevaConfiguracion);

      if (ultimaEjecucion && configuracion.automatizacionActiva) {
        setProximaEjecucion(
          calcularProximaEjecucion(
            ultimaEjecucion,
            nuevoIntervalo
          )
        );
      }

      setMensaje(
        `Intervalo actualizado a cada ${nuevoIntervalo} minutos.`
      );
      setTipoMensaje("success");
    } catch (error) {
      console.error(
        "Error actualizando intervalo:",
        error
      );

      setEstado("error");

      setMensaje(
        "No fue posible actualizar el intervalo."
      );

      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  };

  const estadisticas = useMemo(() => {
    const exitosas = ejecuciones.filter(
      (ejecucion) =>
        ejecucion.estado === "exito"
    ).length;

    const errores = ejecuciones.filter(
      (ejecucion) =>
        ejecucion.estado === "error"
    ).length;

    const automaticas = ejecuciones.filter(
      (ejecucion) =>
        ejecucion.origen === "automatica"
    ).length;

    const manuales = ejecuciones.filter(
      (ejecucion) =>
        ejecucion.origen === "manual"
    ).length;

    return {
      total: ejecuciones.length,
      exitosas,
      errores,
      automaticas,
      manuales,
    };
  }, [ejecuciones]);

  if (cargando) {
    return (
      <section className="automatizacion-page">
        <div className="automatizacion-heading">
          <span className="automatizacion-eyebrow">
            Frost Automation
          </span>

          <h2>Centro de automatización</h2>

          <p>
            Cargando la configuración del sistema...
          </p>
        </div>

        <div className="automatizacion-loading">
          <div className="automatizacion-spinner" />
          <span>
            Preparando el motor académico...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="automatizacion-page">
      <div className="automatizacion-heading">
        <div>
          <span className="automatizacion-eyebrow">
            Frost Automation
          </span>

          <h2>Centro de automatización</h2>

          <p>
            Controla el análisis automático de tus
            entregas y mantén actualizado su nivel de
            riesgo académico.
          </p>
        </div>

        <button
          type="button"
          className="automatizacion-run"
          onClick={() => ejecutarAnalisis("manual")}
          disabled={ejecutando}
        >
          <span aria-hidden="true">
            {ejecutando ? "⋯" : "▶"}
          </span>

          {ejecutando
            ? "Ejecutando..."
            : "Ejecutar análisis"}
        </button>
      </div>

      {mensaje && (
        <div
          className={`automatizacion-message automatizacion-message-${tipoMensaje}`}
        >
          <strong>
            {tipoMensaje === "error"
              ? "Ocurrió un problema"
              : "Automatización"}
          </strong>

          <span>{mensaje}</span>
        </div>
      )}

      <div className="automatizacion-main-grid">
        <section className="automatizacion-card automatizacion-control-card">
          <div className="automatizacion-card-heading">
            <div>
              <span className="automatizacion-card-eyebrow">
                Control del sistema
              </span>

              <h3>
                Motor de análisis académico
              </h3>
            </div>

            <AutomationStatus
            estado={
                ejecutando
                ? "ejecutando"
                : configuracion?.automatizacionActiva
                    ? estado === "exito"
                    ? "exito"
                    : estado === "error"
                        ? "error"
                        : "espera"
                    : "inactiva"
            }
            ultimaEjecucion={
                ultimaEjecucion
                ? formatearFecha(ultimaEjecucion)
                : "Sin registros"
            }
            proximaEjecucion={
                proximaEjecucion
                ? formatearFecha(proximaEjecucion)
                : "Pendiente"
            }
            ejecuciones={
                estadisticas.total
            }
            />
          </div>

          <div className="automatizacion-control">
            <div>
              <span className="automatizacion-control-label">
                Automatización
              </span>

              <strong>
                {configuracion?.automatizacionActiva
                  ? "Activa"
                  : "Inactiva"}
              </strong>

              <p>
                {configuracion?.automatizacionActiva
                  ? "El sistema analizará las entregas automáticamente."
                  : "El análisis automático está detenido."}
              </p>
            </div>

            <button
              type="button"
              className={`automatizacion-switch ${
                configuracion?.automatizacionActiva
                  ? "automatizacion-switch-active"
                  : ""
              }`}
              onClick={
                cambiarEstadoAutomatizacion
              }
              disabled={guardando}
              aria-label={
                configuracion?.automatizacionActiva
                  ? "Desactivar automatización"
                  : "Activar automatización"
              }
              aria-pressed={
                configuracion?.automatizacionActiva
              }
            >
              <span />
            </button>
          </div>

          <div className="automatizacion-divider" />

          <div className="automatizacion-settings">
            <div>
              <label htmlFor="intervalo">
                Frecuencia de análisis
              </label>

              <p>
                Define cada cuánto tiempo se
                ejecutará el análisis automático.
              </p>
            </div>

            <select
              id="intervalo"
              value={
                configuracion?.intervalo || 10
              }
              onChange={cambiarIntervalo}
              disabled={guardando}
            >
              {INTERVALOS.map((intervalo) => (
                <option
                  key={intervalo.valor}
                  value={intervalo.valor}
                >
                  {intervalo.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="automatizacion-card automatizacion-info-card">
          <span className="automatizacion-card-eyebrow">
            Flujo automático
          </span>

          <h3>
            ¿Qué ocurre durante una ejecución?
          </h3>

          <div className="automatizacion-flow">
            <div className="automatizacion-flow-step">
              <span>01</span>

              <div>
                <strong>
                  Detectar entregas
                </strong>

                <p>
                  Se consultan las entregas
                  registradas en el sistema.
                </p>
              </div>
            </div>

            <div className="automatizacion-flow-line" />

            <div className="automatizacion-flow-step">
              <span>02</span>

              <div>
                <strong>
                  Analizar riesgo
                </strong>

                <p>
                  Se calcula la temperatura y el
                  nivel de riesgo académico.
                </p>
              </div>
            </div>

            <div className="automatizacion-flow-line" />

            <div className="automatizacion-flow-step">
              <span>03</span>

              <div>
                <strong>
                  Actualizar estado
                </strong>

                <p>
                  Los cambios se guardan en el
                  sistema y quedan registrados.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="automatizacion-stats">
        <article>
          <span>Total de ejecuciones</span>
          <strong>{estadisticas.total}</strong>
        </article>

        <article>
          <span>Ejecuciones exitosas</span>
          <strong>{estadisticas.exitosas}</strong>
        </article>

        <article>
          <span>Ejecuciones automáticas</span>
          <strong>{estadisticas.automaticas}</strong>
        </article>

        <article>
          <span>Ejecuciones manuales</span>
          <strong>{estadisticas.manuales}</strong>
        </article>
      </section>

      <section className="automatizacion-card automatizacion-history-card">
        <div className="automatizacion-history-heading">
          <div>
            <span className="automatizacion-card-eyebrow">
              Registro
            </span>

            <h3>
              Historial de ejecuciones
            </h3>
          </div>

          <span className="automatizacion-history-count">
            {ejecuciones.length} registros
          </span>
        </div>

        {ejecuciones.length === 0 ? (
          <div className="automatizacion-empty">
            <span>○</span>

            <strong>
              Todavía no hay ejecuciones
            </strong>

            <p>
              Ejecuta un análisis manual para
              comenzar a registrar actividad.
            </p>
          </div>
        ) : (
          <div className="automatizacion-history">
            {ejecuciones.slice(0, 12).map(
              (ejecucion) => {
                const fecha =
                  ejecucion.fechaEjecucion ||
                  ejecucion.fecha;

                const esExito =
                  ejecucion.estado ===
                  "exito";

                return (
                  <article
                    className="automatizacion-history-item"
                    key={ejecucion.id}
                  >
                    <div
                      className={`automatizacion-history-status ${
                        esExito
                          ? "history-status-success"
                          : "history-status-error"
                      }`}
                    >
                      {esExito ? "✓" : "!"}
                    </div>

                    <div className="automatizacion-history-content">
                      <div className="automatizacion-history-title">
                        <strong>
                          {esExito
                            ? "Análisis completado"
                            : "Análisis con error"}
                        </strong>

                        <span>
                          {ejecucion.origen ===
                          "manual"
                            ? "Manual"
                            : "Automática"}
                        </span>
                      </div>

                      <p>
                        {ejecucion.mensaje ||
                          "Sin detalles de ejecución."}
                      </p>
                    </div>

                    <div className="automatizacion-history-meta">
                      <strong>
                        {formatearHora(fecha)}
                      </strong>

                      <span>
                        {ejecucion.entregasAnalizadas ??
                          0}{" "}
                        entregas
                      </span>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </section>
  );
}

export default Automatizacion;