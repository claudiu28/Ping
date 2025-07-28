"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, RefreshCw, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/sheared/apiClient";
import { getVerifyCode, URL_FORGOT_PASSWORD } from "@/constants/const";
import { VerifyCodeRequest, VerifyCodeResponse } from "@/types/auth/verifyCode";
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "@/types/auth/forgotPassword";

export default function VerifyCodePage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(900);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<HTMLInputElement[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.trim().replace(/\D/g, "");
    if (digit.length > 1) return;

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const codeString = newCode.join("");
    if (newCode.every((d) => d !== "") && codeString.length === 6) {
      verifyCode(codeString).then();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (codeString: string) => {
    setIsLoading(true);
    setError("");
    try {
      if (!phone) {
        setError("Phone number is required.");
        return;
      }
      const _ = await apiClient<VerifyCodeRequest, VerifyCodeResponse>({
        url: getVerifyCode(phone),
        method: "POST",
        body: {
          code: codeString,
        } as VerifyCodeRequest,
      });
      setIsCodeVerified(true);
      setTimeout(() => {
        router.push(`/auth/reset-password?phone=${encodeURIComponent(phone)}`);
      }, 2000);
    } catch (error: any) {
      setError(error.message);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setCanResend(false);
    setTimeLeft(300);
    setCode(["", "", "", "", "", ""]);
    setError("");
    setIsLoading(true);

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
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark text-red-700">
        <p className="text-center text-lg">
          Invalid phone number. Return to{" "}
          <Link href="/auth/forgot-password" className="underline text-red-700">
            Forgot Password
          </Link>
        </p>
      </div>
    );
  }

  if (isCodeVerified) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border border-red-800 text-center">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Code verified!
              </h2>
              <p className="text-gray-300 mb-6">
                You can now reset your password.
              </p>
              <p className="text-sm text-gray-400">Redirecting...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border border-red-800 shadow-xl">
          <CardHeader className="text-center space-y-1">
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center text-red-700 hover:text-red-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Link>
            <div className="flex justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Verify Code</CardTitle>
            <p className="text-sm text-gray-400">
              We sent a code to:{" "}
              <span className="text-white font-medium">{phone}</span>
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-center block text-sm font-medium">
                  Enter the 6-digit code
                </Label>
                <div className="flex justify-center space-x-3">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el!;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl font-bold bg-black border-red-800 text-white"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-red-700 text-sm text-center">{error}</p>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-400">Code expires in:</p>
                <p className="text-2xl font-mono text-red-700">
                  {formatTime(timeLeft)}
                </p>
                {canResend ? (
                  <Button
                    variant="outline"
                    onClick={resendCode}
                    className="w-full text-red-700 border-red-800 hover:bg-red-950"
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    Resend Code
                  </Button>
                ) : (
                  <p className="text-xs text-gray-500">
                    You can resend the code once it expires.
                  </p>
                )}
              </div>

              {isLoading && (
                <div className="text-center text-sm text-red-600 flex justify-center items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying code...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
