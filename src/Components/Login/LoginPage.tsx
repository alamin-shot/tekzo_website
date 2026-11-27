"use client";

import Banner from "@/Components/ReuseableComponent/Banner";
import LoginPageAnimation from "@/Components/ReuseableComponent/LoginPage/LoginPageAnimation";
import LoginToggle from "@/Components/ReuseableComponent/LoginPage/LoginToggle";
import React, { useRef, useState, useActionState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, MouseEvent, RefObject, SetStateAction } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { AuthActionState, AuthFormFields } from "@/types/auth";
import { loginAction, registerAction } from "./actions";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { firstOf, rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

const initialState: AuthActionState = { success: null, message: "", errors: null };

// `state?.errors?.<field> && state.errors.<field>[0]` — the backend's
// validation bag, read as before.
const fieldError = (errors: unknown, field: string): unknown => {
  const value = rec(errors)?.[field];
  return value && firstOf(value);
};

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [fields, setFields] = useState<AuthFormFields>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const confirmPassRef = useRef<HTMLInputElement>(null);

  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, initialState);
  const [registerState, registerFormAction, isRegisterPending] = useActionState(registerAction, initialState);

  const state = isLogin ? loginState : registerState;
  const formAction = isLogin ? loginFormAction : registerFormAction;
  const isPending = isLogin ? isLoginPending : isRegisterPending;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // (the handlers are attached to the inputs themselves, so currentTarget is
  // the same element as the old e.target)
  const handleInvalid = (e: FormEvent<HTMLInputElement>, msg: string) => e.currentTarget.setCustomValidity(msg);
  const handleInput = (e: FormEvent<HTMLInputElement>) => e.currentTarget.setCustomValidity("");

  const toggleVisibility = (e: MouseEvent<HTMLButtonElement>, ref: RefObject<HTMLInputElement | null>, setter: Dispatch<SetStateAction<boolean>>) => {
    e.preventDefault();
    if (ref.current) {
      const start = ref.current.selectionStart;
      const end = ref.current.selectionEnd;
      setter((prev) => !prev);
      setTimeout(() => {
        // `ref.current.setSelectionRange(…)` threw if the input had unmounted; kept.
        const input = ref.current;
        if (!input) throw new TypeError("Cannot read properties of null (reading 'setSelectionRange')");
        input.setSelectionRange(start, end);
        input.focus();
      }, 0);
    }
  };

  // Used only by the commented-out "Login With Google" button below (kept as-is).
  const handleGoogleLogin = () => {};

  const nameError = fieldError(state?.errors, "name");
  const emailError = fieldError(state?.errors, "email");
  const phoneError = fieldError(state?.errors, "phone");
  const passwordError = fieldError(state?.errors, "password");

  return (
    <div>
      <Banner h1="Login" image={"/loginPage/contact-about-bg.webp"} title={isLogin ? "login account" : "register account"} />

      <div className="lg:max-w-[1100px] mx-auto lg:mt-12 lg:flex justify-between lg:bg-white lg:rounded-[40px] lg:shadow-2xl overflow-hidden transition-all duration-500">
        <LoginPageAnimation title={isLogin ? "login" : "register"}>
          <LoginToggle isLogin={isLogin} setIsLogin={setIsLogin} />
        </LoginPageAnimation>

        <div className="w-full lg:flex justify-center items-center pt-6 lg:py-0">
          <div className="bg-[#f3f2f7] lg:bg-white p-6 rounded-3xl lg:rounded-[45px] lg:w-[400px]">
            {state?.message ? (
              <div
                className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                  state.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {nodeOf(state.message)}
              </div>
            ) : (
              nodeOf(state?.message)
            )}

            <form action={formAction} className="space-y-4 animate-in fade-in duration-500">
              {isLogin && <input type="hidden" name="redirect" value={redirectTo} />}

              {!isLogin && (
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-500 text-sm ml-1">Your Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={fields.name}
                    onChange={handleChange}
                    onInvalid={(e) => handleInvalid(e, "Name is required")}
                    onInput={handleInput}
                    className="bg-white lg:bg-[#f3f2f7] rounded-xl px-4 py-3 focus:outline outline-[#18c5a8] duration-200"
                    placeholder="John Doe"
                  />
                  {nameError ? <p className="text-xs text-red-500">{nodeOf(nameError)}</p> : nodeOf(nameError)}
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <label className="text-gray-500 text-sm ml-1">Your Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={fields.email}
                  onChange={handleChange}
                  className="bg-white lg:bg-[#f3f2f7] rounded-xl px-4 py-3 focus:outline outline-[#18c5a8] duration-200"
                  placeholder="john@doe.com"
                />
                {emailError ? <p className="text-xs text-red-500">{nodeOf(emailError)}</p> : nodeOf(emailError)}
              </div>

              {!isLogin && (
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-500 text-sm ml-1">Your Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={fields.phone}
                    onChange={handleChange}
                    className="bg-white lg:bg-[#f3f2f7] rounded-xl px-4 py-3 focus:outline outline-[#18c5a8] duration-200"
                    placeholder="+880 1234..."
                  />
                  {phoneError ? <p className="text-xs text-red-500">{nodeOf(phoneError)}</p> : nodeOf(phoneError)}
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <label className="text-gray-500 text-sm ml-1">Password</label>
                <div className="relative w-full">
                  <input
                    ref={inputRef}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={fields.password}
                    onChange={handleChange}
                    className="bg-white lg:bg-[#f3f2f7] rounded-xl px-4 py-3 w-full focus:outline outline-[#18c5a8] duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => toggleVisibility(e, inputRef, setShowPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18c5a8]"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                {passwordError ? <p className="text-xs text-red-500">{nodeOf(passwordError)}</p> : nodeOf(passwordError)}
                {isLogin && (
                  <div className="flex justify-end">
                    <Link href={"/login/reset-password"} className="text-sm font-light underline text-blue-400 cursor-pointer">
                      Forgot Password?
                    </Link>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-500 text-sm ml-1">Confirm Password</label>
                  <div className="relative w-full">
                    <input
                      ref={confirmPassRef}
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={fields.confirmPassword}
                      onChange={handleChange}
                      className="bg-white lg:bg-[#f3f2f7] rounded-xl px-4 py-3 w-full focus:outline outline-[#18c5a8] duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => toggleVisibility(e, confirmPassRef, setShowConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18c5a8]"
                    >
                      {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="py-3 mt-2 w-full bg-secondary text-white rounded-xl active:scale-95 duration-200 font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (isLogin ? "Logging in..." : "Registering...") : isLogin ? "Login" : "Register"}
              </button>
            </form>

            {/*{isLogin && (*/}
            {/*    <>*/}
            {/*        <div className="flex items-center my-3">*/}
            {/*            <div className="grow border-t border-gray-300"></div>*/}
            {/*            <span className="shrink mx-4 text-gray-400 text-sm font-light uppercase tracking-wider">or</span>*/}
            {/*            <div className="grow border-t border-gray-300"></div>*/}
            {/*        </div>*/}
            {/*        <button*/}
            {/*            type="button"*/}
            {/*            onClick={handleGoogleLogin}*/}
            {/*            className="flex gap-1 justify-center items-center h-12 py-3 mt-2 w-full rounded-xl bg-white lg:border border-gray-300 active:scale-95 duration-200 font-semibold cursor-pointer"*/}
            {/*        >*/}
            {/*            <Image src={"/google-logo.png"} alt="google logo" width={200} height={200} className="w-8 h-8" />*/}
            {/*            <span className="text-gray-700">Login With Google</span>*/}
            {/*        </button>*/}
            {/*    </>*/}
            {/*)}*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
