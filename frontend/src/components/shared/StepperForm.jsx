import { RiCheckLine } from 'react-icons/ri'

export default function StepperForm({ steps, currentStep, children }) {
  return (
    <div>
      {/* Indicateur d'étapes */}
      <div className="flex items-center mb-8">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep
          const isActive    = idx === currentStep

          return (
            <div key={idx} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isCompleted ? 'bg-green-500 text-white'
                  : isActive  ? 'bg-accent text-white'
                  : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? <RiCheckLine /> : idx + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  isActive ? 'text-accent' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Contenu de l'étape courante */}
      <div>
        {steps[currentStep]?.icon && (
          <div className="flex items-center gap-2 mb-6">
            {(() => { const Icon = steps[currentStep].icon; return <Icon className="text-accent text-2xl" /> })()}
            <h2 className="text-lg font-semibold text-gray-800">{steps[currentStep].label}</h2>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
