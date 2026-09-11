import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Header />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;