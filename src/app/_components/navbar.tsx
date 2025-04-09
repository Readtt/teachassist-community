"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "~/components/ui/button";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { authClient, type Session } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import { Banner } from "./banner";
import Logo from "./logo";

const navigationLinks = [
  {
    name: "Dashboard",
    href: "/",
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
  },
] as const;

export default function Navbar({ session }: { session: Session }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          router.push("/login");
        },
        onError: (e) => {
          toast.error(e.error.message ?? "An error occured while logging out");
        },
      },
    });
    setIsLoggingOut(false);
  };

  return (
    <Fragment>
      <Banner />
      <nav className="bg-secondary/75 sticky top-0 z-50 backdrop-blur-md">
        {/* Decorative shapes */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 -left-4 h-16 w-32 rounded-full bg-purple-500/5 blur-2xl" />
          <div className="absolute top-2 left-48 h-12 w-24 rounded-full bg-blue-500/5 blur-2xl" />
          <div className="absolute top-0 right-32 h-16 w-32 rounded-full bg-pink-500/5 blur-2xl" />
        </div>
        <div
          className={cn(
            "flex h-16 items-center border-b py-3",
            isMobileMenuOpen && "border-0",
          )}
        >
          <div className="container">
            <div className="flex items-center justify-between">
              <div
                onClick={() => {
                  router.push("/");
                }}
                className="mr-6 flex cursor-pointer items-center gap-2"
              >
                <Logo className="h-6 w-6" />
                <h1 className="text-md font-semibold tracking-tight md:text-lg">
                  Teachassist Community
                </h1>
              </div>
              <div className="hidden flex-1 gap-2 lg:flex">
                {navigationLinks.map((link) => (
                  <Link
                    className={buttonVariants({
                      variant: pathname === link.href ? "secondary" : "ghost",
                    })}
                    key={link.href}
                    href={link.href}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="hidden items-center gap-4 lg:flex">
                <p className="text-muted-foreground text-sm tracking-tighter">
                  Signed in as {session.user.name}
                </p>
                <ThemeToggle />
                <Button
                  isLoading={isLoggingOut}
                  variant={"outline"}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle className="lg:hidden" />
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  className="lg:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {isMobileMenuOpen ? (
                    <XIcon className="scale-125" />
                  ) : (
                    <MenuIcon className="scale-125" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="border-b py-6">
            <div className="container flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {navigationLinks.map((link) => (
                  <Link
                    className={buttonVariants({
                      variant: pathname === link.href ? "secondary" : "ghost",
                      className: "justify-start",
                    })}
                    key={link.href}
                    href={link.href}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col items-center border-t pt-4">
                <p className="text-muted-foreground mb-2 text-sm">
                  Signed in as {session.user.name}
                </p>
                <Button
                  variant={"outline"}
                  onClick={handleLogout}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </Fragment>
  );
}
