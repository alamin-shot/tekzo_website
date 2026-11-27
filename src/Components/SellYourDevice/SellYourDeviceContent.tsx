"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  DollarSign,
  Shield,
  Clock,
  CheckCircle,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Watch,
  Camera,
  ArrowRight,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import type { SellYourDeviceContentProps } from "@/types/props/product";

export default function SellYourDeviceContent({ isLoggedIn }: SellYourDeviceContentProps) {
  const features = [
    {
      icon: DollarSign,
      title: "Best Price Guarantee",
      description:
        "Get the most competitive prices for your used devices in the market",
    },
    {
      icon: Clock,
      title: "Quick Process",
      description: "List your device in minutes and get responses fast",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your data privacy and transaction security is our priority",
    },
    {
      icon: CheckCircle,
      title: "Verified Buyers",
      description: "All transactions are verified and protected by Tekzo",
    },
  ];

  const deviceCategories = [
    { icon: Smartphone, name: "Smartphones", popular: true },
    { icon: Tablet, name: "Tablets", popular: true },
  ];

  const steps = [
    {
      number: "01",
      title: "List Your Device",
      description:
        "Create an account and provide details about your device including condition, specifications, and price",
    },
    {
      number: "02",
      title: "Get Offers",
      description:
        "Receive competitive offers from verified buyers interested in your device",
    },
    {
      number: "03",
      title: "Ship & Get Paid",
      description:
        "Once accepted, ship your device and receive payment securely",
    },
  ];

  const stats = [
    { icon: Users, value: "500+", label: "Happy Sellers" },
    { icon: TrendingUp, value: "95%", label: "Satisfaction Rate" },
    { icon: Award, value: "#1", label: "Buyback Platform" },
  ];

  return (
    <div className="py-6 md:py-10">
      {/* Hero Section */}
      <div className="text-center mb-6 md:mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-3 md:mb-4">
          Turn Your Old Devices into{" "}
          <span className="text-secondary">Cash Today</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8">
          Sell your used smartphones, tablets, laptops and more. Get the best
          price with a safe, secure, and hassle-free process.
        </p>

        {/* CTA Button */}
        {isLoggedIn ? (
          <Link
            href="/dashboard/sell-your-device"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ShoppingBag size={24} />
            Sell Your Device Now
            <ArrowRight size={20} />
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login?redirect=/dashboard/sell-your-device"
              className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Login/Register to Sell
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 md:mb-16">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-8 text-center transform hover:scale-105 transition-all"
            >
              <Icon className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-4xl font-extrabold text-gray-800 mb-2">
                {stat.value}
              </h3>
              <p className="text-gray-600 font-semibold">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Device Categories */}
      <div className="mb-8 md:mb-12 lg:mb-16">
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 text-center mb-4 md:mb-8">
          What Can You Sell?
        </h2>
        <div className="flex justify-center items-center gap-4 lg:gap-6 max-w-xl m-auto">
          {deviceCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="relative flex-1 bg-white border-2 border-gray-200 hover:border-secondary rounded-2xl p-6 text-center transition-all transform hover:scale-105 hover:shadow-lg"
              >
                {category.popular && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <Icon className="w-12 h-12 mx-auto mb-3 text-secondary" />
                <p className="text-sm font-bold text-gray-800">
                  {category.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-8 md:mb-16">
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 text-center mb-6 md:mb-12">
          Why Sell on Tekzo?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                <div className="bg-secondary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-8 md:mb-16 lg:bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl md:p-12">
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 text-center mb-4 md:mb-8">
          How It Works
        </h2>
        <div className="flex flex-col lg:flex-row items-stretch my-gap ">
          {steps.map((step, index) => (
            // 1. Added flex & flex-col so children can expand vertically
            <div key={index} className="relative flex-1 flex flex-col ">
              {/* 2. Added h-full so the white card spans the full height */}
              <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md border border-gray-200 transition-all h-full">
                <div className="bg-gradient-to-br from-secondary to-primary text-white text-2xl font-extrabold w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-secondary" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="mb-8 md:mb-16">
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 text-center mb-6 md:mb-12">
          Additional Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex gap-4 hover:border-secondary transition-all">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Data Security Guarantee
              </h3>
              <p className="text-gray-600 text-sm">
                We provide guidance on how to securely wipe your data before
                selling. Your privacy matters to us.
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex gap-4 hover:border-secondary transition-all">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                No Hidden Fees
              </h3>
              <p className="text-gray-600 text-sm">
                What you see is what you get. No surprise deductions or hidden
                charges in the process.
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex gap-4 hover:border-secondary transition-all">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Expert Support Team
              </h3>
              <p className="text-gray-600 text-sm">
                Our dedicated support team is here to help you throughout the
                selling process.
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex gap-4 hover:border-secondary transition-all">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-orange-700" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Flexible Payment Options
              </h3>
              <p className="text-gray-600 text-sm">
                Receive payments through multiple secure methods including bank
                transfer and mobile banking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-secondary to-primary rounded-3xl p-8 md:p-12 text-center text-white">
        <h2 className="text-2xl md:text-4xl font-extrabold mb-3 md:mb-4">
          Ready to Sell Your Device?
        </h2>
        <p className="text-lg mb-6 md:mb-8 opacity-90">
          Join thousands of satisfied sellers and get the best value for your
          used devices
        </p>
        {isLoggedIn ? (
          <Link
            href="/dashboard/sell-your-device"
            className="inline-flex items-center gap-2 bg-white text-secondary hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            <ShoppingBag size={24} />
            Start Selling Now
            <ArrowRight size={20} />
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login?redirect=/dashboard/sell-your-device"
              className="inline-flex items-center gap-2 bg-white text-secondary hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Login to Continue
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="mt-8 md:mt-12">
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 text-center mb-6 md:mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              What devices can I sell?
            </h3>
            <p className="text-gray-600 text-sm">
              You can sell smartphones and tablets. Just make sure they are in
              working condition.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              How long does it take to sell?
            </h3>
            <p className="text-gray-600 text-sm">
              Once you list your device, you can start receiving offers
              immediately. The entire process typically takes 3-7 days.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Is my data safe?
            </h3>
            <p className="text-gray-600 text-sm">
              We recommend factory resetting your device before shipping. We
              also provide a data wipe guide to ensure complete data removal.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              What if my device has issues?
            </h3>
            <p className="text-gray-600 text-sm">
              You can still sell devices with minor issues. Just be honest about
              the condition when listing, and you'll receive appropriate offers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
