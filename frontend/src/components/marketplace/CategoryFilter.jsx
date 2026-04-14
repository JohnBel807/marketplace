import { CATEGORIES } from '../../utils/constants'

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
      <button
        onClick={() => onChange('')}
        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
          !selected
            ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
            : 'bg-white text-earth-600 border-earth-200 hover:border-brand-300'
        }`}
      >
        Todo
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
            selected === cat.key
              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
              : 'bg-white text-earth-600 border-earth-200 hover:border-brand-300'
          }`}
        >
          <span>{cat.icon}</span>
          <span className="whitespace-nowrap">{cat.label}</span>
        </button>
      ))}
    </div>
  )
}
