// app/(staff)/layout.js — kerangka Area Instruktur: sidebar Ink, tanpa navbar situs.
import StaffShell from "@/components/instructor/StaffShell";

export default function StaffLayout({ children }) {
  return <StaffShell>{children}</StaffShell>;
}
