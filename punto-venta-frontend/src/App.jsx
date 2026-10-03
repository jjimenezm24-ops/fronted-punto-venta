import { Routes, Route, Link, Navigate } from "react-router-dom";
import Categorias from "./page/Categorias";
import Clientes from "./page/Clientes";
import Productos from "./page/Productos";
import Reportes from "./page/Reportes";

function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: "15px", marginBottom: "20px", padding: "10px" }}>
        <Link to="/categorias">Categorías</Link>
        <Link to="/clientes">Clientes</Link>
        <Link to="/producto">Productos</Link>
        <Link to="/reportes">Informes</Link>
      </nav>

      <Routes>
        {/* Redirecciona la raíz / hacia /reportes o /producto */}
        <Route path="/" element={<Navigate to="/reportes" replace />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/producto" element={<Productos />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </div>
  );
}

export default App;
