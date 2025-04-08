import { useLocation } from "wouter";
import { Investment } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, BarChart3, IndianRupee, Clock } from "lucide-react";

interface ActiveInvestmentsProps {
  investments: Investment[];
  onViewAll?: () => void;
}

export default function ActiveInvestments({ investments, onViewAll }: ActiveInvestmentsProps) {
  const [, navigate] = useLocation();
  
  if (investments.length === 0) {
    return (
      <div className="mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#231e1b]">Your Investments</h3>
        </div>
        
        <Card className="border-[#e3d4bb] bg-gradient-to-br from-white to-[#f8f2ed]">
          <CardContent className="p-8 text-center">
            <p className="mb-5 text-[#6b5c3e]">You don't have any active investments yet.</p>
            <Button 
              onClick={() => navigate(`/invest/${investments[0]?.projectId || 'subha'}`)}
              className="bg-[#c7ab6e] hover:bg-[#a3824a] text-white"
            >
              Start Investing Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#231e1b]">Your Investments</h3>
      </div>
      
      <div className="space-y-5">
        {investments.map((investment) => (
          <Card key={investment.id} className="overflow-hidden border-[#e3d4bb] bg-gradient-to-br from-white to-[#f8f2ed]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold text-[#231e1b] text-lg">{investment.projectName}</h4>
                <Badge variant="outline" className={`
                  ${investment.status === 'active' 
                    ? 'bg-[#EFF6E9] text-[#42855B] border-[#BFD9B8]' 
                    : 'bg-[#E9EFF6] text-[#4267A3] border-[#B8C5D9]'}
                `}>
                  {investment.status === 'active' ? 'Active' : 'Completed'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                <div className="flex items-start">
                  <div className="bg-[#c7ab6e] bg-opacity-10 p-1.5 rounded mr-2 mt-0.5">
                    <IndianRupee className="h-4 w-4 text-[#a3824a]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6b5c3e]">Investment</p>
                    <p className="font-medium text-[#231e1b]">{formatCurrency(investment.amount)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#c7ab6e] bg-opacity-10 p-1.5 rounded mr-2 mt-0.5">
                    <BarChart3 className="h-4 w-4 text-[#a3824a]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6b5c3e]">Returns</p>
                    <p className="font-medium text-[#231e1b]">{investment.expectedReturns}% p.a.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#c7ab6e] bg-opacity-10 p-1.5 rounded mr-2 mt-0.5">
                    <Clock className="h-4 w-4 text-[#a3824a]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6b5c3e]">Lock-in</p>
                    <p className="font-medium text-[#231e1b]">{investment.lockInPeriod} years</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#c7ab6e] bg-opacity-10 p-1.5 rounded mr-2 mt-0.5">
                    <Calendar className="h-4 w-4 text-[#a3824a]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6b5c3e]">Maturity</p>
                    <p className="font-medium text-[#231e1b]">{formatDate(investment.maturityDate)}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#e3d4bb] flex justify-between items-center">
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-[#c7ab6e] bg-opacity-10 text-[#a3824a] rounded-full text-xs font-medium">
                    {investment.modelName}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#c7ab6e] text-[#a3824a] hover:bg-[#c7ab6e] hover:bg-opacity-10 hover:text-[#8b6f3e]"
                  onClick={() => navigate("/dashboard")}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
