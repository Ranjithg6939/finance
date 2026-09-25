import React from 'react';
import { formatCurrency } from '../../utils/currency';
import { Calculator, CheckCircle } from 'lucide-react';

export default function LoanCalculation({ calculation, loading = false }) {
  if (!calculation) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-400 text-xs">
        <Calculator className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        Fill in loan amount, interest rate, and duration to see real-time calculation and amortization schedule preview.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 mb-5">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-sm tracking-wide text-white">Live Loan Preview</h3>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-medium capitalize">
          {calculation.calculationMethod?.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-slate-400">Loan Amount</p>
          <p className="text-lg font-bold text-white mt-0.5">
            {formatCurrency(calculation.principalAmount)}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Interest Rate</p>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">
            {calculation.interestRate}% <span className="text-xs font-normal text-slate-300 capitalize">{calculation.interestType}</span>
          </p>
        </div>

        <div>
          <p className="text-slate-400">Duration</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5 capitalize">
            {calculation.duration?.value} {calculation.duration?.unit}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Payment Frequency</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5 capitalize">
            {calculation.paymentFrequency}
          </p>
        </div>

        <div className="col-span-2 pt-3 border-t border-slate-700/80">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300">Estimated Total Interest:</span>
            <span className="font-semibold text-amber-400">
              {formatCurrency(calculation.totalInterest)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm font-bold text-white mb-1">
            <span>Total Payable:</span>
            <span className="text-base text-emerald-400">
              {formatCurrency(calculation.totalPayable)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Initial Outstanding:</span>
            <span className="font-semibold text-slate-300">
              {formatCurrency(calculation.outstandingAmount || calculation.totalPayable)}
            </span>
          </div>

          {calculation.installmentAmount > 0 && (
            <div className="mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[11px] text-slate-400">Installment Amount: </span>
              <span className="text-xs font-bold text-emerald-300">
                {formatCurrency(calculation.installmentAmount)} / {calculation.paymentFrequency}
              </span>
              <span className="text-[11px] text-slate-400"> ({calculation.numberOfInstallments} payments)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
