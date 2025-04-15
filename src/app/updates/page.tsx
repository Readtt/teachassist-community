import { Globe, Layers, Sparkles, Zap } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { Fragment } from "react";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { auth } from "~/server/auth";
import Navbar from "../_components/navbar";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  eta?: number; // months from now
  completed?: boolean;
}

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/login");

  const features: Feature[] = [
    {
      icon: <Zap className="h-6 w-6 text-green-500" />,
      title: "Global Class Switch",
      description:
        "Seamlessly switch from viewing just your own class section to seeing data across all sections of the same course — for example, jump from MCV4U1-4 to the global view of MCV4U1.",
      eta: 0,
      completed: true,
    },
    {
      icon: <Layers className="h-6 w-6 text-blue-500" />,
      title: "Class Search Functionality",
      description:
        "Quickly find and explore any class, including your own and your friends’, with a powerful and intuitive search experience.",
      eta: 0,
      completed: true,
    },
    {
      icon: <Sparkles className="h-6 w-6 text-purple-500" />,
      title: "Automated Weekly Sync",
      description:
        "Never miss an update. Your grades and data sync automatically every week — especially around midterms and final report periods.",
      eta: 2,
      completed: false,
    },
    {
      icon: <Globe className="h-6 w-6 text-orange-500" />,
      title: "School Identifier Feature",
      description:
        "Easily distinguish between classes from your main school and those from other schools — perfect for night, summer, or remote learning programs.",
      eta: 0,
      completed: true,
    },
  ].sort((a, b) => {
    if (a.completed === b.completed) {
      return a.eta - b.eta;
    }
    return b.completed ? 1 : -1;
  });

  return (
    <Fragment>
      <Navbar session={session} />
      <div className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">Roadmap</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Exciting new features are on the horizon. Here&apos;s what
            we&apos;re working on next.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group relative flex cursor-pointer flex-col overflow-hidden ${
                feature.completed
                  ? "border-green-500 bg-green-500/20 hover:border-green-500/60 hover:bg-green-500/15"
                  : ""
              }`}
            >
              <div className="absolute top-0 right-0">
                <Badge
                  variant="secondary"
                  className={`m-3 backdrop-blur-sm ${
                    feature.completed
                      ? "bg-green-500 text-white"
                      : "bg-secondary/80"
                  }`}
                >
                  {feature.completed ? "Completed" : "Coming Soon"}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <div className="bg-primary/5 mb-4 w-fit rounded-lg p-2">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>

              {/* Pushes the footer to the bottom */}
              <CardContent className="flex-grow" />

              <CardFooter>
                <div className="text-muted-foreground text-sm">
                  {feature.completed ? (
                    <span className="font-medium">Completed</span>
                  ) : (
                    <>
                      Expected in:{" "}
                      <span className="font-medium">
                        {feature.eta} month{feature.eta === 1 ? "" : "s"}
                      </span>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Fragment>
  );
}
