"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { notFound, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const CourseDetailPage = () => {
  const params = useParams<{ courseId: Id<"courses"> }>();
  const { user, isLoaded: isUserLoaded } = useUser();

  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });
  const courseData = useQuery(api.courses.getCourseById, {
    courseId: params.courseId,
  });

  const userAccess = useQuery(
    api.users.getUserAccess,
    userData ? { userId: userData._id, courseId: params.courseId } : "skip",
  ) ?? { hasAccess: false };

  // undefined => loading state in convex

  if (!isUserLoaded || courseData === undefined) {
    return <CourseDetailSkeleton />;
  }

  if (courseData === null) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <Image
            src={courseData.imageUrl}
            alt={courseData.title}
            width={1200}
            height={600}
            className="rounded-md object-cover w-full"
          />
        </CardHeader>

        <CardContent>
          <CardTitle className="text-3xl mb-4">{courseData.title}</CardTitle>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetailPage;

function CourseDetailSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="w-full h-[600px] rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
