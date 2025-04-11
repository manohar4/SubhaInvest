import { useInvestment } from "@/context/InvestmentContext";
import { useAuth } from "@/context/AuthContext";
import { Investment } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  getInitials,
} from "@/lib/utils";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user } = useAuth();

  const { investments, isLoading } = useInvestment();

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="My Profile" showBack backTo="/dashboard" />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6">
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-200 flex items-center justify-center text-primary-900 font-bold text-xl">
                {getInitials(user.name)}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-neutral-500">
                  {formatPhoneNumber(user.phoneNumber)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Investment History</h3>

            {isLoading ? (
              <InvestmentHistorySkeleton />
            ) : investments && investments.length > 0 ? (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div
                    key={investment.id}
                    className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium">
                        {investment.projectName} - {investment.modelName}
                      </h4>
                      <Badge
                        variant={
                          investment.status === "active"
                            ? "outline"
                            : "secondary"
                        }
                        className={
                          investment.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-neutral-200 text-neutral-700"
                        }
                      >
                        {investment.status === "active"
                          ? "Active"
                          : "Completed"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <p className="text-neutral-500">Investment Date</p>
                        <p>{formatDate(investment.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Amount</p>
                        <p>{formatCurrency(investment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">
                          {investment.status === "active"
                            ? "Expected ROI"
                            : "Returns"}
                        </p>
                        <p className="text-green-600">
                          {investment.expectedReturns}% p.a.
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Maturity Date</p>
                        <p>{formatDate(investment.maturityDate)}</p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <Button variant="link" className="text-xs p-0 h-auto">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-neutral-500 mb-4">
                  You don't have any investments yet.
                </p>
                <Button onClick={() => (window.location.href = "/dashboard")}>
                  Start Investing Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

function InvestmentHistorySkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border-b border-neutral-200 pb-4 last:border-0">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="mb-2">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>

          <Skeleton className="h-4 w-24 mt-2" />
        </div>
      ))}
    </div>
  );
}
