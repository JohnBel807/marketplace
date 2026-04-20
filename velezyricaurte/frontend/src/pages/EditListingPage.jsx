import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Upload, X, AlertCircle } from 'lucide-react'
import api from '../utils/api'
import { useAuthStore } from '../context/store'
import { CATEGORIES, MUNICIPALITIES, PLACEHOLDER_IMAGES } from '../utils/constants'

export default function EditListingPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [listing, setListing] = useState(null)
  const selectedCategory = watch('category')
  const catMeta = CATEGORIES.find(c => c.key === selectedCategory)

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(r => {
        const l = r.data
        setListing(l)
        setPhotos(l.photos || [])
        // Populate form
        setValue('title', l.title)
        setValue('description', l.description)
        setValue('price', l.price || '')
        setValue('price_negotiable', l.price_negotiable)
        setValue('category', l.category)
        setValue('subcategory', l.subcategory || '')
        setValue('condition', l.condition)
        setValue('city', l.city)
        setValue('municipality', l.municipality || '')
        setValue('contact_phone', l.contact_phone || '')
        setValue('contact_whatsapp', l.contact_whatsapp || '')
        // Attributes
        if (l.attributes) {
          Object.entries(l.attributes).forEach(([k, v]) => {
            setValue(`attr_${k}`, v)
          })
        }
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setFetching(false))
  }, [id])

  // Verify ownership
  useEffect(() => {
    if (listing && user && listing.owner_id !== user.id && !user.is_admin) {
      navigate('/dashboard')
    }
  }, [listing, user])

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 8 - photos.length)
    if (!files.length) return
    setUploading(true)
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    try {
      const { data } = await api.post('/listings/upload-photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setPhotos(prev => [...prev, ...data.urls])
    } catch {
      const urls = files.map(f => URL.createObjectURL(f))
      setPhotos(prev => [...prev, ...urls])
    }
    setUploading(false)
  }

  const removePhoto = (idx) => setPhotos(p => p.filter((_, i) => i !== idx))

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const attributes = {}
      if (catMeta) {
        catMeta.attributes.forEach(attr => {
          if (data[`attr_${attr}`]) attributes[attr] = data[`attr_${attr}`]
        })
      }
      const payload = {
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
        price_negotiable: data.price_negotiable,
        category: data.category,
        subcategory: data.subcategory,
        condition: data.condition,
        city: data.city,
        municipality: data.municipality,
        contact_phone: data.contact_phone,
        contact_whatsapp: data.contact_whatsapp || data.contact_phone,
        photos,
        thumbnail_url: photos[0] || null,
        attributes,
      }
      await api.put(`/listings/${id}`, payload)
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al actualizar el anuncio')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-64 w-full rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">Editar anuncio</h1>
        <p className="text-earth-400 text-sm">ID #{id}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Categoría */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-earth-800">Categoría</h2>
          <div>
            <label className="label">Categoría *</label>
            <select className="input" {...register('category', { required: true })}>
              <option value="">Seleccionar...</option>
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          {catMeta && (
            <div>
              <label className="label">Subcategoría</label>
              <select className="input" {...register('subcategory')}>
                <option value="">Seleccionar...</option>
                {catMeta.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Info básica */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-earth-800">Información del anuncio</h2>
          <div>
            <label className="label">Título *</label>
            <input className="input" {...register('title', { required: true, minLength: 10 })} />
            {errors.title && <p className="text-red-500 text-xs mt-1">Mínimo 10 caracteres</p>}
          </div>
          <div>
            <label className="label">Descripción *</label>
            <textarea rows={5} className="input resize-none" {...register('description', { required: true, minLength: 30 })} />
            {errors.description && <p className="text-red-500 text-xs mt-1">Mínimo 30 caracteres</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Precio (COP)</label>
              <input type="number" className="input" {...register('price')} />
            </div>
            <div>
              <label className="label">Condición *</label>
              <select className="input" {...register('condition', { required: true })}>
                <option value="used">Usado</option>
                <option value="new">Nuevo</option>
                <option value="refurbished">Reacondicionado</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-earth-600 cursor-pointer">
            <input type="checkbox" className="rounded" {...register('price_negotiable')} />
            Precio negociable
          </label>
        </div>

        {/* Atributos dinámicos */}
        {catMeta && catMeta.attributes.length > 0 && (
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-earth-800">Características específicas</h2>
            <div className="grid grid-cols-2 gap-4">
              {catMeta.attributes.map(attr => (
                <div key={attr}>
                  <label className="label capitalize">{attr.replace(/_/g, ' ')}</label>
                  <input className="input" {...register(`attr_${attr}`)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ubicación */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-earth-800">Ubicación</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ciudad *</label>
              <select className="input" {...register('city', { required: true })}>
                {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Municipio / Vereda</label>
              <input className="input" {...register('municipality')} />
            </div>
          </div>
        </div>

        {/* Fotos */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-earth-800">Fotos <span className="text-earth-400 font-normal text-sm">(hasta 8)</span></h2>
          <div className="grid grid-cols-4 gap-3">
            {photos.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-earth-100">
                <img src={url} className="w-full h-full object-cover" alt=""
                  onError={e => { e.target.src = PLACEHOLDER_IMAGES.default }} />
                <button type="button" onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500">
                  <X size={12} />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-brand-500 text-white px-1.5 rounded-full">Principal</span>}
              </div>
            ))}
            {photos.length < 8 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-earth-200 hover:border-brand-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-earth-50">
                {uploading
                  ? <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  : <><Upload size={20} className="text-earth-400 mb-1" /><span className="text-xs text-earth-400">Agregar</span></>
                }
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
        </div>

        {/* Contacto */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-earth-800">Contacto</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Teléfono</label>
              <input className="input" {...register('contact_phone')} />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" {...register('contact_whatsapp')} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1 justify-center py-4">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-4 text-base">
            {loading ? 'Guardando...' : '✓ Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
