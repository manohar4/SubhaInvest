import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useInvestment } from "@/context/InvestmentContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import TopNav from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SlotSelectionPageProps {
  projectId: string;
  modelId: string;
}

export default function SlotSelectionPage({ projectId, modelId }: SlotSelectionPageProps) {
  const { 
    projects, 
    selectedProject, 
    selectedModel, 
    selectProject, 
    selectModel,
    selectedSlots,
    totalAmount,
    setSlots 
  } = useInvestment();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Calculate maturity date based on lock-in period
  const maturityDate = selectedModel ? new Date(
    new Date().setFullYear(
      new Date().getFullYear() + selectedModel.lockInPeriod
    )
  ) : new Date();
  
  // Initialize data if needed (in case of direct page access)
  useEffect(() => {
    if (!selectedProject || selectedProject.id !== projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        selectProject(project);
      } else {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive",
        });
        navigate("/projects");
      }
    }
    
    if (!selectedModel || selectedModel.id !== modelId) {
      // Need to fetch model if not already selected
      // For this demo, we'll use mock data
      const mockModels = [
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
      
      const model = mockModels.find(m => m.id === modelId);
      if (model) {
        selectModel(model);
      } else {
        toast({
          title: "Error",
          description: "Investment model not found",
          variant: "destructive",
        });
        navigate(`/projects/${projectId}`);
      }
    }
  }, [projectId, modelId, selectedProject, selectedModel, projects, selectProject, selectModel, toast, navigate]);
  
  const handleIncreaseSlot = () => {
    if (selectedModel && selectedSlots < selectedModel.availableSlots) {
      setSlots(selectedSlots + 1);
    }
  };
  
  const handleDecreaseSlot = () => {
    if (selectedSlots > 1) {
      setSlots(selectedSlots - 1);
    }
  };
  
  const handlePayNow = () => {
    navigate("/payment");
  };
  
  const handleInvestLater = () => {
    toast({
      title: "Investment saved",
      description: "Your investment preferences have been saved for later.",
    });
    navigate("/dashboard");
  };
  
  if (!selectedProject || !selectedModel) {
    return null; // Loading or redirecting
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav 
        title="Select Slots" 
        showBack 
        backTo={`/projects/${projectId}`} 
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6">
        <div className="mb-6">
          <div className="flex items-center mb-1">
            <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
            <span className="ml-2 bg-secondary-500 text-white px-2 py-0.5 text-sm font-medium rounded">
              {selectedModel.name}
            </span>
          </div>
          <p className="text-neutral-500">Select how many slots you want to purchase</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-neutral-200 p-5 mb-6">
          <div className="mb-6">
            <label htmlFor="slot-count" className="block text-sm font-medium text-neutral-700 mb-1">
              Number of Slots
            </label>
            <div className="flex items-center">
              <button 
                className="bg-neutral-100 text-neutral-700 h-10 w-10 flex items-center justify-center rounded-l-md border border-neutral-300"
                onClick={handleDecreaseSlot}
                disabled={selectedSlots <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <input 
                type="text" 
                id="slot-count" 
                className="h-10 w-16 text-center border-y border-neutral-300"
                value={selectedSlots} 
                readOnly
              />
              <button 
                className="bg-neutral-100 text-neutral-700 h-10 w-10 flex items-center justify-center rounded-r-md border border-neutral-300"
                onClick={handleIncreaseSlot}
                disabled={selectedSlots >= selectedModel.availableSlots}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Max {selectedModel.availableSlots} slots available
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-neutral-600">Price per slot</p>
              <p className="font-medium">{formatCurrency(selectedModel.minInvestment)}</p>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <p className="text-neutral-600">Number of slots</p>
              <p className="font-medium">{selectedSlots}</p>
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <p className="font-semibold text-lg">Total investment</p>
              <p className="font-bold text-lg">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-neutral-200 p-5 mb-6">
          <h3 className="font-semibold mb-4">Investment Summary</h3>
          
          <div className="space-y-3 mb-5">
            <div className="flex justify-between items-center">
              <p className="text-neutral-600">Project</p>
              <p className="font-medium">{selectedProject.name}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-neutral-600">Investment Model</p>
              <p className="font-medium">{selectedModel.name}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-neutral-600">Expected ROI</p>
              <p className="font-medium text-green-600">{selectedModel.roi}% p.a.</p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-neutral-600">Lock-in Period</p>
              <p className="font-medium">{selectedModel.lockInPeriod} years</p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-neutral-600">Maturity Date</p>
              <p className="font-medium">{formatDate(maturityDate.toISOString())}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1"
                onClick={handlePayNow}
              >
                Pay Now
              </Button>
              
              <Button 
                className="flex-1"
                variant="outline"
                onClick={handleInvestLater}
              >
                Invest Later
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
