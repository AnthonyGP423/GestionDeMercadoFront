import http from "./httpClient";

export interface UploadResponse {
  url: string; // "/media/productos/xxxx.jpg"
}

export const filesApi = {
  async upload(
    tipo: "usuarios" | "productos" | "incidencias" | "stands" | "qr",
    file: File
  ) {
    const form = new FormData();
    form.append("file", file);

    // IMPORTANTE: no fijar Content-Type manualmente
    const { data } = await http.post<UploadResponse>(`/api/v1/files/upload/${tipo}`, form);
    return data; // { url: "/media/..." }
  },
};