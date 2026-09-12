import { useState, useEffect } from "react";
import {
  listarProductosActivos,
  crearProducto,
  actualizarProducto,
  anularProducto
} from "../services/productoService";

const formInicial = {
  idProducto: null,
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  idCategoria: ""
};

function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarProductos = async () => {
    try {
      console.log("Cargando productos...");
      const respuesta = await listarProductosActivos();
      
      let rawData = respuesta.data;

      if (typeof rawData === "string") {
        try {
          rawData = JSON.parse(rawData);
        } catch (e) {
          console.error("Error al parsear JSON:", e);
        }
      }

      const lista = rawData?.data || rawData || [];
      setProductos(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProductos([]);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mapeo adaptado a la entidad Java
    const productoPayload = {
      idProducto: form.idProducto,
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock, 10),
      estado: true,
      categoria: form.idCategoria ? { idCategoria: parseInt(form.idCategoria, 10) } : null
    };

    try {
      const idActual = form.idProducto;
      if (modoEdicion) {
        await actualizarProducto(idActual, productoPayload);
        setMensaje("Producto actualizado con éxito.");
      } else {
        await crearProducto(productoPayload);
        setMensaje("Producto registrado con éxito.");
      }
      setForm(formInicial);
      setModoEdicion(false);
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      setMensaje("Ocurrió un error al procesar la solicitud.");
    }
  };

  const handleEditar = (prod) => {
    setForm({
      idProducto: prod.idProducto || prod.id,
      nombre: prod.nombre || "",
      descripcion: prod.descripcion || "",
      precio: prod.precio || "",
      stock: prod.stock || "",
      idCategoria: prod.categoria?.idCategoria || prod.idCategoria || ""
    });
    setModoEdicion(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas anular este producto?")) {
      try {
        await anularProducto(id);
        setMensaje("Producto anulado.");
        cargarProductos();
      } catch (error) {
        console.error("Error al anular producto:", error);
      }
    }
  };

  const handleCancelar = () => {
    setForm(formInicial);
    setModoEdicion(false);
  };

  return (
    <div>
      <h2>{modoEdicion ? "Modificar Producto" : "Ingresar Producto"}</h2>
      {mensaje && <p>{mensaje}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="descripcion">Descripción:</label>
          <input
            type="text"
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="precio">Precio:</label>
          <input
            type="number"
            step="0.01"
            id="precio"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="stock">Existencias (Stock):</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="idCategoria">ID Categoría:</label>
          <input
            type="number"
            id="idCategoria"
            name="idCategoria"
            value={form.idCategoria}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">
          {modoEdicion ? "Actualizar" : "Guardar"}
        </button>
        {modoEdicion && (
          <button type="button" onClick={handleCancelar}>
            Cancelar
          </button>
        )}
      </form>

      <h2>Listado de Productos</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Existencias</th>
            <th>ID Categoría</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod, index) => {
            const idValido = prod.idProducto || prod.id || index;
            const catMostrar = prod.categoria?.idCategoria || prod.idCategoria || "N/A";

            return (
              <tr key={idValido}>
                <td>{prod.nombre}</td>
                <td>{prod.descripcion || "N/A"}</td>
                <td>Q{prod.precio}</td>
                <td>{prod.stock}</td>
                <td>{catMostrar}</td>
                <td>
                  <button onClick={() => handleEditar(prod)}>Modificar</button>
                </td>
                <td>
                  <button onClick={() => handleEliminar(idValido)}>Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Productos;