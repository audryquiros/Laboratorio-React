import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    return localStorage.getItem("frostflow_tema") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("frostflow_tema", tema);
  }, [tema]);

  const cambiarTema = (nuevoTema) => {
    setTema(nuevoTema);
  };

  const alternarTema = () => {
    setTema((actual) => (actual === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        tema,
        cambiarTema,
        alternarTema,
        esOscuro: tema === "dark",
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