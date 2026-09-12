import { useState, useEffect } from "react";
import {
  listarClientesActivos,
  crearCliente,
  actualizarCliente,
  anularCliente
} from "../services/clienteService";

const formInicial = {
  idCliente: null,
  nombre: "",
  apellido: "",
  email: "",
  telefono: ""
};

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarClientes = async () => {
    try {
      console.log("Cargando clientes...");
      const respuesta = await listarClientesActivos();
      
      let rawData = respuesta.data;

      // Si el backend devuelve un String JSON en lugar de un Objeto, lo parseamos
      if (typeof rawData === "string") {
        try {
          rawData = JSON.parse(rawData);
        } catch (e) {
          console.error("Error al parsear JSON del backend:", e);
        }
      }

      // Extrae la lista del objeto devuelto
      const lista = rawData?.data || rawData || [];
      setClientes(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setClientes([]);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const idActual = form.idCliente || form.id;
      if (modoEdicion) {
        await actualizarCliente(idActual, form);
        setMensaje("Cliente actualizado con éxito.");
      } else {
        await crearCliente(form);
        setMensaje("Cliente registrado con éxito.");
      }
      setForm(formInicial);
      setModoEdicion(false);
      cargarClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      setMensaje("Ocurrió un error al procesar la solicitud.");
    }
  };

  const handleEditar = (cliente) => {
    setForm({
      idCliente: cliente.idCliente || cliente.id,
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      email: cliente.email || "",
      telefono: cliente.telefono || ""
    });
    setModoEdicion(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas anular este cliente?")) {
      try {
        await anularCliente(id);
        setMensaje("Cliente anulado.");
        cargarClientes();
      } catch (error) {
        console.error("Error al anular cliente:", error);
      }
    }
  };

  const handleCancelar = () => {
    setForm(formInicial);
    setModoEdicion(false);
  };

  return (
    <div>
      <h2>{modoEdicion ? "Modificar Cliente" : "Ingresar Cliente"}</h2>
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
          <label htmlFor="apellido">Apellido:</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={form.telefono}
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

      <h2>Listado de Clientes</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente, index) => {
            const idValido = cliente.idCliente || cliente.id || index;

            return (
              <tr key={idValido}>
                <td>{cliente.nombre}</td>
                <td>{cliente.apellido || "N/A"}</td>
                <td>{cliente.email || "N/A"}</td>
                <td>{cliente.telefono || "N/A"}</td>
                <td>
                  <button onClick={() => handleEditar(cliente)}>Modificar</button>
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

export default Clientes;