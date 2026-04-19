import React from "react";
import { Loader2 } from "lucide-react";

export default function Loader({ className = "" }) {
    return (
        <div className={`flex justify-center items-center h-full w-full p-8 ${className}`}>
            <Loader2 className="w-8 h-8 animate-spin text-dusty-orange" />
        </div>
    );
}
