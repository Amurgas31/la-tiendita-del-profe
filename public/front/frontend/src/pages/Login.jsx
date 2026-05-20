// Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";

// Usuarios por defecto (semilla inicial)
const defaultUsers = [
  { id: 1, email: "john@gmail.com", username: "johnd", password: "m38rmF$" },
  { id: 2, email: "morrison@gmail.com", username: "mor_2314", password: "83r5^_" },
  { id: 3, email: "kevin@gmail.com", username: "kevinryan", password: "kev02937@" }
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Inicializar la "base de datos" local si no existe
    if (!localStorage.getItem("fakestore_users")) {
      localStorage.setItem("fakestore_users", JSON.stringify(defaultUsers));
    }

    // 2. Validar si ya hay una sesión activa
    const token = localStorage.getItem("fakestore_token") || sessionStorage.getItem("fakestore_token");
    if (token) {
      navigate("/home");
    }

    // 3. Autorrellenar email si se guardó la sesión previamente
    const savedEmail = localStorage.getItem("fakestore_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Por favor completa email y contraseña.");
      return;
    }

    setLoading(true);

    try {
      // Traer todos los usuarios (los por defecto + los nuevos registrados)
      const storedUsers = JSON.parse(localStorage.getItem("fakestore_users")) || defaultUsers;

      // Buscar coincidencia
      const user = storedUsers.find(
        (item) =>
          item.email.toLowerCase() === email.trim().toLowerCase() &&
          item.password === password
      );

      if (!user) {
        throw new Error("Email o contraseña incorrectos.");
      }

      const token = `token-${user.id}-${Date.now()}`;
      
      if (rememberMe) {
        localStorage.setItem("fakestore_token", token);
        localStorage.setItem("fakestore_email", user.email);
        localStorage.setItem("fakestore_user", user.username || user.name);
        sessionStorage.removeItem("fakestore_token");
      } else {
        sessionStorage.setItem("fakestore_token", token);
        sessionStorage.setItem("fakestore_user", user.username || user.name);
        localStorage.removeItem("fakestore_email");
        localStorage.removeItem("fakestore_user");
        localStorage.removeItem("fakestore_token");
      }

      navigate("/home");
    } catch (error_) {
      setError(error_.message || "Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 rounded-4xl bg-gray-100 px-4 p-6 md:p-10 md:flex-row md:items-center shadow-lg border border-gray-100">
        <div className="w-full">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold text-center text-teal-500 sm:text-4xl">
              Inicia sesión
            </h1>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900 ml-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario@dominio.com"
                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-400 outline-none transition-all placeholder-gray-400 bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900 ml-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-400 outline-none transition-all placeholder-gray-400 bg-white"
                required
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 font-medium text-sm text-gray-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-teal-600 focus:ring-teal-500"
                />
                Guardar sesión
              </label>
              <Link
                to="/register"
                className="text-sm text-center font-semibold text-teal-500 hover:text-teal-400"
              >
                ¿No tienes cuenta?
              </Link>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;