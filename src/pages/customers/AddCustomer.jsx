import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { useApp } from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { User, MapPin, ShieldCheck, Briefcase, UserCheck, ArrowLeft } from 'lucide-react';

export default function AddCustomer() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: {
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
    },
    identification: {
      idType: 'Aadhaar',
      idNumber: '',
      panNumber: '',
    },
    employment: {
      occupation: '',
      employmentType: 'Salaried',
      companyName: '',
      monthlyIncome: '',
    },
    referenceContact: {
      name: '',
      relationship: 'Friend',
      phone: '',
    },
    status: 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      showToast('Full name and mobile number are required', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        employment: {
          ...formData.employment,
          monthlyIncome: parseFloat(formData.employment.monthlyIncome) || 0,
        },
      };

      const res = await customerService.create(payload);
      showToast('Customer created successfully', 'success');
      navigate(`/customers/${res.data._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register customer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Add New Customer</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Ranjith Kumar"
              required
            />

            <Input
              label="Mobile Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              required
            />

            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ranjith@example.com"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Residential Address</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Address Line"
                name="address.addressLine"
                value={formData.address.addressLine}
                onChange={handleChange}
                placeholder="Door No, Street Name, Landmark"
              />
            </div>

            <Input
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="Chennai"
            />

            <Input
              label="State"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="Tamil Nadu"
            />

            <Input
              label="Pincode"
              name="address.pincode"
              value={formData.address.pincode}
              onChange={handleChange}
              placeholder="600001"
            />
          </div>
        </div>

        {/* Section 3: Identification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Identification & KYC</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">ID Type</label>
              <select
                name="identification.idType"
                value={formData.identification.idType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
              </select>
            </div>

            <Input
              label="ID Number"
              name="identification.idNumber"
              value={formData.identification.idNumber}
              onChange={handleChange}
              placeholder="XXXX-XXXX-XXXX"
            />

            <Input
              label="PAN Number"
              name="identification.panNumber"
              value={formData.identification.panNumber}
              onChange={handleChange}
              placeholder="ABCDE1234F"
            />
          </div>
        </div>

        {/* Section 4: Employment Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Employment & Financials</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Occupation"
              name="employment.occupation"
              value={formData.employment.occupation}
              onChange={handleChange}
              placeholder="e.g. Software Engineer / Merchant"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employment Type</label>
              <select
                name="employment.employmentType"
                value={formData.employment.employmentType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Daily Wage / Informal">Daily Wage / Informal</option>
              </select>
            </div>

            <Input
              label="Company / Business Name"
              name="employment.companyName"
              value={formData.employment.companyName}
              onChange={handleChange}
              placeholder="Company or shop name"
            />

            <Input
              label="Monthly Income (₹)"
              type="number"
              name="employment.monthlyIncome"
              value={formData.employment.monthlyIncome}
              onChange={handleChange}
              placeholder="50000"
            />
          </div>
        </div>

        {/* Section 5: Reference Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Reference Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Reference Name"
              name="referenceContact.name"
              value={formData.referenceContact.name}
              onChange={handleChange}
              placeholder="Suresh Kumar"
            />

            <Input
              label="Relationship"
              name="referenceContact.relationship"
              value={formData.referenceContact.relationship}
              onChange={handleChange}
              placeholder="Brother / Friend"
            />

            <Input
              label="Reference Phone"
              name="referenceContact.phone"
              value={formData.referenceContact.phone}
              onChange={handleChange}
              placeholder="9876543211"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => navigate('/customers')} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="px-6">
            Save Customer
          </Button>
        </div>
      </form>
    </div>
  );
}
