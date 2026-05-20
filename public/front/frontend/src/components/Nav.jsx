import { Link, useNavigate } from 'react-router';

const Nav = () => {
  const navigate = useNavigate(); // Hook para poder redirigir después del logout

  const handleLogout = () => {
    // Borra todos los datos de sesión del almacenamiento local y de sesión.
    localStorage.removeItem("fakestore_token");
    sessionStorage.removeItem("fakestore_token");
    sessionStorage.removeItem("fakestore_user");
    sessionStorage.removeItem("fakestore_email");
    
    navigate("/"); // Redirige al login
  };

  return (
    <nav className="bg-teal-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">La tiendita</div>

        {/* Se usa una lista horizontal para los enlaces de navegación. */}
        <div className="flex items-center space-x-6">
          <ul className="flex space-x-4">
            <li>
              <Link to="/home" className="hover:text-gray-200 font-medium">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-gray-200 font-medium">
                Products
              </Link>
            </li>
          </ul>

          {/* Botón de cerrar sesión integrado en el diseño del Nav */}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm bg-teal-700 hover:bg-teal-800 border border-teal-500 rounded-md transition-colors font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;