"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  Phone,
  AlertCircle,
  UserPlus,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/sheared/apiClient";
import { RegisterRequest, RegisterResponse } from "@/types/auth/register";
import { URL_REGISTER } from "@/constants/const";

export default function RegisterPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [registerData, setRegisterData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");

    if (registerData.password !== registerData.confirmPassword) {
      setErrors("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient<RegisterRequest, RegisterResponse>({
        url: URL_REGISTER,
        method: "POST",
        body: {
          username: registerData.username,
          phone: registerData.phone,
          password: registerData.password,
          confirmPassword: registerData.confirmPassword,
        } as RegisterRequest,
      });

      if (!response) {
        setErrors("Register failed. Please try again.");
        return;
      }

      if (isClient && response.phone !== undefined) {
        localStorage.setItem("phone", response.phone);
      }
      router.push("/auth/login");
    } catch (err: any) {
      setErrors(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-white" />
              Create Account
            </CardTitle>
            <p className="text-white-300 text-sm">
              Join us by creating your new account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-white font-medium flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-white" />
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. john123"
                    className="pl-10 dark-red-input placeholder-gray-500 text-white focus:ring-2 focus:ring-red-800"
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        username: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-white font-medium flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-white" />
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="7xxxxxxxx(only)"
                    className="pl-10 text-white"
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        phone: e.target.value,
                      })
                    }
                    maxLength={12}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-white font-medium flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-white" />
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 text-white"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2  text-white hover:text-red-800 transition-colors"
                  >
                    {!showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-white font-medium flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-white" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="pl-10 pr-10 text-white"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-red-800 transition-colors"
                  >
                    {!showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {errors && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-800 text-white border border-red-800 ">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-sm">{errors}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-700 text-white font-semibold py-3 transition-all duration-200 hover:bg-red-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-white hover:text-red-800 flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>

              <Separator className="bg-white" />

              <div className="text-center">
                <p className="text-sm text-white">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-white hover:text-red-800 font-medium transition-colors"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
