import { useLocation } from "wouter";
import { Project } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const [, navigate] = useLocation();
  
  const handleViewInvestmentModels = () => {
    onSelect(project);
    navigate(`/projects/${project.id}`);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden">
      <div className="h-48 bg-neutral-200 relative">
        <img 
          src={project.image} 
          alt={`${project.name} Real Estate Project`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-bold">{project.name}</h3>
          <p className="text-sm">{project.location}</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-neutral-500">Minimum Investment</p>
            <p className="font-medium">{formatCurrency(project.minimumInvestment)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Estimated Returns</p>
            <p className="font-medium text-green-600">{project.estimatedReturns}% p.a.</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Lock-in Period</p>
            <p className="font-medium">{project.lockInPeriod} years</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Available Slots</p>
            <p className="font-medium">{project.availableSlots}</p>
          </div>
        </div>
        
        <div className="pt-3 border-t border-neutral-200">
          <Button 
            className="w-full"
            onClick={handleViewInvestmentModels}
          >
            View Investment Models
          </Button>
        </div>
      </div>
    </div>
  );
}
