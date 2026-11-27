import React from "react";
import { pageCanonical } from "@/lib/seo/jsonLd";
import Link from "next/link";
import {
  FaUsers,
  FaAward,
  FaHandshake,
  FaTrophy,
  FaShieldAlt,
  FaHeadset,
  FaCog,
  FaBlog,
  FaLightbulb,
  FaChartLine,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";
import Banner from "@/Components/ReuseableComponent/Banner";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import { getSeoPage } from "@/lib/api";
import type { Metadata } from "next";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seoData = rec(await getSeoPage("discovery"));

    return {
      title:
        str(seoData?.title) ||
        "TEKZO Discovery | Discover the Latest Smartphones, Gadgets & Tech Trends",
      description:
        str(seoData?.description) ||
        "Explore the latest smartphones, laptops, tablets, audio devices, and accessories at TEKZO. Discover premium tech products, expert reviews, and exclusive deals.",
      keywords:
        str(seoData?.tags) ||
        "TEKZO Discovery, Latest Gadgets Bangladesh, Trending Smartphones BD",

      // Open Graph
      openGraph: {
        title:
          str(seoData?.title) ||
          "TEKZO Discovery | Discover the Latest Smartphones, Gadgets & Tech Trends",
        description:
          str(seoData?.description) ||
          "Explore the latest smartphones, laptops, tablets, audio devices, and accessories at TEKZO.",
        url: pageCanonical(seoData?.canonicalUrl, "/discovery"),
        siteName: str(seoData?.siteName) || "TEKZO",
        images: seoData?.ogImage
          ? [
              {
                url: str(seoData.ogImage) ?? "",
                width: 1200,
                height: 630,
                alt: str(seoData?.title) || "TEKZO Discovery",
              },
            ]
          : [
              {
                url: "https://www.tekzo.com.bd/all-product-banner.webp",
                width: 1200,
                height: 630,
                alt: "TEKZO Discovery",
              },
            ],
        locale: "en_US",
        type: "website",
      },

      // Twitter Card
      twitter: {
        card: "summary_large_image",
        title:
          str(seoData?.title) ||
          "TEKZO Discovery | Discover the Latest Smartphones, Gadgets & Tech Trends",
        description:
          str(seoData?.description) ||
          "Explore the latest smartphones, laptops, tablets, audio devices, and accessories at TEKZO.",
        images: seoData?.ogImage
          ? [str(seoData.ogImage) ?? ""]
          : ["https://www.tekzo.com.bd/all-product-banner.webp"],
        site: "@TEKZO",
        creator: "@TEKZO",
      },

      // Canonical URL
      alternates: {
        canonical: pageCanonical(seoData?.canonicalUrl, "/discovery"),
      },

      // Robots
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      // Additional Meta Tags
      category: "Technology",
      classification: "E-commerce",
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title:
        "TEKZO Discovery | Discover the Latest Smartphones, Gadgets & Tech Trends",
      description:
        "Explore the latest smartphones, laptops, tablets, audio devices, and accessories at TEKZO. Discover premium tech products, expert reviews, and exclusive deals.",
    };
  }
}

