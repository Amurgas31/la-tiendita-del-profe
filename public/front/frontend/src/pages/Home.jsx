// Home.jsx muestra la pantalla principal del usuario una vez que ya está autenticado.
// También se asegura de que la página no esté disponible si no existe token.
import { useEffect } from "react";
import { useNavigate } from "react-router";
import Nav from "../components/Nav"; // Componente de navegación que se muestra cuando el usuario está logueado.

const Home = () => {
  const navigate = useNavigate(); // Hook de react-router para redirigir programáticamente.
  const token =
    localStorage.getItem("fakestore_token") ||
    sessionStorage.getItem("fakestore_token");

  // Si hay token, cargamos el usuario.
  const user = token
    ? sessionStorage.getItem("fakestore_user") ||
      localStorage.getItem("fakestore_user") ||
      ""
    : "";

  useEffect(() => {
    // Si no hay token, redirige al login.
    if (!token) {
      navigate("/");
    }
  }, [navigate, token]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {token && <Nav />} {/* Muestra la navegación solo si hay token. */}
      <div className="flex flex-col items-center justify-center grow">
        <header className="text-center mx-4">
          <h1 className="text-4xl font-bold text-teal-600">
            Bienvenido {user ? ` ${user}` : ""}
          </h1>
          <p className="mt-4 text-gray-700">
            Explora las funcionalidades y disfruta de la experiencia.
          </p>
        </header>
      </div>
    </div>
  );
};

export default Home;