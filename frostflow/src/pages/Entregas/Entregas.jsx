import { useEffect, useState } from "react";

import EntregasForm from "../../components/EntregasForm/EntregasForm";
import ConfirmacionModal from "../../components/ConfirmacionModal/ConfirmacionModal";
import AyudaEstados from "../../components/AyudaEstados/AyudaEstados";

import {
  getEntregas,
  createEntrega,
  updateEntrega,
  deleteEntrega,
} from "../../services/entregasService";

import { getCursos } from "../../services/cursosService";

import {
  obtenerTemperatura,
  calcularRiesgo,
} from "../../utils/academicRisk";

import "./Entregas.css";

function Entregas() {
  const [entregas, setEntregas] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [entregaEditar, setEntregaEditar] =
    useState(null);

  const [entregaEliminar, setEntregaEliminar] =
    useState(null);

  const [procesandoEntrega, setProcesandoEntrega] =
    useState(null);

  const [filtro, setFiltro] =
    useState("todas");

  /* =====================================================
     CARGAR DATOS
  ===================================================== */

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [
        entregasData,
        cursosData,
      ] = await Promise.all([
        getEntregas(),
        getCursos(),
      ]);

      setEntregas(entregasData);
      setCursos(cursosData);
    } catch (err) {
      console.error(
        "Error cargando datos:",
        err
      );

      setError(
        "No se pudieron cargar las entregas. Verifica que JSON Server esté ejecutándose."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  /* =====================================================
     FORMULARIO
  ===================================================== */

  const abrirFormulario = () => {
    setEntregaEditar(null);
    setMostrarFormulario(true);

    setTimeout(() => {
      document
        .querySelector(
          ".entrega-form-section"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const manejarEditar = (entrega) => {
    setEntregaEditar(entrega);
    setMostrarFormulario(true);

    setTimeout(() => {
      document
        .querySelector(
          ".entrega-form-section"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setEntregaEditar(null);
  };

  /* =====================================================
     GUARDAR ENTREGA
  ===================================================== */

  const manejarGuardar = async (
    entrega
  ) => {
    try {
      setError("");

      const temperatura =
        obtenerTemperatura(
          entrega.fechaEntrega,
          entrega.estado
        );

      const riesgo =
        calcularRiesgo(
          entrega.fechaEntrega,
          entrega.progreso,
          entrega.estado
        );

      const datos = {
        ...entrega,
        temperatura,
        riesgo,
        ultimaActualizacion:
          new Date().toISOString(),
      };

      if (entregaEditar) {
        const actualizada =
          await updateEntrega(
            entregaEditar.id,
            datos
          );

        setEntregas(
          (actuales) =>
            actuales.map(
              (item) =>
                item.id ===
                entregaEditar.id
                  ? actualizada
                  : item
            )
        );

        setEntregaEditar(null);
      } else {
        const nuevaEntrega =
          await createEntrega(
            datos
          );

        setEntregas(
          (actuales) => [
            ...actuales,
            nuevaEntrega,
          ]
        );
      }

      setMostrarFormulario(false);
    } catch (err) {
      console.error(
        "Error al guardar entrega:",
        err
      );

      setError(
        "No se pudo guardar la entrega."
      );
    }
  };

  /* =====================================================
     MARCAR COMO ENTREGADA
  ===================================================== */

  const marcarComoEntregada =
    async (entrega) => {
      if (
        entrega.estado ===
        "completada"
      ) {
        return;
      }

      try {
        setError("");

        setProcesandoEntrega(
          entrega.id
        );

        const datosActualizados = {
          ...entrega,

          estado: "completada",

          progreso: 100,

          temperatura:
            "completada",

          riesgo: 0,

          ultimaActualizacion:
            new Date().toISOString(),
        };

        const actualizada =
          await updateEntrega(
            entrega.id,
            datosActualizados
          );

        setEntregas(
          (actuales) =>
            actuales.map(
              (item) =>
                item.id ===
                entrega.id
                  ? actualizada
                  : item
            )
        );
      } catch (err) {
        console.error(
          "Error marcando entrega como completada:",
          err
        );

        setError(
          "No se pudo marcar la entrega como completada."
        );
      } finally {
        setProcesandoEntrega(
          null
        );
      }
    };

  /* =====================================================
     ELIMINAR ENTREGA
  ===================================================== */

  const solicitarEliminar = (
    entrega
  ) => {
    setEntregaEliminar(
      entrega
    );
  };

  const cancelarEliminar = () => {
    setEntregaEliminar(null);
  };

  const confirmarEliminar =
    async () => {
      if (!entregaEliminar) {
        return;
      }

      try {
        setError("");

        await deleteEntrega(
          entregaEliminar.id
        );

        setEntregas(
          (actuales) =>
            actuales.filter(
              (item) =>
                item.id !==
                entregaEliminar.id
            )
        );

        setEntregaEliminar(null);
      } catch (err) {
        console.error(
          "Error al eliminar entrega:",
          err
        );

        setError(
          "No se pudo eliminar la entrega."
        );

        setEntregaEliminar(null);
      }
    };

  /* =====================================================
     CURSOS
  ===================================================== */

  const obtenerCurso = (
    cursoId
  ) => {
    return cursos.find(
      (curso) =>
        Number(curso.id) ===
        Number(cursoId)
    );
  };

  /* =====================================================
     TEMPERATURA
  ===================================================== */

  const obtenerNombreTemperatura =
    (temperatura) => {
      const nombres = {
        estable: "Estable",
        proximo: "Próximo",
        urgente: "Urgente",
        critico: "Crítico",
        vencido: "Vencido",
        completada: "Completada",
      };

      return (
        nombres[temperatura] ||
        "Estable"
      );
    };

  const obtenerIconoTemperatura =
    (temperatura) => {
      const iconos = {
        estable: "❄",
        proximo: "◌",
        urgente: "◉",
        critico: "▲",
        vencido: "!",
        completada: "✓",
      };

      return (
        iconos[temperatura] ||
        "❄"
      );
    };

  const obtenerClaseTemperatura =
    (temperatura) => {
      return `temperatura-${temperatura}`;
    };

  /* =====================================================
     FECHAS
  ===================================================== */

  const obtenerFecha = (
    fecha
  ) => {
    if (!fecha) {
      return "Sin fecha";
    }

    return new Date(
      fecha
    ).toLocaleDateString(
      "es-CR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const obtenerHora = (
    fecha
  ) => {
    if (!fecha) {
      return "";
    }

    return new Date(
      fecha
    ).toLocaleTimeString(
      "es-CR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =====================================================
     FILTROS
  ===================================================== */

  const entregasFiltradas =
    entregas.filter(
      (entrega) => {
        if (
          filtro ===
          "todas"
        ) {
          return true;
        }

        const temperatura =
          obtenerTemperatura(
            entrega.fechaEntrega,
            entrega.estado
          );

        if (
          filtro ===
          "criticas"
        ) {
          return (
            temperatura ===
              "critico" ||
            temperatura ===
              "vencido"
          );
        }

        if (
          filtro ===
          "proximas"
        ) {
          return (
            temperatura ===
              "urgente" ||
            temperatura ===
              "proximo"
          );
        }

        if (
          filtro ===
          "completadas"
        ) {
          return (
            entrega.estado ===
            "completada"
          );
        }

        return true;
      }
    );

  /* =====================================================
     RESUMEN
  ===================================================== */

  const totalCompletadas =
    entregas.filter(
      (entrega) =>
        entrega.estado ===
        "completada"
    ).length;

  const totalCriticas =
    entregas.filter(
      (entrega) => {
        const temperatura =
          obtenerTemperatura(
            entrega.fechaEntrega,
            entrega.estado
          );

        return (
          temperatura ===
            "critico" ||
          temperatura ===
            "vencido"
        );
      }
    ).length;

  const totalProximas =
    entregas.filter(
      (entrega) => {
        const temperatura =
          obtenerTemperatura(
            entrega.fechaEntrega,
            entrega.estado
          );

        return (
          temperatura ===
            "urgente" ||
          temperatura ===
            "proximo"
        );
      }
    ).length;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="entregas-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="entregas-header">

        <div>
          <span className="page-eyebrow">
            Seguimiento académico
          </span>

          <p>
            Controla tus actividades, fechas límite
            y nivel de urgencia.
          </p>
        </div>

        <div className="entregas-header-actions">

          <AyudaEstados />

          <button
            className="btn-nueva-entrega"
            onClick={
              abrirFormulario
            }
          >
            <span>+</span>
            Nueva entrega
          </button>

        </div>

      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="entregas-error">

          <span>!</span>

          <p>
            {error}
          </p>

          <button
            onClick={() =>
              setError("")
            }
            aria-label="Cerrar mensaje"
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          FORMULARIO
      ================================================= */}

      {mostrarFormulario && (
        <section className="entrega-form-section">

          <EntregasForm
            cursos={cursos}
            entregaEditar={
              entregaEditar
            }
            onGuardar={
              manejarGuardar
            }
            onCancelar={
              cancelarFormulario
            }
          />

        </section>
      )}

      {/* =================================================
          RESUMEN
      ================================================= */}

      <section className="entregas-resumen">

        <div className="resumen-entrega">
          <span>
            Entregas totales
          </span>

          <strong>
            {entregas.length}
          </strong>
        </div>

        <div className="resumen-entrega">
          <span>
            Próximas
          </span>

          <strong>
            {totalProximas}
          </strong>
        </div>

        <div className="resumen-entrega">
          <span>
            Críticas
          </span>

          <strong>
            {totalCriticas}
          </strong>
        </div>

        <div className="resumen-entrega">
          <span>
            Completadas
          </span>

          <strong>
            {totalCompletadas}
          </strong>
        </div>

      </section>

      {/* =================================================
          LISTA
      ================================================= */}

      <section className="entregas-list-section">

        <div className="entregas-list-header">

          <div>
            <span className="section-eyebrow">
              Actividad académica
            </span>

            <h2>
              Mis entregas
            </h2>
          </div>

          <div className="filtros-entregas">

            <button
              className={
                filtro === "todas"
                  ? "filtro-activo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "todas"
                )
              }
            >
              Todas
            </button>

            <button
              className={
                filtro ===
                "proximas"
                  ? "filtro-activo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "proximas"
                )
              }
            >
              Próximas
            </button>

            <button
              className={
                filtro ===
                "criticas"
                  ? "filtro-activo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "criticas"
                )
              }
            >
              Críticas
            </button>

            <button
              className={
                filtro ===
                "completadas"
                  ? "filtro-activo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "completadas"
                )
              }
            >
              Completadas
            </button>

          </div>

        </div>

        {/* =================================================
            CARGANDO
        ================================================= */}

        {cargando ? (

          <div className="entregas-estado">

            <div className="entregas-spinner"></div>

            <p>
              Cargando entregas...
            </p>

          </div>

        ) : entregasFiltradas.length ===
          0 ? (

          <div className="entregas-estado">

            <div className="entregas-vacio-icon">
              □
            </div>

            <h3>
              No hay entregas en esta categoría
            </h3>

            <p>
              Agrega una nueva entrega o
              cambia el filtro.
            </p>

          </div>

        ) : (

          <div className="entregas-lista">

            {entregasFiltradas.map(
              (entrega) => {

                const curso =
                  obtenerCurso(
                    entrega.cursoId
                  );

                const temperatura =
                  obtenerTemperatura(
                    entrega.fechaEntrega,
                    entrega.estado
                  );

                const completada =
                  entrega.estado ===
                  "completada";

                const procesando =
                  procesandoEntrega ===
                  entrega.id;

                return (
                  <article
                    className="entrega-card"
                    key={entrega.id}
                  >

                    {/* TEMPERATURA */}

                    <div
                      className={`entrega-temperatura ${obtenerClaseTemperatura(
                        temperatura
                      )}`}
                    >

                      <span>
                        {obtenerIconoTemperatura(
                          temperatura
                        )}
                      </span>

                      <small>
                        {obtenerNombreTemperatura(
                          temperatura
                        )}
                      </small>

                    </div>

                    {/* INFORMACIÓN */}

                    <div className="entrega-info">

                      <div className="entrega-identificacion">

                        <span className="entrega-curso">
                          {curso?.codigo ||
                            "Sin curso"}
                        </span>

                        <span className="separador">
                          /
                        </span>

                        <span className="entrega-curso-nombre">
                          {curso?.nombre ||
                            "Curso no encontrado"}
                        </span>

                      </div>

                      <h3>
                        {entrega.titulo}
                      </h3>

                      {entrega.descripcion && (
                        <p>
                          {
                            entrega.descripcion
                          }
                        </p>
                      )}

                    </div>

                    {/* FECHA */}

                    <div className="entrega-fecha">

                      <span>
                        Fecha límite
                      </span>

                      <strong>
                        {obtenerFecha(
                          entrega.fechaEntrega
                        )}
                      </strong>

                      <small>
                        {obtenerHora(
                          entrega.fechaEntrega
                        )}
                      </small>

                    </div>

                    {/* PROGRESO */}

                    <div className="entrega-progreso">

                      <div className="progreso-header">

                        <span>
                          Progreso
                        </span>

                        <strong>
                          {entrega.progreso ||
                            0}
                          %
                        </strong>

                      </div>

                      <div className="barra-progreso">

                        <div
                          style={{
                            width: `${
                              entrega.progreso ||
                              0
                            }%`,
                          }}
                        ></div>

                      </div>

                    </div>

                    {/* ACCIONES */}

                    <div className="entrega-acciones">

                      <button
                        className="accion-editar"
                        onClick={() =>
                          manejarEditar(
                            entrega
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        className={
                          completada
                            ? "accion-completada"
                            : "accion-completar"
                        }
                        onClick={() =>
                          marcarComoEntregada(
                            entrega
                          )
                        }
                        disabled={
                          completada ||
                          procesando
                        }
                      >
                        {procesando
                          ? "Guardando..."
                          : completada
                          ? "✓ Entregada"
                          : "Marcar entregada"}
                      </button>

                      <button
                        className="accion-eliminar"
                        onClick={() =>
                          solicitarEliminar(
                            entrega
                          )
                        }
                      >
                        Eliminar
                      </button>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        )}

      </section>

      {/* =================================================
          MODAL DE ELIMINACIÓN
      ================================================= */}

      {entregaEliminar && (
        <ConfirmacionModal
          titulo="Eliminar entrega"
          descripcion="¿Estás segura de que deseas eliminar esta entrega?"
          elemento={
            entregaEliminar.titulo
          }
          detalle="Esta acción eliminará permanentemente la entrega y su información de seguimiento."
          textoCancelar="Cancelar"
          textoConfirmar="Eliminar entrega"
          onCancel={
            cancelarEliminar
          }
          onConfirm={
            confirmarEliminar
          }
        />
      )}

    </main>
  );
}

export default Entregas;