export default async function DiscoveryPage() {
  const seoData = rec(await getSeoPage("discovery"));

  return (
    <div className="">
      <Banner image={"/all-product-banner.webp"} title={"careers"} />
      <main className="min-h-screen my-mt">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-secondary/10 via-primary/5 to-secondary/10 py-16 lg:py-24 rounded-3xl lg:rounded-[40px]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Discover the{" "}
              <span className="text-transparent bg-clip-text gradient-r">
                TEKZO Experience
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your gateway to premium technology solutions, dedicated care
              services, industry insights, and seamless communication
            </p>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  About <span className="text-secondary">TEKZO</span>
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                  Building trust through authentic products and exceptional
                  service
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
                {[
                  {
                    icon: FaUsers,
                    number: "50,000+",
                    label: "Happy Customers",
                    gradient: "from-secondary/20 to-secondary/5",
                  },
                  {
                    icon: FaAward,
                    number: "100+",
                    label: "Premium Brands",
                    gradient: "from-primary/20 to-primary/5",
                  },
                  {
                    icon: FaHandshake,
                    number: "5 Years",
                    label: "Of Excellence",
                    gradient: "from-secondary/20 to-secondary/5",
                  },
                  {
                    icon: FaTrophy,
                    number: "99%",
                    label: "Satisfaction Rate",
                    gradient: "from-primary/20 to-primary/5",
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className={`bg-dark bg-gradient-to-br ${stat.gradient} rounded-2xl lg:rounded-3xl p-6 text-center
                                hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100`}
                    >
                      <Icon className="text-3xl lg:text-4xl text-secondary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                        {stat.number}
                      </h3>
                      <p className="text-sm lg:text-base text-gray-600">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Mission Statement */}
              <div className="bg-dark bg-gradient-to-br from-secondary/10 to-transparent border border-gray-100 rounded-3xl p-8 lg:p-12 mb-8 shadow-sm">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center lg:text-left">
                  Our Mission
                </h3>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-4">
                  At TEKZO, we're committed to delivering 100% authentic tech
                  products from world-renowned brands. We combine competitive
                  pricing, official warranties, and exceptional customer service
                  to create a shopping experience you can trust.
                </p>
                <p className="text-base text-gray-600 leading-relaxed">
                  From the latest smartphones and audio devices to cutting-edge
                  accessories, we ensure every product meets the highest
                  standards of quality and authenticity.
                </p>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Link
                  href="/about-us"
                  className="inline-flex items-center gap-3 bg-secondary hover:bg-secondary/90 text-white 
                           px-8 py-4 rounded-full font-semibold text-base lg:text-lg 
                           shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  Learn More About Us
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* TEKZO Care Section */}
        <section className="py-12 lg:py-20 rounded-3xl lg:rounded-[40px]">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  <span className="text-secondary">TEKZO Care</span> - Premium
                  Protection
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                  Comprehensive device protection and ongoing support for
                  ultimate peace of mind
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  {
                    icon: FaShieldAlt,
                    title: "Complete Protection",
                    description:
                      "Extended warranty coverage, accidental damage protection, and hassle-free claims process for all your devices.",
                    gradient: "from-secondary/20 to-secondary/5",
                  },
                  {
                    icon: FaHeadset,
                    title: "24/7 Support",
                    description:
                      "Round-the-clock customer support with dedicated care specialists ready to assist you whenever you need help.",
                    gradient: "from-primary/20 to-primary/5",
                  },
                  {
                    icon: FaCog,
                    title: "Proactive Maintenance",
                    description:
                      "Regular device checkups, software updates, and preventive care to keep your technology running at peak performance.",
                    gradient: "from-secondary/20 to-secondary/5",
                  },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className={`bg-dark bg-gradient-to-br ${feature.gradient} rounded-3xl p-6 lg:p-8
                               hover:shadow-lg transition-all duration-300 group border border-gray-100`}
                    >
                      <div
                        className="w-14 h-14 lg:w-16 lg:h-16 bg-dark border border-gray-200/80 rounded-2xl flex items-center justify-center 
                                 mb-5 shadow-sm group-hover:scale-110 transition-transform"
                      >
                        <Icon className="text-2xl lg:text-3xl text-secondary" />
                      </div>
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Value Proposition Card */}
              <div className="bg-dark border border-gray-100 rounded-3xl p-8 lg:p-12 mb-8 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      Why Choose TEKZO Care?
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Fast repair turnaround times",
                        "Genuine replacement parts guaranteed",
                        "Transparent pricing with no hidden fees",
                        "Priority service for care members",
                        "Device health monitoring and alerts",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-secondary text-sm">✓</span>
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-dark border border-gray-200/70 bg-gradient-to-br from-secondary/10 to-primary/5 rounded-2xl p-8 text-center">
                    <div className="text-5xl lg:text-6xl font-bold text-secondary mb-3">
                      24/7
                    </div>
                    <p className="text-lg text-gray-800 font-semibold mb-2">
                      Always Available
                    </p>
                    <p className="text-sm text-gray-600">
                      Our care team never sleeps, ensuring your devices are
                      always protected
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Link
                  href="/TEKZO-care"
                  className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white 
                           px-8 py-4 rounded-full font-semibold text-base lg:text-lg 
                           shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  Explore TEKZO Care
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Insights & <span className="text-secondary">Updates</span>
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                  Stay informed with the latest tech news, product reviews, and
                  industry trends
                </p>
              </div>

              {/* Featured Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  {
                    category: "Product Review",
                    categoryColor: "bg-secondary text-white",
                    title: "Top 5 Flagship Smartphones of 2024",
                    excerpt:
                      "Discover the best premium smartphones featuring cutting-edge technology, stunning displays, and exceptional camera systems.",
                    readTime: "8 min read",
                    icon: FaLightbulb,
                    gradient: "from-secondary/10 to-transparent",
                    slug: "/blog",
                  },
                  {
                    category: "Tech Trends",
                    categoryColor: "bg-primary text-white",
                    title: "The Future of Wireless Audio",
                    excerpt:
                      "Explore how advanced audio codecs, active noise cancellation, and spatial audio are revolutionizing the listening experience.",
                    readTime: "6 min read",
                    icon: FaChartLine,
                    gradient: "from-primary/10 to-transparent",
                    slug: "/blog",
                  },
                  {
                    category: "Buying Guide",
                    categoryColor: "bg-secondary text-white",
                    title: "How to Choose the Perfect Power Bank",
                    excerpt:
                      "Expert tips on selecting the right capacity, charging speed, and portability for your mobile lifestyle.",
                    readTime: "5 min read",
                    icon: FaBlog,
                    gradient: "from-secondary/10 to-transparent",
                    slug: "/blog",
                  },
                ].map((article, index) => {
                  const Icon = article.icon;
                  return (
                    <PreFetchLink
                      href={article.slug}
                      prefetch={false}
                      key={index}
                      className={`bg-dark bg-gradient-to-br ${article.gradient} rounded-3xl overflow-hidden
                                hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100`}
                    >
                      {/* Image Placeholder */}
                      <div className="h-48 bg-dark border-b border-gray-200/60 flex items-center justify-center relative overflow-hidden">
                        <Icon className="text-6xl text-gray-400 group-hover:scale-110 transition-transform duration-300" />
                        <span
                          className={`absolute top-4 left-4 ${article.categoryColor} px-3 py-1 rounded-full text-xs font-semibold`}
                        >
                          {article.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-secondary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{article.readTime}</span>
                          <span className="text-secondary font-semibold group-hover:gap-2 flex items-center transition-all">
                            Read More
                            <FaArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </PreFetchLink>
                  );
                })}
              </div>

              {/* Blog CTA Card */}
              <div className="bg-dark border border-gray-100 rounded-3xl p-8 lg:p-12 text-center shadow-sm">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Explore Our Complete Blog Library
                </h3>
                <p className="text-base lg:text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                  Access hundreds of articles covering product launches, tech
                  tutorials, industry analysis, and expert recommendations
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-3 bg-secondary hover:bg-secondary/90 text-white 
                           px-8 py-4 rounded-full font-semibold text-base lg:text-lg 
                           shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  Visit Our Blog
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="py-12 lg:py-20 rounded-3xl lg:rounded-[40px]">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Get in <span className="text-secondary">Touch</span>
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                  We're here to help with any questions, support needs, or
                  feedback
                </p>
              </div>

              {/* Contact Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  {
                    icon: FaEnvelope,
                    title: "Email Support",
                    detail: "support@tekzo.com.bd",
                    description:
                      "Send us an email anytime - we typically respond within 2 hours",
                    gradient: "from-secondary/20 to-secondary/5",
                    iconBg: "bg-secondary/10",
                    href: "mailto:support@tekzo.com.bd",
                  },
                  {
                    icon: FaPhone,
                    title: "Phone Support",
                    detail: "+8801897-715222",
                    description:
                      "Call our hotline for immediate assistance and expert guidance",
                    gradient: "from-primary/20 to-primary/5",
                    iconBg: "bg-primary/10",
                    href: "tel:+8801897715222",
                  },
                  {
                    icon: FaMapMarkerAlt,
                    title: "Visit Our Store",
                    detail: "Dhaka, Bangladesh",
                    description:
                      "Experience our products in person at our flagship showroom",
                    gradient: "from-secondary/20 to-secondary/5",
                    iconBg: "bg-secondary/10",
                    href: "/outlets",
                  },
                ].map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <Link
                      key={index}
                      href={contact.href}
                      className={`bg-dark bg-gradient-to-br ${contact.gradient} rounded-3xl p-6 lg:p-8
                               hover:shadow-lg transition-all duration-300 group cursor-pointer block border border-gray-100`}
                    >
                      <div
                        className={`w-14 h-14 lg:w-16 lg:h-16 ${contact.iconBg} rounded-2xl 
                                 flex items-center justify-center mb-5 shadow-sm 
                                 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="text-2xl lg:text-3xl text-secondary" />
                      </div>
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">
                        {contact.title}
                      </h3>
                      <p className="text-base font-semibold text-secondary mb-3">
                        {contact.detail}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {contact.description}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Contact CTA */}
              <div className="bg-dark border border-gray-100 rounded-3xl p-8 lg:p-12 shadow-md">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      Ready to Connect?
                    </h3>
                    <p className="text-base lg:text-lg text-gray-700 mb-6 leading-relaxed">
                      Whether you have questions about products, need technical
                      support, or want to provide feedback, our team is ready to
                      assist you through multiple channels.
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="text-secondary">✓</span> Multi-channel
                        support (Phone, Email, Chat)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-secondary">✓</span> Fast response
                        times guaranteed
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-secondary">✓</span> Expert product
                        consultations available
                      </li>
                    </ul>
                  </div>
                  <div className="bg-dark border border-gray-200/70 bg-gradient-to-br from-secondary/10 to-primary/5 rounded-3xl p-8 text-center">
                    <div className="mb-6">
                      <div className="text-5xl mb-4">💬</div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        Let's Talk
                      </h4>
                      <p className="text-sm text-gray-600">
                        Fill out our contact form and we'll get back to you
                        promptly
                      </p>
                    </div>
                    <Link
                      href="/contact-us"
                      className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white 
                               px-6 py-3 rounded-full font-semibold text-base 
                               shadow-md hover:shadow-lg transition-all duration-300 group"
                    >
                      Get in Touch
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-12 lg:py-16 mt-12 lg:mt-16 bg-gradient-to-tl lg:bg-gradient-to-r from-primary lg:from-secondary lg:via-primary to-secondary rounded-3xl lg:rounded-[40px]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Experience the TEKZO Difference
            </h2>
            <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust TEKZO for
              authentic products and exceptional service
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-secondary 
                       px-8 py-4 rounded-full font-bold text-base lg:text-lg 
                       shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Start Shopping
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
        <PageDescription
          title="Learn More About TEKZO Discovery"
          description={seoData?.description}
        />
      </main>
    </div>
  );
}
