import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  /*
   * Recuperar la sesión cuando se abre o recarga la aplicación.
   */
  useEffect(() => {
    const usuarioGuardado =
      localStorage.getItem("frostflow_usuario");

    if (usuarioGuardado) {
      try {
        const usuarioParseado =
          JSON.parse(usuarioGuardado);

        setUsuario(usuarioParseado);
      } catch (error) {
        console.error(
          "No se pudo recuperar la sesión:",
          error
        );

        localStorage.removeItem(
          "frostflow_usuario"
        );
      }
    }

    setCargando(false);
  }, []);

  /*
   * Guardar usuario al iniciar sesión.
   */
  const iniciarSesion = (usuarioData) => {
    setUsuario(usuarioData);

    localStorage.setItem(
      "frostflow_usuario",
      JSON.stringify(usuarioData)
    );
  };

  /*
   * Cerrar sesión y eliminar la sesión guardada.
   */
  const cerrarSesion = () => {
    setUsuario(null);

    localStorage.removeItem(
      "frostflow_usuario"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        autenticado: Boolean(usuario),
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
 * Hook personalizado para acceder
 * fácilmente al contexto de autenticación.
 */
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;