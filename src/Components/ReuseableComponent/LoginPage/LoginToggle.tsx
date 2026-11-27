"use client";
import React from "react";
import type { LoginToggleProps } from "@/types/props/content";

const LoginToggle = ({ isLogin, setIsLogin }: LoginToggleProps) => {
  return (
    <div className="relative border border-gray-400 flex rounded-2xl p-1 lg:max-w-[300px] mx-auto bg-white overflow-hidden">
      {/* Sliding Background Indicator */}
      <div
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-secondary rounded-[14px] transition-transform duration-500 ease-in-out ${isLogin ? "translate-x-0" : "translate-x-full"}`}
      />

      {/* Login Button */}
      <button
        type="button"
        onClick={() => setIsLogin(true)}
        className={`relative z-10 text-lg lg:text-2xl font-light w-full text-center py-4 transition-colors duration-500 cursor-pointer ${isLogin ? "text-white" : "text-gray-500 hover:text-secondary"}`}
      >
        Login
      </button>

      {/* Register Button */}
      <button
        type="button"
        onClick={() => setIsLogin(false)}
        className={`relative z-10 text-lg lg:text-2xl font-light w-full text-center py-4 transition-colors duration-500 cursor-pointer ${!isLogin ? "text-white" : "text-gray-500 hover:text-secondary"}`}
      >
        Register
      </button>
    </div>
  );
};

export default LoginToggle;
