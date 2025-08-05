import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    jobTitle: '',
    companyName: '',
    experienceLevel: '',
    teamSize: '',
    primaryLanguage: '',
    isStudent: false,
    university: '',
    studyField: '',
    graduationYear: '',
    selectedPlan: 'free',
    agreeToTerms: false,
    subscribeNewsletter: true,
    allowAnalytics: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'username' && value.length > 2) {
      checkUsernameAvailability(value);
    }
  };

  const checkUsernameAvailability = async (username) => {
    setUsernameChecking(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setUsernameAvailable(!username.toLowerCase().startsWith('admin'));
    setUsernameChecking(false);
  };

  const getPasswordRequirements = (password) => {
    return {
      minLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  };

  const getPasswordStrength = (password) => {
    const requirements = getPasswordRequirements(password);
    const score = Object.values(requirements).filter(Boolean).length;
    
    if (score === 0) return { strength: 0, label: '', color: '' };
    if (score <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { strength: 3, label: 'Good', color: 'bg-blue-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.username) newErrors.username = 'Username is required';
      else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
      else if (usernameAvailable === false) newErrors.username = 'Username is not available';
    }
    
    if (step === 2) {
      const requirements = getPasswordRequirements(formData.password);
      if (!formData.password) newErrors.password = 'Password is required';
      else if (!Object.values(requirements).every(Boolean)) newErrors.password = 'Password must meet all requirements';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (step === 3) {
      if (formData.isStudent) {
        if (!formData.university.trim()) newErrors.university = 'University is required';
        if (!formData.studyField.trim()) newErrors.studyField = 'Field of study is required';
        if (!formData.graduationYear) newErrors.graduationYear = 'Graduation year is required';
      } else {
        if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      }
      if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
      if (!formData.teamSize) newErrors.teamSize = 'Team size is required';
      if (!formData.primaryLanguage) newErrors.primaryLanguage = 'Primary language is required';
    }
    
    if (step === 4) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Sign up successful:', formData);
      window.location.href = '/welcome';
    } catch (error) {
      console.error('Sign up failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    { name: "Free", price: "$0", period: "forever", description: "Perfect for students and hobby developers", features: ["Basic AI code completion", "Up to 3 projects", "Community support", "Basic debugging tools"], value: "free" },
    { name: "Pro", price: "$19", period: "per month", description: "Best for individual developers and freelancers", features: ["Advanced AI pair programming", "Unlimited projects", "Priority support", "Advanced debugging & analytics", "Cloud collaboration", "Multi-language support"], value: "pro", popular: true },
    { name: "Team", price: "$49", period: "per month", description: "Perfect for development teams and companies", features: ["Everything in Pro", "Team collaboration tools", "Advanced analytics dashboard", "Custom integrations", "Dedicated support", "Enterprise security"], value: "team" }
  ];

  const programmingLanguages = ['JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB', 'Other'];
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({length: 10}, (_, i) => currentYear + i);
  const passwordRequirements = getPasswordRequirements(formData.password);
  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <Link to="/" className="flex justify-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-white font-pacifico">
            logo
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {step < currentStep ? (
                    <i className="ri-check-line"></i>
                  ) : (
                    step
                  )}
                </div>
                {index < 3 && (
                  <div className={`flex-grow h-1 mx-4 ${
                    step < currentStep ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                <p className="text-gray-600 dark:text-gray-300">Let's start with your basic details</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First name</label>
                  <input
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border rounded-lg 
                        text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                        ${errors.firstName ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="John"
                    />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last name</label>
                  <input
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border rounded-lg 
                        text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                        ${errors.lastName ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="Doe"
                    />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border rounded-lg 
                    text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <div className="relative">
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg 
                      text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 
                      ${
                        errors.username ? 'border-red-300' : 
                        usernameAvailable === false ? 'border-red-300' :
                        usernameAvailable === true ? 'border-green-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="johndoe123"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {usernameChecking ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : usernameAvailable === true ? (
                      <i className="ri-check-line text-green-500"></i>
                    ) : usernameAvailable === false ? (
                      <i className="ri-close-line text-red-500"></i>
                    ) : null}
                  </div>
                </div>
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                {usernameAvailable === false && !errors.username && (
                  <p className="mt-1 text-sm text-red-600">Username is not available</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or sign up with</span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="w-full flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <i className="ri-github-fill text-gray-900 dark:text-white text-lg mr-2"></i>
                    GitHub
                  </button>
                  <button className="w-full flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <i className="ri-google-fill text-red-500 text-lg mr-2"></i>
                    Google
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Password & Security */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Password & Security</h3>
                <p className="text-gray-600 dark:text-gray-300">Create a strong password to secure your account</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg 
                      text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 
                      ${errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400`}></i>
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength <= 1 ? 'text-red-600' :
                        passwordStrength.strength <= 2 ? 'text-yellow-600' :
                        passwordStrength.strength <= 3 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className={`flex items-center space-x-2 ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        <i className={`${passwordRequirements.minLength ? 'ri-check-line' : 'ri-close-line'}`}></i>
                        <span>At least 6 characters</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        <i className={`${passwordRequirements.hasUppercase ? 'ri-check-line' : 'ri-close-line'}`}></i>
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        <i className={`${passwordRequirements.hasLowercase ? 'ri-check-line' : 'ri-close-line'}`}></i>
                        <span>One lowercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        <i className={`${passwordRequirements.hasNumber ? 'ri-check-line' : 'ri-close-line'}`}></i>
                        <span>One number</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordRequirements.hasSpecial ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        <i className={`${passwordRequirements.hasSpecial ? 'ri-check-line' : 'ri-close-line'}`}></i>
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg 
                      text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 
                      ${
                        errors.confirmPassword
                          ? 'border-red-300'
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-300'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <i className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400`}></i>
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-sm text-green-600 flex items-center">
                    <i className="ri-check-line mr-1"></i>
                    Passwords match
                  </p>
                )}
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Professional Profile */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Professional Profile</h3>
                <p className="text-gray-600 dark:text-gray-300">Tell us about your development background</p>
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <input
                  id="isStudent"
                  name="isStudent"
                  type="checkbox"
                  checked={formData.isStudent}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <label htmlFor="isStudent" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  I'm a student
                </label>
              </div>

              {formData.isStudent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">University</label>
                    <input
                      name="university"
                      type="text"
                      value={formData.university}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.university ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="University of Technology"
                    />
                    {errors.university && <p className="mt-1 text-sm text-red-600">{errors.university}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field of Study</label>
                    <input
                      name="studyField"
                      type="text"
                      value={formData.studyField}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.studyField ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Computer Science"
                    />
                    {errors.studyField && <p className="mt-1 text-sm text-red-600">{errors.studyField}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Graduation Year</label>
                    <select
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.graduationYear ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select year</option>
                      {graduationYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {errors.graduationYear && <p className="mt-1 text-sm text-red-600">{errors.graduationYear}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      name="jobTitle"
                      type="text"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.jobTitle ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Senior Software Developer"
                    />
                    {errors.jobTitle && <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.companyName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Tech Corp Inc."
                    />
                    {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.experienceLevel ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (2-4 years)</option>
                  <option value="senior">Senior (5-9 years)</option>
                  <option value="expert">Expert (10+ years)</option>
                </select>
                {errors.experienceLevel && <p className="mt-1 text-sm text-red-600">{errors.experienceLevel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                <select
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.teamSize ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select team size</option>
                  <option value="solo">Solo Developer</option>
                  <option value="small">Small Team (2-10)</option>
                  <option value="medium">Medium Team (11-50)</option>
                  <option value="large">Large Team (50+)</option>
                </select>
                {errors.teamSize && <p className="mt-1 text-sm text-red-600">{errors.teamSize}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Programming Language</label>
                <select
                  name="primaryLanguage"
                  value={formData.primaryLanguage}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.primaryLanguage ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select primary language</option>
                  {programmingLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                {errors.primaryLanguage && <p className="mt-1 text-sm text-red-600">{errors.primaryLanguage}</p>}
              </div>
            </div>
          )}

          {/* Step 4: Plan Selection & Terms */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Choose Your Plan</h3>
                <p className="text-gray-600">Select the plan that best fits your needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.value}
                    className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      formData.selectedPlan === plan.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, selectedPlan: plan.value }))}
                    style={{
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h4>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-500 ml-1">/{plan.period}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      
                      <ul className="space-y-2 text-sm text-left">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <i className="ri-check-line text-green-500 mt-0.5 flex-shrink-0"></i>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {formData.selectedPlan === plan.value && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <i className="ri-check-line text-white text-sm"></i>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-start space-x-3">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 ${
                      errors.agreeToTerms ? 'border-red-300' : ''
                    }`}
                  />
                  <div>
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                        Privacy Policy
                      </Link>
                      {' '}<span className="text-red-500">*</span>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <i className="ri-error-warning-line mr-1"></i>
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    id="subscribeNewsletter"
                    name="subscribeNewsletter"
                    type="checkbox"
                    checked={formData.subscribeNewsletter}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                  />
                  <label htmlFor="subscribeNewsletter" className="text-sm text-gray-700">
                    Send me product updates, developer tips, and news about AI coding tools
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    id="allowAnalytics"
                    name="allowAnalytics"
                    type="checkbox"
                    checked={formData.allowAnalytics}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                  />
                  <label htmlFor="allowAnalytics" className="text-sm text-gray-700">
                    Allow usage analytics to help improve the product (recommended)
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">🎉 You're almost ready to start coding with AI!</h4>
                  <div className="flex justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <i className="ri-check-line text-green-500"></i>
                      <span>Instant access</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <i className="ri-check-line text-green-500"></i>
                      <span>No setup required</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <i className="ri-check-line text-green-500"></i>
                      <span>14-day free trial</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line mr-2"></i>
                    Create Account
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}