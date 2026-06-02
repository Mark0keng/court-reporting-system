export interface UserInput {
  name: string;
  email: string;
  role: "admin" | "reporter" | "editor";
  baseRate: number;
  location?: string;
  availability?: boolean;
}

export interface User extends UserInput {
  id: number;
  createdAt: string;
  activeJobsCount: number;
}

export const formatRate = (rate: number, role: User["role"]) => {
  if (role === "admin") return "N/A (Monthly Salary)";

  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(rate);

  return role === "reporter"
    ? `${formatted} / min`
    : `${formatted} (Flat / File)`;
};

export const getRoleBadgeClass = (role: User["role"]) => {
  return `badge-role role-${role}`;
};

export const getRoleLabel = (role: User["role"]) => {
  const labels: Record<User["role"], string> = {
    admin: "Administrator",
    reporter: "Court Reporter",
    editor: "Transcript Editor",
  };
  return labels[role] || role;
};
