import { useState, useEffect } from "react";
import {
  listarProductosActivos,
  crearProducto,
  actualizarProducto,
  anularProducto
} from "../services/productoService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
      setTimeout(() => setMensaje(""), 3000);
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

  // =======================================================
  // 🛠️ GENERACIÓN DE DOCUMENTO PDF
  // =======================================================
  const generarDocumentoPDF = () => {
    const doc = new jsPDF();

    const columnas = ["Nombre", "Descripción", "Precio", "Stock", "Categoría"];
    const filas = productos.map((prod) => [
      prod.nombre,
      prod.descripcion || "-",
      `Q${parseFloat(prod.precio || 0).toFixed(2)}`,
      prod.stock,
      prod.categoria?.nombre || prod.categoria?.idCategoria || prod.idCategoria || "-"
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 32,
      headStyles: { fillColor: [107, 33, 168] },
      margin: { top: 32, bottom: 20 },
      didDrawPage: (data) => {
        // --- 1. DIBUJAR LOGOTIPO ---
        doc.setFillColor(107, 33, 168);
        doc.roundedRect(14, 8, 16, 16, 3, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("SYS", 17, 18);

        // --- 2. ENCABEZADO Y TÍTULOS ---
        doc.setTextColor(74, 21, 75);
        doc.setFontSize(16);
        doc.text("SISTEMA DE GESTIÓN", 35, 15);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text("Reporte General de Productos", 35, 21);

        // --- 3. FECHA Y HORA DE EMISIÓN ---
        const fechaActual = new Date().toLocaleDateString();
        doc.setFontSize(9);
        doc.text(`Fecha: ${fechaActual}`, 160, 15);

        // Línea divisora
        doc.setDrawColor(226, 212, 232);
        doc.setLineWidth(0.5);
        doc.line(14, 27, 196, 27);
      }
    });

    // --- 4. NUMERACIÓN DE PÁGINAS ---
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `Página ${i} de ${totalPages}`,
        196,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    }

    return doc;
  };

  const verPDF = () => {
    const doc = generarDocumentoPDF();
    const pdfUrl = doc.output("bloburl");
    window.open(pdfUrl, "_blank");
  };

  const exportarPDF = () => {
    const doc = generarDocumentoPDF();
    doc.save("Reporte_Productos.pdf");
  };

  // =======================================================
  // 📊 EXPORTAR A EXCEL (.xlsx)
  // =======================================================
  const exportarExcel = () => {
    const datosExcel = productos.map((prod) => ({
      ID: prod.idProducto || prod.id || "-",
      Nombre: prod.nombre,
      Descripción: prod.descripcion || "-",
      "Precio (Q)": parseFloat(prod.precio || 0),
      Stock: prod.stock,
      "ID Categoría": prod.categoria?.idCategoria || prod.idCategoria || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

    XLSX.writeFile(workbook, "Reporte_Productos.xlsx");
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas anular este producto?")) {
      try {
        await anularProducto(id);
        setMensaje("Producto anulado.");
        cargarProductos();
        setTimeout(() => setMensaje(""), 3000);
      } catch (error) {
        console.error("Error al anular producto:", error);
      }
    }
  };

  const handleCancelar = () => {
    setForm(formInicial);
    setModoEdicion(false);
  };


  const styles = {
    container: {
      padding: "25px",
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f7f3f9",
      minHeight: "100vh"
    },
    title: {
      color: "#4a154b",
      marginBottom: "20px",
      fontSize: "26px",
      fontWeight: "bold",
      borderBottom: "2px solid #e2d4e8",
      paddingBottom: "10px"
    },
    message: {
      backgroundColor: "#d8b4fe",
      color: "#3b0764",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      fontWeight: "600"
    },
    layout: {
      display: "flex",
      gap: "25px",
      flexWrap: "wrap",
      alignItems: "flex-start"
    },
    cardForm: {
      backgroundColor: "#ffffff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(110, 86, 120, 0.1)",
      border: "1px solid #e9d5ff",
      flex: "1 1 300px",
      maxWidth: "400px"
    },
    cardTable: {
      backgroundColor: "#ffffff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(110, 86, 120, 0.1)",
      border: "1px solid #e9d5ff",
      flex: "2 1 500px"
    },
    formGroup: {
      marginBottom: "15px"
    },
    label: {
      display: "block",
      marginBottom: "6px",
      color: "#581c87",
      fontWeight: "bold",
      fontSize: "14px"
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #c084fc",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none"
    },
    btnSubmit: {
      backgroundColor: modoEdicion ? "#d97706" : "#7e22ce",
      color: "white",
      border: "none",
      padding: "10px 18px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      marginRight: "10px"
    },
    btnCancel: {
      backgroundColor: "#9ca3af",
      color: "white",
      border: "none",
      padding: "10px 18px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold"
    },
    btnViewPDF: {
      backgroundColor: "#0284c7",
      color: "white",
      border: "none",
      padding: "9px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      marginRight: "10px",
      marginBottom: "15px"
    },
    btnExportPDF: {
      backgroundColor: "#dc2626",
      color: "white",
      border: "none",
      padding: "9px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      marginRight: "10px",
      marginBottom: "15px"
    },
    btnExportExcel: {
      backgroundColor: "#16a34a",
      color: "white",
      border: "none",
      padding: "9px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      marginBottom: "15px"
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
      marginTop: "10px",
      borderRadius: "8px",
      overflow: "hidden"
    },
    th: {
      backgroundColor: "#6b21a8",
      color: "white",
      padding: "12px",
      textAlign: "left",
      fontSize: "14px"
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #f3e8ff",
      color: "#374151",
      fontSize: "14px"
    },
    btnEdit: {
      backgroundColor: "#fef3c7",
      color: "#b45309",
      border: "1px solid #fcd34d",
      padding: "6px 12px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold"
    },
    btnDelete: {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fca5a5",
      padding: "6px 12px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold"
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📦 Gestión de Productos</h1>

      {mensaje && <div style={styles.message}>{mensaje}</div>}

      <div style={styles.layout}>
        {/* FORMULARIO */}
        <div style={styles.cardForm}>
          <h2 style={{ color: "#6b21a8", marginTop: 0, marginBottom: "15px" }}>
            {modoEdicion ? "✏️ Modificar Producto" : "➕ Nuevo Producto"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label htmlFor="nombre" style={styles.label}>
                Nombre:
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej. Galletas"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="descripcion" style={styles.label}>
                Descripción:
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                style={{ ...styles.input, height: "70px", resize: "none" }}
                placeholder="Descripción opcional"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="precio" style={styles.label}>
                Precio:
              </label>
              <input
                type="number"
                step="0.01"
                id="precio"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                style={styles.input}
                placeholder="0.00"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="stock" style={styles.label}>
                Existencias (Stock):
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                style={styles.input}
                placeholder="0"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="idCategoria" style={styles.label}>
                ID Categoría:
              </label>
              <input
                type="number"
                id="idCategoria"
                name="idCategoria"
                value={form.idCategoria}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej. 1"
                required
              />
            </div>

            <button type="submit" style={styles.btnSubmit}>
              {modoEdicion ? "Actualizar" : "Guardar Producto"}
            </button>

            {modoEdicion && (
              <button
                type="button"
                onClick={handleCancelar}
                style={styles.btnCancel}
              >
                Cancelar
              </button>
            )}
          </form>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div style={styles.cardTable}>
          <h2 style={{ color: "#6b21a8", marginTop: 0, marginBottom: "15px" }}>
            📋 Listado de Productos ({productos.length})
          </h2>

          {/* BOTONES DE EXPORTACIÓN */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={verPDF} style={styles.btnViewPDF}>
              👁️ Ver PDF
            </button>
            <button onClick={exportarPDF} style={styles.btnExportPDF}>
              📄 Exportar PDF
            </button>
            <button onClick={exportarExcel} style={styles.btnExportExcel}>
              📊 Exportar Excel
            </button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Descripción</th>
                <th style={styles.th}>Precio</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>ID Cat.</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod, index) => {
                const idValido = prod.idProducto || prod.id || index;
                const catMostrar =
                  prod.categoria?.idCategoria || prod.idCategoria || "N/A";
                const rowStyle = {
                  ...styles.td,
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#faf5ff"
                };

                return (
                  <tr key={idValido}>
                    <td
                      style={{
                        ...rowStyle,
                        fontWeight: "600",
                        color: "#581c87"
                      }}
                    >
                      {prod.nombre}
                    </td>
                    <td style={rowStyle}>{prod.descripcion || "-"}</td>
                    <td style={{ ...rowStyle, fontWeight: "600" }}>
                      Q{parseFloat(prod.precio || 0).toFixed(2)}
                    </td>
                    <td style={rowStyle}>{prod.stock}</td>
                    <td style={rowStyle}>{catMostrar}</td>
                    <td style={{ ...rowStyle, width: "160px" }}>
                      <button
                        onClick={() => handleEditar(prod)}
                        style={styles.btnEdit}
                      >
                        ✏️ Editar
                      </button>{" "}
                      <button
                        onClick={() => handleEliminar(idValido)}
                        style={styles.btnDelete}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Productos;