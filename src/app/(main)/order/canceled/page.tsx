import React from "react";
import {CircleX} from "lucide-react";
import Banner from "@/Components/ReuseableComponent/Banner";

const OrderCanceled = () => {
    return (
        <div className="">
            <Banner image={"/all-product-banner.webp"} title={"Order Payment Canceled"}/>
            <div className=" md:bg-gray-50 flex flex-col items-center md:py-10 md:px-4 my-rounded my-mt">
                {/* Main Content Card */}
                <div
                    className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-16 flex flex-col items-center text-center">
                    {/* Success Icon */}
                    <div className="mb-8 relative">
                        <div className="bg-red-500 rounded-full p-4 text-white shadow-lg shadow-green-200">
                            <CircleX className="w-12 h-12"/>
                        </div>
                        {/* Confetti effect (Simple CSS) */}
                        <div className="absolute inset-0 animate-ping opacity-20 bg-green-400 rounded-full -z-10"></div>
                    </div>

                    {/* Success Message */}
                    <div className="space-y-6 max-w-3xl">
                        <p className="text-gray-600 text-lg leading-relaxed">
                            We appreciate your trust in <span
                            className="font-bold text-gray-800">Unfortunately</span>Your order
                            payment has been canceled.
                        </p>

                        <div className="pt-4">
                            <p className="text-gray-500 mb-6">To download your invoice, simply click the button
                                below:</p>

                            <button
                                className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-10 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-md">
                                Download Invoice
                            </button>
                        </div>

                        <p className="text-gray-400 text-sm mt-10 italic">
                            We hope you enjoy your new gadgets, and if you have any questions or need assistance, feel
                            free to reach out to our customer service team.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCanceled;
