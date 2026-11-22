// Official manufacturer websites, keyed by lower-cased brand slug/name.
// Used as the outbound "source" citation on product, brand and category
// pages. Only add a brand here when the URL is its verified official site —
// a wrong citation is worse than none.
export const BRAND_OFFICIAL_SITES = {
  apple: "https://www.apple.com",
  samsung: "https://www.samsung.com",
  google: "https://store.google.com",
  oneplus: "https://www.oneplus.com",
  xiaomi: "https://www.mi.com",
  redmi: "https://www.mi.com",
  poco: "https://www.po.co",
  realme: "https://www.realme.com",
  oppo: "https://www.oppo.com",
  vivo: "https://www.vivo.com",
  zte: "https://www.ztedevices.com",
  motorola: "https://www.motorola.com",
  nothing: "https://nothing.tech",
  huawei: "https://consumer.huawei.com",
  honor: "https://www.honor.com",
  infinix: "https://www.infinixmobility.com",
  tecno: "https://www.tecno-mobile.com",
  nokia: "https://www.nokia.com/phones",
  sony: "https://www.sony.com",
  anker: "https://www.anker.com",
  soundcore: "https://www.soundcore.com",
  jbl: "https://www.jbl.com",
  baseus: "https://www.baseus.com",
  ugreen: "https://www.ugreen.com",
  edifier: "https://www.edifier.com",
  amazfit: "https://www.amazfit.com",
  lenovo: "https://www.lenovo.com",
  asus: "https://www.asus.com",
  hp: "https://www.hp.com",
  dell: "https://www.dell.com",
  microsoft: "https://www.microsoft.com",
  dji: "https://www.dji.com",
  tozo: "https://www.tozostore.com",
};

export function brandOfficialSite(brand) {
  const keys = [brand?.slug, brand?.name].filter(Boolean).map((k) => String(k).toLowerCase().trim());
  for (const k of keys) if (BRAND_OFFICIAL_SITES[k]) return BRAND_OFFICIAL_SITES[k];
  return null;
}
