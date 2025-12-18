import http from "../httpClient";

export type CalificacionResponseDto = {
  idCalificacion: number;
  idStand: number;
  nombreStand: string;
  puntuacion: number;
  comentario: string | null;
  fecha: string | null;

  idCliente?: number | null;
  nombreCliente?: string | null;
  origen?: string | null;
};

export type PageDto<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type CalificacionCreateRequestDto = {
  idStand: number;
  puntuacion: number;
  comentario?: string | null;
};

export const calificacionesClienteApi = {
  listar(page = 0, size = 10) {
    return http.get<PageDto<CalificacionResponseDto>>(
      "/api/v1/cliente/calificaciones",
      { params: { page, size } }
    );
  },

  crear(payload: CalificacionCreateRequestDto) {
    return http.post<void>("/api/v1/cliente/calificaciones", payload);
  },
};