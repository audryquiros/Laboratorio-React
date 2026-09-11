import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { getCursos } from "../../services/cursosService";
import { getEntregas } from "../../services/entregasService";
import { getAlertas } from "../../services/alertasService";

import { obtenerTemperatura } from "../../utils/academicRisk";

import "./Header.css";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { cerrarSesion } = useAuth();

  const headerToolsRef =
    useRef(null);

  const searchInputRef =
    useRef(null);

  const [mostrarBusqueda, setMostrarBusqueda] =
    useState(false);

  const [
    mostrarNotificaciones,
    setMostrarNotificaciones,
  ] = useState(false);

  const [busqueda, setBusqueda] =
    useState("");

  const [cursos, setCursos] =
    useState([]);

  const [entregas, setEntregas] =
    useState([]);

  const [alertas, setAlertas] =
    useState([]);

  const [cargandoDatos, setCargandoDatos] =
    useState(true);

  /* =====================================================
     TÍTULOS
  ===================================================== */

  const titulos = {
    "/dashboard": "Dashboard",
    "/cursos": "Cursos",
    "/entregas": "Entregas",
    "/calendario": "Calendario",
    "/automatizacion":
      "Automatización",
    "/configuracion":
      "Configuración",
    "/perfil": "Perfil",
  };

  const titulo =
    titulos[location.pathname] ||
    "FrostFlow";

  /* =====================================================
     FECHA
  ===================================================== */

  const fecha =
    new Date().toLocaleDateString(
      "es-CR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      }
    );

  /* =====================================================
     CARGAR DATOS
  ===================================================== */

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        setCargandoDatos(true);

        const [
          cursosData,
          entregasData,
          alertasData,
        ] = await Promise.all([
          getCursos(),
          getEntregas(),
          getAlertas(),
        ]);

        if (!activo) return;

        setCursos(
          Array.isArray(cursosData)
            ? cursosData
            : []
        );

        setEntregas(
          Array.isArray(entregasData)
            ? entregasData
            : []
        );

        setAlertas(
          Array.isArray(alertasData)
            ? alertasData
            : []
        );
      } catch (error) {
        console.error(
          "No se pudieron cargar los datos del Header:",
          error
        );
      } finally {
        if (activo) {
          setCargandoDatos(false);
        }
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  /* =====================================================
     ACTUALIZAR DATOS AL ABRIR HERRAMIENTAS
  ===================================================== */

  useEffect(() => {
    if (
      !mostrarBusqueda &&
      !mostrarNotificaciones
    ) {
      return;
    }

    let activo = true;

    const actualizarDatos = async () => {
      try {
        const [
          cursosData,
          entregasData,
          alertasData,
        ] = await Promise.all([
          getCursos(),
          getEntregas(),
          getAlertas(),
        ]);

        if (!activo) return;

        setCursos(
          Array.isArray(cursosData)
            ? cursosData
            : []
        );

        setEntregas(
          Array.isArray(entregasData)
            ? entregasData
            : []
        );

        setAlertas(
          Array.isArray(alertasData)
            ? alertasData
            : []
        );
      } catch (error) {
        console.error(
          "No se pudieron actualizar los datos del Header:",
          error
        );
      }
    };

    actualizarDatos();

    return () => {
      activo = false;
    };
  }, [
    mostrarBusqueda,
    mostrarNotificaciones,
  ]);

  /* =====================================================
     CERRAR AL HACER CLICK AFUERA
  ===================================================== */

  useEffect(() => {
    const manejarClickFuera = (
      event
    ) => {
      if (
        headerToolsRef.current &&
        !headerToolsRef.current.contains(
          event.target
        )
      ) {
        setMostrarBusqueda(false);

        setMostrarNotificaciones(
          false
        );
      }
    };

    document.addEventListener(
      "mousedown",
      manejarClickFuera
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        manejarClickFuera
      );
    };
  }, []);

  /* =====================================================
     ESC PARA CERRAR
  ===================================================== */

  useEffect(() => {
    const manejarEscape = (
      event
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      setMostrarBusqueda(false);

      setMostrarNotificaciones(
        false
      );
    };

    document.addEventListener(
      "keydown",
      manejarEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        manejarEscape
      );
    };
  }, []);

  /* =====================================================
     ENFOCAR BUSCADOR
  ===================================================== */

  useEffect(() => {
    if (!mostrarBusqueda) {
      return;
    }

    const temporizador =
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

    return () => {
      clearTimeout(temporizador);
    };
  }, [mostrarBusqueda]);

  /* =====================================================
     BUSCADOR
  ===================================================== */

  const textoBusqueda =
    busqueda.trim().toLowerCase();

  const resultadosBusqueda = [];

  if (textoBusqueda) {
    cursos
      .filter((curso) => {
        const nombre =
          curso.nombre
            ?.toLowerCase() || "";

        const codigo =
          curso.codigo
            ?.toLowerCase() || "";

        const profesor =
          curso.profesor
            ?.toLowerCase() || "";

        return (
          nombre.includes(
            textoBusqueda
          ) ||
          codigo.includes(
            textoBusqueda
          ) ||
          profesor.includes(
            textoBusqueda
          )
        );
      })
      .forEach((curso) => {
        resultadosBusqueda.push({
          id: `curso-${curso.id}`,
          tipo: "Curso",
          titulo:
            curso.nombre ||
            "Curso sin nombre",
          detalle:
            curso.codigo ||
            "Sin código",
          ruta: "/cursos",
        });
      });

    entregas
      .filter((entrega) => {
        const tituloEntrega =
          entrega.titulo
            ?.toLowerCase() || "";

        const descripcion =
          entrega.descripcion
            ?.toLowerCase() || "";

        return (
          tituloEntrega.includes(
            textoBusqueda
          ) ||
          descripcion.includes(
            textoBusqueda
          )
        );
      })
      .forEach((entrega) => {
        const curso =
          cursos.find(
            (item) =>
              Number(item.id) ===
              Number(
                entrega.cursoId
              )
          );

        resultadosBusqueda.push({
          id: `entrega-${entrega.id}`,
          tipo: "Entrega",
          titulo:
            entrega.titulo ||
            "Entrega sin título",
          detalle:
            curso?.nombre ||
            "Sin curso",
          ruta: "/entregas",
        });
      });
  }

  const abrirBusqueda = () => {
    setMostrarBusqueda(
      (actual) => !actual
    );

    setMostrarNotificaciones(
      false
    );
  };

  const abrirResultado = (
    resultado
  ) => {
    navigate(resultado.ruta);

    setBusqueda("");

    setMostrarBusqueda(false);
  };

  /* =====================================================
     NOTIFICACIONES
  ===================================================== */

  const alertasValidas = alertas
    .filter(
      (alerta) =>
        alerta &&
        alerta.leida !== true
    )
    .sort(
      (a, b) =>
        new Date(
          b.fecha ||
            b.fechaCreacion ||
            0
        ) -
        new Date(
          a.fecha ||
            a.fechaCreacion ||
            0
        )
    );

  const entregasAtencion =
    entregas
      .filter((entrega) => {
        const temperatura =
          obtenerTemperatura(
            entrega.fechaEntrega,
            entrega.estado
          );

        return (
          temperatura ===
            "critico" ||
          temperatura ===
            "urgente" ||
          temperatura ===
            "vencido"
        );
      })
      .sort(
        (a, b) =>
          new Date(
            a.fechaEntrega
          ) -
          new Date(
            b.fechaEntrega
          )
      );

  const usarAlertasReales =
    alertasValidas.length > 0;

  const cantidadNotificaciones =
    usarAlertasReales
      ? alertasValidas.length
      : entregasAtencion.length;

  const abrirNotificaciones =
    () => {
      setMostrarNotificaciones(
        (actual) => !actual
      );

      setMostrarBusqueda(false);
    };

  const obtenerTextoNotificacion =
    (entrega) => {
      const temperatura =
        obtenerTemperatura(
          entrega.fechaEntrega,
          entrega.estado
        );

      const textos = {
        critico: "Vence hoy",
        urgente:
          "Entrega próxima",
        vencido:
          "Entrega vencida",
      };

      return (
        textos[temperatura] ||
        "Revisar entrega"
      );
    };

  const obtenerTemperaturaAlerta =
    (alerta) => {
      const tipo =
        alerta.tipo ||
        alerta.temperatura ||
        "";

      if (
        tipo === "critico" ||
        tipo === "urgente" ||
        tipo === "vencido"
      ) {
        return tipo;
      }

      return "urgente";
    };

  const manejarNotificacion =
    (notificacion) => {
      if (
        notificacion?.entregaId
      ) {
        navigate("/entregas");
      } else {
        navigate("/entregas");
      }

      setMostrarNotificaciones(
        false
      );
    };

  /* =====================================================
     CERRAR SESIÓN
  ===================================================== */

  const manejarCerrarSesion =
    () => {
      cerrarSesion();

      setMostrarBusqueda(false);

      setMostrarNotificaciones(
        false
      );

      setBusqueda("");

      navigate("/login", {
        replace: true,
      });
    };

  return (
    <header className="header">
      {/* =================================================
          TÍTULO
      ================================================= */}

      <div className="header-title">
        <h1>{titulo}</h1>
      </div>

      <div
        className="header-actions"
        ref={headerToolsRef}
      >
        {/* =================================================
            FECHA
        ================================================= */}

        <div className="header-date">
          <span className="date-icon">
            ◷
          </span>

          <span>{fecha}</span>
        </div>

        {/* =================================================
            BUSCADOR
        ================================================= */}

        <div className="header-tool">
          <button
            type="button"
            className={`header-search ${
              mostrarBusqueda
                ? "header-tool-active"
                : ""
            }`}
            onClick={abrirBusqueda}
            aria-label="Buscar"
            aria-expanded={
              mostrarBusqueda
            }
          >
            <span>⌕</span>
          </button>

          {mostrarBusqueda && (
            <div className="header-dropdown search-dropdown">
              <div className="dropdown-header">
                <div>
                  <span>
                    Buscar
                  </span>

                  <strong>
                    Cursos y entregas
                  </strong>
                </div>
              </div>

              <div className="search-input-wrapper">
                <span>⌕</span>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={busqueda}
                  onChange={(
                    event
                  ) =>
                    setBusqueda(
                      event.target.value
                    )
                  }
                  placeholder="Buscar curso, código, profesor o entrega..."
                />

                {busqueda && (
                  <button
                    type="button"
                    onClick={() =>
                      setBusqueda(
                        ""
                      )
                    }
                    aria-label="Limpiar búsqueda"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="search-results">
                {!textoBusqueda ? (
                  <div className="dropdown-empty">
                    <span>⌕</span>

                    <p>
                      Escribe para buscar
                      cursos o entregas.
                    </p>
                  </div>
                ) : cargandoDatos ? (
                  <div className="dropdown-empty">
                    <p>
                      Cargando
                      información...
                    </p>
                  </div>
                ) : resultadosBusqueda.length ===
                  0 ? (
                  <div className="dropdown-empty">
                    <span>∅</span>

                    <p>
                      No encontramos
                      resultados.
                    </p>
                  </div>
                ) : (
                  resultadosBusqueda
                    .slice(0, 8)
                    .map(
                      (
                        resultado
                      ) => (
                        <button
                          type="button"
                          className="search-result"
                          key={
                            resultado.id
                          }
                          onClick={() =>
                            abrirResultado(
                              resultado
                            )
                          }
                        >
                          <span className="result-icon">
                            {resultado.tipo ===
                            "Curso"
                              ? "▣"
                              : "□"}
                          </span>

                          <span className="result-info">
                            <strong>
                              {
                                resultado.titulo
                              }
                            </strong>

                            <small>
                              {
                                resultado.tipo
                              }{" "}
                              ·{" "}
                              {
                                resultado.detalle
                              }
                            </small>
                          </span>

                          <span className="result-arrow">
                            →
                          </span>
                        </button>
                      )
                    )
                )}
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            NOTIFICACIONES
        ================================================= */}

        <div className="header-tool">
          <button
            type="button"
            className={`header-notifications ${
              mostrarNotificaciones
                ? "header-tool-active"
                : ""
            }`}
            onClick={
              abrirNotificaciones
            }
            aria-label="Notificaciones"
            aria-expanded={
              mostrarNotificaciones
            }
          >
            <span>♢</span>

            {cantidadNotificaciones >
              0 && <i></i>}
          </button>

          {mostrarNotificaciones && (
            <div className="header-dropdown notification-dropdown">
              <div className="dropdown-header notification-header">
                <div>
                  <span>
                    Actividad
                  </span>

                  <strong>
                    Notificaciones
                  </strong>
                </div>

                {cantidadNotificaciones >
                  0 && (
                  <span className="notification-count">
                    {
                      cantidadNotificaciones
                    }
                  </span>
                )}
              </div>

              <div className="notification-list">
                {cargandoDatos ? (
                  <div className="dropdown-empty">
                    <p>
                      Cargando
                      notificaciones...
                    </p>
                  </div>
                ) : usarAlertasReales ? (
                  alertasValidas
                    .slice(0, 5)
                    .map(
                      (alerta) => {
                        const temperatura =
                          obtenerTemperaturaAlerta(
                            alerta
                          );

                        return (
                          <button
                            type="button"
                            className="notification-item"
                            key={
                              alerta.id
                            }
                            onClick={() =>
                              manejarNotificacion(
                                alerta
                              )
                            }
                          >
                            <span
                              className={`notification-indicator temperatura-${temperatura}`}
                            >
                              {temperatura ===
                              "critico"
                                ? "▲"
                                : temperatura ===
                                  "vencido"
                                ? "!"
                                : "◉"}
                            </span>

                            <span className="notification-info">
                              <strong>
                                {
                                  alerta.titulo
                                }
                              </strong>

                              <small>
                                {alerta.mensaje ||
                                  alerta.descripcion ||
                                  "Revisar alerta académica"}
                              </small>
                            </span>

                            <span className="notification-arrow">
                              →
                            </span>
                          </button>
                        );
                      }
                    )
                ) : entregasAtencion.length ===
                  0 ? (
                  <div className="dropdown-empty">
                    <span>
                      ✓
                    </span>

                    <p>
                      No tienes entregas
                      que requieran
                      atención.
                    </p>
                  </div>
                ) : (
                  entregasAtencion
                    .slice(0, 5)
                    .map(
                      (entrega) => {
                        const temperatura =
                          obtenerTemperatura(
                            entrega.fechaEntrega,
                            entrega.estado
                          );

                        return (
                          <button
                            type="button"
                            className="notification-item"
                            key={
                              entrega.id
                            }
                            onClick={() =>
                              manejarNotificacion(
                                entrega
                              )
                            }
                          >
                            <span
                              className={`notification-indicator temperatura-${temperatura}`}
                            >
                              {temperatura ===
                              "critico"
                                ? "▲"
                                : temperatura ===
                                  "vencido"
                                ? "!"
                                : "◉"}
                            </span>

                            <span className="notification-info">
                              <strong>
                                {
                                  entrega.titulo
                                }
                              </strong>

                              <small>
                                {obtenerTextoNotificacion(
                                  entrega
                                )}
                              </small>
                            </span>

                            <span className="notification-arrow">
                              →
                            </span>
                          </button>
                        );
                      }
                    )
                )}
              </div>

              {cantidadNotificaciones >
                0 && (
                <button
                  type="button"
                  className="notification-footer"
                  onClick={() => {
                    navigate(
                      "/entregas"
                    );

                    setMostrarNotificaciones(
                      false
                    );
                  }}
                >
                  Ver todas las
                  entregas

                  <span>
                    →
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* =================================================
            DIVISOR
        ================================================= */}

        <div className="header-divider"></div>

        {/* =================================================
            CERRAR SESIÓN
        ================================================= */}

        <button
          type="button"
          className="header-logout"
          onClick={
            manejarCerrarSesion
          }
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <span>↪</span>
        </button>
      </div>
    </header>
  );
}

export default Header;