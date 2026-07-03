import React, { useState } from "react";
import { FormField, FormLabel, FormInput } from "./hb/common/Form";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import logoDefault from "../../assets/1b7ab447194c5f0fc1b269452281b2173e53bd29.png";
import bulkSacksBg from "../../assets/bulk_sacks_bg.png";

interface LoginScreenProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
  logoUrl?: string;
}

export default function LoginScreen({ onLoginSuccess, logoUrl }: LoginScreenProps) {
  const [username, setUsername] = useState("superadmin@abs.com");
  const [password, setPassword] = useState("password");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);

    // Basic Validation
    if (!username.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    // Simulate Server Authentication Delay
    setTimeout(() => {
      const validUsername1 = "superadmin@abs.com";
      const validUsername2 = "admin@abs.com";
      const validPassword = "password";

      const inputLower = username.trim().toLowerCase();

      if (
        (inputLower === validUsername1 || inputLower === validUsername2 || inputLower === "admin" || inputLower === "superadmin") &&
        password === validPassword
      ) {
        // Success
        setIsLoading(false);
        onLoginSuccess({
          name: "ABS Admin",
          email: inputLower === "admin" || inputLower === "superadmin" ? "superadmin@abs.com" : inputLower,
        });
      } else {
        // Failure
        setIsLoading(false);
        setError("Invalid username or password. Please use superadmin@abs.com / password.");
      }
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300"
    >
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-8 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <img
              src={logoUrl || logoDefault}
              alt="Hidden Brains Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-sm font-semibold tracking-wider uppercase text-neutral-450 dark:text-neutral-500">
            Inquiry Processing POC
          </p>
        </div>

        {/* Alert Error Box */}
        {error && (
          <Alert variant="destructive" className="flex items-center gap-2 py-3 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <AlertDescription className="text-xs text-red-600 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField>
            <FormLabel htmlFor="username" required>
              Username / Email
            </FormLabel>
            <FormInput
              id="username"
              type="text"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="w-full text-sm placeholder:text-neutral-400"
              autoComplete="username"
              required
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="password" required>
              Password
            </FormLabel>
            <FormInput
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full text-sm placeholder:text-neutral-400"
              autoComplete="current-password"
              required
            />
          </FormField>

          {/* Remember Me Box */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                disabled={isLoading}
              />
              <label
                htmlFor="remember"
                className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none"
              >
                Remember Me
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 mt-2 bg-primary hover:bg-primary/95 text-white font-medium text-sm transition-all flex items-center justify-center"
            disabled={isLoading || !username.trim() || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Login
              </>
            )}
          </Button>
        </form>

        {/* Redesigned Demo Credentials Section */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <div className="inline-flex flex-col items-center gap-1.5 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200/50 dark:border-neutral-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-450 dark:text-neutral-500">
              Demo Credentials
            </span>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-0.5">
              <div>
                <span className="font-semibold text-neutral-700 dark:text-neutral-350">User:</span>{' '}
                <code className="bg-neutral-200/60 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono text-[11px] select-all">
                  superadmin@abs.com
                </code>
              </div>
              <div>
                <span className="font-semibold text-neutral-700 dark:text-neutral-350">Pass:</span>{' '}
                <code className="bg-neutral-200/60 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono text-[11px] select-all">
                  password
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
