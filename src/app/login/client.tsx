"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { loginSchema } from "~/common/types/client-login";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";
import { schoolIdentifierToAcronym, studentIdToEmail } from "~/lib/utils";
import Logo from "../_components/logo";
import { doesUserExistByEmail } from "./actions";

export default function Login({
  TRUSTED_SCHOOLS,
}: {
  TRUSTED_SCHOOLS: string[];
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      studentId: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    const userExists = await doesUserExistByEmail(
      studentIdToEmail(values.studentId),
    );

    if (userExists) {
      await authClient.signIn.email(
        {
          email: studentIdToEmail(values.studentId),
          password: values.password,
        },
        {
          onSuccess: () => {
            redirect("/");
          },
          onError: async (ctx) => {
            toast.error(
              ctx.error.message ??
                "There was an issue encountered while signing in.",
            );
          },
        },
      );
    } else {
      await authClient.signUp.email(
        {
          email: studentIdToEmail(values.studentId),
          password: values.password,
          name: values.studentId,
          taPassword: values.password,
          studentId: values.studentId,
        },
        {
          onSuccess: () => {
            toast.success("Account created successfully.");
            redirect("/?created=true");
          },
          onError: (e) => {
            toast.error(
              e.error.message ??
                "There was an issue encountered while signing up.",
            );
          },
        },
      );
    }

    setIsLoading(false);
  }

  const MAX_SCHOOLS_SHOWN = 10;
  const shownSchools = TRUSTED_SCHOOLS.slice(0, MAX_SCHOOLS_SHOWN);
  const remainingSchools = Math.max(TRUSTED_SCHOOLS.length - shownSchools.length, 0);

  const GITHUB_URL = "https://github.com/Readtt/teachassist-community";

  return (
    <section className="flex h-screen items-center">
      <div className="container">
        <div className="grid lg:grid-cols-2">
          <div className="relative overflow-hidden py-10">
            <div className="mx-auto my-auto flex h-full w-full max-w-md flex-col justify-center gap-4 p-6">
              <div className="mb-6 flex flex-col items-center gap-2 text-center">
                <Link
                  href="/"
                  className="flex flex-col items-center gap-2 md:flex-row"
                >
                  <Logo className="h-8 w-8" />
                  <h1 className="text-xl font-bold">Teachassist Community</h1>
                  <p className="text-muted-foreground text-center text-sm italic">
                    All rankings are anonymous — no names shown.
                  </p>
                </Link>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Number</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your 9-digit YRDSB student number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    isLoading={isLoading}
                    type="submit"
                    variant={"highlight"}
                    className="w-full"
                  >
                    Login
                  </Button>
                </form>
              </Form>

              {/* ✅ GitHub link */}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-2 text-xs"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.69c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.54 2.36 1.1 2.94.84.09-.65.35-1.1.63-1.35-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.71.11 2.51.33 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
                </svg>
                View on GitHub
              </a>

              <div className="text-muted-foreground space-y-1 text-center text-xs">
                <p>
                  Trusted by students from {TRUSTED_SCHOOLS.length}+ schools:
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-x-2 gap-y-1">
                  {shownSchools.map((school, i) => (
                    <span
                      key={i}
                      className="bg-muted rounded px-2 py-0.5 text-xs"
                    >
                      {schoolIdentifierToAcronym(school)}
                    </span>
                  ))}

                  {remainingSchools > 0 && (
                    <span className="bg-muted rounded px-2 py-0.5 text-xs">
                      +{remainingSchools} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background/70 relative hidden h-full max-h-screen overflow-clip rounded-md border lg:block">
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute top-0 -left-4 h-32 w-64 rounded-full bg-purple-500/70 blur-3xl" />
              <div className="absolute top-2 left-48 h-24 w-48 rounded-full bg-blue-500/70 blur-3xl" />
              <div className="absolute top-0 right-32 h-32 w-64 rounded-full bg-pink-500/70 blur-3xl" />
              <div className="absolute bottom-32 -left-8 h-48 w-72 rounded-full bg-green-500/70 blur-3xl" />
              <div className="absolute right-16 -bottom-8 h-40 w-80 rounded-full bg-yellow-500/70 blur-3xl" />
            </div>
            <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome to Teachassist Community!
              </h1>
              <div className="max-w-md space-y-4">
                <p className="text-muted-foreground text-lg">
                  Track your grades, view class averages, and compare your
                  performance with other students - all in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
