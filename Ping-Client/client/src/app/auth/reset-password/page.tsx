"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  CheckCircle,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getResetPassword } from "@/constants/const";
import { apiClient } from "@/sheared/apiClient";
import {
  ResetPasswordRequest,
  ResetPasswordRespond,
} from "@/types/auth/resetPassword";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    if (newPassword.length < 6) {
      setErrors("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      if (phone === undefined || phone === null || phone.trim() === "") {
        setErrors("Phone number is required");
        setIsLoading(false);
        return;
      }
      const response = await apiClient<
        ResetPasswordRequest,
        ResetPasswordRespond
      >({
        url: getResetPassword(phone),
        method: "PATCH",
        body: {
          newPassword: newPassword,
          verifyPassword: confirmPassword,
        } as ResetPasswordRequest,
      });

      if (response.username === undefined || response.username === null) {
        setErrors(response.message);
        setIsLoading(false);
        return;
      }
      setIsPasswordReset(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (error) {
      setErrors("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPasswordReset) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border border-red-800 text-center">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Password reset successfully!
              </h2>
              <p className="text-gray-300 mb-6">
                You can now log in with your new password.
              </p>
              <p className="text-sm text-gray-400">Redirecting to login...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border border-red-800 shadow-xl">
          <CardHeader className="text-center space-y-1">
            <Link
              href="/auth/verify-code"
              className="inline-flex items-center text-red-700 hover:text-red-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to verification
            </Link>
            <div className="flex justify-center mb-2">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">New Password</CardTitle>
            <p className="text-sm text-gray-400">
              Set a new password for:
              <br />
              <span className="text-white font-medium">{phone}</span>
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    className="pl-10 pr-10 border-red-800 text-white"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-red-800"
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
                  className="text-white font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10 bg-black border-red-800 text-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-red-800"
                  >
                    {!showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="border border-red-800 rounded-lg p-4 text-sm text-white">
                <p className="font-medium mb-1">Password tips:</p>
                <ul className="list-disc ml-5 text-xs space-y-1">
                  <li>At least 6 characters</li>
                  <li>Use a mix of letters and numbers</li>
                  <li>Avoid common or weak passwords</li>
                </ul>
              </div>

              {errors && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950 border border-red-800 text-red-700">
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0" />
                  <span className="text-sm">{errors}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3"
                disabled={isLoading}
              >
                {isLoading ? "Resetting password..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Remembered your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-red-700 hover:text-red-800 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
