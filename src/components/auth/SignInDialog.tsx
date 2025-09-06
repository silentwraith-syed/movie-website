// src/components/auth/SignInDialog.tsx
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignInDialog({
  open,
  onOpenChange,
}: SignInDialogProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone:"",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const validateForm = () => {
    let errors: Record<string, string> = {};

    if (isSignUp && !formData.name.trim()) errors.name = "Name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Invalid email format.";
    if (!formData.password.trim()) errors.password = "Password is required.";
    if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters.";

    if (isSignUp) {
      if (!formData.confirmPassword.trim())
        errors.confirmPassword = "Confirm Password is required.";
      if (formData.password !== formData.confirmPassword)
        errors.confirmPassword = "Passwords do not match.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const endpoint = isSignUp ? "register" : "login";
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: isSignUp ? formData.name : undefined,
            email: formData.email,
            password: formData.password,
            phone:formData.phone,
          }),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();

      // ✅ If signing up, log in the user automatically
      if (isSignUp) {
        await handleAutoLogin();
      } else {
        login({
          token: data.token,
          name: data.user.name,
          email: data.user.email,
        });

        toast({
          title: "Success",
          description: "Logged in successfully!",
          variant: "default",
        });

        resetForm(); // Reset form on successful login
        onOpenChange(false); // Close dialog
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });

      if (isSignUp) {
        setIsSignUp(false); // If signup fails, switch to login form
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      login({
        token: data.token,
        name: data.user.name,
        email: data.user.email,
      });

      toast({
        title: "Success",
        description: "Account created & logged in successfully!",
        variant: "default",
      });

      resetForm(); // Reset form after success
      onOpenChange(false); // Close dialog
    } catch (error: any) {
      toast({
        title: "Account created",
        description: "Please log in.",
        variant: "default",
      });

      setIsSignUp(false); // Switch to login form
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone:"",
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isSignUp ? "Sign Up" : "Sign In"} to Junglee.Moviez
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Google Sign-In Button */}
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-4 h-4"
              />
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative flex items-center my-2">
            <span className="flex-grow border-t border-gray-300"></span>
            <span className="px-3 text-sm text-gray-500">OR</span>
            <span className="flex-grow border-t border-gray-300"></span>
          </div>

          {/* Name Input (For Sign Up) */}
          {isSignUp && (
            <Input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          )}

          {/* Email Input */}
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          {/* Password Input */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-600"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm Password (For Sign Up) */}
          {isSignUp && (
            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          )}

          {/* Phone No */}
          {isSignUp && (
            <Input
              type="number"
              placeholder="Phone No."
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          )}

          {/* Submit Button */}
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Toggle Between Sign In & Sign Up */}
          <p className="text-center text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="text-blue-500 underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}