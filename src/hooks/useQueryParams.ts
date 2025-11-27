'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useTableQueryParams() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const setPage = useCallback((newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPage));
      router.replace(`?${params.toString()}`);
    }, [router, searchParams]);

    const setPageSize = useCallback((newSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('limit', String(newSize));
      params.set('page', '1'); 
      router.replace(`?${params.toString()}`);
    }, [router, searchParams]);

    return {
      page,
      pageSize: limit,
      setPage,
      setPageSize,
    };
  }
