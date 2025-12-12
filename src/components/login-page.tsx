import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { IconShield, IconStethoscope } from "@tabler/icons-react"
import { AuthAPI, AuthStorage } from "@/api/auth"
import { getLoginErrorMessage } from "@/lib/errors"

interface LoginPageProps {
  onLogin: (userType: 'admin' | 'doctor', userData?: any) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {

  const [userType, setUserType] = useState<'admin' | 'doctor'>('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [showMfa, setShowMfa] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const loginData = {
        email: email.trim(),
        password,
        ...(mfaCode && { mfa_code: mfaCode })
      }

      let response
      if (userType === 'admin') {
        response = await AuthAPI.adminLogin(loginData)

        // Handle MFA requirement for admin login
        if (response.mfa_required && !mfaCode) {
          setShowMfa(true)
          setIsLoading(false)
          setError('MFA code required. Please enter your 6-digit MFA code.')
          return
        }

        if (response.access_token) {
          // console.log('💾 Storing admin auth data...')
          AuthStorage.setToken(response.access_token)
          AuthStorage.setUserType('admin')
          AuthStorage.setUserData(response.admin)
          // console.log('✅ Admin login successful, token stored')
          onLogin('admin', response.admin)
        } else {
          setError('Login successful but no access token received. Please try again.')
        }
      } else {
        response = await AuthAPI.doctorLogin(loginData)
        // console.log('💾 Storing doctor auth data...')
        AuthStorage.setToken(response.access_token)
        AuthStorage.setUserType('doctor')
        AuthStorage.setUserData(response.doctor)
        // console.log('✅ Doctor login successful, token stored')
        onLogin('doctor', response.doctor)
      }
    } catch (err) {
      const errorMessage = getLoginErrorMessage(err)
      setError(errorMessage)
      setShowMfa(false) // Reset MFA on error
      setMfaCode('')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        {/* Abstract Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-1/4 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/4 left-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <img src="/logo.svg" alt="EzMedTech Logo" className="w-6 h-6 object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">EZMedTech</h1>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Effortlessly Manage Your Medical Practice
            </h2>
            <p className="text-xl text-white/80 leading-relaxed">
              Streamline patient information, appointments, and clinical workflows with our modern healthcare platform.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                📊 Smart Analytics
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                📅 Easy Scheduling
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                🔒 HIPAA Compliant
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-white/60">
            <span>© {new Date().getFullYear()} EZMedTech. All rights reserved.</span>
            <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-50 min-h-screen">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <img src="/logo.svg" alt="EzMedTech Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">EZMedtech</h1>
            <p className="text-slate-500 mt-1">Medical Dashboard</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 mt-1">Sign in to your account</p>
            </div>

            {/* User Type Selection */}
            <Tabs
              value={userType}
              onValueChange={(value) => setUserType(value as 'admin' | 'doctor')}
              className="mb-6"
            >
              <TabsList className="w-full bg-slate-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="admin" 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all"
                >
                  <IconShield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger 
                  value="doctor" 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all"
                >
                  <IconStethoscope className="w-4 h-4" />
                  Doctor
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 px-4 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 px-4 pr-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* MFA Code Field (shown when required) */}
              {showMfa && (
                <div className="space-y-2">
                  <Label htmlFor="mfaCode" className="text-sm font-medium text-slate-700">
                    MFA Code
                  </Label>
                  <Input
                    id="mfaCode"
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="h-12 px-4 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-center text-lg tracking-widest"
                    maxLength={6}
                    required={showMfa}
                  />
                </div>
              )}

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <span className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">
                  Forgot password?
                </span>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Sign in</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Bottom text for mobile */}
          <p className="text-center text-sm text-slate-500 mt-6 lg:hidden">
            © {new Date().getFullYear()} EZMedTech. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
