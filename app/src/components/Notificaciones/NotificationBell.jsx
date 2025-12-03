import { Bell } from "lucide-react";
import { useNotification } from "./useNotification";

export default function NotificationBell() {

    const { sinLeer, togglePanel } = useNotification();

    return (
        <button
            onClick={togglePanel}
            className="relative p-2 rounded-full hover:bg-white/10 transition"
        >
            <Bell className="h-6 w-6 text-white" />

            {sinLeer > 0 && (
                <span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold 
                               w-5 h-5 flex items-center justify-center rounded-full animate-pulse"
                >
                    {sinLeer}
                </span>
            )}
        </button>
    );
}
