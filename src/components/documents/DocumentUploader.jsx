import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { documentService } from '../../services/documentService';
import { customerService } from '../../services/customerService';
import { loanService } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

export default function DocumentUploader({
  isOpen,
  onClose,
  preselectedCustomerId,
  preselectedLoanId,
  onUploadSuccess,
}) {
  const { showToast } = useApp();
  const [customerId, setCustomerId] = useState(preselectedCustomerId || '');
  const [loanId, setLoanId] = useState(preselectedLoanId || '');
  const [documentType, setDocumentType] = useState('id_proof');
  const [documentName, setDocumentName] = useState('');
  const [file, setFile] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      customerService.getAll().then((res) => setCustomers(res.data || []));
      if (preselectedCustomerId) {
        setCustomerId(preselectedCustomerId);
      }
      if (preselectedLoanId) {
        setLoanId(preselectedLoanId);
      }
    }
  }, [isOpen, preselectedCustomerId, preselectedLoanId]);

  useEffect(() => {
    if (customerId) {
      loanService.getByCustomer(customerId).then((res) => setLoans(res.data || []));
    } else {
      setLoans([]);
    }
  }, [customerId]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!documentName) {
        setDocumentName(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!documentName) {
        setDocumentName(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (customerId) formData.append('customerId', customerId);
      if (loanId) formData.append('loanId', loanId);
      formData.append('documentType', documentType);
      formData.append('documentName', documentName);

      const res = await documentService.upload(formData);
      showToast('Document uploaded successfully', 'success');
      if (onUploadSuccess) onUploadSuccess(res.data);
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Document">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Customer
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName} ({c.customerId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Loan (Optional)
            </label>
            <select
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- None / General Document --</option>
              {loans.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.loanId} (₹{l.principalAmount})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Document Type *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="id_proof">ID Proof</option>
              <option value="address_proof">Address Proof</option>
              <option value="income_proof">Income Proof</option>
              <option value="loan_agreement">Loan Agreement</option>
              <option value="signed_agreement">Signed Agreement</option>
              <option value="payment_receipt">Payment Receipt</option>
              <option value="bank_document">Bank Document</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Input
            label="Document Name *"
            name="documentName"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="e.g. Aadhaar Card Front"
            required
          />
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50'
              : file
              ? 'border-emerald-300 bg-emerald-50/20'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100/60'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {file ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="text-xs font-bold text-slate-800">{file.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB — Click to choose another
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Drag & Drop File Here or <span className="text-emerald-600 underline">Browse</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PDF, PNG, JPG, DOC up to 10MB
                </p>
              </div>
            )}
          </label>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!file}>
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
