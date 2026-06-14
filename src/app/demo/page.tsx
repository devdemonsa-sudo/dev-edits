import type { Metadata } from "next";
import { RepasseCheckDemo } from "@/components/repassecheck-demo";

export const metadata: Metadata = {
  title: "RepasseCheck | Demonstração pública",
  description:
    "Veja uma demonstração pública do RepasseCheck com painel de conciliação, alertas, transações e relatório visual para e-commerce.",
  openGraph: {
    description:
      "Demonstração pública do RepasseCheck com painel de conciliação inteligente para recebimentos de e-commerce.",
    title: "RepasseCheck | Demonstração pública",
    type: "website"
  },
  twitter: {
    description: "Demonstração pública do RepasseCheck com painel de conciliação para e-commerce.",
    title: "RepasseCheck | Demonstração pública"
  }
};

export default function DemoPage() {
  return <RepasseCheckDemo />;
}
