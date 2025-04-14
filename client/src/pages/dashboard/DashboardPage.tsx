import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import InvestmentSummary from "@/components/dashboard/InvestmentSummary";
import ActiveInvestments from "@/components/dashboard/ActiveInvestments";
import { Investment, Project } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isBypassMode } = useAuth();
  const {
    investments: contextInvestments,
    projects,
    selectProject,
  } = useInvestment();
  const [, navigate] = useLocation();

  // Only use the query if not in bypass mode
  const { data: apiInvestments, isLoading: isApiLoading } = useQuery<
    Investment[]
  >({
    queryKey: ["/api/investments"],
    enabled: !isBypassMode,
  });

  // Use either context investments (bypass mode) or API investments
  const investments = isBypassMode ? contextInvestments : apiInvestments;
  const isLoading = isBypassMode ? false : isApiLoading;

  const [summaryData, setSummaryData] = useState({
    totalInvested: 0,
    currentValue: 0,
    growthPercentage: 0,
    activeInvestments: 0,
  });

  useEffect(() => {
    if (investments) {
      const totalInvested = investments.reduce(
        (sum, inv) => sum + inv.amount,
        0,
      );

      // Calculate current value with varying growth rates for each investment
      const currentValue = investments.reduce((sum, inv) => {
        // Calculate months since investment
        const investmentDate = new Date(inv.createdAt);
        const currentDate = new Date();
        const monthsDiff =
          (currentDate.getFullYear() - investmentDate.getFullYear()) * 12 +
          (currentDate.getMonth() - investmentDate.getMonth());

        // Monthly growth rate (annual rate / 12)
        const monthlyRate = inv.expectedReturns / 12 / 100;

        // Compound interest formula
        const investmentValue =
          inv.amount * Math.pow(1 + monthlyRate, monthsDiff);
        return sum + investmentValue;
      }, 0);

      // Calculate growth percentage
      const growthPercentage =
        totalInvested > 0
          ? Math.round(((currentValue - totalInvested) / totalInvested) * 100)
          : 0;

      setSummaryData({
        totalInvested,
        currentValue: Math.round(currentValue),
        growthPercentage,
        activeInvestments: investments.length,
      });
    }
  }, [investments]);

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
                Welcome, {user?.name.split(" ")[0]}
              </h2>
              <p className="text-[#6b5c3e]">
                Manage your real estate investments
              </p>
            </div>
            <Card className="border-0 overflow-hidden mb-4">
              <div className="bg-gradient-to-r from-[#c7ab6e60] to-[#a3824a60] text-white">
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
                             
                            </div>
                          </div>

                          <div className="p-4">
                          <span className="text-sm font-bold text-[#000000]"> 
                          <p className="text-sm font-normal">{project.location}</p>
                          {project.name === "Codename Skylife 2100"
                                ? "Future ready apartments"
                                : "Relive the victorian era"}
                           </span>
                            {/* <p className="text-sm text-[#6b5c3e] mb-4">
                              {project.name === "Codename Skylife 2100"
                                ? "120 acres of green luxury with organic farming, events space, and recreational activities."
                                : "Premium residential project with modern amenities and excellent connectivity."}
                            </p> */}
                           
                            <Button
                              className="w-full bg-[#231e1b] hover:bg-[#231e1b]/90 text-white mt-4"
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
            {investments && investments.length > 0 ? (
              <>
                <InvestmentSummary
                  totalInvested={summaryData.totalInvested}
                  currentValue={summaryData.currentValue}
                  growthPercentage={summaryData.growthPercentage}
                  activeInvestments={summaryData.activeInvestments}
                />

                <ActiveInvestments investments={investments} />
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

      {/* Summary Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-6 w-48 mb-3 bg-[#f0e7dc]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg bg-[#f0e7dc]" />
          ))}
        </div>
      </div>

      {/* Investments Skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-36 bg-[#f0e7dc]" />
          <Skeleton className="h-5 w-16 bg-[#f0e7dc]" />
        </div>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-60 w-full rounded-lg bg-[#f0e7dc]" />
          ))}
        </div>
      </div>

      <Skeleton className="h-40 w-full rounded-lg bg-[#f0e7dc]" />
    </>
  );
}
