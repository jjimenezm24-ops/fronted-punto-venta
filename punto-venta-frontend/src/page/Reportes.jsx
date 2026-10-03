import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { listarProductosActivos } from "../services/productoService";
import * as categoriaService from "../services/categoriaService";

export default function Reportes() {

  // Helper para obtener las categorías según la función exportada en el servicio
  const obtenerListaCategorias = async () => {
    const funcionListar = 
      categoriaService.listarCategoriasActivas || 
      categoriaService.listarCategorias || 
      categoriaService.obtenerCategorias ||
      categoriaService.default;

    if (!funcionListar) return [];

    const respuesta = await funcionListar();
    let rawData = respuesta.data;
    if (typeof rawData === "string") {
      try { rawData = JSON.parse(rawData); } catch (e) {}
    }
    const lista = rawData?.data || rawData || [];
    return Array.isArray(lista) ? lista : [];
  };

  // Helper para obtener productos
  const obtenerListaProductos = async () => {
    const respuesta = await listarProductosActivos();
    let rawData = respuesta.data;
    if (typeof rawData === "string") {
      try { rawData = JSON.parse(rawData); } catch (e) {}
    }
    const lista = rawData?.data || rawData || [];
    return Array.isArray(lista) ? lista : [];
  };

  // ==========================================
  // 1. INFORME DE PRODUCTOS PDF (GENERAL)
  // ==========================================
  const generarReporteProductos = async () => {
    try {
      const productos = await obtenerListaProductos();
      if (productos.length === 0) {
        alert("No hay productos disponibles.");
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Informe General de Productos", 14, 20);

      const columnas = ["ID", "Nombre", "Precio", "Stock"];
      const filas = productos.map((p) => [
        p.idProducto || p.id || "-",
        p.nombre || "-",
        `Q${parseFloat(p.precio || 0).toFixed(2)}`,
        p.stock ?? 0
      ]);

      autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: 30,
        headStyles: { fillColor: [29, 78, 216] }
      });

      window.open(doc.output("bloburl"), "_blank");
    } catch (error) {
      console.error("Error al generar reporte de productos:", error);
      alert("Error al cargar productos.");
    }
  };

  // ==========================================
  // 2. INFORME DE CATEGORÍAS PDF (GENERAL)
  // ==========================================
  const generarReporteCategorias = async () => {
    try {
      const categorias = await obtenerListaCategorias();
      if (categorias.length === 0) {
        alert("No hay categorías disponibles.");
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Informe General de Categorías", 14, 20);

      const columnas = ["ID Categoría", "Nombre", "Descripción"];
      const filas = categorias.map((c) => [
        c.idCategoria || c.id || "-",
        c.nombre || "-",
        c.descripcion || "-"
      ]);

      autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: 30,
        headStyles: { fillColor: [29, 78, 216] }
      });

      window.open(doc.output("bloburl"), "_blank");
    } catch (error) {
      console.error("Error al generar reporte de categorías:", error);
      alert("Error al obtener datos de categorías.");
    }
  };

  // ==========================================
  // 3. FILTRO CATEGORÍAS (GENERA PDF FILTRADO)
  // ==========================================
  const filtrarCategorias = async () => {
    const busqueda = prompt("Ingrese el nombre de la categoría a filtrar:");
    if (busqueda === null) return; // Si presiona cancelar

    try {
      const categorias = await obtenerListaCategorias();
      const filtradas = categorias.filter((c) =>
        (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
      );

      if (filtradas.length === 0) {
        alert(`No se encontraron categorías que coincidan con "${busqueda}".`);
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Informe de Categorías - Filtro: "${busqueda}"`, 14, 20);

      const columnas = ["ID Categoría", "Nombre", "Descripción"];
      const filas = filtradas.map((c) => [
        c.idCategoria || c.id || "-",
        c.nombre || "-",
        c.descripcion || "-"
      ]);

      autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: 30,
        headStyles: { fillColor: [29, 78, 216] }
      });

      window.open(doc.output("bloburl"), "_blank");
    } catch (error) {
      console.error("Error al filtrar categorías:", error);
      alert("Ocurrió un error al filtrar categorías.");
    }
  };

  // ==========================================
  // 4. FILTRO PRODUCTOS (GENERA PDF FILTRADO)
  // ==========================================
  const filtrarProductos = async () => {
    const busqueda = prompt("Ingrese el nombre del producto a filtrar:");
    if (busqueda === null) return; // Si presiona cancelar

    try {
      const productos = await obtenerListaProductos();
      const filtrados = productos.filter((p) =>
        (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
      );

      if (filtrados.length === 0) {
        alert(`No se encontraron productos que coincidan con "${busqueda}".`);
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Informe de Productos - Filtro: "${busqueda}"`, 14, 20);

      const columnas = ["ID", "Nombre", "Precio", "Stock"];
      const filas = filtrados.map((p) => [
        p.idProducto || p.id || "-",
        p.nombre || "-",
        `Q${parseFloat(p.precio || 0).toFixed(2)}`,
        p.stock ?? 0
      ]);

      autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: 30,
        headStyles: { fillColor: [29, 78, 216] }
      });

      window.open(doc.output("bloburl"), "_blank");
    } catch (error) {
      console.error("Error al filtrar productos:", error);
      alert("Ocurrió un error al filtrar productos.");
    }
  };

  const styles = {
    container: {
      padding: "30px 20px",
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#222222",
      marginBottom: "20px"
    },
    btnGroup: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap"
    },
    btnBlue: {
      backgroundColor: "#1d4ed8",
      color: "#ffffff",
      border: "none",
      padding: "12px 20px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Informes</h1>

      <div style={styles.btnGroup}>
        <button style={styles.btnBlue} onClick={generarReporteProductos}>
          Informe de productos PDF
        </button>

        <button style={styles.btnBlue} onClick={generarReporteCategorias}>
          Informe Categorías PDF
        </button>

        <button style={styles.btnBlue} onClick={filtrarCategorias}>
          Filtro Categorías
        </button>

        <button style={styles.btnBlue} onClick={filtrarProductos}>
          Filtro Productos
        </button>
      </div>
    </div>
  );
}