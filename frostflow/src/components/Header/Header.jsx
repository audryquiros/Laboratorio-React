import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const titulos = {
    "/dashboard": "Dashboard",
    "/cursos": "Cursos",
    "/entregas": "Entregas",
    "/calendario": "Calendario",
    "/automatizacion": "Automatización",
    "/configuracion": "Configuración",
    "/perfil": "Perfil",
  };

  const titulo =
    titulos[location.pathname] || "FrostFlow";

  const fecha = new Date().toLocaleDateString(
    "es-CR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );

  const nombreUsuario =
    usuario?.nombre || "Estudiante";

  const inicial =
    nombreUsuario.charAt(0).toUpperCase();

  return (
    <header className="header">
      <div className="header-title">
        <h1>{titulo}</h1>
      </div>

      <div className="header-actions">
        <div className="header-date">
          <span className="date-icon">
            ◷
          </span>

          <span>{fecha}</span>
        </div>

        <button
          className="header-search"
          aria-label="Buscar"
        >
          <span>⌕</span>
        </button>

        <button
          className="header-notifications"
          aria-label="Notificaciones"
        >
          <span>♢</span>
          <i></i>
        </button>

        <div className="header-divider"></div>

        <button
          className="header-profile"
          onClick={() => navigate("/perfil")}
          aria-label="Abrir perfil"
        >
          <div className="header-avatar">
            {inicial}
          </div>

          <div className="header-profile-info">
            <strong>{nombreUsuario}</strong>
            <span>III 2026</span>
          </div>

          <span className="profile-arrow">
            ⌄
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;