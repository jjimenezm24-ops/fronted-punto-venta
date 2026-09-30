import { useState, useEffect } from "react";
import {
  listarCategoriasActivas,
  crearCategoria,
  actualizarCategoria,
  anularCategoria
} from "../services/categoriaService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
      let rawData = respuesta.data;

      if (typeof rawData === "string") {
        try {
          rawData = JSON.parse(rawData);
        } catch (e) {
          console.error("Error al parsear JSON del backend:", e);
        }
      }

      const lista = rawData?.data || rawData || [];
      setCategorias(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error("Error al listar categorías", error);
      setCategorias([]);
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
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error("Error al guardar categoría", error);
      setMensaje("Error al procesar la solicitud.");
    }
  };

  const handleEditar = (categoria) => {
    setForm({
      ...categoria,
      idCategoria: categoria.idCategoria || categoria.id
    });
    setModoEdicion(true);
  };

  // =======================================================
  // 🛠️ FUNCIÓN BASE PARA GENERAR LA ESTRUCTURA DEL PDF
  // =======================================================
  const generarDocumentoPDF = () => {
    const doc = new jsPDF();

    const columnas = ["Nombre", "Descripción"];
    const filas = categorias.map((categoria) => [
      categoria.nombre,
      categoria.descripcion || "-"
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 32,
      headStyles: { fillColor: [107, 33, 168] },
      margin: { top: 32, bottom: 20 },
      didDrawPage: (data) => {
        // Logotipo
        doc.setFillColor(107, 33, 168);
        doc.roundedRect(14, 8, 16, 16, 3, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("SYS", 17, 18);

        // Encabezado
        doc.setTextColor(74, 21, 75);
        doc.setFontSize(16);
        doc.text("SISTEMA DE GESTIÓN", 35, 15);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text("Reporte General de Categorías", 35, 21);

        // Fecha de emisión
        const fechaActual = new Date().toLocaleDateString();
        doc.setFontSize(9);
        doc.text(`Fecha: ${fechaActual}`, 160, 15);

        // Línea divisora
        doc.setDrawColor(226, 212, 232);
        doc.setLineWidth(0.5);
        doc.line(14, 27, 196, 27);
      }
    });

    // Paginación
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

  // 👁️ VER PDF EN NUEVA PESTAÑA
  const verPDF = () => {
    const doc = generarDocumentoPDF();
    const pdfUrl = doc.output("bloburl");
    window.open(pdfUrl, "_blank");
  };

  // 📥 DESCARGAR PDF
  const exportarPDF = () => {
    const doc = generarDocumentoPDF();
    doc.save("Reporte_Categorias.pdf");
  };

  // 📊 EXPORTAR A EXCEL (.xlsx)
  const exportarExcel = () => {
    const datosExcel = categorias.map((cat) => ({
      ID: cat.idCategoria || cat.id || "-",
      Nombre: cat.nombre,
      Descripción: cat.descripcion || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categorías");

    XLSX.writeFile(workbook, "Reporte_Categorias.xlsx");
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta categoría?")) {
      try {
        await anularCategoria(id);
        setMensaje("Categoría eliminada.");
        cargarCategorias();
        setTimeout(() => setMensaje(""), 3000);
      } catch (error) {
        console.error("Error al eliminar categoría", error);
      }
    }
  };

  const handleCancelar = () => {
    setForm(formInicial);
    setModoEdicion(false);
  };

  // ESTILOS EN LÍNEA
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
      fontWeight: "bold"
    },
    btnExportPDF: {
      backgroundColor: "#dc2626",
      color: "white",
      border: "none",
      padding: "9px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold"
    },
    btnExportExcel: {
      backgroundColor: "#16a34a",
      color: "white",
      border: "none",
      padding: "9px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold"
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
      <h1 style={styles.title}>🔮 Gestión de Categorías</h1>

      {mensaje && <div style={styles.message}>{mensaje}</div>}

      <div style={styles.layout}>
        {/* FORMULARIO */}
        <div style={styles.cardForm}>
          <h2 style={{ color: "#6b21a8", marginTop: 0, marginBottom: "15px" }}>
            {modoEdicion ? "✏️ Modificar Categoría" : "➕ Nueva Categoría"}
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
                placeholder="Ej. Bebidas, Lácteos..."
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
                style={{ ...styles.input, height: "80px", resize: "none" }}
                placeholder="Descripción opcional"
              />
            </div>

            <button type="submit" style={styles.btnSubmit}>
              {modoEdicion ? "Actualizar" : "Guardar Categoría"}
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

        {/* TABLA DE CATEGORÍAS */}
        <div style={styles.cardTable}>
          <h2 style={{ color: "#6b21a8", marginTop: 0, marginBottom: "15px" }}>
            📋 Listado de Categorías ({categorias.length})
          </h2>

          {/* BOTONES DE ACCIÓN / EXPORTACIÓN */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button onClick={verPDF} style={styles.btnViewPDF}>
              👁️ Ver PDF
            </button>
            <button onClick={exportarPDF} style={styles.btnExportPDF}>
              📄 Descargar PDF
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
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat, index) => {
                const idValido = cat.idCategoria || cat.id || index;
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
                      {cat.nombre}
                    </td>
                    <td style={rowStyle}>{cat.descripcion || "-"}</td>
                    <td style={{ ...rowStyle, width: "160px" }}>
                      <button
                        onClick={() => handleEditar(cat)}
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

export default Categorias;