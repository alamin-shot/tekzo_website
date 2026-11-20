import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const SECRET = process.env.REVALIDATION_SECRET;

export async function POST(request) {
  try {
    const { secret, type, slug } = await request.json();

    if (!SECRET || secret !== SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // সব slug lowercase — case mismatch (Earbuds vs earbuds) এখানেই fix
    //const slug = rawSlug?.toLowerCase();

    switch (type) {
      // ---------- Slug-based ----------
      case "brand":
        revalidateTag("brands", "max");
        if (slug) revalidateTag(`brand-${slug}`, "max");
        revalidatePath("/brands");
        revalidatePath("/");
        if (slug) revalidatePath(`/brands/${slug}`);
        break;

      case "category":
        revalidateTag("categories", "max");
        if (slug) revalidateTag(`category-${slug}`, "max");
        revalidatePath("/categories");
        revalidatePath("/");
        if (slug) revalidatePath(`/categories/${slug}`);
        break;

      case "product":
        if (slug) {
          revalidateTag(`product-${slug}`, "max");
          revalidatePath(`/product/${slug}`);
        }
        revalidateTag("products", "max");
        break;

        case "review":
        if (slug) {
          revalidateTag(`reviews-${slug}`, "max");
          revalidatePath(`/product/${slug}`);
        }
        revalidateTag("products", "max");
        break;

      // ---------- Page-level ----------
      case "categories":
        revalidateTag("categories", "max");
        if (slug) revalidateTag(`category-${slug}`, "max");
        revalidatePath("/categories");
        if (slug) revalidatePath(`/categories/${slug}`);
        break;

      case "featured-products":
        revalidateTag("featured-products", "max");
        revalidatePath("/");
        revalidatePath("/featured-products");
        break;

      case "offer":
        revalidateTag("offers", "max");
        if (slug) revalidateTag(`offer-${slug}`, "max");
        revalidateTag("shops", "max");
        revalidateTag("brands", "max");
        revalidateTag("categories", "max");
        revalidateTag("featured-products", "max");
        revalidateTag("products", "max");
        revalidatePath("/");
        revalidatePath("/shop");
        revalidatePath("/brands");
        revalidatePath("/categories");
        revalidatePath("/flash-sale");
        revalidatePath(`/shop/offer/`);
        if (slug) revalidatePath(`/shop/offer/${slug}`);
        break;

      case "coupon":
      case "gift-product":
        revalidateTag("offers", "max");
        revalidateTag("shops", "max");
        revalidateTag("brands", "max");
        revalidateTag("categories", "max");
        revalidateTag("featured-products", "max");
        revalidateTag("products", "max");
        revalidatePath("/");
        revalidatePath("/shop");
        revalidatePath("/brands");
        revalidatePath("/categories");
        revalidatePath("/flash-sale");
        break;

        

      case "slider":
        revalidateTag("sliders", "max");
        revalidatePath("/");
        break;

      case "settings":
      revalidateTag("settings", "max");
      revalidatePath("contact-us");
      revalidatePath("/", "layout");
      break;

      case "shop":
        revalidateTag("shops", "max");
        revalidatePath("/shop");
        break;

      case "policies":
        revalidateTag("policies", "max");
        if (slug) revalidateTag(`policy-${slug}`, "max");
        revalidatePath("/", "layout");
        if (slug) revalidatePath(`/policy/${slug}`);
        break;

      case "reel-video":
        revalidateTag("reels-video", "max");
        revalidatePath("/", "layout");
        break;

      case "news":
        revalidateTag("news", "max");
        revalidatePath("/news");
        revalidatePath("/", "layout");
        break;

      case "blog":
        revalidateTag("blogs", "max");
        revalidatePath("/blog");
        if (slug) revalidateTag(`blog-${slug}`, "max");
        break;

      case "faq":
        revalidateTag("faqs", "max");
        revalidatePath("/faq");
        break;
      
      case "used-device":
        revalidateTag("used-devices", "max");
        if (slug) revalidateTag(`used-device-${slug}`, "max");
        revalidatePath("/used-device");
        revalidatePath("/marketplace");
        if (slug) revalidatePath(`/used-device/${slug}`);
        if (slug) revalidatePath(`/used-device/product/${slug}`);
        break;

      case "outlet":
        revalidateTag("outlets", "max");
        if (slug) revalidateTag(`outlet-${slug}`, "max");
        revalidatePath("/outlets");
        break;

      case "popup-dialog":
        revalidateTag("popup-dialogs", "max");
        revalidatePath("/", "layout");
        break;

      // ---------- SEO pages ----------
      case "page-seo": {
        if (slug) {
          const seoPathMap = {
            home: "/",
           
            checkout: "/checkout",
            categories: "/categories",
            brands: "/brands",
            blog: "/blog",
            news: "/news",
          
            outlets: "/outlets",
            careers: "/careers",
           

            "flash-sale": "/flash-sale",
            "featured-products": "/featured-products",
            shop: "/shop",
            offer: "/shop/offer",
            "used-device": "/used-device",
            marketplace: "/marketplace",

            "tekzo-care": "/tekzo-care",
            "sell-your-device": "/sell-your-device",
            "about-us": "/about-us",
            "contact-us": "/contact-us",
            "tekzo-care": "/tekzo-care",
            "claim-your-warranty": "/claim-your-warranty",
            "how-to-claim": "/how-to-claim",
            "order-tracking": "/order-tracking",
            faq: "/faq",
            compare: "/compare",
            
            "privacy-policy": "/policy/privacy-policy",
            "emi-policy": "/policy/emi-policy",
            'warranty-policy': '/policy/warranty-policy',
            "exchange-policy": "/policy/exchange-policy",
            "delivery-policy": "/policy/delivery-policy",
            "preorder-policy": "/policy/preorder-policy",
            "terms-conditions": "/policy/terms-condition",
            "refund-policy": "/policy/refund-policy",
            "return-policy": "/policy/return-policy",
            "policy" : "/policy/care-policy",     
          };
          const path = seoPathMap[slug];
          if (path) {
            revalidatePath(path);
          } else {
            return NextResponse.json(
              { message: `Unknown seo page: ${slug}` },
              { status: 400 }
            );
          }
        } else {
          revalidatePath("/", "layout");
        }
        break;
      }

      // ---------- সব একসাথে ----------
      case "all":
        revalidatePath("/", "layout");
        break;

      // ---------- Unknown type → error ----------
      default:
        return NextResponse.json(
          { message: `Unknown type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ revalidated: true, type, slug: slug ?? null });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}