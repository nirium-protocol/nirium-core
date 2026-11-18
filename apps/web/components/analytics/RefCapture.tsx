"use client";

import { useEffect } from "react";
import { captureRef } from "@/lib/attribution";

// Guarda el ?ref= de la página de entrada. Sin UI.
export default function RefCapture() {
    useEffect(() => {
        captureRef();
    }, []);
    return null;
}
