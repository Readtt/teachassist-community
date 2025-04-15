import { ChevronRight } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "~/components/ui/card";
import { auth } from "~/server/auth";
import { getUserClasses, searchClasses } from "~/server/queries";
import PaginationControls from "./_components/pagination-controls";
import Search from "./_components/search";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q: string | undefined;
    page: string | undefined;
  }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { q: qParam, page: pageParam } = await searchParams;
  const userClasses = await getUserClasses();
  let searchResults: Awaited<ReturnType<typeof searchClasses>> = {
    results: [],
    totalPages: 1,
  };
  const page = parseInt(pageParam ?? "1");

  if (qParam !== undefined) {
    searchResults = await searchClasses(qParam, page);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Search />
        {qParam === undefined ? (
          <div className="flex flex-col gap-2">
            <h1 className="mb-2 text-2xl font-semibold">Active Classes</h1>
            {userClasses.length === 0 ? (
              <Card className="flex w-full flex-row items-center justify-between px-4 py-4">
                <div className="flex flex-col justify-center">
                  <p className="font-medium">
                    Waiting for your classes to be added...
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Check back soon or contact your teacher. When you&apos;re
                    ready, sync your data!
                  </p>
                </div>
              </Card>
            ) : (
              userClasses.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/leaderboard/class/${cls.code}?school=${cls.schoolIdentifier}`}
                >
                  <Card className="flex w-full cursor-pointer flex-row items-center justify-between px-4 py-2">
                    <div className="flex flex-col justify-center">
                      <p className="text-xs">{cls.code}</p>
                      <p className="font-semibold">
                        {cls.name ?? cls.code}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {cls.schoolIdentifier}
                      </p>
                    </div>
                    <ChevronRight />
                  </Card>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h1 className="mb-2 text-2xl font-semibold">Search Results</h1>
            {searchResults.results.length === 0 ? (
              <Card className="flex w-full flex-row items-center justify-between px-4 py-4">
                <div className="flex flex-col justify-center">
                  <p className="font-medium">No results found.</p>
                  <p className="text-muted-foreground text-xs">
                    Try searching with a different term or check your spelling.
                    You can search codes, classes and schools.
                  </p>
                </div>
              </Card>
            ) : (
              searchResults.results.map((cls) => (
                <Link
                  key={cls.code + cls.schoolIdentifier + cls.name}
                  href={`/leaderboard/class/${cls.code}?school=${cls.schoolIdentifier}`}
                >
                  <Card className="flex w-full cursor-pointer flex-row items-center justify-between px-4 py-2">
                    <div className="flex flex-col justify-center">
                      <p className="text-xs">{cls.code}</p>
                      <p className="font-semibold">
                        {cls.name ?? cls.code}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {cls.schoolIdentifier}
                      </p>
                    </div>
                    <ChevronRight />
                  </Card>
                </Link>
              ))
            )}
            <PaginationControls
              currentPage={page}
              maxPages={searchResults.totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
