import Link from 'next/link';
import { 
  Calculator, 
  LineChart, 
  Receipt,
  Settings
} from 'lucide-react';

export default function Layout({ children }) {
const navigation = [
 { name: 'Income Tracking', href: '/', icon: LineChart },
 { name: 'Tax Calculator', href: '/calculator', icon: Calculator },
 { name: 'Tax Payments', href: '/payments', icon: Receipt },
 { name: 'Settings', href: '/settings', icon: Settings }
];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-xl font-bold text-gray-800">MoneyWise</h1>
        </div>
        <nav className="px-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-2 py-2 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 group"
            >
              <item.icon className="mr-3 h-6 w-6" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}