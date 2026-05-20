// Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas de seguridad
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Por favor llena todos los campos.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // 1. Obtener los usuarios actuales de localStorage (o los iniciales por defecto si está vacío)
    const currentUsers = JSON.parse(localStorage.getItem("fakestore_users")) || [
      { id: 1, email: "john@gmail.com", username: "johnd", password: "m38rmF$" },
      { id: 2, email: "morrison@gmail.com", username: "mor_2314", password: "83r5^_" },
      { id: 3, email: "kevin@gmail.com", username: "kevinryan", password: "kev02937@" },
    ];

    // 2. Verificar si el correo electrónico ya se encuentra registrado
    const emailExists = currentUsers.some(
      (user) => user.email.toLowerCase() === formData.email.trim().toLowerCase()
    );

    if (emailExists) {
      setError('Este correo electrónico ya está registrado.');
      return;
    }

    // 3. Crear el nuevo objeto de usuario
    const newUser = {
      id: currentUsers.length + 1,
      email: formData.email.trim(),
      username: formData.name.trim().toLowerCase().replace(/\s+/g, '_'), // Genera un username ej: "juan_perez"
      password: formData.password
    };

    // 4. Guardar la lista actualizada de vuelta en el localStorage
    const updatedUsers = [...currentUsers, newUser];
    localStorage.setItem("fakestore_users", JSON.stringify(updatedUsers));

    // Mostrar ventana de éxito
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      {/* Contenedor idéntico al del Login en tamaño y formas */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 rounded-4xl bg-gray-100 px-4 p-6 md:p-10 shadow-lg border border-gray-100 relative overflow-hidden">
        
        {/* Modal de éxito (Estilo unificado) */}
        {showSuccess && (
          <div className="absolute inset-0 bg-gray-100/95 z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              ✓
            </div>
            <h3 className="text-2xl font-bold text-gray-950">¡Cuenta Creada!</h3>
            <p className="text-gray-600 max-w-sm mt-2 mb-6 text-sm">
              Tu registro se completó con éxito. Tus credenciales han sido guardadas localmente de manera segura.
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-teal-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-teal-500 transition-all shadow-md shadow-teal-100 text-sm"
            >
              Ir al Inicio de Sesión
            </button>
          </div>
        )}

        <div className="w-full">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold text-center text-teal-500 sm:text-4xl">
              Crear Cuenta
            </h1>
          </div>
          
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            
            {/* Input 1: Nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900 ml-1">
                Nombre Completo
              </label>
              <input 
                type="text" 
                placeholder="Ej: Astrid Murgas" 
                required
                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-400 outline-none transition-all placeholder-gray-400 bg-white text-sm" 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Input 2: Correo */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900 ml-1">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                placeholder="usuario@dominio.com" 
                required
                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-400 outline-none transition-all placeholder-gray-400 bg-white text-sm" 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Input 3: Contraseña */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900 ml-1">
                Contraseña
              </label>
              <input 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                required 
                minLength={6}
                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-400 outline-none transition-all placeholder-gray-400 bg-white text-sm" 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {/* Manejo de Alertas de Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            {/* Botón de envío */}
            <button 
              type="submit" 
              className="flex w-full items-center justify-center rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 shadow-sm"
            >
              Registrarse
            </button>
          </form>

          {/* Enlace inferior de navegación */}
          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/" className="text-teal-500 font-bold hover:text-teal-400 transition-colors">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}