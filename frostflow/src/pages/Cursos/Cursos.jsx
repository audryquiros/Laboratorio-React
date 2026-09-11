import { useEffect, useState } from "react";
import CursosForm from "../../components/CursosForm/CursosForm";
import {
  getCursos,
  createCurso,
  updateCurso,
  deleteCurso,
} from "../../services/cursosService";
import { getEntregas } from "../../services/entregasService";
import "./Cursos.css";

function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cursoEditar, setCursoEditar] = useState(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [cursosData, entregasData] = await Promise.all([
        getCursos(),
        getEntregas(),
      ]);

      setCursos(cursosData);
      setEntregas(entregasData);
    } catch (err) {
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

  const manejarGuardar = async (curso) => {
    try {
      setError("");

      if (cursoEditar) {
        const actualizado = await updateCurso(cursoEditar.id, curso);

        setCursos((actuales) =>
          actuales.map((item) =>
            item.id === cursoEditar.id ? actualizado : item
          )
        );

        setCursoEditar(null);
      } else {
        const nuevoCurso = await createCurso(curso);
        setCursos((actuales) => [...actuales, nuevoCurso]);
      }

      setMostrarFormulario(false);
    } catch (err) {
      setError("No se pudo guardar el curso.");
    }
  };

const manejarEditar = (curso) => {
  setCursoEditar(curso);
  setMostrarFormulario(true);

  setTimeout(() => {
    document
      .querySelector(".formulario-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, 100);
};

  const manejarEliminar = async (id) => {
    const curso = cursos.find((item) => item.id === id);

    const entregasRelacionadas = entregas.filter(
      (entrega) => Number(entrega.cursoId) === Number(id)
    );

    if (entregasRelacionadas.length > 0) {
      setError(
        `No puedes eliminar "${curso?.nombre}" porque tiene ${entregasRelacionadas.length} entrega(s) vinculada(s).`
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas eliminar el curso "${curso?.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await deleteCurso(id);

      setCursos((actuales) =>
        actuales.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError("No se pudo eliminar el curso.");
    }
  };

    const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setCursoEditar(null);
    };

  const contarEntregas = (cursoId) => {
    return entregas.filter(
      (entrega) => Number(entrega.cursoId) === Number(cursoId)
    ).length;
  };

  const obtenerProximaEntrega = (cursoId) => {
    const relacionadas = entregas
      .filter((entrega) => Number(entrega.cursoId) === Number(cursoId))
      .sort(
        (a, b) =>
          new Date(a.fechaEntrega) - new Date(b.fechaEntrega)
      );

    return relacionadas[0] || null;
  };

  const obtenerClaseColor = (color) => {
    const colores = {
      blue: "curso-blue",
      lavender: "curso-lavender",
      ice: "curso-ice",
      steel: "curso-steel",
      slate: "curso-slate",
    };

    return colores[color] || "curso-blue";
  };

  return (
    <main className="cursos-page">
      <section className="cursos-header">
        <div>
          <span className="page-eyebrow">Gestión académica</span>

          <h1>Cursos</h1>

          <p>
            Organiza tus materias y conecta cada entrega con su curso.
          </p>
        </div>

        <button
          className="btn-nuevo-curso"
          onClick={() => {
            setCursoEditar(null);
            setMostrarFormulario(true);

            setTimeout(() => {
                document
                .querySelector(".formulario-section")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
            }}
        >
          <span>+</span>
          Nuevo curso
        </button>
      </section>

      {error && (
        <div className="mensaje-error">
          <span>!</span>
          <p>{error}</p>

          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {mostrarFormulario && (
        <section className="formulario-section">
          <CursosForm
            cursoEditar={cursoEditar}
            onGuardar={manejarGuardar}
            onCancelar={cancelarFormulario}
          />
        </section>
      )}

      <section className="resumen-cursos">
        <div className="resumen-item">
          <span className="resumen-label">Cursos activos</span>
          <strong>
            {cursos.filter((curso) => curso.estado === "activo").length}
          </strong>
        </div>

        <div className="resumen-item">
          <span className="resumen-label">Total de cursos</span>
          <strong>{cursos.length}</strong>
        </div>

        <div className="resumen-item">
          <span className="resumen-label">Entregas vinculadas</span>
          <strong>{entregas.length}</strong>
        </div>
      </section>

      <section className="cursos-section">
        <div className="section-title">
          <div>
            <span className="section-eyebrow">Tu semestre</span>
            <h2>Mis cursos</h2>
          </div>

          <span className="contador-cursos">
            {cursos.length} registrados
          </span>
        </div>

        {cargando ? (
          <div className="estado-vacio">
            <div className="spinner"></div>
            <p>Cargando cursos...</p>
          </div>
        ) : cursos.length === 0 ? (
          <div className="estado-vacio">
            <div className="vacio-icon">∅</div>
            <h3>Aún no tienes cursos</h3>
            <p>
              Agrega tu primer curso para comenzar a organizar tus entregas.
            </p>

            <button
              className="btn-nuevo-curso"
              onClick={() => setMostrarFormulario(true)}
            >
              <span>+</span>
              Agregar curso
            </button>
          </div>
        ) : (
          <div className="cursos-grid">
            {cursos.map((curso) => {
              const cantidadEntregas = contarEntregas(curso.id);
              const proximaEntrega = obtenerProximaEntrega(curso.id);

              return (
                <article className="curso-card" key={curso.id}>
                  <div
                    className={`curso-accent ${obtenerClaseColor(
                      curso.color
                    )}`}
                  ></div>

                  <div className="curso-card-content">
                    <div className="curso-card-top">
                      <span className="curso-codigo">
                        {curso.codigo}
                      </span>

                      <span
                        className={`estado-curso ${
                          curso.estado === "activo"
                            ? "estado-activo"
                            : "estado-inactivo"
                        }`}
                      >
                        <span></span>
                        {curso.estado}
                      </span>
                    </div>

                    <h3>{curso.nombre}</h3>

                    <p className="curso-profesor">
                      {curso.profesor || "Profesor no registrado"}
                    </p>

                    <div className="curso-meta">
                      <div>
                        <span>Créditos</span>
                        <strong>{curso.creditos}</strong>
                      </div>

                      <div>
                        <span>Semestre</span>
                        <strong>{curso.semestre}</strong>
                      </div>
                    </div>

                    <div className="curso-entregas">
                      <div>
                        <span className="entregas-icon">□</span>

                        <div>
                          <strong>
                            {cantidadEntregas}{" "}
                            {cantidadEntregas === 1
                              ? "entrega"
                              : "entregas"}
                          </strong>

                          <span>vinculadas</span>
                        </div>
                      </div>

                      {proximaEntrega && (
                        <div className="proxima-entrega">
                          <span>Próxima</span>

                          <strong>
                            {new Date(
                              proximaEntrega.fechaEntrega
                            ).toLocaleDateString("es-CR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </strong>
                        </div>
                      )}
                    </div>

                    <div className="curso-actions">
                      <button
                        className="btn-editar"
                        onClick={() => manejarEditar(curso)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-eliminar"
                        onClick={() => manejarEliminar(curso.id)}
                      >
                        Eliminar
                      </button>
                    </div>
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

export default Cursos;