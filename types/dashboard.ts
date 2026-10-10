export type UserRole = "CLIENT" | "DESIGNER" | "ADMIN";

export type ProjectStatus =
  | "AWAITING_PAYMENT" // Очікує оплати
  | "IN_PROGRESS"      // В роботі
  | "IN_REVIEW"        // На перевірці
  | "COMPLETED";       // Завершено

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: "DWG" | "PDF" | "IMAGE" | "REFERENCE";
  size: string;
}

export interface RenderVersion {
  id: string;
  version: string; // v1.0, v1.1, v2.0
  createdAt: string;
  comment?: string;
  images: string[];
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  status: ProjectStatus;
  area: number;
  serviceType: string;
  totalAmount: number;
  currency: "UAH" | "USD" | "EUR";
  files: ProjectFile[];
  versions: RenderVersion[];
  createdAt: string;
}