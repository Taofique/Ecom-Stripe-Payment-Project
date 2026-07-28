import { api } from "../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { getCourses, getCourseById } from "../../../convex/courses";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Show, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import PurchaseButton from "@/components/PurchaseButton";

const page = async () => {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const courses = await convex.query(api.courses.getCourses);
  return (
    <div className="flex-grow container mx-auto px-4 py-16">
      <h1 className="flex text-3xl justify-center font-bold mb-8">
        All Courses
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {courses.map((course) => (
          <Card key={course._id} className="flex flex-col h-full">
            <Link
              href={`/courses/${course._id}`}
              className="cursor-pointer flex-1"
            >
              <CardHeader>
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  width={640}
                  height={360}
                  className="rounded-md object-cover w-full h-auto"
                />
              </CardHeader>
              <CardContent className="flex-grow">
                <CardTitle className="text-xl mb-2 hover:underline">
                  {course.title}
                </CardTitle>
              </CardContent>
            </Link>

            <CardFooter className="flex justify-between items-center pt-4 border-t mt-auto">
              <Badge variant="default" className="text-lg px-3 py-1">
                ${course.price.toFixed(2)}
              </Badge>

              <Show when="signed-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-2"
                >
                  <PurchaseButton courseId={course._id} />
                </Button>
              </Show>

              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center gap-2"
                  >
                    Enroll Now
                  </Button>
                </SignInButton>
              </Show>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default page;
