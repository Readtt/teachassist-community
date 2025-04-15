"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Separator } from "~/components/ui/separator";

type PaginationControlsProps = {
  currentPage: number;
  maxPages: number;
};

export default function PaginationControls({
  currentPage,
  maxPages,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageHref = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    return `?${params.toString()}`;
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => router.push(createPageHref(currentPage - 1))}
            aria-disabled={currentPage <= 1}
            className={
              currentPage <= 1 ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>

        {/* First Page */}
        <PaginationItem>
          <PaginationLink
            onClick={() => router.push(createPageHref(1))}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>

        {/* Left Ellipsis */}
        {currentPage > 3 && <Separator orientation="vertical" />}

        {/* Pages Around Current */}
        {[-1, 0, 1].map((offset) => {
          const p = currentPage + offset;
          if (p > 1 && p < maxPages) {
            return (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={() => router.push(createPageHref(p))}
                  isActive={currentPage === p}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          }
          return null;
        })}

        {/* Right Ellipsis */}
        {currentPage <= maxPages - 3 && <Separator orientation="vertical" />}

        {/* Last Page */}
        {maxPages > 1 && (
          <PaginationItem>
            <PaginationLink
              onClick={() => router.push(createPageHref(maxPages))}
              isActive={currentPage === maxPages}
            >
              {maxPages}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            onClick={() => router.push(createPageHref(currentPage + 1))}
            aria-disabled={currentPage >= maxPages}
            className={
              currentPage >= maxPages
                ? "pointer-events-none opacity-50"
                : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
