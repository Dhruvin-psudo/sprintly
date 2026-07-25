import { getAccessToken } from "@/api";
import { Navigate, Outlet } from "react-router-dom";
import { PUBLIC_ROUTES } from "../constants/routes";

export function ProtectedRoute() {
    const token = getAccessToken();

    if(!token) {
        return <Navigate to={PUBLIC_ROUTES.LOGIN} replace />
    }

    return <Outlet />
}