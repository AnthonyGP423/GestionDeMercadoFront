import http from "./httpClient";

export interface UsuarioRow {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
}

// DTO que viene del backend (ajusta nombres si es necesario)
export interface UsuarioBackend {
  id?: number;
  idUsuario?: number;
  email: string;

  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;

  rol?: string | { idRol: number; nombreRol: string };

  estado?: string;
  estadoUsuario?: string;

  // Campos adicionales para el modal
  telefono?: string;
  dni?: string;
  ruc?: string;
  razonSocial?: string;

  fotoUrl?: string;
  foto_url?: string;
}

const mapUsuarioToRow = (u: UsuarioBackend): UsuarioRow => {
  const id = u.id ?? u.idUsuario!;

  const nombre =
    u.nombreCompleto ??
    (
      `${u.nombres ?? ""} ${u.apellidos ?? ""}`.trim() || "(Sin nombre)"
    );

  const rol =
    typeof u.rol === "string"
      ? u.rol
      : u.rol && "nombreRol" in u.rol
      ? u.rol.nombreRol
      : "";

  const estado = u.estado ?? u.estadoUsuario ?? "ACTIVO";

  return { id, nombre, email: u.email, rol, estado };
};

export const usuarioApi = {
  listar: async (): Promise<UsuarioRow[]> => {
    const res = await http.get<UsuarioBackend[]>("/api/v1/admin/usuarios");
    return res.data.map(mapUsuarioToRow);
  },

  /** Obtener detalle por id para ver/editar */
  obtener: async (id: number): Promise<UsuarioBackend> => {
    const res = await http.get<UsuarioBackend>(
      `/api/v1/admin/usuarios/${id}`
    );
    return res.data;
  },

  crear: async (body: any): Promise<UsuarioRow> => {
    const res = await http.post<UsuarioBackend>("/api/v1/admin/usuarios", body);
    return mapUsuarioToRow(res.data);
  },

  actualizar: async (id: number, body: any): Promise<UsuarioRow> => {
    const res = await http.put<UsuarioBackend>(
      `/api/v1/admin/usuarios/${id}`,
      body
    );
    return mapUsuarioToRow(res.data);
  },

  cambiarEstado: async (id: number, nuevoEstado: string): Promise<void> => {
    await http.patch(`/api/v1/admin/usuarios/${id}/estado`, {
      estado: nuevoEstado,
    });
  },

  eliminar: async (id: number): Promise<void> => {
    await http.delete(`/api/v1/admin/usuarios/${id}`);
  },
};