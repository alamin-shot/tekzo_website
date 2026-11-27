"use client";

import React from "react";
import dynamic from "next/dynamic";
import loginAnimation from "../../../assets/lottie/login-animation.json";
import type { LoginPageAnimationProps } from "@/types/props/content";

// lottie-react (and its lottie-web runtime) only ships when the login page
// is actually visited, instead of getting hoisted into the shared/common
// chunk that loads on every route.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const LoginPageAnimation = ({ children, title }: LoginPageAnimationProps) => {
  return (
    <div className="bg-dark rounded-3xl lg:rounded-[40px] lg:w-full px-4 pt-4 lg:pt-15 mt-6 lg:mt-0">
      {children}
      <h3 className="text-2xl lg:text-3xl text-gray-500 py-10 text-center capitalize">
        {title} Your Account
      </h3>
      <Lottie
        animationData={loginAnimation}
        loop
        autoplay
        className="w-full  opacity-50"
      />
    </div>
  );
};

export default LoginPageAnimation;
