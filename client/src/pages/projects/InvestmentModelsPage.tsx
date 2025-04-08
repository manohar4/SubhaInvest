import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useInvestment } from "@/context/InvestmentContext";
import { InvestmentModel } from "@/lib/types";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import InvestmentModelCard from "@/components/projects/InvestmentModelCard";
import { Skeleton } from "@/components/ui/skeleton";

interface InvestmentModelsPageProps {
  projectId: string;
}

export default function InvestmentModelsPage({ projectId }: InvestmentModelsPageProps) {
  const { projects, selectedProject, selectProject } = useInvestment();
  const [models, setModels] = useState<InvestmentModel[]>([]);
  
  useEffect(() => {
    // If project is not already selected, find it by ID
    if (!selectedProject || selectedProject.id !== projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        selectProject(project);
      }
    }
  }, [projectId, projects, selectedProject, selectProject]);

  // Load models for this project
  const { data: investmentModels, isLoading } = useQuery<InvestmentModel[]>({
    queryKey: [`/api/projects/${projectId}/models`],
    enabled: !!projectId,
    initialData: () => {
      // Mock models data based on requirements
      if (projectId) {
        return [
          {
            id: "gold",
            name: "Gold",
            minInvestment: 100000,
            roi: 12,
            lockInPeriod: 3,
            availableSlots: 5,
            projectId
          },
          {
            id: "platinum",
            name: "Platinum",
            minInvestment: 100000,
            roi: 14,
            lockInPeriod: 4,
            availableSlots: 3,
            projectId
          },
          {
            id: "virtual",
            name: "Virtual",
            minInvestment: 100000,
            roi: 10,
            lockInPeriod: 2,
            availableSlots: 10,
            projectId
          }
        ];
      }
      return [];
    }
  });

  useEffect(() => {
    if (investmentModels) {
      setModels(investmentModels);
    }
  }, [investmentModels]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav 
        title="Investment Models" 
        showBack 
        backTo="/projects" 
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">
            {selectedProject?.name || ''}
          </h2>
          <p className="text-neutral-500">Select an investment model</p>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {models.map((model) => (
              <InvestmentModelCard 
                key={model.id}
                model={model}
                projectId={projectId}
              />
            ))}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
