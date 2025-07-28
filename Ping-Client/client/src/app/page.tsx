"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  Shield,
  ArrowRight,
  Play,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Building2,
  NotebookPen,
  MessageSquare,
  LifeBuoy,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { apiClient } from "@/sheared/apiClient";
import { URL_VERIFY } from "@/constants/const";

const features = [
  {
    icon: Users,
    title: "Connect with Friends",
    description:
      "Find and connect with your friends in a safe and friendly environment.",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description:
      "Instant conversations with notifications for perfect communication.",
  },
  {
    icon: Share2,
    title: "Share Moments",
    description: "Post photos, thoughts and experiences with your community.",
  },
];

export default function WelcomePage() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (window.location.pathname === "/") {
        try {
          await apiClient<void, string>({
            url: URL_VERIFY,
            method: "GET",
          });
          window.location.href = "/social";
        } catch (error) {
          localStorage.removeItem("token");
        }
      }
    };

    verifyToken();
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white">
      <nav className="bg-dark backdrop-blur-md border-b border-red-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Ping</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-red-700 hover:text-white"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-red-700 hover:bg-red-800 text-white border-red-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`space-y-8 ${
                isVisible
                  ? "animate-in slide-in-from-left duration-1000"
                  : "opacity-0"
              }`}
            >
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Connect with
                  <span className="text-red-700"> your world</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Discover a new way to connect with friends, share special
                  moments and build authentic communities in a safe and friendly
                  environment.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="bg-red-700 hover:bg-red-800 text-white text-lg px-8 py-6 w-full sm:w-auto border-red-700"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-red-700 hover:bg-red-800 hover:text-white text-lg px-8 py-6 w-full sm:w-auto bg-transparent"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>
            </div>
            <div
              className={`relative ${
                isVisible
                  ? "animate-in slide-in-from-right duration-1000"
                  : "opacity-0"
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-red-700 rounded-3xl blur-3xl opacity-20 animate-pulse" />
                <Card className="relative bg-dark border-red-700 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            Maria Popescu
                          </h3>
                        </div>
                      </div>
                      <div className="bg-gray-800 border border-red-700 rounded-2xl p-4">
                        <p className="text-white">
                          Right now I discover an amazing group of people!
                          Thanks to the team for support!
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4 text-red-700" />
                              <span className="text-sm text-gray-300">24</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4 text-red-700" />
                              <span className="text-sm text-gray-300">8</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-4 h-4 text-red-700" />
                              <span className="text-sm text-gray-300">3</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">2 min</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Ping?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We offer the most advanced features for a complete and secure
              social experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-dark border-red-700 shadow-lg hover:shadow-xl hover:border-red-600 transition-all duration-300 group"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-red-700 border-t border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already found their community on
            Ping. Registration is free and takes just a few seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="auth/register">
              <Button
                size="lg"
                className="bg-white text-red-700 hover:bg-gray-100 text-lg px-8 py-6 w-full sm:w-auto"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 w-full sm:w-auto bg-transparent"
              >
                I Already Have an Account
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-6 mt-12 text-red-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>100% Secure</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 border-t border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-700 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Ping</span>
              </div>
              <p className="text-gray-400">
                Connect with your world in an authentic and secure way.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-red-800 transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-red-800 transition-colors flex items-center gap-2"
                  >
                    <Users size={16} />
                    Friends
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-red-800 transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    <Building2 size={16} />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    <NotebookPen size={16} />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare size={16} />
                    Chat
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    <LifeBuoy size={16} />
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    <Mail size={16} />
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    <Shield size={16} />
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-red-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ping. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
