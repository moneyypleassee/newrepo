import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const TaxCalculator = () => {
  const standardDeductions = {
    single: 13850,
    married: 27700
  };

  const [incomeData, setIncomeData] = useState([]);
  const [deductions, setDeductions] = useState(standardDeductions.single);
  const [state, setState] = useState('CA');
  const [filingStatus, setFilingStatus] = useState('single');
  const [useStandardDeduction, setUseStandardDeduction] = useState(true);
  
  // Load income data from localStorage
  useEffect(() => {
    const savedIncome = localStorage.getItem('incomeData');
    if (savedIncome) {
      setIncomeData(JSON.parse(savedIncome));
    }
  }, []);

  // Update deductions when filing status changes
  useEffect(() => {
    if (useStandardDeduction) {
      setDeductions(standardDeductions[filingStatus]);
    }
  }, [filingStatus, useStandardDeduction]);

// Calculate quarterly totals
const calculateQuarterlyTotals = () => {
  return incomeData.reduce((quarters, income) => {
    const date = new Date(income.date);
    const quarter = Math.floor(date.getMonth() / 3);
    const amount = parseFloat(income.amount) || 0;
    
    // Initialize quarter if undefined
    quarters[quarter] = quarters[quarter] || 0;
    
    // For recurring income, calculate amount for each month in the quarter
    if (income.frequency === 'monthly') {
      quarters[quarter] += amount;  // Add monthly amount once per entry
    } else if (income.frequency === 'quarterly') {
      quarters[quarter] += amount;
    } else if (income.frequency === 'annual') {
      quarters[quarter] += amount / 4;
    } else { // one-time
      quarters[quarter] += amount;
    }
    
    return quarters;
  }, [0, 0, 0, 0]);
};

// Calculate projected annual income based on average monthly income
const calculateProjectedIncome = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Sum all quarterly totals
  const totalIncomeSoFar = calculateQuarterlyTotals().reduce((a, b) => a + b, 0);
  
  // Get number of months with data
  const monthsWithData = incomeData.reduce((months, income) => {
    const date = new Date(income.date);
    const month = date.getMonth();
    if (!months.includes(month)) {
      months.push(month);
    }
    return months;
  }, []).length;
  
  // Calculate average monthly income
  const averageMonthlyIncome = monthsWithData > 0 ? totalIncomeSoFar / monthsWithData : 0;
  
  // Project annual income based on average monthly income
  const annualIncome = averageMonthlyIncome * 12;
  
  console.log('Total income so far:', totalIncomeSoFar);
  console.log('Months with data:', monthsWithData);
  console.log('Average monthly income:', averageMonthlyIncome);
  console.log('Projected annual income:', annualIncome);
  
  return annualIncome;
};

  // Federal tax brackets for 2024
  const federalBrackets = {
    single: [
      { limit: 11600, rate: 0.10 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243725, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    married: [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: 487450, rate: 0.32 },
      { limit: 731200, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ]
  };

  // State tax brackets (example for California)
  const stateBrackets = {
    CA: {
      single: [
        { limit: 10099, rate: 0.01 },
        { limit: 23942, rate: 0.02 },
        { limit: 37788, rate: 0.04 },
        { limit: 52455, rate: 0.06 },
        { limit: 66295, rate: 0.08 },
        { limit: 338639, rate: 0.093 },
        { limit: 406364, rate: 0.103 },
        { limit: 677275, rate: 0.113 },
        { limit: Infinity, rate: 0.123 }
      ],
      married: [
        { limit: 20198, rate: 0.01 },
        { limit: 47884, rate: 0.02 },
        { limit: 75576, rate: 0.04 },
        { limit: 104910, rate: 0.06 },
        { limit: 132590, rate: 0.08 },
        { limit: 677278, rate: 0.093 },
        { limit: 812728, rate: 0.103 },
        { limit: 1354550, rate: 0.113 },
        { limit: Infinity, rate: 0.123 }
      ]
    }
  };

  // Find current tax bracket and surrounding brackets
const findTaxBracketInfo = (income, brackets) => {
  let currentBracket = null;
  let previousBracket = null;
  let nextBracket = null;
  let currentBracketStart = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracketStart = i > 0 ? brackets[i - 1].limit : 0;
    const bracketEnd = brackets[i].limit;
    
    if (income > bracketStart && income <= bracketEnd) {
      currentBracket = { ...brackets[i], start: bracketStart };
      previousBracket = i > 0 ? { ...brackets[i - 1], start: i > 1 ? brackets[i - 2].limit : 0 } : null;
      nextBracket = i < brackets.length - 1 ? { ...brackets[i + 1], start: bracketEnd } : null;
      currentBracketStart = bracketStart;
      break;
    }
  }

  if (!currentBracket) {
    const lastIndex = brackets.length - 1;
    currentBracket = { ...brackets[lastIndex], start: brackets[lastIndex - 1].limit };
    previousBracket = { ...brackets[lastIndex - 1], start: brackets[lastIndex - 2].limit };
    nextBracket = null;
  }

  return {
    currentBracket,
    previousBracket,
    nextBracket,
    currentBracketStart
  };
};

const calculateQuarterlyPayments = () => {
  const calculateTotalTax = (income, brackets) => {
    let tax = 0;
    let remainingIncome = income;
    let prevLimit = 0;

    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i];
      const prevBracket = i > 0 ? brackets[i - 1] : { limit: 0 };
      const bracketStart = prevBracket.limit;
      const bracketEnd = bracket.limit;
      
      // Calculate taxable income within this bracket
      const taxableInThisBracket = Math.min(
        Math.max(0, remainingIncome - bracketStart),
        bracketEnd - bracketStart
      );
      
      // Add tax for this bracket
      tax += taxableInThisBracket * bracket.rate;
      
      // Update remaining income
      remainingIncome -= taxableInThisBracket;
      
      // Break if we've processed all income
      if (remainingIncome <= 0) break;
    }
    
    return tax;
  };

  // Calculate adjusted taxable income (after deductions)
  const adjustedTaxableIncome = Math.max(0, taxableIncome);

  // Calculate self-employment tax (15.3% of 92.35% of net earnings)
  const seTaxableIncome = adjustedTaxableIncome * 0.9235;
  const seTax = seTaxableIncome * 0.153;
  
  // Calculate federal and state tax using progressive brackets
  const federalTax = calculateTotalTax(adjustedTaxableIncome, federalBrackets[filingStatus]);
  const stateTax = calculateTotalTax(adjustedTaxableIncome, stateBrackets[state][filingStatus]);
  
  // Total annual tax
  const totalAnnualTax = seTax + federalTax + stateTax;
  
  // Calculate required quarterly payments (90% of current year)
  const safeHarborPayment = totalAnnualTax * 0.90 / 4;

  return {
    quarterly: {
      selfEmployment: seTax / 4,
      federal: federalTax / 4,
      state: stateTax / 4,
      total: safeHarborPayment
    },
    annual: {
      selfEmployment: seTax,
      federal: federalTax,
      state: stateTax,
      total: totalAnnualTax
    }
  };
};
  const projectedIncome = calculateProjectedIncome();
  const taxableIncome = projectedIncome - deductions;
  const quarterlyTotals = calculateQuarterlyTotals();
  
  const federalBracketInfo = findTaxBracketInfo(
    taxableIncome,
    federalBrackets[filingStatus]
  );
  
  const stateBracketInfo = findTaxBracketInfo(
    taxableIncome,
    stateBrackets[state][filingStatus]
  );

  // Format percentage for display
  const formatRate = (rate) => `${(rate * 100).toFixed(1)}%`;
