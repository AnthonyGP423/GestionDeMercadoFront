import http from "../httpClient";

export type FavoritoResponseDto = {
  idFavorito: number;
  idStand: number;
  nombreStand: string;
  bloque: string | null;
  numeroStand: string | null;
  categoriaStand: string | null;
  fechaAgregado: string | null;
};

export const favoritosApi = {
  listar() {
    return http.get<FavoritoResponseDto[]>("/api/v1/cliente/favoritos");
  },
  agregar(idStand: number) {
    return http.post(`/api/v1/cliente/favoritos/${idStand}`);
  },
  quitar(idStand: number) {
    return http.delete(`/api/v1/cliente/favoritos/${idStand}`);
  },
};