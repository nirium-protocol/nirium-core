import { redirect } from "next/navigation";

// Retired deck; /docs is the maintained, verifiable reference.
export default function Page() {
    redirect("/docs");
}
