// Navigation menu item shapes (navbar mega-menus, mobile sidebar, footer).
import type { LucideIcon } from "lucide-react";

/** Static menu tile with an image (sidebar / company-profile / partners). */
export type NavImageItem = {
  name: string;
  image: string;
  link: string;
};

/** Static menu tile with a lucide icon (marketplace / discovery menus). */
export type NavIconItem = {
  name: string;
  icon: LucideIcon;
  link: string;
};

/** Mobile sidebar grid button. */
export type SidebarButtonItem = {
  title: string;
  image: string;
  isExpandable?: boolean;
  link?: string;
};

/** Footer link (About column). */
export type FooterLink = {
  title: string;
  link: string;
};

/** Footer social / payment icon entry. */
export type FooterIconLink = {
  icon: string;
  title: string;
  link: string;
};

/** Mega-menu / sidebar panel keys used by NavHoverEffect, ModalBox and SidebarItems. */
export type NavMenuTitle = string;
