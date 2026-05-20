// ProductForm.jsx - Componente de formulario dinámico (funciona para Crear y Editar).
import { useState, useEffect, useRef } from 'react'

// RECIBE PROPIEDADES (Props) DEL PADRE (Products.jsx):
// - initialData: Objeto con datos si vamos a editar; vacío {} si vamos a crear.
// - onSubmit: La función del padre que guarda los datos (handleCreate o handleUpdate).
// - submitting: Estado booleano para saber si está cargando/guardando.
// - onClose: Función para cerrar este modal visualmente.
// - categories: Arreglo de strings que viene de la API para llenar el selector.
const ProductForm = ({ initialData = {}, onSubmit, submitting = false, onClose, categories = [] }) => {
  
  // --- 1. ESTADO DEL FORMULARIO ---
  // Inicializamos el formulario con campos vacíos por defecto, pero si "initialData" trae
  // información (porque se presionó "Editar"), el operador spread (...initialData) sobrescribe
  // los campos vacíos con los datos reales del producto viejito.
  const [form, setForm] = useState(() => ({
    title: '',
    price: '',
    description: '',
    category: '',
    image: '', // Añadido por buena práctica para la URL de la imagen del producto
    ...initialData
  }))

  // --- 2. VARIABLE DE CONTROL DE MODO ---
  // Convierte el ID a un valor booleano verdadero/falso (true o false).
  // Si initialData tiene un ID significa que el producto ya existe, por ende: ¡Estamos editando!
  const isEditing = !!initialData?.id 

  // --- 3. MANEJADOR DE CAMBIOS GENERALIZADO (Súper importante) ---
  // Se ejecuta cada vez que el usuario escribe en cualquier input.
  // Agarra el "name" del input (ej: name="title") y su "value" (lo que escribió)
  // y actualiza de forma dinámica esa propiedad exacta en el estado sin borrar las demás.
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // --- 4. MANEJADOR DEL ENVÍO (Submit del formulario) ---
  const handleSubmit = (e) => {
    e.preventDefault() // Evita que la página web se recargue por completo (comportamiento por defecto de HTML)
    
    // Convertimos explícitamente el precio a un número matemático real usando Number(),
    // ya que los inputs de HTML siempre devuelven texto plano (strings).
    const payload = { ...form, price: Number(form.price) }
    
    // Si la propiedad onSubmit existe, le enviamos el paquete de datos (payload) hacia Products.jsx
    if (onSubmit) onSubmit(payload)
  }

  // --- 5. CONTROL ACCESIBILIDAD Y COMODIDAD (UX) ---
  const overlayRef = useRef(null) // Referencia para enganchar el fondo oscuro del modal

  // Efecto para escuchar la tecla "Escape" en el teclado. Si el usuario la presiona, el modal se cierra.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose()
      }
    }
    window.addEventListener('keydown', onKey) // Añade el detector al teclado global
    return () => window.removeEventListener('keydown', onKey) // Limpieza del detector cuando el modal se destruye
  }, [onClose])

  // Función para cerrar el modal si el usuario hace click afuera (en la zona oscura de fondo)
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      if (onClose) onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-6"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-teal-600">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Formulario oficial de registro</p>
          </div>
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Formulario con Sistema Grid Autodocumentado */}
        <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>

          {/* CASO A: Campo que ocupa TODO EL ANCHO (sm:col-span-2) */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-gray-950 uppercase tracking-wider ml-1">Título</label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej: Camiseta Deportiva Premium"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              required
            />
          </div>

          {/* CASO B: Campo que ocupa la MITAD DEL ANCHO en escritorio (Por defecto ocupa 1 columna) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-950 uppercase tracking-wider ml-1">Precio</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              required
            />
          </div>

          {/* CASO B2: Otro campo de mitad de ancho para balancear la fila horizontal */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-950 uppercase tracking-wider ml-1">Categoría</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              required
            >
              <option value="" disabled>
                {categories.length ? 'Selecciona una opción' : 'Cargando categorías...'}
              </option>
              {form.category && !categories.includes(form.category) && (
                <option value={form.category}>{form.category}</option>
              )}
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* CASO A: Área de texto que ocupa TODO EL ANCHO */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-gray-950 uppercase tracking-wider ml-1">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Escribe las especificaciones detalladas del artículo..."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all min-h-[100px]"
              rows={3}
            />
          </div>

          {/* Botones de Acción (Siempre al fondo y ocupando todo el ancho del grid) */}
          <div className="sm:col-span-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onClose && onClose()}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 text-sm font-bold transition-all shadow-sm shadow-teal-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {submitting ? 'Guardando...' : isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm