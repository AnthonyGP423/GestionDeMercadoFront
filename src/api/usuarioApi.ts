import http from "./httpClient";

export interface UsuarioRow {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
}

// Lo que responde el backend
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

  telefono?: string;
  dni?: string;
  ruc?: string;
  razonSocial?: string;

  fotoUrl?: string;
  foto_url?: string;
}

// Lo que ESPERA el backend al crear usuario
export interface UsuarioCreateBackend {
  idRol: number;
  email: string;
  password: string;
  telefono?: string | null;
  dni?: string | null;
  ruc?: string | null;
  razonSocial?: string | null;
  nombres: string;
  apellidos: string;
}

// Para actualizar (tú decides qué campos permites)
export interface UsuarioUpdateBackend {
  nombres?: string;
  apellidos?: string;
  telefono?: string | null;
  fotoUrl?: string | null;
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

  obtener: async (id: number): Promise<UsuarioBackend> => {
    const res = await http.get<UsuarioBackend>(
      `/api/v1/admin/usuarios/${id}`
    );
    return res.data;
  },

  crear: async (body: UsuarioCreateBackend): Promise<UsuarioRow> => {
    const res = await http.post<UsuarioBackend>("/api/v1/admin/usuarios", body);
    return mapUsuarioToRow(res.data);
  },

  actualizar: async (
    id: number,
    body: UsuarioUpdateBackend
  ): Promise<UsuarioRow> => {
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