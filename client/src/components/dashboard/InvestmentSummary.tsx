import { formatCurrency } from "@/lib/utils";
import { TrendingUp, IndianRupee, Building2, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InvestmentSummaryProps {
  totalInvested: number;
  currentValue: number;
  growthPercentage: number;
  activeInvestments: number;
}

export default function InvestmentSummary({
  totalInvested,
  currentValue,
  growthPercentage,
  activeInvestments,
}: InvestmentSummaryProps) {
  return (
    <div className="mb-8 hidden">
      <h3 className="text-lg font-semibold mb-3 text-[#231e1b]">
        Investment Summary
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#e3d4bb] bg-gradient-to-br from-white to-[#f8f2ed]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b5c3e] mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-[#231e1b]">
                  {formatCurrency(totalInvested)}
                </p>
              </div>
              <div className="bg-[#c7ab6e] bg-opacity-10 p-2 rounded-full">
                <IndianRupee className="h-5 w-5 text-[#a3824a]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e3d4bb] bg-gradient-to-br from-white to-[#f8f2ed]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b5c3e] mb-1">Current Value</p>
                <p className="text-2xl font-bold text-[#231e1b]">
                  {formatCurrency(currentValue)}
                </p>
                <div className="flex items-center text-[#42855B] text-sm mt-1 font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {growthPercentage}% growth
                </div>
              </div>
              <div className="bg-[#c7ab6e] bg-opacity-10 p-2 rounded-full">
                <PiggyBank className="h-5 w-5 text-[#a3824a]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e3d4bb] bg-gradient-to-br from-white to-[#f8f2ed]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b5c3e] mb-1">
                  Active Investments
                </p>
                <p className="text-2xl font-bold text-[#231e1b]">
                  {activeInvestments}
                </p>
              </div>
              <div className="bg-[#c7ab6e] bg-opacity-10 p-2 rounded-full">
                <Building2 className="h-5 w-5 text-[#a3824a]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
