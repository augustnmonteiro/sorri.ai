import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'

const presetColors = [
  '#0066E0', '#00C4CC', '#6366F1', '#8B5CF6',
  '#EC4899', '#EF4444', '#F59E0B', '#22C55E',
]

export function BrandColors() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>Extras</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Suas cores de marca
        </h1>
        <p className="text-lg text-gray-500">
          Usaremos essas cores nas miniaturas e elementos visuais
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        {/* Primary Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Cor primaria
          </label>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl border-2 border-gray-200 shadow-inner"
              style={{ backgroundColor: data.brand_color_primary }}
            />
            <input
              type="color"
              value={data.brand_color_primary || '#0066E0'}
              onChange={(e) => updateData({ brand_color_primary: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <div className="flex flex-wrap gap-2">
              {presetColors.slice(0, 4).map((color) => (
                <button
                  key={color}
                  onClick={() => updateData({ brand_color_primary: color })}
                  className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                    data.brand_color_primary === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Cor secundaria
          </label>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl border-2 border-gray-200 shadow-inner"
              style={{ backgroundColor: data.brand_color_secondary }}
            />
            <input
              type="color"
              value={data.brand_color_secondary || '#00C4CC'}
              onChange={(e) => updateData({ brand_color_secondary: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer"
            />
            <div className="flex flex-wrap gap-2">
              {presetColors.slice(4).map((color) => (
                <button
                  key={color}
                  onClick={() => updateData({ brand_color_secondary: color })}
                  className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                    data.brand_color_secondary === color ? 'ring-2 ring-offset-2 ring-secondary' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Preview</p>
          <div
            className="h-24 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: `linear-gradient(135deg, ${data.brand_color_primary} 0%, ${data.brand_color_secondary} 100%)`,
            }}
          >
            Seu Nome
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
