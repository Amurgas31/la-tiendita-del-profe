// Products.jsx - Panel de administración con almacenamiento híbrido persistente.
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Nav from '../components/Nav'
import ProductForm from '../components/ProductForm'
import ConfirmModal from '../components/ConfirmModal'

const Products = () => {
  // --- 1. ESTADOS DE CONTROL PRINCIPALES ---
  const [products, setProducts] = useState([]) // Almacena la lista de productos activa en memoria
  const [loading, setLoading] = useState(true) // Controla el spinner o pantalla de carga inicial
  const [error, setError] = useState('') // Mensajes de error globales
  const [categories, setCategories] = useState([]) // Lista de categorías para el formulario
  const [searchTerm, setSearchTerm] = useState('') // Texto del cuadro de búsqueda
  const [currentPage, setCurrentPage] = useState(1) // Página actual de la tabla
  const itemsPerPage = 5 // Registros máximos por página

  // --- 2. ESTADOS DE FORMULARIOS Y MODALES ---
  const [showProductForm, setShowProductForm] = useState(false) // Muestra/oculta el formulario de producto
  const [productSubmitting, setProductSubmitting] = useState(false) // Deshabilita botones mientras se procesa un cambio
  const [productError, setProductError] = useState('') // Errores del formulario
  const [productSuccess, setProductSuccess] = useState('') // Mensajes de éxito del formulario
  const [editingProduct, setEditingProduct] = useState(null) // Producto que se está editando (null si es creación)
  const [loadingProductDetail, setLoadingProductDetail] = useState(false) // Estado de carga al buscar un producto
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false) // Muestra/oculta el modal de confirmación de borrado
  const [productToDelete, setProductToDelete] = useState(null) // ID del producto guardado temporalmente para borrar

  const navigate = useNavigate()
  
  // Recuperamos el token de seguridad para verificar que el usuario inició sesión
  const token = localStorage.getItem('fakestore_token') || sessionStorage.getItem('fakestore_token')

  // --- 3. FILTRADO Y BÚSQUEDA EN TIEMPO REAL ---
  const filteredProducts = products.filter((product) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true // Si el buscador está vacío, conserva todos los productos
    
    // Unimos los campos clave en una sola cadena de texto para buscar en todos a la vez
    return [product.title, product.description, product.category]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  // --- 4. CÁLCULOS MATEMÁTICOS DE PAGINACIÓN ---
  // Math.ceil divide el total de productos entre 5 y lo redondea hacia arriba (Ej: 21 productos / 5 = 5 páginas)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  // --- 5. CARGA INICIAL DE DATOS (Efecto de montaje) ---
  useEffect(() => {
    // Protección de ruta: Si no hay token, el usuario es expulsado inmediatamente al login
    if (!token) {
      navigate('/')
      return
    }

    // CARGAR PRODUCTOS PERSISTENTES:
    const fetchProducts = async () => {
      try {
        // Intentamos leer si ya existe nuestra "Base de datos" en el almacenamiento del navegador
        const localSavedData = localStorage.getItem('my_custom_store_products')
        
        if (localSavedData) {
          // CASO A: Si ya guardamos datos antes, los convertimos de texto a Objeto JS y los usamos
          setProducts(JSON.parse(localSavedData))
        } else {
          // CASO B: Si es la primera vez que abre la app, traemos los productos de la API externa
          const response = await fetch('https://fakestoreapi.com/products')
          if (!response.ok) throw new Error('Error al cargar los productos del servidor')

          const data = await response.json()
          
          // Mapeamos los productos inyectándoles la propiedad "source: 'api'" para saber su origen
          const initialProducts = data.map((product) => ({ ...product, source: 'api' }))
          
          // Guardamos esta lista inicial en el localStorage convertido en cadena de texto (String)
          localStorage.setItem('my_custom_store_products', JSON.stringify(initialProducts))
          setProducts(initialProducts)
        }
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los productos')
      } finally {
        setLoading(false) // Apagamos la animación de carga sin importar si falló o funcionó
      }
    }

    // CARGAR CATEGORÍAS (Para poblar el menú desplegable/Select del formulario)
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products/categories')
        if (!response.ok) throw new Error('Error al cargar las categorías')
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.warn('Alerta de categorías:', err)
      }
    }

    fetchProducts()
    fetchCategories()
  }, [navigate, token])

  // --- 6. MANEJADORES DE INTERFAZ SIMPLES ---
  const handlePageChange = (page) => setCurrentPage(page)

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reiniciamos siempre a la página 1 al escribir para evitar descuadres visuales
  }

  // --- 7. ACCIÓN: PREPARAR EDICIÓN (Cargar datos en el formulario) ---
  const handleEditProduct = async (productId) => {
    setProductError('')
    setLoadingProductDetail(true)

    // Buscamos el producto directamente en nuestro estado local en memoria
    const productToEdit = products.find((product) => product.id === productId)
    
    if (productToEdit) {
      setEditingProduct(productToEdit) // Guardamos el objeto seleccionado en el estado de edición
      setShowProductForm(true) // Abrimos el modal (el formulario se rellenará automáticamente)
      setLoadingProductDetail(false)
    } else {
      setProductError('No se encontró el producto solicitado.')
      setLoadingProductDetail(false)
    }
  }

  // --- 8. ACCIÓN: GUARDAR CAMBIOS DE EDICIÓN ---
  const handleUpdateProduct = async (formData) => {
    setProductError('')
    setProductSuccess('')
    setProductSubmitting(true)

    try {
      // Modificamos el producto usando .map()
      // Si el id coincide, mezclamos los datos viejos, los nuevos del formulario, y mantenemos su origen original
      const updatedList = products.map((p) =>
        p.id === editingProduct.id 
          ? { ...p, ...formData, source: p.source } 
          : p
      )

      // Guardamos la lista actualizada de inmediato en el disco del navegador
      localStorage.setItem('my_custom_store_products', JSON.stringify(updatedList))
      
      // Sincronizamos el estado de React para actualizar la tabla en la pantalla
      setProducts(updatedList)
      
      setProductSuccess('Producto actualizado con éxito localmente.')
      setShowProductForm(false)
      setEditingProduct(null)
    } catch (err) {
      setProductError('No se pudo guardar la actualización.')
    } finally {
      setProductSubmitting(false)
    }
  }

  // --- 9. ACCIÓN: CREAR NUEVO PRODUCTO ---
  const handleCreateProduct = async (formData) => {
    setProductError('')
    setProductSuccess('')
    setProductSubmitting(true)

    try {
      // Generamos un ID autoincremental seguro buscando el ID más alto actual y sumándole 1
      const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1

      // Construimos el nuevo objeto de producto
      const newProduct = {
        ...formData,               // Copia todo lo que viene del formulario (title, price, description, category, image)
        id: nextId,               // Le asignamos nuestro nuevo ID numérico
        source: 'local',          // Lo marcamos explícitamente como creado en local
        rating: { rate: 0, count: 0 } // Estructura por defecto para evitar errores si la UI intenta leer estrellas
      }

      // Ponemos el producto nuevo al principio del arreglo usando desestructuración
      const updatedList = [newProduct, ...products]

      // Guardamos la lista expandida en el localStorage
      localStorage.setItem('my_custom_store_products', JSON.stringify(updatedList))
      setProducts(updatedList)

      setProductSuccess(`Producto creado localmente con éxito. ID: ${nextId}`)
      setShowProductForm(false)
      setCurrentPage(1) // Movemos la tabla a la primera página para ver el producto recién creado
    } catch (err) {
      setProductError('Error al guardar el nuevo producto.')
    } finally {
      setProductSubmitting(false)
    }
  }

  // --- 10. ACCIÓN: SOLICITAR ELIMINACIÓN ---
  const handleDeleteProduct = (productId) => {
    setProductToDelete(productId) // Recordamos qué ID queremos borrar
    setShowDeleteConfirm(true) // Abrimos el modal flotante que pregunta "¿Estás seguro?"
  }

  // --- 11. ACCIÓN: CONFIRMACIÓN FINAL DE ELIMINACIÓN ---
  const confirmDeleteProduct = () => {
    if (!productToDelete) return

    setProductError('')
    setProductSuccess('')
    setShowDeleteConfirm(false)

    try {
      // Filtramos el arreglo eliminando por completo el producto que coincida con el ID seleccionado
      const updatedList = products.filter((p) => p.id !== productToDelete)

      // Sobrescribimos el localStorage con el nuevo arreglo reducido
      localStorage.setItem('my_custom_store_products', JSON.stringify(updatedList))
      setProducts(updatedList)

      setProductSuccess('Producto eliminado permanentemente de tu almacenamiento.')
    } catch (err) {
      setProductError('No se pudo eliminar el producto de forma local.')
    } finally {
      setProductToDelete(null) // Limpiamos el estado temporal del ID
    }
  }

  const cancelDeleteProduct = () => {
    setShowDeleteConfirm(false)
    setProductToDelete(null)
  }


  return (
    <div className="min-h-screen bg-white">
      {token && <Nav />}

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Encabezado Principal */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-teal-600">Catálogo de Productos</h1>
            <p className="text-sm text-slate-500 font-medium">Gestión Profesional de Inventario</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-sm font-bold text-slate-700">{filteredProducts.length} items</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm((s) => !s);
              }}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm shadow-teal-100"
            >
              Nuevo Producto +
            </button>
          </div>
        </header>

        {/* Buscador */}
        <div className="mb-6 w-full"> {/* Cambiado de max-w-xl a w-full */}
          <label htmlFor="product-search" className="sr-only">Buscar productos</label>
          <input
            id="product-search"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por título, descripción o categoría..."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 text-sm outline-none shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </div>

        {/* Alertas de Estado */}
        {productError && <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-medium text-rose-700">{productError}</div>}
        {productSuccess && <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm font-medium text-emerald-700">{productSuccess}</div>}

        {/* Formularios y Modales */}
        {showProductForm && (
          <ProductForm
            initialData={editingProduct || {}}
            categories={categories}
            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
            submitting={productSubmitting || loadingProductDetail}
            onClose={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
          />
        )}

        <ConfirmModal
          title="Confirmar eliminación"
          message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
          isOpen={showDeleteConfirm}
          isDangerous={true}
          onConfirm={confirmDeleteProduct}
          onCancel={cancelDeleteProduct}
        />

        {/* Tabla / Contenedor Principal */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 font-medium text-sm">Cargando productos...</div>
          ) : error ? (
            <div className="m-4 rounded-lg bg-rose-50 p-6 text-sm text-rose-700 border border-rose-100">{error}</div>
          ) : (
            <>
              {/* VISTA PARA MÓVILES (Tarjetas/Cards que se ocultan en pantallas grandes) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {currentProducts.map((product) => (
                  <div key={product.id} className="p-4 space-y-3 hover:bg-teal-50/10 transition-colors">
                    <div>
                      <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-1">
                        {product.category}
                      </span>
                      <h3 className="font-bold text-slate-800 line-clamp-1">{product.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{product.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-slate-900 text-base">${product.price.toFixed(2)}</span>
                      <div className="flex gap-3 text-xs font-bold">
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          disabled={loadingProductDetail}
                          className="text-teal-600 hover:text-teal-800 disabled:text-slate-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* VISTA PARA ESCRITORIO (Tabla tradicional que se oculta en celulares) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-4 font-bold max-w-[280px]">Producto / Categoría</th>
                      <th className="p-4 font-bold max-w-[350px]">Descripción</th>
                      <th className="p-4 font-bold text-right">Precio</th>
                      <th className="p-4 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {currentProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-teal-50/20 transition-colors">
                        {/* Título y Categoría combinados al estilo Académico */}
                        <td className="p-4 align-middle">
                          <div className="font-bold text-slate-800 line-clamp-1 max-w-[260px]">{product.title}</div>
                          <div className="text-xs text-teal-600 font-semibold mt-0.5">{product.category}</div>
                        </td>
                        {/* Descripción con límite de líneas */}
                        <td className="p-4 align-middle text-slate-500 max-w-[350px]">
                          <p className="line-clamp-2 leading-relaxed" title={product.description}>
                            {product.description}
                          </p>
                        </td>
                        {/* Precio */}
                        <td className="p-4 align-middle text-right font-bold text-slate-900 whitespace-nowrap">
                          ${product.price.toFixed(2)}
                        </td>
                        {/* Acciones limpias tipo link */}
                        <td className="p-4 align-middle">
                          <div className="flex justify-center gap-4 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product.id)}
                              disabled={loadingProductDetail}
                              className="text-teal-600 hover:text-teal-800 transition-colors disabled:cursor-not-allowed disabled:text-slate-400"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación Profesional Estilizada */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Página {currentPage} de {totalPages}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                  >
                    ← Ant
                  </button>

                  {/* Páginas numéricas */}
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      const isCurrent = currentPage === page;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => handlePageChange(page)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${isCurrent
                            ? 'bg-teal-600 text-white shadow-sm shadow-teal-100'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                  >
                    Sig →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
export default Products