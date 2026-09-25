import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import { formatDate } from '../../utils/date';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import DocumentUploader from '../../components/documents/DocumentUploader';
import {
  FileText,
  Search,
  Upload,
  Filter,
  Trash2,
  ExternalLink,
  Download,
} from 'lucide-react';

export default function Documents() {
  const { showToast } = useApp();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentService.getAll({
        documentType: typeFilter !== 'all' ? typeFilter : undefined,
        search,
      });
      setDocuments(res.data || []);
    } catch (err) {
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete document "${title}"?`)) {
      try {
        await documentService.delete(id);
        showToast('Document deleted successfully', 'success');
        fetchDocuments();
      } catch (err) {
        showToast('Failed to delete document', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Documents Vault</h2>
          <p className="text-xs text-slate-500 mt-0.5">Secure metadata storage for agreements, proofs, and receipts</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} size="sm">
          <Upload className="w-4 h-4 mr-1.5" /> Upload Document
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title, file name, customer..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Document Types</option>
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
      </div>

      {/* Table */}
      {loading ? (
        <Loader text="Loading documents archive..." />
      ) : documents.length === 0 ? (
        <EmptyState
          title="No documents uploaded"
          description="Upload borrower agreements, KYC certificates, and income verification slips."
          actionLabel="Upload Document"
          onAction={() => setIsUploadOpen(true)}
          icon={FileText}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Document Title</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Loan</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Uploaded Date</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div>{doc.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{doc.fileName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {doc.customer ? doc.customer.fullName : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {doc.loan ? doc.loan.loanId : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                        {doc.documentType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-500 hover:text-emerald-600 rounded hover:bg-slate-100 inline-flex items-center gap-1 text-[11px] font-medium"
                          title="Open File"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id, doc.title)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchDocuments}
      />
    </div>
  );
}
