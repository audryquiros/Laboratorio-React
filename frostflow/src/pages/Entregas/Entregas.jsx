import { useEffect, useState } from "react";
import EntregasForm from "../../components/EntregasForm/EntregasForm";
import {
  getEntregas,
  createEntrega,
  updateEntrega,
  deleteEntrega,
} from "../../services/entregasService";
import { getCursos } from "../../services/cursosService";
import "./Entregas.css";

function Entregas() {
  const [entregas, setEntregas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [entregaEditar, setEntregaEditar] = useState(null);
  const [filtro, setFiltro] = useState("todas");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [entregasData, cursosData] = await Promise.all([
        getEntregas(),
        getCursos(),
      ]);

      setEntregas(entregasData);
      setCursos(cursosData);
    } catch (err) {
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

  const manejarGuardar = async (entrega) => {
    try {
      setError("");

      const datos = {
        ...entrega,
        temperatura: entregaEditar?.temperatura || "estable",
        riesgo: entregaEditar?.riesgo || 0,
        ultimaActualizacion: new Date().toISOString(),
      };

      if (entregaEditar) {
        const actualizada = await updateEntrega(
          entregaEditar.id,
          datos
        );

        setEntregas((actuales) =>
          actuales.map((item) =>
            item.id === entregaEditar.id ? actualizada : item
          )
        );

        setEntregaEditar(null);
      } else {
        const nuevaEntrega = await createEntrega(datos);

        setEntregas((actuales) => [
          ...actuales,
          nuevaEntrega,
        ]);
      }

      setMostrarFormulario(false);
    } catch (err) {
      setError("No se pudo guardar la entrega.");
    }
  };

    const manejarEditar = (entrega) => {
    setEntregaEditar(entrega);
    setMostrarFormulario(true);

    setTimeout(() => {
        document
        .querySelector(".entrega-form-section")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, 100);
    };

  const manejarEliminar = async (id) => {
    const entrega = entregas.find(
      (item) => item.id === id
    );

    const confirmar = window.confirm(
      `¿Deseas eliminar "${entrega?.titulo}"?`
    );

    if (!confirmar) return;

    try {
      await deleteEntrega(id);

      setEntregas((actuales) =>
        actuales.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError("No se pudo eliminar la entrega.");
    }
  };

    const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setEntregaEditar(null);
    };

  const obtenerCurso = (cursoId) => {
    return cursos.find(
      (curso) => Number(curso.id) === Number(cursoId)
    );
  };

  const obtenerTemperatura = (entrega) => {
    if (entrega.estado === "completada") {
      return "completada";
    }

    const fechaActual = new Date();
    const fechaEntrega = new Date(entrega.fechaEntrega);

    const diferencia =
      fechaEntrega.getTime() - fechaActual.getTime();

    const dias = diferencia / (1000 * 60 * 60 * 24);

    if (dias < 0) return "vencido";
    if (dias <= 1) return "critico";
    if (dias <= 3) return "urgente";
    if (dias <= 7) return "proximo";

    return "estable";
  };

  const obtenerNombreTemperatura = (temperatura) => {
    const nombres = {
      estable: "Estable",
      proximo: "Próximo",
      urgente: "Urgente",
      critico: "Crítico",
      vencido: "Vencido",
      completada: "Completada",
    };

    return nombres[temperatura] || "Estable";
  };

  const obtenerIconoTemperatura = (temperatura) => {
    const iconos = {
      estable: "❄",
      proximo: "◌",
      urgente: "◉",
      critico: "▲",
      vencido: "!",
      completada: "✓",
    };

    return iconos[temperatura] || "❄";
  };

  const obtenerClaseTemperatura = (temperatura) => {
    return `temperatura-${temperatura}`;
  };

  const obtenerFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const obtenerHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const entregasFiltradas = entregas.filter((entrega) => {
    if (filtro === "todas") return true;

    if (filtro === "criticas") {
      const temperatura = obtenerTemperatura(entrega);

      return (
        temperatura === "critico" ||
        temperatura === "vencido"
      );
    }

    if (filtro === "proximas") {
      const temperatura = obtenerTemperatura(entrega);

      return (
        temperatura === "urgente" ||
        temperatura === "proximo"
      );
    }

    if (filtro === "completadas") {
      return entrega.estado === "completada";
    }

    return true;
  });

  const totalCompletadas = entregas.filter(
    (entrega) => entrega.estado === "completada"
  ).length;

  const totalCriticas = entregas.filter((entrega) => {
    const temperatura = obtenerTemperatura(entrega);

    return (
      temperatura === "critico" ||
      temperatura === "vencido"
    );
  }).length;

  const totalProximas = entregas.filter((entrega) => {
    const temperatura = obtenerTemperatura(entrega);

    return (
      temperatura === "urgente" ||
      temperatura === "proximo"
    );
  }).length;

  return (
    <main className="entregas-page">
      <section className="entregas-header">
        <div>
          <span className="page-eyebrow">
            Seguimiento académico
          </span>

          <h1>Entregas</h1>

          <p>
            Controla tus actividades, fechas límite y nivel de
            urgencia.
          </p>
        </div>

        <button
          className="btn-nueva-entrega"
          onClick={() => {
            setEntregaEditar(null);
            setMostrarFormulario(true);

            setTimeout(() => {
                document
                .querySelector(".entrega-form-section")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
            }}
        >
          <span>+</span>
          Nueva entrega
        </button>
      </section>

      {error && (
        <div className="entregas-error">
          <span>!</span>
          <p>{error}</p>

          <button onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {mostrarFormulario && (
        <section className="entrega-form-section">
          <EntregasForm
            cursos={cursos}
            entregaEditar={entregaEditar}
            onGuardar={manejarGuardar}
            onCancelar={cancelarFormulario}
          />
        </section>
      )}

      <section className="entregas-resumen">
        <div className="resumen-entrega">
          <span>Entregas totales</span>
          <strong>{entregas.length}</strong>
        </div>

        <div className="resumen-entrega">
          <span>Próximas</span>
          <strong>{totalProximas}</strong>
        </div>

        <div className="resumen-entrega">
          <span>Críticas</span>
          <strong>{totalCriticas}</strong>
        </div>

        <div className="resumen-entrega">
          <span>Completadas</span>
          <strong>{totalCompletadas}</strong>
        </div>
      </section>

      <section className="entregas-list-section">
        <div className="entregas-list-header">
          <div>
            <span className="section-eyebrow">
              Actividad académica
            </span>

            <h2>Mis entregas</h2>
          </div>

          <div className="filtros-entregas">
            <button
              className={
                filtro === "todas" ? "filtro-activo" : ""
              }
              onClick={() => setFiltro("todas")}
            >
              Todas
            </button>

            <button
              className={
                filtro === "proximas" ? "filtro-activo" : ""
              }
              onClick={() => setFiltro("proximas")}
            >
              Próximas
            </button>

            <button
              className={
                filtro === "criticas" ? "filtro-activo" : ""
              }
              onClick={() => setFiltro("criticas")}
            >
              Críticas
            </button>

            <button
              className={
                filtro === "completadas"
                  ? "filtro-activo"
                  : ""
              }
              onClick={() => setFiltro("completadas")}
            >
              Completadas
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="entregas-estado">
            <div className="entregas-spinner"></div>
            <p>Cargando entregas...</p>
          </div>
        ) : entregasFiltradas.length === 0 ? (
          <div className="entregas-estado">
            <div className="entregas-vacio-icon">
              □
            </div>

            <h3>No hay entregas en esta categoría</h3>

            <p>
              Agrega una nueva entrega o cambia el filtro.
            </p>
          </div>
        ) : (
          <div className="entregas-lista">
            {entregasFiltradas.map((entrega) => {
              const curso = obtenerCurso(entrega.cursoId);
              const temperatura = obtenerTemperatura(entrega);

              return (
                <article
                  className="entrega-card"
                  key={entrega.id}
                >
                  <div
                    className={`entrega-temperatura ${
                      obtenerClaseTemperatura(
                        temperatura
                      )
                    }`}
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

                  <div className="entrega-info">
                    <div className="entrega-identificacion">
                      <span className="entrega-curso">
                        {curso?.codigo || "Sin curso"}
                      </span>

                      <span className="separador">
                        /
                      </span>

                      <span className="entrega-curso-nombre">
                        {curso?.nombre ||
                          "Curso no encontrado"}
                      </span>
                    </div>

                    <h3>{entrega.titulo}</h3>

                    {entrega.descripcion && (
                      <p>{entrega.descripcion}</p>
                    )}
                  </div>

                  <div className="entrega-fecha">
                    <span>Fecha límite</span>

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

                  <div className="entrega-progreso">
                    <div className="progreso-header">
                      <span>Progreso</span>
                      <strong>
                        {entrega.progreso || 0}%
                      </strong>
                    </div>

                    <div className="barra-progreso">
                      <div
                        style={{
                          width: `${entrega.progreso || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="entrega-acciones">
                    <button
                      className="accion-editar"
                      onClick={() =>
                        manejarEditar(entrega)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="accion-eliminar"
                      onClick={() =>
                        manejarEliminar(entrega.id)
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Entregas;