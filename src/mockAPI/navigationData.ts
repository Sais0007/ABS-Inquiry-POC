import {
  ClipboardList,
} from "lucide-react";

export interface SubMenuItem {
  id: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: any;
  onClick?: () => void;
  active?: boolean;
  subItems?: SubMenuItem[];
}

export const getNavigationData = (
  currentPage: string = "inquiry-listing",
  onNavigate: (pageId: string) => void = () => {},
): MenuItem[] => {
  return [
    {
      id: "inquiry-listing",
      label: "Inquiry Listing",
      icon: ClipboardList,
      onClick: () => onNavigate("inquiry-listing"),
      active: currentPage === "inquiry-listing",
    },
  ];
};