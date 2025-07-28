"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Phone,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/sheared/apiClient";
import { URL_FORGOT_PASSWORD } from "@/constants/const";
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "@/types/auth/forgotPassword";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient<
        ForgotPasswordRequest,
        ForgotPasswordResponse
      >({
        url: URL_FORGOT_PASSWORD,
        method: "POST",
        body: {
          phone: phone,
        } as ForgotPasswordRequest,
      });
      setIsCodeSent(true);
      setTimeout(() => {
        router.push(`/auth/verify-code?phone=${encodeURIComponent(phone)}`);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCodeSent) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border border-red-800 text-center">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Code sent!</h2>
              <p className="text-gray-300 mb-6">
                We sent a 6-digit verification code to <strong>{phone}</strong>
              </p>
              <p className="text-sm text-gray-400">
                You will be automatically redirected to the verification page...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border border-red-800 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-2 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Forgot Password
            </CardTitle>
            <p className="text-white text-sm">
              Enter your phone number to receive a verification code
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="7xxxxxxxx"
                    className="pl-10 bg-black border-red-800 text-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-red-800 text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-white">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-white hover:text-red-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
