import api from '../api/axios';

export const listarProductosActivos = () => api.get('/productos/activos');
export const crearProducto = (producto) => api.post('/productos', producto);
export const actualizarProducto = (id, producto) => api.put(`/productos/${id}`, producto);
export const anularProducto = (id) => api.patch(`/productos/${id}/anular`);