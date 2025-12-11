import http from "./httpClient";

export interface PropietarioBackend {
  id?: number;
  idUsuario?: number;

  email: string;

  nombres?: string | null;
  apellidos?: string | null;
  nombreCompleto?: string | null;

  // Rol puede venir como string ("SOCIO") o como objeto { idRol, nombreRol }
  rol?: string | { idRol: number; nombreRol: string };

  estado?: string | null;
  estadoUsuario?: string | null;

  telefono?: string | null;
  dni?: string | null;

  ruc?: string | null;
  razonSocial?: string | null;
  razon_social?: string | null;
}

export interface PropietarioOption {
  id: number;
  nombre: string;
}

export interface PropietarioDetalle {
  id: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  ruc?: string | null;
  razonSocial?: string | null;
}

// --- helpers ---

const getId = (u: PropietarioBackend): number =>
  (u.id ?? u.idUsuario)!;

const buildNombre = (u: PropietarioBackend): string => {
  if (u.nombreCompleto && u.nombreCompleto.trim() !== "") {
    return u.nombreCompleto;
  }

  const concat = `${u.nombres ?? ""} ${u.apellidos ?? ""}`.trim();
  if (concat !== "") return concat;

  return "(Sin nombre)";
};

const toOption = (u: PropietarioBackend): PropietarioOption => ({
  id: getId(u),
  nombre: buildNombre(u),
});

const toDetalle = (u: PropietarioBackend): PropietarioDetalle => ({
  id: getId(u),
  nombreCompleto: buildNombre(u),
  email: u.email,
  telefono: u.telefono ?? "",
  ruc: u.ruc ?? null,
  razonSocial: u.razonSocial ?? u.razon_social ?? null,
});

// Solo usuarios activos
const estaActivo = (u: PropietarioBackend): boolean => {
  const estado = (u.estadoUsuario ?? u.estado ?? "").toUpperCase();
  // Si no viene nada en estado, lo consideramos activo por defecto
  return estado === "" || estado === "ACTIVO";
};

// Si luego quieres filtrar solo SOCIO / PROPIETARIO, aquí lo puedes ajustar.
const esPropietario = (u: PropietarioBackend): boolean => {
  const r = u.rol;
  const nombreRol =
    typeof r === "string" ? r : r?.nombreRol;

  // Por ahora dejamos que cualquier rol activo sea elegible.
  // Si tu rol de socio se llama "SOCIO", podrías hacer:
  // return nombreRol?.toUpperCase() === "SOCIO";
  return true;
};

// --- API ---

const propietariosApi = {
  async listar(): Promise<PropietarioOption[]> {
    const { data } = await http.get<PropietarioBackend[]>(
      "/api/v1/admin/usuarios"
    );

    return data
      .filter(estaActivo)
      .filter(esPropietario)
      .map(toOption);
  },

  async obtener(id: number): Promise<PropietarioDetalle> {
    const { data } = await http.get<PropietarioBackend>(
      `/api/v1/admin/usuarios/${id}`
    );
    return toDetalle(data);
  },
};

export default propietariosApi;