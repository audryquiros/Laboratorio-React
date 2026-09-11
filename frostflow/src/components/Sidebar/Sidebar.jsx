import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const menuPrincipal = [
    {
      path: "/dashboard",
      icon: "⌂",
      label: "Dashboard",
    },
    {
      path: "/cursos",
      icon: "▣",
      label: "Cursos",
    },
    {
      path: "/entregas",
      icon: "□",
      label: "Entregas",
    },
    {
      path: "/calendario",
      icon: "▦",
      label: "Calendario",
    },
  ];

  const menuSistema = [
    {
      path: "/automatizacion",
      icon: "✦",
      label: "Automatización",
    },
    {
      path: "/configuracion",
      icon: "⚙",
      label: "Configuración",
    },
  ];

  const nombre =
    usuario?.nombre || "Estudiante";

  const inicial =
    nombre.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      {/* =================================================
          BRAND
      ================================================= */}

      <div className="sidebar-brand">
        <div className="brand-mark">
          <span>F</span>
        </div>

        <div className="brand-text">
          <strong>FrostFlow</strong>
          <span>Academic Control</span>
        </div>
      </div>

      {/* =================================================
          NAVEGACIÓN
      ================================================= */}

      <nav className="sidebar-navigation">
        {/* WORKSPACE */}

        <div className="sidebar-group">
          <span className="sidebar-group-title">
            Workspace
          </span>

          <div className="sidebar-links">
            {menuPrincipal.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive
                      ? "sidebar-link-active"
                      : ""
                  }`
                }
              >
                <span className="sidebar-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="sidebar-divider"></div>

        {/* SISTEMA */}

        <div className="sidebar-group">
          <span className="sidebar-group-title">
            Sistema
          </span>

          <div className="sidebar-links">
            {menuSistema.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive
                      ? "sidebar-link-active"
                      : ""
                  }`
                }
              >
                <span className="sidebar-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* =================================================
          PARTE INFERIOR
      ================================================= */}

      <div className="sidebar-bottom">
        {/* ESTADO DEL SISTEMA */}

        <div className="sidebar-status">
          <span className="status-dot"></span>

          <div>
            <strong>
              Sistema activo
            </strong>

            <span>
              Automatización disponible
            </span>
          </div>
        </div>

        {/* USUARIO / PERFIL */}

        <button
          type="button"
          className="sidebar-user"
          onClick={() => navigate("/perfil")}
          title="Abrir perfil"
        >
          <div className="user-avatar">
            {inicial}
          </div>

          <div className="user-info">
            <strong>
              {nombre}
            </strong>

            <span>
              Cuenta personal
            </span>
          </div>

          <span className="user-menu">
            •••
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;