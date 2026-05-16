import { Truck, RotateCcw, Shield, Headphones } from 'lucide-react'

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50', color: 'bg-blue-50 text-blue-600' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy', color: 'bg-green-50 text-green-600' },
  { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'bg-purple-50 text-purple-600' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help', color: 'bg-orange-50 text-orange-600' },
]

export function FeatureBanner() {
  return (
    <section className="py-8">
      <div className="container-narrow">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 hover:shadow-card transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
