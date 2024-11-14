import Layout from '../components/Layout';
import TaxCalculator from '../components/TaxCalculator';

export default function CalculatorPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Tax Calculator</h1>
        <p className="text-gray-600">
          Estimate your quarterly tax payments and understand your tax brackets based on your current income.
        </p>
        <TaxCalculator />
      </div>
    </Layout>
  );
}