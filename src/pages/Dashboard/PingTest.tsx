import { useEffect, useState } from "react";
import http from "../../api/httpClient";

const PingTest = () => {
  const [resultado, setResultado] = useState<string>("Cargando...");

  useEffect(() => {
    http
      .get("/api/v1/ping")
      .then((res) => {
        setResultado(JSON.stringify(res.data, null, 2));
      })
      .catch((err) => {
        console.error(err);
        const mensajeBackend = err.response?.data?.mensaje ?? err.message;
        setResultado("Error: " + mensajeBackend);
      });
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Prueba de conexión con el backend</h2>
      <pre>{resultado}</pre>
    </div>
  );
};

export default PingTest;