const payments = calculateQuarterlyPayments();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Tax Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filing Status
            </label>
            <select
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="CA">California</option>
            </select>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={useStandardDeduction}
                onChange={(e) => setUseStandardDeduction(e.target.checked)}
                className="rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Use Standard Deduction (${standardDeductions[filingStatus].toLocaleString()})
              </label>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="number"
                value={deductions}
                onChange={(e) => {
                  setUseStandardDeduction(false);
                  setDeductions(Number(e.target.value));
                }}
                className="w-full pl-10 p-2 border rounded-lg"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Income Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quarterly Income</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyTotals.map((amount, index) => ({
                quarter: `Q${index + 1}`,
                amount
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#3b82f6" name="Income" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

{/* Tax Bracket Information */}
<div className="grid md:grid-cols-2 gap-6">
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Federal Tax Brackets</h2>
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Current Bracket:</span>
          <span className="text-lg font-bold text-blue-600">
            {formatRate(federalBracketInfo.currentBracket.rate)}
          </span>
        </div>

        <div className="text-sm text-gray-600 mb-3">
          Income between ${federalBracketInfo.currentBracketStart?.toLocaleString()} - ${federalBracketInfo.currentBracket.limit.toLocaleString()}
        </div>
        
        {federalBracketInfo.previousBracket && (
          <div className="flex flex-col text-gray-600 mb-3">
            <div className="flex items-center">
              <TrendingDown className="mr-2" size={16} />
              <span>Previous Bracket: {formatRate(federalBracketInfo.previousBracket.rate)}</span>
            </div>
            <div className="text-sm ml-6">
              Income between ${federalBracketInfo.previousBracket.start.toLocaleString()} - ${federalBracketInfo.previousBracket.limit.toLocaleString()}
            </div>
          </div>
        )}
        
        {federalBracketInfo.nextBracket && (
          <div className="flex flex-col text-gray-600">
            <div className="flex items-center">
              <TrendingUp className="mr-2" size={16} />
              <span>Next Bracket: {formatRate(federalBracketInfo.nextBracket.rate)}</span>
            </div>
            <div className="text-sm ml-6">
              Income between ${federalBracketInfo.nextBracket.start.toLocaleString()} - ${federalBracketInfo.nextBracket.limit.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>

  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">State Tax Brackets</h2>
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Current Bracket:</span>
          <span className="text-lg font-bold text-green-600">
            {formatRate(stateBracketInfo.currentBracket.rate)}
          </span>
        </div>

        <div className="text-sm text-gray-600 mb-3">
          Income between ${stateBracketInfo.currentBracketStart?.toLocaleString()} - ${stateBracketInfo.currentBracket.limit.toLocaleString()}
        </div>
        
        {stateBracketInfo.previousBracket && (
          <div className="flex flex-col text-gray-600 mb-3">
            <div className="flex items-center">
              <TrendingDown className="mr-2" size={16} />
              <span>Previous Bracket: {formatRate(stateBracketInfo.previousBracket.rate)}</span>
            </div>
            <div className="text-sm ml-6">
              Income between ${stateBracketInfo.previousBracket.start.toLocaleString()} - ${stateBracketInfo.previousBracket.limit.toLocaleString()}
            </div>
          </div>
        )}
        
        {stateBracketInfo.nextBracket && (
          <div className="flex flex-col text-gray-600">
            <div className="flex items-center">
              <TrendingUp className="mr-2" size={16} />
              <span>Next Bracket: {formatRate(stateBracketInfo.nextBracket.rate)}</span>
            </div>
            <div className="text-sm ml-6">
              Income between ${stateBracketInfo.nextBracket.start.toLocaleString()} - ${stateBracketInfo.nextBracket.limit.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>              

{/* Quarterly Tax Payments */}
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-semibold mb-4">Quarterly Tax Payments</h2>
  <div className="grid md:grid-cols-2 gap-6">
    {/* Payment Schedule */}
    <div className="space-y-4">
      <h3 className="text-lg font-medium">2024 Payment Schedule</h3>
      <div className="space-y-3">
        {[
          { quarter: 'Q1', period: 'Jan - Mar', dueDate: 'April 15, 2024', paymentLinks: {
            federal: 'https://www.irs.gov/payments',
            state: 'https://www.ftb.ca.gov/pay/index.html'
          }},
          { quarter: 'Q2', period: 'Apr - Jun', dueDate: 'June 15, 2024', paymentLinks: {
            federal: 'https://www.irs.gov/payments',
            state: 'https://www.ftb.ca.gov/pay/index.html'
          }},
          { quarter: 'Q3', period: 'Jul - Sep', dueDate: 'September 15, 2024', paymentLinks: {
            federal: 'https://www.irs.gov/payments',
            state: 'https://www.ftb.ca.gov/pay/index.html'
          }},
          { quarter: 'Q4', period: 'Oct - Dec', dueDate: 'January 15, 2025', paymentLinks: {
            federal: 'https://www.irs.gov/payments',
            state: 'https://www.ftb.ca.gov/pay/index.html'
          }}
        ].map((quarter) => (
          <div key={quarter.quarter} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium">{quarter.quarter} ({quarter.period})</p>
              <p className="text-sm text-gray-600">Due {quarter.dueDate}</p>
            </div>
            <div className="flex gap-2">
              <a
                className="text-blue-600 hover:text-blue-800 text-sm"
                href={quarter.paymentLinks.federal}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay Federal
              </a>
              <span className="text-gray-300">|</span>
              <a
                className="text-blue-600 hover:text-blue-800 text-sm"
                href={quarter.paymentLinks.state}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay State
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Payment Breakdown */}
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Quarterly Payment Breakdown</h3>
      <div className="space-y-3">
        {Object.entries(payments.quarterly).map(([type, amount]) => (
          <div key={type} className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="capitalize">
              {type.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="font-medium">${Math.round(amount).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <div className="flex gap-2 items-start">
          <AlertCircle size={20} className="flex-shrink-0 mt-1 text-yellow-700" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Safe Harbor Payment</p>
            <p>
              These payments are calculated to meet safe harbor requirements 
              (90% of current year tax or 110% of prior year tax).
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Summary */}
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-semibold mb-4">Income Summary</h2>
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>Projected Annual Income:</span>
        <span className="font-medium">${projectedIncome.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Deductions:</span>
        <span className="font-medium">-${deductions.toLocaleString()}</span>
      </div>
      <div className="flex justify-between pt-2 border-t">
        <span>Projected Taxable Income:</span>
        <span className="font-medium">${taxableIncome.toLocaleString()}</span>
      </div>
    </div>
    
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex gap-2 items-start text-yellow-700">
        <AlertCircle size={20} className="flex-shrink-0 mt-1" />
        <span className="text-sm">
          Projections are based on your current average monthly income of ${(projectedIncome / 12).toLocaleString()} 
          multiplied by 12 months. This may vary based on your actual future income.
        </span>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default TaxCalculator;