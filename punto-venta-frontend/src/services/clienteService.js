import api from '../api/axios';

export const listarClientesActivos = () => api.get('/clientes/activos');
export const crearCliente = (cliente) => api.post('/clientes', cliente);
export const actualizarCliente = (id, cliente) => api.put(`/clientes/${id}`, cliente);
export const anularCliente = (id) => api.patch(`/clientes/${id}/anular`);