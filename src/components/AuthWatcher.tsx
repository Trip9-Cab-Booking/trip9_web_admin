"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { logout, selectAccessToken } from "@/store/authSlice";

export default function AuthWatcher() {
    const token = useSelector(selectAccessToken);
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // ignore auth pages
        if (pathname.startsWith("/signin")) return;

        if (!token) {
            dispatch(logout());
            router.replace("/signin");
        }
    }, [token, pathname, dispatch, router]);

    return null;
}
