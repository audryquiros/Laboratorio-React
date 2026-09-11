import { useEffect, useMemo, useState } from "react";

import CursosForm from "../../components/CursosForm/CursosForm";
import PlanEstudiosImporter from "../../components/PlanEstudiosImporter/PlanEstudiosImporter";

import {
  getCursos,
  createCurso,
  updateCurso,
  deleteCurso,
} from "../../services/cursosService";

import { getEntregas } from "../../services/entregasService";

import "./Cursos.css";

const NOTA_MINIMA_APROBACION = 7;

function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [entregas, setEntregas] = useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [mostrarImportador, setMostrarImportador] =
    useState(false);

  const [cursoEditar, setCursoEditar] =
    useState(null);

  const [filtro, setFiltro] =
    useState("todos");

  const [busqueda, setBusqueda] =
    useState("");

  const [cursoCulminar, setCursoCulminar] =
    useState(null);

  const [calificacion, setCalificacion] =
    useState("");

  const [guardandoCalificacion, setGuardandoCalificacion] =
    useState(false);

  const [importandoCursos, setImportandoCursos] =
    useState(false);

  /* =====================================================
     CARGAR DATOS
  ===================================================== */

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [
        cursosData,
        entregasData,
      ] = await Promise.all([
        getCursos(),
        getEntregas(),
      ]);

      setCursos(cursosData);
      setEntregas(entregasData);
    } catch (err) {
      console.error(
        "Error cargando cursos:",
        err
      );

      setError(
        "No se pudieron cargar los datos. Verifica que JSON Server esté ejecutándose."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  /* =====================================================
     NORMALIZACIÓN DE ESTADOS
  ===================================================== */

  const obtenerEstado = (curso) => {
    if (curso.estado === "activo") {
      return "en_curso";
    }

    if (curso.estado === "inactivo") {
      return "culminado";
    }

    return curso.estado || "pendiente";
  };

  const obtenerNombreEstado = (estado) => {
    const nombres = {
      pendiente: "Pendiente",
      en_curso: "En curso",
      culminado: "Culminado",
    };

    return (
      nombres[estado] ||
      "Pendiente"
    );
  };

  /* =====================================================
     CALIFICACIÓN
  ===================================================== */

  const obtenerResultado = (curso) => {
    const estado =
      obtenerEstado(curso);

    if (
      estado !== "culminado" ||
      curso.calificacion === null ||
      curso.calificacion === undefined ||
      curso.calificacion === ""
    ) {
      return null;
    }

    const nota =
      Number(curso.calificacion);

    return nota >=
      NOTA_MINIMA_APROBACION
      ? "aprobado"
      : "reprobado";
  };

  const obtenerTextoResultado = (
    curso
  ) => {
    const resultado =
      obtenerResultado(curso);

    if (!resultado) {
      return null;
    }

    const nota =
      Number(curso.calificacion);

    if (resultado === "aprobado") {
      return `Aprobado con ${nota}`;
    }

    return `Reprobado con ${nota}`;
  };

  /* =====================================================
     FILTROS
  ===================================================== */

  const cursosFiltrados = useMemo(() => {
    const texto =
      busqueda.trim().toLowerCase();

    return cursos.filter((curso) => {
      const estado =
        obtenerEstado(curso);

      const resultado =
        obtenerResultado(curso);

      const coincideBusqueda =
        !texto ||
        curso.nombre
          ?.toLowerCase()
          .includes(texto) ||
        curso.codigo
          ?.toLowerCase()
          .includes(texto) ||
        curso.profesor
          ?.toLowerCase()
          .includes(texto);

      if (!coincideBusqueda) {
        return false;
      }

      switch (filtro) {
        case "en_curso":
          return estado === "en_curso";

        case "culminados":
          return estado === "culminado";

        case "aprobados":
          return resultado === "aprobado";

        case "reprobados":
          return resultado === "reprobado";

        case "todos":
        default:
          return true;
      }
    });
  }, [
    cursos,
    filtro,
    busqueda,
  ]);

  /* =====================================================
     CONTADORES
  ===================================================== */

  const cursosEnCurso =
    cursos.filter(
      (curso) =>
        obtenerEstado(curso) ===
        "en_curso"
    ).length;

  const cursosCulminados =
    cursos.filter(
      (curso) =>
        obtenerEstado(curso) ===
        "culminado"
    ).length;

  const cursosAprobados =
    cursos.filter(
      (curso) =>
        obtenerResultado(curso) ===
        "aprobado"
    ).length;

  const cursosReprobados =
    cursos.filter(
      (curso) =>
        obtenerResultado(curso) ===
        "reprobado"
    ).length;

  /* =====================================================
     FORMULARIO
  ===================================================== */

  const abrirFormulario = () => {
    setCursoEditar(null);
    setMostrarFormulario(true);

    setTimeout(() => {
      document
        .querySelector(
          ".formulario-section"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const manejarEditar = (curso) => {
    setCursoEditar(curso);
    setMostrarFormulario(true);

    setTimeout(() => {
      document
        .querySelector(
          ".formulario-section"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setCursoEditar(null);
  };

  /* =====================================================
     GUARDAR CURSO
  ===================================================== */

  const manejarGuardar = async (
    curso
  ) => {
    try {
      setError("");

      const datosCurso = {
        ...curso,

        estado:
          curso.estado === "activo"
            ? "en_curso"
            : curso.estado ||
              "pendiente",

        calificacion:
          curso.calificacion === "" ||
          curso.calificacion === undefined
            ? null
            : Number(
                curso.calificacion
              ),
      };

      if (cursoEditar) {
        const actualizado =
          await updateCurso(
            cursoEditar.id,
            datosCurso
          );

        setCursos((actuales) =>
          actuales.map((item) =>
            item.id ===
            cursoEditar.id
              ? actualizado
              : item
          )
        );
      } else {
        const nuevoCurso =
          await createCurso(
            datosCurso
          );

        setCursos((actuales) => [
          ...actuales,
          nuevoCurso,
        ]);
      }

      setMostrarFormulario(false);
      setCursoEditar(null);
    } catch (err) {
      console.error(
        "Error guardando curso:",
        err
      );

      setError(
        "No se pudo guardar el curso."
      );
    }
  };

  /* =====================================================
     IMPORTAR PLAN DE ESTUDIOS
  ===================================================== */

  const abrirImportador = () => {
    setError("");
    setMostrarImportador(true);
  };

  const cerrarImportador = () => {
    if (importandoCursos) {
      return;
    }

    setMostrarImportador(false);
  };

  const manejarImportarCursos = async (
    cursosImportados
  ) => {
    if (
      !cursosImportados ||
      cursosImportados.length === 0
    ) {
      setError(
        "No hay cursos seleccionados para importar."
      );

      return;
    }

    try {
      setImportandoCursos(true);
      setError("");

      /*
        Guardamos los códigos que ya existen
        para evitar duplicados.
      */
      const codigosExistentes =
        new Set(
          cursos
            .map(
              (curso) =>
                curso.codigo
                  ?.trim()
                  .toLowerCase()
            )
            .filter(Boolean)
        );

      const cursosNuevos =
        cursosImportados.filter(
          (curso) => {
            const codigo =
              curso.codigo
                ?.trim()
                .toLowerCase();

            /*
              Si tiene código y ya existe,
              no lo volvemos a crear.
            */
            if (
              codigo &&
              codigosExistentes.has(
                codigo
              )
            ) {
              return false;
            }

            if (codigo) {
              codigosExistentes.add(
                codigo
              );
            }

            return true;
          }
        );

      if (cursosNuevos.length === 0) {
        setError(
          "Todos los cursos detectados ya existen en tu historial."
        );

        return;
      }

      const cursosCreados = [];

      /*
        Se crean uno por uno para evitar
        problemas con JSON Server.
      */
      for (const curso of cursosNuevos) {
        const nuevoCurso =
          await createCurso({
            nombre:
              curso.nombre?.trim() ||
              "Curso sin nombre",

            codigo:
              curso.codigo?.trim() ||
              "",

            profesor:
              curso.profesor?.trim() ||
              "",

            creditos:
              Number(
                curso.creditos
              ) || 4,

            semestre:
              curso.semestre?.trim() ||
              "",

            estado:
              curso.estado ||
              "pendiente",

            color:
              curso.color ||
              "blue",

            calificacion:
              curso.estado ===
              "culminado" &&
              curso.calificacion !==
                "" &&
              curso.calificacion !==
                null &&
              curso.calificacion !==
                undefined
                ? Number(
                    curso.calificacion
                  )
                : null,
          });

        cursosCreados.push(
          nuevoCurso
        );
      }

      setCursos((actuales) => [
        ...actuales,
        ...cursosCreados,
      ]);

      setMostrarImportador(false);

      /*
        Dejamos un mensaje de éxito temporal
        utilizando el mismo sistema de mensajes
        de la página.
      */
      setError(
        `Se importaron ${cursosCreados.length} ${
          cursosCreados.length === 1
            ? "curso"
            : "cursos"
        } correctamente.`
      );
    } catch (err) {
      console.error(
        "Error importando cursos:",
        err
      );

      setError(
        "No se pudieron importar todos los cursos. Verifica que JSON Server esté ejecutándose."
      );
    } finally {
      setImportandoCursos(false);
    }
  };

  /* =====================================================
     CULMINAR CURSO
  ===================================================== */

  const abrirCulminar = (
    curso
  ) => {
    setCursoCulminar(curso);

    setCalificacion(
      curso.calificacion ??
        ""
    );
  };

  const cancelarCulminar = () => {
    setCursoCulminar(null);
    setCalificacion("");
  };

  const manejarCalificacion = (
    event
  ) => {
    const valor =
      event.target.value;

    if (valor === "") {
      setCalificacion("");
      return;
    }

    const numero =
      Number(valor);

    if (
      Number.isNaN(numero) ||
      numero < 0 ||
      numero > 10
    ) {
      return;
    }

    setCalificacion(valor);
  };

  const confirmarCulminacion =
    async () => {
      if (!cursoCulminar) {
        return;
      }

      const nota =
        Number(calificacion);

      if (
        calificacion === "" ||
        Number.isNaN(nota) ||
        nota < 0 ||
        nota > 10
      ) {
        setError(
          "Ingresa una calificación válida entre 0 y 10."
        );

        return;
      }

      try {
        setGuardandoCalificacion(
          true
        );

        setError("");

        const actualizado =
          await updateCurso(
            cursoCulminar.id,
            {
              estado: "culminado",
              calificacion: nota,
            }
          );

        setCursos((actuales) =>
          actuales.map((item) =>
            item.id ===
            cursoCulminar.id
              ? actualizado
              : item
          )
        );

        setCursoCulminar(null);
        setCalificacion("");
      } catch (err) {
        console.error(
          "Error culminando curso:",
          err
        );

        setError(
          "No se pudo registrar la calificación."
        );
      } finally {
        setGuardandoCalificacion(
          false
        );
      }
    };

  /* =====================================================
     ELIMINAR
  ===================================================== */

  const manejarEliminar = async (
    id
  ) => {
    const curso =
      cursos.find(
        (item) => item.id === id
      );

    const entregasRelacionadas =
      entregas.filter(
        (entrega) =>
          Number(
            entrega.cursoId
          ) === Number(id)
      );

    if (
      entregasRelacionadas.length >
      0
    ) {
      setError(
        `No puedes eliminar "${curso?.nombre}" porque tiene ${entregasRelacionadas.length} entrega(s) vinculada(s).`
      );

      return;
    }

    const confirmar =
      window.confirm(
        `¿Deseas eliminar el curso "${curso?.nombre}"?`
      );

    if (!confirmar) {
      return;
    }

    try {
      await deleteCurso(id);

      setCursos((actuales) =>
        actuales.filter(
          (item) =>
            item.id !== id
        )
      );
    } catch (err) {
      setError(
        "No se pudo eliminar el curso."
      );
    }
  };

  /* =====================================================
     ENTREGAS
  ===================================================== */

  const contarEntregas = (
    cursoId
  ) => {
    return entregas.filter(
      (entrega) =>
        Number(
          entrega.cursoId
        ) === Number(cursoId)
    ).length;
  };

  const obtenerProximaEntrega = (
    cursoId
  ) => {
    const relacionadas =
      entregas
        .filter(
          (entrega) =>
            Number(
              entrega.cursoId
            ) === Number(cursoId)
        )
        .sort(
          (a, b) =>
            new Date(
              a.fechaEntrega
            ) -
            new Date(
              b.fechaEntrega
            )
        );

    return (
      relacionadas[0] || null
    );
  };

  /* =====================================================
     COLORES
  ===================================================== */

  const obtenerClaseColor = (
    color
  ) => {
    const colores = {
      blue: "curso-blue",
      lavender: "curso-lavender",
      ice: "curso-ice",
      steel: "curso-steel",
      slate: "curso-slate",
    };

    return (
      colores[color] ||
      "curso-blue"
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="cursos-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="cursos-header">
        <div>
          <span className="page-eyebrow">
            Historial académico
          </span>

          <p className="page-description">
            Consulta los cursos que has llevado,
            los que estás cursando y tu rendimiento
            académico.
          </p>
        </div>

        <div className="cursos-header-actions">
          <button
            type="button"
            className="btn-importar-plan"
            onClick={
              abrirImportador
            }
          >
            <span>↑</span>
            Importar plan
          </button>

          <button
            type="button"
            className="btn-nuevo-curso"
            onClick={
              abrirFormulario
            }
          >
            <span>+</span>
            Nuevo curso
          </button>
        </div>
      </section>

      {/* =================================================
          MENSAJE
      ================================================= */}

      {error && (
        <div
          className={`mensaje-error ${
            error.includes(
              "correctamente"
            )
              ? "mensaje-exito"
              : ""
          }`}
        >
          <span>
            {error.includes(
              "correctamente"
            )
              ? "✓"
              : "!"}
          </span>

          <p>{error}</p>

          <button
            type="button"
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
          FILTROS
      ================================================= */}

      <section className="cursos-filtros">
        <div className="cursos-buscador">
          <span>⌕</span>

          <input
            type="search"
            value={busqueda}
            onChange={(event) =>
              setBusqueda(
                event.target.value
              )
            }
            placeholder="Buscar por curso, código o profesor..."
          />

          {busqueda && (
            <button
              type="button"
              onClick={() =>
                setBusqueda("")
              }
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        <div className="filtros-cursos">
          <button
            type="button"
            className={
              filtro === "todos"
                ? "filtro-curso-activo"
                : ""
            }
            onClick={() =>
              setFiltro("todos")
            }
          >
            Todos

            <span>
              {cursos.length}
            </span>
          </button>

          <button
            type="button"
            className={
              filtro === "en_curso"
                ? "filtro-curso-activo"
                : ""
            }
            onClick={() =>
              setFiltro("en_curso")
            }
          >
            En curso

            <span>
              {cursosEnCurso}
            </span>
          </button>

          <button
            type="button"
            className={
              filtro === "culminados"
                ? "filtro-curso-activo"
                : ""
            }
            onClick={() =>
              setFiltro(
                "culminados"
              )
            }
          >
            Culminados

            <span>
              {cursosCulminados}
            </span>
          </button>

          <button
            type="button"
            className={
              filtro === "aprobados"
                ? "filtro-curso-activo"
                : ""
            }
            onClick={() =>
              setFiltro(
                "aprobados"
              )
            }
          >
            Aprobados

            <span>
              {cursosAprobados}
            </span>
          </button>

          <button
            type="button"
            className={
              filtro === "reprobados"
                ? "filtro-curso-activo"
                : ""
            }
            onClick={() =>
              setFiltro(
                "reprobados"
              )
            }
          >
            Reprobados

            <span>
              {cursosReprobados}
            </span>
          </button>
        </div>
      </section>

      {/* =================================================
          FORMULARIO
      ================================================= */}

      {mostrarFormulario && (
        <section className="formulario-section">
          <CursosForm
            cursoEditar={
              cursoEditar
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

      <section className="resumen-cursos">
        <div className="resumen-item">
          <span className="resumen-label">
            Total de cursos
          </span>

          <strong>
            {cursos.length}
          </strong>
        </div>

        <div className="resumen-item">
          <span className="resumen-label">
            En curso
          </span>

          <strong>
            {cursosEnCurso}
          </strong>
        </div>

        <div className="resumen-item">
          <span className="resumen-label">
            Culminados
          </span>

          <strong>
            {cursosCulminados}
          </strong>
        </div>

        <div className="resumen-item">
          <span className="resumen-label">
            Aprobados
          </span>

          <strong>
            {cursosAprobados}
          </strong>
        </div>
      </section>

      {/* =================================================
          LISTA
      ================================================= */}

      <section className="cursos-section">
        <div className="section-title">
          <div>
            <span className="section-eyebrow">
              Historial
            </span>

            <h2>
              Mis cursos
            </h2>
          </div>

          <span className="contador-cursos">
            {cursosFiltrados.length}{" "}
            {cursosFiltrados.length ===
            1
              ? "resultado"
              : "resultados"}
          </span>
        </div>

        {cargando ? (
          <div className="estado-vacio">
            <div className="spinner"></div>

            <p>
              Cargando cursos...
            </p>
          </div>
        ) : cursosFiltrados.length ===
          0 ? (
          <div className="estado-vacio">
            <div className="vacio-icon">
              ∅
            </div>

            <h3>
              No encontramos cursos
            </h3>

            <p>
              Prueba con otro filtro
              o cambia la búsqueda.
            </p>

            {busqueda && (
              <button
                type="button"
                className="btn-nuevo-curso"
                onClick={() =>
                  setBusqueda("")
                }
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="cursos-grid">
            {cursosFiltrados.map(
              (curso) => {
                const cantidadEntregas =
                  contarEntregas(
                    curso.id
                  );

                const proximaEntrega =
                  obtenerProximaEntrega(
                    curso.id
                  );

                const estado =
                  obtenerEstado(
                    curso
                  );

                const resultado =
                  obtenerResultado(
                    curso
                  );

                const textoResultado =
                  obtenerTextoResultado(
                    curso
                  );

                return (
                  <article
                    className="curso-card"
                    key={curso.id}
                  >
                    <div
                      className={`curso-accent ${obtenerClaseColor(
                        curso.color
                      )}`}
                    ></div>

                    <div className="curso-card-content">
                      <div className="curso-card-top">
                        <span className="curso-codigo">
                          {curso.codigo ||
                            "SIN CÓDIGO"}
                        </span>

                        <span
                          className={`estado-curso estado-${estado}`}
                        >
                          <span></span>

                          {obtenerNombreEstado(
                            estado
                          )}
                        </span>
                      </div>

                      <h3>
                        {curso.nombre}
                      </h3>

                      <p className="curso-profesor">
                        {curso.profesor ||
                          "Profesor no registrado"}
                      </p>

                      <div className="curso-meta">
                        <div>
                          <span>
                            Créditos
                          </span>

                          <strong>
                            {curso.creditos}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Semestre
                          </span>

                          <strong>
                            {curso.semestre ||
                              "Sin definir"}
                          </strong>
                        </div>
                      </div>

                      {textoResultado ? (
                        <div
                          className={`curso-resultado resultado-${resultado}`}
                        >
                          <span>
                            {resultado ===
                            "aprobado"
                              ? "✓"
                              : "×"}
                          </span>

                          <strong>
                            {
                              textoResultado
                            }
                          </strong>
                        </div>
                      ) : (
                        estado ===
                          "en_curso" && (
                          <button
                            type="button"
                            className="btn-culminar-curso"
                            onClick={() =>
                              abrirCulminar(
                                curso
                              )
                            }
                          >
                            <span>
                              ✓
                            </span>

                            Culminar curso
                          </button>
                        )
                      )}

                      <div className="curso-entregas">
                        <div>
                          <span className="entregas-icon">
                            □
                          </span>

                          <div>
                            <strong>
                              {
                                cantidadEntregas
                              }{" "}
                              {cantidadEntregas ===
                              1
                                ? "entrega"
                                : "entregas"}
                            </strong>

                            <span>
                              vinculadas
                            </span>
                          </div>
                        </div>

                        {proximaEntrega && (
                          <div className="proxima-entrega">
                            <span>
                              Próxima
                            </span>

                            <strong>
                              {new Date(
                                proximaEntrega.fechaEntrega
                              ).toLocaleDateString(
                                "es-CR",
                                {
                                  day: "2-digit",
                                  month:
                                    "short",
                                }
                              )}
                            </strong>
                          </div>
                        )}
                      </div>

                      <div className="curso-actions">
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() =>
                            manejarEditar(
                              curso
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="btn-eliminar"
                          onClick={() =>
                            manejarEliminar(
                              curso.id
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* =================================================
          MODAL CULMINAR
      ================================================= */}

      {cursoCulminar && (
        <div
          className="culminar-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              cancelarCulminar();
            }
          }}
        >
          <div className="culminar-modal">
            <div className="culminar-header">
              <div>
                <span>
                  Curso culminado
                </span>

                <h2>
                  {cursoCulminar.nombre}
                </h2>

                <p>
                  Registra la calificación
                  final obtenida.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cancelarCulminar
                }
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="culminar-form">
              <label htmlFor="calificacionFinal">
                Calificación final
              </label>

              <div className="calificacion-input">
                <input
                  id="calificacionFinal"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={
                    calificacion
                  }
                  onChange={
                    manejarCalificacion
                  }
                  placeholder="0.0"
                  autoFocus
                />

                <span>
                  / 10
                </span>
              </div>

              <small>
                Una calificación de{" "}
                {
                  NOTA_MINIMA_APROBACION
                }{" "}
                o superior se considera
                aprobada.
              </small>
            </div>

            <div className="culminar-actions">
              <button
                type="button"
                className="culminar-cancelar"
                onClick={
                  cancelarCulminar
                }
                disabled={
                  guardandoCalificacion
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className="culminar-guardar"
                onClick={
                  confirmarCulminacion
                }
                disabled={
                  guardandoCalificacion
                }
              >
                {guardandoCalificacion
                  ? "Guardando..."
                  : "Guardar calificación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          IMPORTADOR DE PLAN
      ================================================= */}

      {mostrarImportador && (
        <PlanEstudiosImporter
          onImport={
            manejarImportarCursos
          }
          onClose={
            cerrarImportador
          }
        />
      )}
    </main>
  );
}

export default Cursos;