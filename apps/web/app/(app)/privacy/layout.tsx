import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/privacy",
    title: "Aviso de Privacidad | Privacy Policy",
    description: "Aviso de privacidad y política de protección de datos personales aplicable al uso de Nirium Protocol.",
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
