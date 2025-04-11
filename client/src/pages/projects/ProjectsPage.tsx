import { useQuery } from "@tanstack/react-query";
import { useInvestment } from "@/context/InvestmentContext";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import ProjectCard from "@/components/projects/ProjectCard";
import { Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  const { projects, selectProject } = useInvestment();
  const isLoading = false;

  // const { isLoading } = useQuery<Project[]>({
  //   queryKey: ["/api/projects"],
  //   initialData: projects,
  // });
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="Available Projects" showBack backTo="/dashboard" />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6">
        <div className="mb-6">
          <p className="text-neutral-500">Select a project to invest in</p>
        </div>

        {isLoading ? (
          <ProjectsListSkeleton />
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={selectProject}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function ProjectsListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
