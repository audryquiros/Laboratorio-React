import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    const temaGuardado = localStorage.getItem(
      "frostflow_tema"
    );

    return temaGuardado === "dark"
      ? "dark"
      : "light";
  });

  const modoOscuro = tema === "dark";

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      tema
    );

    localStorage.setItem(
      "frostflow_tema",
      tema
    );
  }, [tema]);

  const cambiarTema = () => {
    setTema((actual) =>
      actual === "light"
        ? "dark"
        : "light"
    );
  };

  const establecerTema = (nuevoTema) => {
    if (
      nuevoTema !== "light" &&
      nuevoTema !== "dark"
    ) {
      return;
    }

    setTema(nuevoTema);
  };

  return (
    <ThemeContext.Provider
      value={{
        tema,
        modoOscuro,
        cambiarTema,
        establecerTema,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;