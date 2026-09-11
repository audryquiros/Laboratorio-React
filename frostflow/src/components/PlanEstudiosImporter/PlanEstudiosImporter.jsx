import { useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import "./PlanEstudiosImporter.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const CODIGO_PATTERN =
  String.raw`[A-ZÁÉÍÓÚÑ]{2,6}(?:-\d{1,4}|-[IVX]{1,4}|-|\d{1,4})`;

const CODIGO_REGEX = new RegExp(
  CODIGO_PATTERN,
  "i"
);

const CODIGOS_REGEX_GLOBAL = new RegExp(
  CODIGO_PATTERN,
  "gi"
);

const COLORES = [
  "blue",
  "lavender",
  "ice",
  "steel",
  "slate",
];

/* =========================================================
   NORMALIZAR TEXTO
========================================================= */

const normalizarTexto = (texto = "") => {
  return texto
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/* =========================================================
   OBTENER COLOR
========================================================= */

const obtenerColorCurso = (index) => {
  return COLORES[index % COLORES.length];
};

/* =========================================================
   RECONSTRUIR LÍNEAS DEL PDF
========================================================= */

/*
  PDF.js no siempre devuelve el texto respetando las filas
  visuales del documento.

  Por eso utilizamos las coordenadas X/Y de cada fragmento
  de texto para reconstruir las filas del PDF.
*/

const extraerLineasPagina = async (page) => {
  const contenido =
    await page.getTextContent();

  const grupos = [];

  contenido.items.forEach(
    (item) => {
      const texto =
        item.str?.trim();

      if (!texto) {
        return;
      }

      const x =
        item.transform?.[4] ?? 0;

      const y =
        item.transform?.[5] ?? 0;

      /*
        Buscamos una fila con una coordenada
        Y suficientemente cercana.
      */
      let grupoEncontrado =
        grupos.find(
          (grupo) =>
            Math.abs(
              grupo.y - y
            ) <= 2.5
        );

      if (!grupoEncontrado) {
        grupoEncontrado = {
          y,
          items: [],
        };

        grupos.push(
          grupoEncontrado
        );
      }

      grupoEncontrado.items.push({
        x,
        texto,
      });
    }
  );

  /*
    PDF.js utiliza coordenadas cuyo eje Y aumenta
    hacia arriba, por eso ordenamos de mayor a menor.
  */
  grupos.sort(
    (a, b) => b.y - a.y
  );

  return grupos
    .map((grupo) => {
      grupo.items.sort(
        (a, b) => a.x - b.x
      );

      return normalizarTexto(
        grupo.items
          .map(
            (item) =>
              item.texto
          )
          .join(" ")
      );
    })
    .filter(Boolean);
};

/* =========================================================
   DETECTAR CÓDIGO AL INICIO
========================================================= */

const obtenerCodigoInicial = (
  texto
) => {
  const coincidencia =
    texto.match(
      new RegExp(
        `^(${CODIGO_PATTERN})(?=\\s|$)`,
        "i"
      )
    );

  return coincidencia
    ? coincidencia[1].toUpperCase()
    : "";
};

/* =========================================================
   LIMPIAR NOMBRE
========================================================= */

const limpiarNombre = (
  nombre = ""
) => {
  return normalizarTexto(
    nombre
      .replace(
        /^[\s\-:;,|]+/,
        ""
      )
      .replace(
        /[\s\-:;,|]+$/,
        ""
      )
  );
};

/* =========================================================
   EXTRAER NOMBRE DE UNA FILA DEL PLAN
========================================================= */

/*
  Formato principal del PDF:

  Ciclo
  Código
  T
  P
  L
  TP
  Cred.
  Requisitos
  Nombre
*/

const extraerCursoPrincipal = (
  linea,
  indice
) => {
  const coincidencia =
    linea.match(
      new RegExp(
        `^(\\d{1,2})\\s+(${CODIGO_PATTERN})\\s+(.+)$`,
        "i"
      )
    );

  if (!coincidencia) {
    return null;
  }

  const ciclo =
    coincidencia[1];

  const codigo =
    coincidencia[2].toUpperCase();

  /*
    OPT981, OPT982, etc. son bloques optativos,
    no cursos individuales.
  */
  if (
    codigo
      .toUpperCase()
      .startsWith("OPT")
  ) {
    return null;
  }

  const resto =
    coincidencia[3].trim();

  /*
    Después del código vienen 5 valores:

    T P L TP Cred.

    Algunos textos del PDF tienen el nombre
    pegado directamente al último número.
  */
  const datos =
    resto.match(
      /^(?:\d+\s*){4}(\d+)\s*(.*)$/s
    );

  if (!datos) {
    return null;
  }

  const creditos =
    Number(datos[1]);

  let textoRestante =
    datos[2].trim();

  /*
    Los requisitos aparecen antes del nombre.
    Ejemplo:

    TM1500INTRODUCCIÓN A LA INFORMÁTICA...

    o:

    TM1200; TM1300 TM2400MEDIOS DIGITALES...
  */

  const codigosEncontrados = [
    ...textoRestante.matchAll(
      CODIGOS_REGEX_GLOBAL
    ),
  ];

  if (
    codigosEncontrados.length > 0
  ) {
    const ultimoCodigo =
      codigosEncontrados[
        codigosEncontrados.length - 1
      ];

    /*
      Solo eliminamos el último código
      porque es el requisito que está
      inmediatamente antes del nombre.
    */
    textoRestante =
      textoRestante
        .slice(
          ultimoCodigo.index +
            ultimoCodigo[0].length
        )
        .trim();
  }

  const nombre =
    limpiarNombre(
      textoRestante
    );

  if (
    !nombre ||
    nombre.length < 3 ||
    nombre.length > 150
  ) {
    return null;
  }

  return {
    id: `plan-${indice}-${codigo}`,
    nombre,
    codigo,
    profesor: "",
    creditos:
      Number.isFinite(creditos) &&
      creditos > 0
        ? creditos
        : 4,
    semestre: `Ciclo ${ciclo}`,
    estado: "pendiente",
    color:
      obtenerColorCurso(
        indice
      ),
    calificacion: null,
    seleccionado: true,
  };
};

/* =========================================================
   LIMPIAR REQUISITOS INICIALES
========================================================= */

const quitarRequisitosIniciales = (
  texto
) => {
  let resultado =
    texto.trim();

  let continuar = true;

  while (continuar) {
    continuar = false;

    /*
      Eliminar "Equiv.: TM6102"
    */
    const equivalencia =
      resultado.match(
        new RegExp(
          `^Equiv\\.?\\s*:\\s*${CODIGO_PATTERN}\\s*`,
          "i"
        )
      );

    if (equivalencia) {
      resultado =
        resultado
          .slice(
            equivalencia[0]
              .length
          )
          .trim();

      continuar = true;
      continue;
    }

    /*
      Eliminar códigos de requisitos
      al principio del texto.
    */
    const codigo =
      resultado.match(
        new RegExp(
          `^${CODIGO_PATTERN}(?:\\s+|;\\s*|\\s*)`,
          "i"
        )
      );

    if (codigo) {
      resultado =
        resultado
          .slice(
            codigo[0]
              .length
          )
          .replace(
            /^[\s;|,]+/,
            ""
          )
          .trim();

      continuar = true;
    }
  }

  return resultado;
};

/* =========================================================
   DETECTAR CURSO OPTATIVO
========================================================= */

/*
  Las páginas 5, 6 y 7 tienen un formato diferente.

  Ejemplo aproximado:

  TM0100 4 TM8400 PRODUCCIÓN DE JUEGOS 0 0 0 4

  También puede aparecer:

  TM0100 PRODUCCIÓN DE JUEGOS 0 0 0 4 4 TM8400
*/

const extraerCursoOptativo = (
  bloque,
  indice
) => {
  const texto =
    normalizarTexto(
      bloque
    );

  const codigo =
    obtenerCodigoInicial(
      texto
    );

  if (!codigo) {
    return null;
  }

  /*
    No importar códigos que sean bloques.
  */
  if (
    codigo
      .toUpperCase()
      .startsWith("OPT")
  ) {
    return null;
  }

  let resto =
    texto
      .slice(
        codigo.length
      )
      .trim();

  let creditos = 4;
  let nombre = "";

  /*
    ---------------------------------------------------------
    FORMATO 1
    Código + créditos + requisitos + nombre + números
    ---------------------------------------------------------
  */

  const comienzaConNumero =
    resto.match(
      /^(\d+)\s*(.*)$/s
    );

  if (comienzaConNumero) {
    const posibleCredito =
      Number(
        comienzaConNumero[1]
      );

    if (
      posibleCredito >= 0 &&
      posibleCredito <= 20
    ) {
      creditos =
        posibleCredito;

      resto =
        comienzaConNumero[2]
          .trim();
    }

    /*
      Eliminar los 4 valores finales
      correspondientes a horas.
    */
    resto =
      resto.replace(
        /(?:\s*\d+){4}\s*$/,
        ""
      );

    /*
      Eliminar requisitos y equivalencias.
    */
    resto =
      quitarRequisitosIniciales(
        resto
      );

    nombre =
      limpiarNombre(
        resto
      );
  }

  /*
    ---------------------------------------------------------
    FORMATO 2
    Código + nombre + T P L TP Cred + requisitos
    ---------------------------------------------------------
  */

  if (
    !nombre ||
    nombre.length < 3
  ) {
    const formatoVisual =
      resto.match(
        /^(.*?)\s+(?:\d+\s+){4}(\d+)(?:\s+(.*))?$/s
      );

    if (formatoVisual) {
      nombre =
        limpiarNombre(
          formatoVisual[1]
        );

      creditos =
        Number(
          formatoVisual[2]
        ) || 4;
    }
  }

  /*
    Evitar que un encabezado se convierta
    accidentalmente en curso.
  */
  const palabrasNoCurso = [
    "CURSO",
    "NOMBRE",
    "BLOQUE",
    "OBSERVACIONES",
    "GRUPO DE CURSOS",
    "HORAS",
  ];

  const nombreMayusculas =
    nombre.toUpperCase();

  if (
    palabrasNoCurso.some(
      (palabra) =>
        nombreMayusculas ===
        palabra
    )
  ) {
    return null;
  }

  if (
    !nombre ||
    nombre.length < 3 ||
    nombre.length > 150
  ) {
    return null;
  }

  return {
    id: `plan-optativo-${indice}-${codigo}`,
    nombre,
    codigo,
    profesor: "",
    creditos:
      Number.isFinite(creditos)
        ? creditos
        : 4,
    semestre: "Optativo",
    estado: "pendiente",
    color:
      obtenerColorCurso(
        indice
      ),
    calificacion: null,
    seleccionado: true,
  };
};

/* =========================================================
   DETECTAR TODOS LOS CURSOS
========================================================= */

const detectarCursos = (
  lineasPorPagina
) => {
  const cursos = [];

  /*
    ---------------------------------------------------------
    1. CURSOS DEL PLAN PRINCIPAL
    ---------------------------------------------------------
  */

  lineasPorPagina.forEach(
    (lineas, pagina) => {
      lineas.forEach(
        (linea) => {
          const curso =
            extraerCursoPrincipal(
              linea,
              cursos.length
            );

          if (!curso) {
            return;
          }

          /*
            Evitar duplicados.
          */
          const existe =
            cursos.some(
              (actual) =>
                actual.codigo ===
                curso.codigo
            );

          if (!existe) {
            cursos.push(
              curso
            );
          }
        }
      );
    }
  );

  /*
    ---------------------------------------------------------
    2. CURSOS OPTATIVOS
    ---------------------------------------------------------

    Las páginas 5-7 contienen bloques donde algunos
    nombres ocupan más de una línea.

    Por eso agrupamos las líneas que comienzan con
    código de curso.
  */

  lineasPorPagina
    .slice(4)
    .forEach(
      (lineas) => {
        const bloques = [];

        let bloqueActual = null;

        lineas.forEach(
          (linea) => {
            const codigo =
              obtenerCodigoInicial(
                linea
              );

            if (codigo) {
              /*
                Si había un bloque anterior,
                guardarlo.
              */
              if (
                bloqueActual
              ) {
                bloques.push(
                  bloqueActual
                );
              }

              bloqueActual =
                linea;
            } else if (
              bloqueActual
            ) {
              /*
                Continuación del nombre
                del curso anterior.
              */
              bloqueActual +=
                ` ${linea}`;
            }
          }
        );

        if (
          bloqueActual
        ) {
          bloques.push(
            bloqueActual
          );
        }

        bloques.forEach(
          (bloque) => {
            const curso =
              extraerCursoOptativo(
                bloque,
                cursos.length
              );

            if (!curso) {
              return;
            }

            /*
              Evitar duplicados.
              Por ejemplo, algunos cursos
              optativos aparecen en más de
              un bloque.
            */
            const existe =
              cursos.some(
                (actual) =>
                  actual.codigo ===
                  curso.codigo
              );

            if (!existe) {
              cursos.push(
                curso
              );
            }
          }
        );
      }
    );

  /*
    Reasignar IDs y colores para que sean
    consecutivos y consistentes.
  */
  return cursos.map(
    (curso, index) => ({
      ...curso,
      id: `plan-${Date.now()}-${index}`,
      color:
        obtenerColorCurso(
          index
        ),
    })
  );
};

/* =========================================================
   COMPONENTE
========================================================= */

function PlanEstudiosImporter({
  onImport,
  onClose,
}) {
  const inputRef =
    useRef(null);

  const [archivo, setArchivo] =
    useState(null);

  const [
    cursosDetectados,
    setCursosDetectados,
  ] = useState([]);

  const [
    procesando,
    setProcesando,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [paso, setPaso] =
    useState("archivo");

  const [
    arrastrando,
    setArrastrando,
  ] = useState(false);

  /* =====================================================
     VALIDAR ARCHIVO
  ===================================================== */

  const validarArchivo = (
    file
  ) => {
    if (!file) {
      return;
    }

    setError("");

    const esPdf =
      file.type ===
        "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!esPdf) {
      setError(
        "Selecciona un archivo PDF válido."
      );

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "El archivo supera el límite de 10 MB."
      );

      return;
    }

    setArchivo(file);
  };

  /* =====================================================
     SELECCIONAR ARCHIVO
  ===================================================== */

  const manejarArchivo = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    validarArchivo(file);
  };

  /* =====================================================
     DRAG & DROP
  ===================================================== */

  const manejarDragOver = (
    event
  ) => {
    event.preventDefault();

    setArrastrando(true);
  };

  const manejarDragLeave = () => {
    setArrastrando(false);
  };

  const manejarDrop = (
    event
  ) => {
    event.preventDefault();

    setArrastrando(false);

    const file =
      event.dataTransfer
        .files?.[0];

    validarArchivo(file);
  };

  /* =====================================================
     ANALIZAR PDF
  ===================================================== */

  const analizarPDF = async () => {
    if (!archivo) {
      setError(
        "Primero selecciona un archivo PDF."
      );

      return;
    }

    try {
      setProcesando(true);
      setError("");

      const arrayBuffer =
        await archivo.arrayBuffer();

      /*
        Abrir PDF utilizando PDF.js.
      */
      const pdf =
        await pdfjsLib
          .getDocument({
            data: arrayBuffer,
          })
          .promise;

      const lineasPorPagina =
        [];

      /*
        Reconstruimos las filas
        de cada página.
      */
      for (
        let pagina = 1;
        pagina <= pdf.numPages;
        pagina++
      ) {
        const page =
          await pdf.getPage(
            pagina
          );

        const lineas =
          await extraerLineasPagina(
            page
          );

        lineasPorPagina.push(
          lineas
        );
      }

      /*
        Mostrar en consola para poder
        inspeccionar el resultado si
        necesitamos adaptar otro PDF.
      */
      console.log(
        "Líneas reconstruidas del PDF:",
        lineasPorPagina
      );

      const cursos =
        detectarCursos(
          lineasPorPagina
        );

      console.log(
        "Cursos detectados:",
        cursos
      );

      if (
        cursos.length === 0
      ) {
        setError(
          "El PDF se pudo abrir, pero no se encontraron cursos automáticamente. El documento utiliza una estructura que requiere otro patrón de lectura."
        );

        return;
      }

      setCursosDetectados(
        cursos
      );

      setPaso("revision");
    } catch (err) {
      console.error(
        "Error analizando PDF:",
        err
      );

      setError(
        "No se pudo analizar el PDF. Verifica que el documento no esté protegido o dañado."
      );
    } finally {
      setProcesando(false);
    }
  };

  /* =====================================================
     ACTUALIZAR CURSO
  ===================================================== */

  const actualizarCurso = (
    id,
    campo,
    valor
  ) => {
    setCursosDetectados(
      (actuales) =>
        actuales.map(
          (curso) =>
            curso.id === id
              ? {
                  ...curso,
                  [campo]:
                    valor,
                }
              : curso
        )
    );
  };

  /* =====================================================
     SELECCIONAR / DESELECCIONAR
  ===================================================== */

  const alternarSeleccion = (
    id
  ) => {
    setCursosDetectados(
      (actuales) =>
        actuales.map(
          (curso) =>
            curso.id === id
              ? {
                  ...curso,
                  seleccionado:
                    !curso.seleccionado,
                }
              : curso
        )
    );
  };

  const seleccionarTodos =
    () => {
      setCursosDetectados(
        (actuales) =>
          actuales.map(
            (curso) => ({
              ...curso,
              seleccionado:
                true,
            })
          )
      );
    };

  const deseleccionarTodos =
    () => {
      setCursosDetectados(
        (actuales) =>
          actuales.map(
            (curso) => ({
              ...curso,
              seleccionado:
                false,
            })
          )
      );
    };

  /* =====================================================
     ELIMINAR CURSO
  ===================================================== */

  const eliminarDetectado = (
    id
  ) => {
    setCursosDetectados(
      (actuales) =>
        actuales.filter(
          (curso) =>
            curso.id !== id
        )
    );
  };

  /* =====================================================
     VOLVER AL ARCHIVO
  ===================================================== */

  const volverArchivo = () => {
    setPaso("archivo");
    setError("");
  };

  /* =====================================================
     IMPORTAR
  ===================================================== */

  const importarCursos = () => {
    const seleccionados =
      cursosDetectados.filter(
        (curso) =>
          curso.seleccionado
      );

    if (
      seleccionados.length ===
      0
    ) {
      setError(
        "Selecciona al menos un curso para importar."
      );

      return;
    }

    const cursosLimpios =
      seleccionados.map(
        ({
          id,
          seleccionado,
          ...curso
        }) => ({
          ...curso,

          nombre:
            curso.nombre.trim(),

          codigo:
            curso.codigo
              .trim()
              .toUpperCase(),

          profesor:
            curso.profesor.trim(),

          semestre:
            curso.semestre.trim(),

          creditos:
            Number(
              curso.creditos
            ) || 4,

          estado:
            curso.estado ||
            "pendiente",

          calificacion:
            curso.estado ===
            "culminado"
              ? curso.calificacion ===
                ""
                ? null
                : Number(
                    curso.calificacion
                  )
              : null,
        })
      );

    onImport(
      cursosLimpios
    );
  };

  /* =====================================================
     CERRAR
  ===================================================== */

  const manejarCerrar = () => {
    if (procesando) {
      return;
    }

    onClose();
  };

  /* =====================================================
     VISTA: ARCHIVO
  ===================================================== */

  if (paso === "archivo") {
    return (
      <div
        className="plan-importer-overlay"
        onMouseDown={(
          event
        ) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            manejarCerrar();
          }
        }}
      >
        <section
          className="plan-importer-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="planImporterTitle"
        >
          <header className="plan-importer-header">
            <div>
              <span className="plan-importer-eyebrow">
                Importación académica
              </span>

              <h2 id="planImporterTitle">
                Importar plan de estudios
              </h2>

              <p>
                Carga tu plan de
                estudios en PDF y
                FrostFlow detectará
                los cursos
                automáticamente.
              </p>
            </div>

            <button
              type="button"
              className="plan-importer-close"
              onClick={
                manejarCerrar
              }
              aria-label="Cerrar"
            >
              ×
            </button>
          </header>

          <div className="plan-importer-body">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={
                manejarArchivo
              }
              hidden
            />

            <div
              className={`plan-dropzone ${
                arrastrando
                  ? "plan-dropzone-active"
                  : ""
              } ${
                archivo
                  ? "plan-dropzone-selected"
                  : ""
              }`}
              onDragOver={
                manejarDragOver
              }
              onDragLeave={
                manejarDragLeave
              }
              onDrop={
                manejarDrop
              }
              onClick={() =>
                inputRef.current?.click()
              }
            >
              <div className="plan-upload-icon">
                {archivo
                  ? "✓"
                  : "↑"}
              </div>

              {archivo ? (
                <>
                  <strong>
                    {archivo.name}
                  </strong>

                  <span>
                    {(
                      archivo.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB · PDF
                    seleccionado
                  </span>
                </>
              ) : (
                <>
                  <strong>
                    Arrastra tu PDF aquí
                  </strong>

                  <span>
                    o haz clic para
                    seleccionar un
                    archivo
                  </span>

                  <small>
                    PDF · máximo 10 MB
                  </small>
                </>
              )}
            </div>

            {error && (
              <div className="plan-importer-error">
                <span>!</span>

                <p>
                  {error}
                </p>
              </div>
            )}
          </div>

          <footer className="plan-importer-actions">
            <button
              type="button"
              className="plan-btn-secondary"
              onClick={
                manejarCerrar
              }
              disabled={
                procesando
              }
            >
              Cancelar
            </button>

            <button
              type="button"
              className="plan-btn-primary"
              onClick={
                analizarPDF
              }
              disabled={
                !archivo ||
                procesando
              }
            >
              {procesando
                ? "Analizando..."
                : "Analizar documento"}
            </button>
          </footer>
        </section>
      </div>
    );
  }

  /* =====================================================
     VISTA: REVISIÓN
  ===================================================== */

  const cantidadSeleccionados =
    cursosDetectados.filter(
      (curso) =>
        curso.seleccionado
    ).length;

  return (
    <div
      className="plan-importer-overlay"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          manejarCerrar();
        }
      }}
    >
      <section
        className="plan-importer-modal plan-importer-modal-review"
        role="dialog"
        aria-modal="true"
        aria-labelledby="planReviewTitle"
      >
        <header className="plan-importer-header">
          <div>
            <span className="plan-importer-eyebrow">
              Revisión de resultados
            </span>

            <h2 id="planReviewTitle">
              Cursos detectados
            </h2>

            <p>
              Revisa la información
              antes de incorporarla
              a tu historial
              académico.
            </p>
          </div>

          <button
            type="button"
            className="plan-importer-close"
            onClick={
              manejarCerrar
            }
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="plan-review-toolbar">
          <div>
            <strong>
              {
                cantidadSeleccionados
              }
            </strong>

            <span>
              {" "}
              de{" "}
              {
                cursosDetectados.length
              }{" "}
              cursos seleccionados
            </span>
          </div>

          <div className="plan-review-selection">
            <button
              type="button"
              onClick={
                seleccionarTodos
              }
            >
              Seleccionar todos
            </button>

            <button
              type="button"
              onClick={
                deseleccionarTodos
              }
            >
              Ninguno
            </button>
          </div>
        </div>

        <div className="plan-cursos-lista">
          {cursosDetectados.map(
            (curso) => (
              <article
                key={curso.id}
                className={`plan-curso-item ${
                  curso.seleccionado
                    ? "plan-curso-seleccionado"
                    : ""
                }`}
              >
                <div className="plan-curso-check">
                  <button
                    type="button"
                    className={
                      curso.seleccionado
                        ? "plan-check active"
                        : "plan-check"
                    }
                    onClick={() =>
                      alternarSeleccion(
                        curso.id
                      )
                    }
                    aria-label={
                      curso.seleccionado
                        ? "Deseleccionar curso"
                        : "Seleccionar curso"
                    }
                  >
                    {curso.seleccionado
                      ? "✓"
                      : ""}
                  </button>
                </div>

                <div className="plan-curso-fields">
                  <div className="plan-campo plan-campo-nombre">
                    <label>
                      Nombre del curso
                    </label>

                    <input
                      type="text"
                      value={
                        curso.nombre
                      }
                      onChange={(
                        event
                      ) =>
                        actualizarCurso(
                          curso.id,
                          "nombre",
                          event.target
                            .value
                        )
                      }
                    />
                  </div>

                  <div className="plan-campo">
                    <label>
                      Código
                    </label>

                    <input
                      type="text"
                      value={
                        curso.codigo
                      }
                      onChange={(
                        event
                      ) =>
                        actualizarCurso(
                          curso.id,
                          "codigo",
                          event.target
                            .value
                        )
                      }
                    />
                  </div>

                  <div className="plan-campo">
                    <label>
                      Créditos
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={
                        curso.creditos
                      }
                      onChange={(
                        event
                      ) =>
                        actualizarCurso(
                          curso.id,
                          "creditos",
                          event.target
                            .value
                        )
                      }
                    />
                  </div>

                  <div className="plan-campo">
                    <label>
                      Semestre
                    </label>

                    <input
                      type="text"
                      value={
                        curso.semestre
                      }
                      placeholder="Ej. III 2026"
                      onChange={(
                        event
                      ) =>
                        actualizarCurso(
                          curso.id,
                          "semestre",
                          event.target
                            .value
                        )
                      }
                    />
                  </div>

                  <div className="plan-campo plan-campo-profesor">
                    <label>
                      Profesor
                    </label>

                    <input
                      type="text"
                      value={
                        curso.profesor
                      }
                      placeholder="Agregar profesor"
                      onChange={(
                        event
                      ) =>
                        actualizarCurso(
                          curso.id,
                          "profesor",
                          event.target
                            .value
                        )
                      }
                    />
                  </div>

                  <div className="plan-campo">
                    <label>
                      Estado
                    </label>

                    <select
                      value={
                        curso.estado
                      }
                      onChange={(
                        event
                      ) =>
                        actualizarCurso(
                          curso.id,
                          "estado",
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="pendiente">
                        Pendiente
                      </option>

                      <option value="en_curso">
                        En curso
                      </option>

                      <option value="culminado">
                        Culminado
                      </option>
                    </select>
                  </div>

                  {curso.estado ===
                    "culminado" && (
                    <div className="plan-campo">
                      <label>
                        Calificación
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={
                          curso.calificacion ??
                          ""
                        }
                        placeholder="0.0"
                        onChange={(
                          event
                        ) =>
                          actualizarCurso(
                            curso.id,
                            "calificacion",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="plan-curso-remove"
                  onClick={() =>
                    eliminarDetectado(
                      curso.id
                    )
                  }
                  aria-label="Eliminar curso detectado"
                >
                  ×
                </button>
              </article>
            )
          )}
        </div>

        {error && (
          <div className="plan-importer-error">
            <span>!</span>

            <p>
              {error}
            </p>
          </div>
        )}

        <footer className="plan-importer-actions">
          <button
            type="button"
            className="plan-btn-secondary"
            onClick={
              volverArchivo
            }
          >
            ← Cambiar PDF
          </button>

          <button
            type="button"
            className="plan-btn-primary"
            onClick={
              importarCursos
            }
            disabled={
              cantidadSeleccionados ===
              0
            }
          >
            Importar{" "}
            {cantidadSeleccionados}{" "}
            {cantidadSeleccionados ===
            1
              ? "curso"
              : "cursos"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default PlanEstudiosImporter;