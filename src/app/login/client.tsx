"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import Logo from "../_components/logo";
import { loginSchema } from "~/common/types/login";

export default function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      studentNumber: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    await authClient.signUp.email(
      {
        email: values.studentNumber + "@gapps.yrdsb.ca",
        password: values.password,
        name: values.studentNumber,
      },
      {
        onSuccess: () => {
          toast.success("Account created successfully.");
          redirect("/");
        },
        onError: async (ctx) => {
          if (ctx.error.code === "USER_ALREADY_EXISTS") {
            await authClient.signIn.email(
              {
                email: values.studentNumber + "@gapps.yrdsb.ca",
                password: values.password,
              },
              {
                onSuccess: () => {
                  redirect("/");
                },
                onError: (e) => {
                  toast.error(e.error.message);
                },
              }
            );
          }

          toast.error(ctx.error.message);
        },
      }
    );

    setIsLoading(false);
  }

  return (
    <section className="h-screen flex items-center">
      <div className="container">
        <div className="grid lg:grid-cols-2">
          <div className="relative overflow-hidden py-10">
            <div className="mx-auto my-auto flex h-full w-full max-w-md flex-col justify-center gap-4 p-6">
              <div className="mb-6 flex flex-col items-center text-center">
                <Link href="/" className="mb-6 flex items-center gap-2">
                  <Logo className="w-8 h-8" />
                  <h1 className="text-2xl font-bold">Teachassist Community</h1>
                </Link>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="studentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Number</FormLabel>
                        <FormControl>
                          <Input placeholder="000000000" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your school student number
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
                        <FormDescription>
                          This is encrypted and cannot be seen by anyone.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button disabled={isLoading} type="submit" variant={"highlight"} className="w-full">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          <div className="hidden lg:block h-full max-h-screen rounded-md border bg-background/70 relative overflow-clip">
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -left-4 top-0 h-32 w-64 rounded-full bg-purple-500/70 blur-3xl" />
              <div className="absolute left-48 top-2 h-24 w-48 rounded-full bg-blue-500/70 blur-3xl" />
              <div className="absolute right-32 top-0 h-32 w-64 rounded-full bg-pink-500/70 blur-3xl" />
              <div className="absolute bottom-32 -left-8 h-48 w-72 rounded-full bg-green-500/70 blur-3xl" />
              <div className="absolute -bottom-8 right-16 h-40 w-80 rounded-full bg-yellow-500/70 blur-3xl" />
            </div>
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome to Teachassist Community!
              </h1>
              <div className="max-w-md space-y-4">
                <p className="text-lg text-muted-foreground">
                  Track your grades, view class averages, and compare your
                  performance with other students - all in one place.
                </p>
              </div>
            </div>
          </div>

          {/* <img
            src="https://shadcnblocks.com/images/block/placeholder-1.svg"
            alt="placeholder"
            className="hidden h-full max-h-screen rounded-md object-cover lg:block"
          /> */}
        </div>
      </div>
    </section>
  );
}
