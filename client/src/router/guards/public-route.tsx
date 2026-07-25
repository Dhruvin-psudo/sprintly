import { getAccessToken } from "@/api";
import { Navigate, Outlet } from "react-router-dom";
import { PRIVATE_ROUTES } from "../constants/routes";

export function PublicRoute() {
    const token = getAccessToken()

    if(token) {
        return <Navigate to={PRIVATE_ROUTES.DASHBOARD} replace />
    }

    return <Outlet />
}