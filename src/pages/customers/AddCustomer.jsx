import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { useApp } from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import { User, MapPin, ShieldCheck, Briefcase, UserCheck, ArrowLeft } from 'lucide-react';
import {
  filterLettersOnly,
  filterDigitsOnly,
  filterAmount,
  filterAlphanumeric,
  validateName,
  validateMobile,
  validateAadhaar,
  validatePAN,
  validateEmail,
  validatePincode,
  validateAmount,
} from '../../utils/validation';

export default function AddCustomer() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/staff';

  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      staffService
        .getAll({ status: 'active' })
        .then((res) => {
          setStaffList(res.data || []);
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    email: '',
    assignedStaff: '',
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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Today's date in YYYY-MM-DD format for DOB max limit
  const todayDate = new Date().toISOString().split('T')[0];

  // Validate a single field based on name and value
  const validateField = (name, value, currentFormData = formData) => {
    switch (name) {
      case 'fullName':
        return validateName(value, 'Full Name', true);
      case 'phone':
        return validateMobile(value, true, 'Mobile Number');
      case 'email':
        return validateEmail(value, false);
      case 'dateOfBirth':
        if (value && value > todayDate) {
          return 'Date of birth cannot be in the future';
        }
        return null;
      case 'address.city':
        return value ? validateName(value, 'City', false) : null;
      case 'address.state':
        return value ? validateName(value, 'State', false) : null;
      case 'address.pincode':
        return validatePincode(value, false);
      case 'identification.idNumber':
        if (currentFormData.identification.idType === 'Aadhaar') {
          return validateAadhaar(value, false);
        } else if (currentFormData.identification.idType === 'PAN') {
          return validatePAN(value, false);
        }
        return null;
      case 'identification.panNumber':
        return validatePAN(value, false);
      case 'employment.occupation':
        return value ? validateName(value, 'Occupation', false) : null;
      case 'employment.monthlyIncome':
        return value ? validateAmount(value, 'Monthly income', 0) : null;
      case 'referenceContact.name':
        return value ? validateName(value, 'Reference name', false) : null;
      case 'referenceContact.phone':
        return validateMobile(value, false, 'Reference Phone');
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Strict input filtering while typing
    if (name === 'fullName' || name === 'referenceContact.name') {
      // Letters and spaces only
      sanitizedValue = filterLettersOnly(value);
    } else if (name === 'phone' || name === 'referenceContact.phone') {
      // Numbers only, strictly max 10 digits
      sanitizedValue = filterDigitsOnly(value, 10);
    } else if (name === 'address.city' || name === 'address.state' || name === 'employment.occupation') {
      // Letters only for city/state/occupation
      sanitizedValue = filterLettersOnly(value);
    } else if (name === 'address.pincode') {
      // Numbers only, exactly 6 digits max
      sanitizedValue = filterDigitsOnly(value, 6);
    } else if (name === 'identification.idNumber') {
      if (formData.identification.idType === 'Aadhaar') {
        // Numbers only, max 12 digits
        sanitizedValue = filterDigitsOnly(value, 12);
      } else if (formData.identification.idType === 'PAN') {
        // Uppercase alphanumeric, max 10
        sanitizedValue = filterAlphanumeric(value, 10);
      }
    } else if (name === 'identification.panNumber') {
      // Uppercase alphanumeric, max 10
      sanitizedValue = filterAlphanumeric(value, 10);
    } else if (name === 'employment.monthlyIncome') {
      // Positive numbers only
      sanitizedValue = filterAmount(value, 0);
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: sanitizedValue,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    }

    // Live validation if the field was already touched
    if (touched[name]) {
      const err = validateField(name, sanitizedValue);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateAll = () => {
    const newErrors = {};

    newErrors['fullName'] = validateField('fullName', formData.fullName);
    newErrors['phone'] = validateField('phone', formData.phone);
    newErrors['email'] = validateField('email', formData.email);
    newErrors['dateOfBirth'] = validateField('dateOfBirth', formData.dateOfBirth);
    newErrors['address.city'] = validateField('address.city', formData.address.city);
    newErrors['address.state'] = validateField('address.state', formData.address.state);
    newErrors['address.pincode'] = validateField('address.pincode', formData.address.pincode);
    newErrors['identification.idNumber'] = validateField('identification.idNumber', formData.identification.idNumber);
    newErrors['identification.panNumber'] = validateField('identification.panNumber', formData.identification.panNumber);
    newErrors['employment.occupation'] = validateField('employment.occupation', formData.employment.occupation);
    newErrors['employment.monthlyIncome'] = validateField('employment.monthlyIncome', formData.employment.monthlyIncome);
    newErrors['referenceContact.name'] = validateField('referenceContact.name', formData.referenceContact.name);
    newErrors['referenceContact.phone'] = validateField('referenceContact.phone', formData.referenceContact.phone);

    // Filter out null errors
    const activeErrors = {};
    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key]) activeErrors[key] = newErrors[key];
    });

    return activeErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched
    const allTouched = {
      fullName: true,
      phone: true,
      email: true,
      dateOfBirth: true,
      'address.city': true,
      'address.state': true,
      'address.pincode': true,
      'identification.idNumber': true,
      'identification.panNumber': true,
      'employment.occupation': true,
      'employment.monthlyIncome': true,
      'referenceContact.name': true,
      'referenceContact.phone': true,
    };
    setTouched(allTouched);

    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorMessage = Object.values(validationErrors)[0];
      showToast(firstErrorMessage, 'error');
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
      navigate(`${prefix}/customers/${res.data._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to register customer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`${prefix}/customers`)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Add New Customer</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
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
              onBlur={handleBlur}
              placeholder="e.g. Ranjith Kumar (letters only)"
              required
              error={errors.fullName}
              helperText="Letters and spaces only"
            />

            <Input
              label="Mobile Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 9876543210 (10 digits)"
              maxLength={10}
              required
              error={errors.phone}
              helperText="Exactly 10 digits"
            />

            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              max={todayDate}
              value={formData.dateOfBirth}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.dateOfBirth}
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
                onBlur={handleBlur}
                placeholder="e.g. ranjith@example.com"
                error={errors.email}
                helperText="Valid email format"
              />
            </div>

            {isAdmin && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Assign Field Staff Executive
                </label>
                <select
                  name="assignedStaff"
                  value={formData.assignedStaff}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500 text-slate-700"
                >
                  <option value="">-- Unassigned (Assign Later) --</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Assigned staff executive will be able to manage this customer and follow up on loan repayments.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Address */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
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
                onBlur={handleBlur}
                placeholder="Door No, Street Name, Landmark"
              />
            </div>

            <Input
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Chennai"
              error={errors['address.city']}
            />

            <Input
              label="State"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tamil Nadu"
              error={errors['address.state']}
            />

            <Input
              label="Pincode"
              name="address.pincode"
              type="text"
              maxLength={6}
              value={formData.address.pincode}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="600001 (6 digits)"
              error={errors['address.pincode']}
            />
          </div>
        </div>

        {/* Section 3: Identification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
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
                onChange={(e) => {
                  handleChange(e);
                  // Clear idNumber errors when switching ID type
                  setErrors((prev) => ({ ...prev, 'identification.idNumber': null }));
                }}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Aadhaar">Aadhaar Card (12 Digits)</option>
                <option value="PAN">PAN Card</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
              </select>
            </div>

            <Input
              label={formData.identification.idType === 'Aadhaar' ? 'Aadhaar Number (12 Digits)' : 'ID Number'}
              name="identification.idNumber"
              value={formData.identification.idNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={formData.identification.idType === 'Aadhaar' ? '123456789012' : 'Enter ID number'}
              maxLength={formData.identification.idType === 'Aadhaar' ? 12 : 20}
              error={errors['identification.idNumber']}
              helperText={formData.identification.idType === 'Aadhaar' ? 'Numbers only, exactly 12 digits' : ''}
            />

            <Input
              label="PAN Number"
              name="identification.panNumber"
              value={formData.identification.panNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ABCDE1234F"
              maxLength={10}
              error={errors['identification.panNumber']}
              helperText="10-digit PAN format"
            />
          </div>
        </div>

        {/* Section 4: Employment Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
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
              onBlur={handleBlur}
              placeholder="e.g. Software Engineer / Merchant (letters only)"
              error={errors['employment.occupation']}
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
              type="text"
              name="employment.monthlyIncome"
              value={formData.employment.monthlyIncome}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 50000 (numbers only)"
              error={errors['employment.monthlyIncome']}
            />
          </div>
        </div>

        {/* Section 5: Reference Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
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
              onBlur={handleBlur}
              placeholder="e.g. Suresh Kumar (letters only)"
              error={errors['referenceContact.name']}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Relationship</label>
              <select
                name="referenceContact.relationship"
                value={formData.referenceContact.relationship}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Friend">Friend</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Spouse">Spouse</option>
                <option value="Colleague">Colleague</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input
              label="Reference Phone"
              name="referenceContact.phone"
              type="tel"
              value={formData.referenceContact.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 9876543211 (10 digits)"
              maxLength={10}
              error={errors['referenceContact.phone']}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={() => navigate('/customers')} disabled={loading} className="w-full sm:w-auto justify-center">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="w-full sm:w-auto justify-center px-6">
            Save Customer
          </Button>
        </div>
      </form>
    </div>
  );
}
