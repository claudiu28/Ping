"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  LogIn,
  AlertCircle,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/sheared/apiClient";
import { URL_LOGIN } from "@/constants/const";
import { LoginRequest, LoginResponse } from "@/types/auth/login";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    verifyPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");

    if (loginData.password !== loginData.verifyPassword) {
      setErrors("Passwords do not match");
      setIsLoading(false);
      return;
    }
    try {
      const response = await apiClient<LoginRequest, LoginResponse>({
        url: URL_LOGIN,
        method: "POST",
        body: {
          username: loginData.username,
          password: loginData.password,
          verifyPassword: loginData.verifyPassword,
        } as LoginRequest,
      });

      if (!response) {
        setErrors("Login failed. Please try again.");
        return;
      }
      if (response.token) {
        localStorage.setItem("token", response.token);
        router.push("/social");
      } else {
        setErrors(response.message);
      }
    } catch (err: any) {
      setErrors(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-2 rounded-full">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-white" />
              Secure Login
            </CardTitle>
            <p className="text-white text-sm">
              Enter your credentials to access your account
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
                    placeholder="e.g. john_doe_123"
                    className="pl-10 text-white"
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
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
                    placeholder="Your password"
                    className="pl-10 pr-10  text-white"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-red-700 transition-colors"
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
                  htmlFor="verifyPassword"
                  className="text-white font-medium flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-white" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                  <Input
                    id="verifyPassword"
                    type={verifyPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="pl-10 pr-10 d text-white"
                    value={loginData.verifyPassword}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        verifyPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVerifyPassword(!verifyPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-red-800 transition-colors"
                  >
                    {!verifyPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {errors && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950 border border-red-800 text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0" />
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
                    Logging in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-white hover:text-red-700 flex items-center justify-center gap-2 transition-colors"
                >
                  Back to Home
                </Link>
              </div>

              <div className="text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-white hover:text-red-700 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              <Separator className="bg-white" />

              <div className="text-center">
                <p className="text-sm text-white">
                  {"Don't have an account? "}
                  <Link
                    href="/auth/register"
                    className="text-white hover:text-red-700 font-medium transition-colors"
                  >
                    Register here
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
