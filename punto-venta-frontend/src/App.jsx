import { Routes, Route, Link } from "react-router-dom";
import Categorias from "./page/Categorias";
import Clientes from "./page/Clientes";
import Productos from "./page/Productos";

function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Link to="/categorias">Categorías</Link>
        <Link to="/clientes">Clientes</Link>
        <Link to="/producto">Productos</Link>
      </nav>

      <Routes>
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/producto" element={<Productos />} />
      </Routes>
    </div>
  );
}

export default App;
