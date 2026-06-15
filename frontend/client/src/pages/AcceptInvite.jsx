import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Building2, ShieldCheck, User, Phone, Lock, Heart, Users as UsersIcon } from 'lucide-react';
import apiClient from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import Card from '../components/Card';
import { validatePasswordStrength } from '../lib/passwordResetUtils';

export default function AcceptInvite({ token }) {
  const [, setLocation] = useLocation();
  const { acceptInvite } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phone: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    adultsCount: '1',
    childrenCount: '0',
    petsDescription: '',
    agreedToTerms: false,
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!token) {
        setErrorMsg('Invitation token is missing.');
        setLoading(false);
        return;
      }
      try {
        const response = await apiClient.validateInviteToken(token);
        if (response.success) {
          setInviteData(response.tenant);
        } else {
          setErrorMsg(response.message || 'This invitation is invalid or has expired.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to validate invitation link.');
      } finally {
        setLoading(false);
      }
    };

    fetchInviteDetails();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const strengthValidation = validatePasswordStrength(formData.password);
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!strengthValidation.valid) {
      errors.password = strengthValidation.errors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the terms to proceed';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the errors in the form.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        password: formData.password,
        phone: formData.phone,
        emergencyContact: {
          name: formData.emergencyName || '',
          phone: formData.emergencyPhone || '',
          relationship: formData.emergencyRelationship || '',
        },
        occupants: {
          adults: parseInt(formData.adultsCount) || 1,
          children: parseInt(formData.childrenCount) || 0,
          pets: formData.petsDescription || '',
        },
      };

      const response = await acceptInvite(token, payload);
      if (response && response.success) {
        toast.success('Onboarding complete! Welcome to EstateLedger.');
        setLocation('/');
      } else {
        toast.error(response?.message || 'Failed to complete onboarding.');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred during onboarding.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4 animate-spin"></div>
          <p className="text-muted-foreground text-sm font-medium">Validating invitation link...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card variant="elevated" className="max-w-md w-full p-8 text-center border border-border">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4 border border-destructive/20">
            <Building2 className="text-destructive animate-pulse" size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
            Invitation Expired or Invalid
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {errorMsg || 'We couldn\'t verify your invitation token. It may have expired or been deleted.'}
          </p>
          <button
            onClick={() => setLocation('/')}
            className="w-full py-2.5 px-4 text-sm bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity"
          >
            Go to Portal Landing
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      <SEO 
        title="Complete Your Onboarding | EstateLedger"
        description="Verify your residency details, configure your account credentials, and complete onboarding for your new rental unit."
      />
      
      {/* Visual Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#003441_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-2xl w-full space-y-8 relative z-10 animate-fade-in-up">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center shadow-sm border border-primary/20">
              <Building2 size={20} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground animate-pulse">
              EstateLedger
            </span>
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
            Complete Your Resident Profile
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hi, <span className="font-semibold text-foreground">{inviteData.fullName}</span>! You're one step away from joining your new tenancy ledger.
          </p>
        </div>

        {/* Lease Summary Card */}
        <Card variant="elevated" className="p-6 border border-border">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" /> Lease Terms Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground block uppercase tracking-wider text-[10px] font-semibold">Estate</span>
              <strong className="text-sm text-foreground">{inviteData.propertyName}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block uppercase tracking-wider text-[10px] font-semibold">Unit</span>
              <strong className="text-sm text-foreground">{inviteData.unitNumber || 'N/A'}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block uppercase tracking-wider text-[10px] font-semibold">Monthly rent</span>
              <strong className="text-sm text-primary">KSh {inviteData.monthlyRent.toLocaleString()}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block uppercase tracking-wider text-[10px] font-semibold">Security Deposit</span>
              <strong className="text-sm text-foreground">KSh {inviteData.securityDeposit.toLocaleString()}</strong>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block uppercase tracking-wider text-[10px] font-semibold">Lease Commences</span>
              <span className="text-foreground font-medium">{formatDate(inviteData.leaseStartDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block uppercase tracking-wider text-[10px] font-semibold">Lease Expires</span>
              <span className="text-foreground font-medium">{formatDate(inviteData.leaseEndDate)}</span>
            </div>
          </div>
        </Card>

        {/* Onboarding Form */}
        <Card variant="elevated" className="p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Group 1: Account Credentials */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-widest uppercase text-muted-foreground border-b border-border/50 pb-2 flex items-center gap-1.5">
                <User size={13} /> Account Credentials
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    value={inviteData.email}
                    disabled
                    className="w-full px-3 py-2 text-sm bg-muted rounded-md border border-border text-muted-foreground outline-none cursor-not-allowed opacity-80"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. +254 700 000000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  />
                  {formErrors.password ? (
                    <p className="text-xs text-destructive mt-1 leading-normal">{formErrors.password}</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Must be 8+ characters, with uppercase, lowercase, number & symbol.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Group 2: Emergency Contact */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold tracking-widest uppercase text-muted-foreground border-b border-border/50 pb-2 flex items-center gap-1.5">
                <Heart size={13} /> Emergency Contact
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="emergencyName"
                    placeholder="e.g. Mary Smith"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    placeholder="e.g. +254 711 111111"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergencyRelationship"
                    placeholder="e.g. Spouse, Parent"
                    value={formData.emergencyRelationship}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Occupants Info */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold tracking-widest uppercase text-muted-foreground border-b border-border/50 pb-2 flex items-center gap-1.5">
                <UsersIcon size={13} /> Roommates & Occupants
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Adults Count
                  </label>
                  <input
                    type="number"
                    name="adultsCount"
                    min="1"
                    value={formData.adultsCount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-card rounded-md border border-border outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Children Count
                  </label>
                  <input
                    type="number"
                    name="childrenCount"
                    min="0"
                    value={formData.childrenCount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-card rounded-md border border-border outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pets Info
                  </label>
                  <input
                    type="text"
                    name="petsDescription"
                    placeholder="e.g. 1 small cat"
                    value={formData.petsDescription}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Accept lease agreement */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <div className="flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  id="agreedToTerms"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 rounded border-border text-primary bg-card focus:ring-primary focus:ring-offset-background"
                />
                <label htmlFor="agreedToTerms" className="text-xs font-medium text-foreground leading-normal select-none cursor-pointer">
                  I accept the tenancy lease agreement of <span className="font-semibold">{inviteData.propertyName} Unit {inviteData.unitNumber || 'N/A'}</span>. I certify that all details provided above are true, accurate and complete.
                </label>
              </div>
              {formErrors.agreedToTerms && (
                <p className="text-xs text-destructive">{formErrors.agreedToTerms}</p>
              )}
            </div>

            {/* Submit Onboarding Button */}
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full mt-4 py-2.5 px-4 text-sm bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitLoading ? 'Registering Account...' : 'Complete Onboarding & Log In'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
