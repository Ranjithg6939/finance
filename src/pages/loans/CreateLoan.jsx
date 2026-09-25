import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { loanService } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoanCalculation from '../../components/loans/LoanCalculation';
import { Search, UserCheck, Calculator, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CreateLoan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useApp();

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Loan parameters
  const [formData, setFormData] = useState({
    principalAmount: '100000',
    interestRate: '2',
    interestType: 'monthly',
    calculationMethod: 'simple',
    durationValue: '12',
    durationUnit: 'months',
    paymentFrequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    firstDueDate: '',
    notes: '',
  });

  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If customer ID is provided in URL query
  useEffect(() => {
    const preselectedId = searchParams.get('customer');
    if (preselectedId) {
      customerService.getById(preselectedId).then((res) => {
        setSelectedCustomer(res.data);
      });
    }
  }, [searchParams]);

  // Live calculation trigger whenever parameters change
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.principalAmount && formData.interestRate && formData.durationValue) {
        try {
          setCalculating(true);
          const res = await loanService.calculate({
            principalAmount: parseFloat(formData.principalAmount),
            interestRate: parseFloat(formData.interestRate),
            interestType: formData.interestType,
            calculationMethod: formData.calculationMethod,
            durationValue: parseInt(formData.durationValue, 10),
            durationUnit: formData.durationUnit,
            paymentFrequency: formData.paymentFrequency,
            startDate: formData.startDate,
            firstDueDate: formData.firstDueDate,
          });
          setCalculation(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setCalculating(false);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [
    formData.principalAmount,
    formData.interestRate,
    formData.interestType,
    formData.calculationMethod,
    formData.durationValue,
    formData.durationUnit,
    formData.paymentFrequency,
    formData.startDate,
    formData.firstDueDate,
  ]);

  const handleCustomerSearch = async (query) => {
    setCustomerSearch(query);
    if (!query.trim()) {
      setCustomerResults([]);
      return;
    }
    try {
      setSearchLoading(true);
      const res = await customerService.getAll({ search: query, limit: 5 });
      setCustomerResults(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      showToast('Please select a customer for this loan', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await loanService.create({
        customerId: selectedCustomer._id,
        principalAmount: parseFloat(formData.principalAmount),
        interestRate: parseFloat(formData.interestRate),
        interestType: formData.interestType,
        calculationMethod: formData.calculationMethod,
        durationValue: parseInt(formData.durationValue, 10),
        durationUnit: formData.durationUnit,
        paymentFrequency: formData.paymentFrequency,
        startDate: formData.startDate,
        firstDueDate: formData.firstDueDate,
        notes: formData.notes,
      });

      showToast('Loan approved and disbursed successfully!', 'success');
      navigate(`/loans/${res.data._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to disburse loan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/loans/active')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Loans
        </button>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Disburse New Loan</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Step 1 & Step 2 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Customer Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1 — Customer</span>
              {selectedCustomer && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Customer Selected
                </span>
              )}
            </div>

            {selectedCustomer ? (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">{selectedCustomer.fullName}</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Customer ID: <span className="font-mono">{selectedCustomer.customerId}</span> | Phone: {selectedCustomer.phone}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Change Customer
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    placeholder="Search by borrower name, phone, or customer ID..."
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {customerResults.length > 0 && (
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden max-h-48 overflow-y-auto">
                    {customerResults.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerResults([]);
                          setCustomerSearch('');
                        }}
                        className="p-3 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{c.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{c.customerId} • {c.phone}</p>
                        </div>
                        <span className="text-xs text-emerald-600 font-semibold">Select</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Loan Details */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 2 — Loan Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Loan Amount (Principal ₹) *"
                type="number"
                name="principalAmount"
                value={formData.principalAmount}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Interest Rate (%) *"
                type="number"
                step="0.01"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleInputChange}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Interest Type *</label>
                <select
                  name="interestType"
                  value={formData.interestType}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="fixed">Fixed</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Calculation Method *</label>
                <select
                  name="calculationMethod"
                  value={formData.calculationMethod}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="simple">Simple Interest</option>
                  <option value="flat">Flat Interest</option>
                  <option value="reducing_balance">Reducing-Balance (EMI)</option>
                  <option value="fixed">Fixed Interest</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Input
                  label="Duration *"
                  type="number"
                  name="durationValue"
                  value={formData.durationValue}
                  onChange={handleInputChange}
                  required
                />
                <div className="w-32">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unit</label>
                  <select
                    name="durationUnit"
                    value={formData.durationUnit}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 py-2 px-2 text-xs bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="months">Months</option>
                    <option value="weeks">Weeks</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Frequency *</label>
                <select
                  name="paymentFrequency"
                  value={formData.paymentFrequency}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <Input
                label="Disbursement / Start Date *"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />

              <Input
                label="First Due Date (Optional)"
                type="date"
                name="firstDueDate"
                value={formData.firstDueDate}
                onChange={handleInputChange}
                placeholder="Auto-calculated if blank"
              />

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
                <textarea
                  rows="2"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Guarantor details, purpose of loan, asset collateral..."
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => navigate('/loans/active')}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} disabled={!selectedCustomer}>
                Disburse & Approve Loan
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Calculation Preview Card */}
        <div className="space-y-4">
          <LoanCalculation calculation={calculation} loading={calculating} />
        </div>
      </div>
    </div>
  );
}
