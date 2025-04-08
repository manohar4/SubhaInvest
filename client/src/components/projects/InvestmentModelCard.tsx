import { useLocation } from "wouter";
import { useInvestment } from "@/context/InvestmentContext";
import { InvestmentModel } from "@/lib/types";
import { formatCurrency, calculateProjectedAmount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface InvestmentModelCardProps {
  model: InvestmentModel;
  projectId: string;
}

export default function InvestmentModelCard({ model, projectId }: InvestmentModelCardProps) {
  const { selectModel } = useInvestment();
  const [, navigate] = useLocation();
  
  const projectedAmount = calculateProjectedAmount(
    model.minInvestment,
    model.roi,
    model.lockInPeriod
  );
  
  const growthPercentage = Math.round(
    ((projectedAmount - model.minInvestment) / model.minInvestment) * 100
  );
  
  const handleChooseModel = () => {
    selectModel(model);
    navigate(`/projects/${projectId}/model/${model.id}`);
  };
  
  // Determine badge color based on model name
  let badgeColor = '';
  switch (model.name.toLowerCase()) {
    case 'gold':
      badgeColor = 'bg-secondary-500';
      break;
    case 'platinum':
      badgeColor = 'bg-neutral-800';
      break;
    case 'virtual':
      badgeColor = 'bg-primary-600';
      break;
    default:
      badgeColor = 'bg-primary-600';
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden relative">
      <div className={`absolute top-0 right-0 ${badgeColor} text-white px-3 py-1 text-sm font-medium rounded-bl-lg`}>
        {model.name}
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-sm text-neutral-500">Minimum Investment</p>
            <p className="font-medium">{formatCurrency(model.minInvestment)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Expected ROI</p>
            <p className="font-medium text-green-600">{model.roi}% p.a.</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Lock-in Period</p>
            <p className="font-medium">{model.lockInPeriod} years</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Slots Available</p>
            <p className="font-medium">{model.availableSlots}</p>
          </div>
        </div>
        
        <div className="mb-5">
          <p className="text-sm text-neutral-600 mb-2">
            Projected earnings after {model.lockInPeriod} years
          </p>
          <Progress value={growthPercentage} className="h-2 mb-1" />
          <p className="text-sm">
            <span className="font-medium">{formatCurrency(model.minInvestment)}</span>
            <span className="text-neutral-400 mx-2">→</span>
            <span className="font-medium">{formatCurrency(projectedAmount)}</span>
          </p>
        </div>
        
        <div className="pt-3 border-t border-neutral-200">
          <Button 
            className="w-full"
            onClick={handleChooseModel}
          >
            Choose This Model
          </Button>
        </div>
      </div>
    </div>
  );
}
