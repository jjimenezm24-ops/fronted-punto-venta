import { useState, useEffect } from "react";
import {
  listarCategoriasActivas,
  crearCategoria,
  actualizarCategoria,
  anularCategoria
} from "../services/categoriaService";

const formInicial = {
  idCategoria: null,
  nombre: "",
  descripcion: ""
};

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarCategorias = async () => {
    try {
      const respuesta = await listarCategoriasActivas();
      // Extrae la lista del campo 'data' dentro del objeto ApiResponse
      const lista = respuesta.data?.data || respuesta.data || [];
      setCategorias(lista);
    } catch (error) {
      console.error("Error al listar categorías", error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const idActual = form.idCategoria || form.id;
      if (modoEdicion) {
        await actualizarCategoria(idActual, form);
        setMensaje("Categoría actualizada con éxito.");
      } else {
        await crearCategoria(form);
        setMensaje("Categoría creada con éxito.");
      }
      setForm(formInicial);
      setModoEdicion(false);
      cargarCategorias();
    } catch (error) {
      console.error("Error al guardar categoría", error);
      setMensaje("Ocurrió un error al procesar la solicitud.");
    }
  };

  const handleEditar = (categoria) => {
    setForm({
      ...categoria,
      idCategoria: categoria.idCategoria || categoria.id
    });
    setModoEdicion(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta categoría?")) {
      try {
        await anularCategoria(id);
        setMensaje("Categoría eliminada.");
        cargarCategorias();
      } catch (error) {
        console.error("Error al eliminar categoría", error);
      }
    }
  };

  const handleCancelar = () => {
    setForm(formInicial);
    setModoEdicion(false);
  };

  return (
    <div>
      <h2>{modoEdicion ? "Modificar Categoría" : "Ingresar Categoría"}</h2>
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
        <button type="submit">
          {modoEdicion ? "Actualizar" : "Guardar"}
        </button>
        {modoEdicion && (
          <button type="button" onClick={handleCancelar}>
            Cancelar
          </button>
        )}
      </form>

      <h2>Listado de Categorías</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => {
            const idValido = categoria.idCategoria || categoria.id;
            return (
              <tr key={idValido}>
                <td>{categoria.nombre}</td>
                <td>{categoria.descripcion}</td>
                <td>
                  <button onClick={() => handleEditar(categoria)}>
                    Modificar
                  </button>
                </td>
                <td>
                  <button onClick={() => handleEliminar(idValido)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Categorias;