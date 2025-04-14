import { useEffect } from "react";
import { useLocation } from "wouter";
import { collection, onSnapshot } from "firebase/firestore";
import { firestoreDb } from "../../firebaseConfig.js";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InvestmentSummary from "@/components/dashboard/InvestmentSummary";
import ActiveInvestments from "@/components/dashboard/ActiveInvestments";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { projects, selectProject, isLoading, investments } = useInvestment();

  // Set up real-time listener for projects
  // useEffect(() => {
  //   const projectsRef = collection(firestoreDb, "projects");
  //   const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
  //     const projectsData = snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //   });

  //   return () => unsubscribe();
  // }, []);

  console.log("investments", investments);
  console.log("projects", projects);
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="Invest" />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2 text-[#231e1b]">
                Welcome, {user?.name?.split(" ")[0]}
              </h2>
              <p className="text-[#6b5c3e]">
                Manage your real estate investments
              </p>
            </div>

            {/* Portfolio Growth Card */}
            <Card className="border-0 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-[#c7ab6e60] to-[#a3824a60]">
                <CardContent className="p-7">
                  <div className="flex flex-col">
                    <div className="mb-5">
                      <h3 className="text-xl font-semibold mb-2 text-[#231e1b]">
                        Ready to grow your portfolio?
                      </h3>
                      <p className="text-[#231e1b] text-opacity-90">
                        Choose a project to start investing and diversify your
                        real estate assets.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                      {projects.slice(0, 2).map((project) => (
                        <div
                          key={project.id}
                          className="bg-white rounded-lg overflow-hidden shadow-lg"
                        >
                          <div className="h-40 bg-neutral-200 relative">
                            <img
                              src={project.image}
                              alt={project.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-3 text-white">
                              <h3 className="text-lg font-bold">
                                {project.name}
                              </h3>
                              <p className="text-sm">{project.location}</p>
                            </div>
                          </div>

                          <div className="p-4">
                            <p className="text-sm text-[#6b5c3e] mb-4">
                              {project.title}
                            </p>

                            <Button
                              className="w-full bg-[#231e1b] hover:bg-[#231e1b]/90 text-white"
                              onClick={() => {
                                selectProject(project);
                                navigate(`/invest/${project.id}`);
                              }}
                            >
                              Start Investment
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
            {/* Investments Section */}
            {investments && investments.length > 0 ? (
              <>
                <div className="mb-8">
                  <InvestmentSummary
                    totalInvested={investments.reduce(
                      (sum, inv) => sum + inv.amount,
                      0
                    )}
                    currentValue={investments.reduce((sum, inv) => {
                      const monthsSinceInvestment = Math.floor(
                        (new Date().getTime() -
                          new Date(inv.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24 * 30)
                      );
                      const monthlyRate = inv.expectedReturns / 12 / 100;
                      return (
                        sum +
                        inv.amount *
                          Math.pow(1 + monthlyRate, monthsSinceInvestment)
                      );
                    }, 0)}
                    growthPercentage={
                      investments.reduce(
                        (avg, inv) => avg + inv.expectedReturns,
                        0
                      ) / investments.length
                    }
                    activeInvestments={investments.length}
                  />
                  <ActiveInvestments investments={investments} />
                </div>
              </>
            ) : (
              <div className="mt-8 p-6 border border-dashed border-[#e3d4bb] rounded-lg text-center">
                <p className="text-[#6b5c3e] mb-2">
                  You don't have any active investments yet.
                </p>
                <p className="text-sm text-[#a3824a] mb-4">
                  Start investing in one of our featured projects.
                </p>
                {projects.length > 0 && (
                  <Button
                    onClick={() => {
                      if (projects.length > 0) {
                        selectProject(projects[0]);
                        navigate(`/invest/${projects[0].id}`);
                      }
                    }}
                    className="bg-[#231e1b] hover:bg-[#231e1b]/90 text-white"
                  >
                    Start Investing Now
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2 bg-[#f0e7dc]" />
        <Skeleton className="h-5 w-72 bg-[#f0e7dc]" />
      </div>

      {/* Portfolio Card Skeleton */}
      <Skeleton className="h-[500px] w-full rounded-lg bg-[#f0e7dc] mb-8" />

      {/* Investment Summary Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-6 w-48 mb-3 bg-[#f0e7dc]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg bg-[#f0e7dc]" />
          ))}
        </div>
      </div>

      {/* Active Investments Skeleton */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-60 w-full rounded-lg bg-[#f0e7dc]" />
        ))}
      </div>
    </>
  );
}
