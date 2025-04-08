import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useInvestment } from "@/context/InvestmentContext";
import { Project, InvestmentModel } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Check, ArrowLeft, ArrowRight, Building2, MapPin, Calendar, Banknote, PercentCircle, Clock, Plus, Minus } from "lucide-react";

interface InvestmentDraft {
  projectId: string;
  modelId: string | null;
  slots: number;
  quantity: number;
  step: number;
}

const STEPS = [
  "Explore Project",
  "Choose Investment Model",
  "Choose Slots",
  "Investment Summary"
];

export default function InvestPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { 
    projects, 
    selectProject, 
    selectModel, 
    setSlots, 
    selectedProject, 
    selectedModel,
    selectedSlots,
    totalAmount,
    createInvestment,
    isLoading
  } = useInvestment();

  const [currentStep, setCurrentStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [models, setModels] = useState<InvestmentModel[]>([]);
  
  // Handle draft loading/saving
  const [draft, setDraft] = useState<InvestmentDraft | null>(null);

  useEffect(() => {
    // Load draft from localStorage if exists
    const savedDraft = localStorage.getItem(`investDraft_${projectId}`);
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft) as InvestmentDraft;
      setDraft(parsedDraft);
      // Prompt user to continue draft
      setTimeout(() => {
        const shouldContinue = confirm("You have an unfinished investment draft for this project. Would you like to continue?");
        if (shouldContinue) {
          // Restore draft state
          setCurrentStep(parsedDraft.step);
          setSlots(parsedDraft.slots);
          setQuantity(parsedDraft.quantity);
          
          // Find and select the project
          const project = projects.find(p => p.id === parsedDraft.projectId);
          if (project) {
            selectProject(project);
          }
          
          // Find and select the model if we're past step 1
          if (parsedDraft.modelId && parsedDraft.step > 1) {
            const projectModels = getModelsByProject(parsedDraft.projectId);
            setModels(projectModels);
            const model = projectModels.find(m => m.id === parsedDraft.modelId);
            if (model) {
              selectModel(model);
            }
          }
        } else {
          // Clear draft
          localStorage.removeItem(`investDraft_${projectId}`);
          setDraft(null);
        }
      }, 500);
    }
  }, [projectId]);

  // Save draft whenever important values change
  useEffect(() => {
    if (selectedProject && currentStep >= 0) {
      const draftData: InvestmentDraft = {
        projectId: selectedProject.id,
        modelId: selectedModel?.id || null,
        slots: selectedSlots,
        quantity: quantity,
        step: currentStep
      };
      localStorage.setItem(`investDraft_${projectId}`, JSON.stringify(draftData));
    }
  }, [selectedProject, selectedModel, selectedSlots, quantity, currentStep, projectId]);

  useEffect(() => {
    // Find the project by ID
    const project = projects.find(p => p.id === projectId);
    if (project) {
      selectProject(project);
    } else {
      toast({
        title: "Project not found",
        description: "The requested project could not be found.",
        variant: "destructive"
      });
      navigate("/dashboard");
    }
  }, [projectId, projects, selectProject, navigate, toast]);

  // Function to get mock models for a project
  const getModelsByProject = (pid: string): InvestmentModel[] => {
    // Gold, platinum, virtual models as per requirements
    const mockModels: Record<string, InvestmentModel[]> = {
      'subha-farms': [
        {
          id: "gold",
          name: "Gold",
          minInvestment: 100000,
          roi: 12,
          lockInPeriod: 3,
          availableSlots: 10,
          projectId: pid
        },
        {
          id: "platinum",
          name: "Platinum",
          minInvestment: 150000,
          roi: 14,
          lockInPeriod: 4,
          availableSlots: 5,
          projectId: pid
        },
        {
          id: "virtual",
          name: "Virtual",
          minInvestment: 75000,
          roi: 10,
          lockInPeriod: 2,
          availableSlots: 15,
          projectId: pid
        }
      ],
      'subha': [
        {
          id: "gold",
          name: "Gold",
          minInvestment: 75000,
          roi: 12,
          lockInPeriod: 3,
          availableSlots: 10,
          projectId: pid
        },
        {
          id: "platinum",
          name: "Platinum",
          minInvestment: 75000,
          roi: 14,
          lockInPeriod: 4,
          availableSlots: 5,
          projectId: pid
        },
        {
          id: "virtual",
          name: "Virtual",
          minInvestment: 75000,
          roi: 10,
          lockInPeriod: 2,
          availableSlots: 15,
          projectId: pid
        }
      ],
      'grand-courtyard': [
        {
          id: "gold",
          name: "Gold",
          minInvestment: 200000,
          roi: 15,
          lockInPeriod: 5,
          availableSlots: 6,
          projectId: pid
        },
        {
          id: "platinum",
          name: "Platinum",
          minInvestment: 250000,
          roi: 17.5,
          lockInPeriod: 6,
          availableSlots: 3,
          projectId: pid
        },
        {
          id: "virtual",
          name: "Virtual",
          minInvestment: 150000,
          roi: 13,
          lockInPeriod: 4,
          availableSlots: 10,
          projectId: pid
        }
      ]
    };

    return mockModels[pid] || [];
  };

  // Load models for the selected project
  useEffect(() => {
    if (selectedProject) {
      const projectModels = getModelsByProject(selectedProject.id);
      setModels(projectModels);
    }
  }, [selectedProject]);

  const handleNextStep = () => {
    if (currentStep === 0) {
      // Moving from Project Details to Investment Models
      if (!selectedProject) {
        toast({
          title: "Project not selected",
          description: "Please select a project to continue.",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Moving from Investment Models to Choose Slots
      if (!selectedModel) {
        toast({
          title: "Investment model not selected",
          description: "Please select an investment model to continue.",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Moving from Choose Slots to Summary
      if (selectedSlots <= 0) {
        toast({
          title: "Invalid selection",
          description: "Please select at least one slot to continue.",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep(3);
    }
    // Update the draft
    if (selectedProject) {
      const draftData: InvestmentDraft = {
        projectId: selectedProject.id,
        modelId: selectedModel?.id || null,
        slots: selectedSlots,
        quantity: quantity,
        step: currentStep + 1
      };
      localStorage.setItem(`investDraft_${projectId}`, JSON.stringify(draftData));
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Update the draft
      if (selectedProject) {
        const draftData: InvestmentDraft = {
          projectId: selectedProject.id,
          modelId: selectedModel?.id || null,
          slots: selectedSlots,
          quantity: quantity,
          step: currentStep - 1
        };
        localStorage.setItem(`investDraft_${projectId}`, JSON.stringify(draftData));
      }
    }
  };

  const handleModelSelect = (model: InvestmentModel) => {
    selectModel(model);
  };

  const handleSlotsChange = (newSlots: number) => {
    if (newSlots >= 1 && selectedModel && newSlots <= selectedModel.availableSlots) {
      setSlots(newSlots);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleContactSales = () => {
    toast({
      title: "Success!",
      description: "Your investment process is successfully started. Our sales team will reach out to you shortly. You can view this application anytime under 'My Investments'.",
    });
    navigate("/dashboard");
    
    // Clear the draft
    localStorage.removeItem(`investDraft_${projectId}`);
  };
  
  const handleSaveDraft = () => {
    if (!selectedProject) return;
    
    // Create a draft object to save
    const draftData = {
      projectId: selectedProject.id,
      modelId: selectedModel?.id || null,
      slots: selectedSlots,
      quantity: quantity,
      step: currentStep
    };
    
    // Save to localStorage
    localStorage.setItem(`investDraft_${projectId}`, JSON.stringify(draftData));
    
    toast({
      title: "Draft Saved",
      description: "Your investment draft has been saved. You can continue later.",
    });
  };
  
  const handleCompleteInvestment = () => {
    if (selectedModel && selectedSlots > 0) {
      // Create the investment
      createInvestment()
        .then((success) => {
          if (success) {
            // Clear the draft
            localStorage.removeItem(`investDraft_${projectId}`);
            
            // Show success toast
            toast({
              title: "Investment Successful!",
              description: "Your investment has been successfully processed. You can view it under 'My Investments'.",
            });
            
            // Navigate back to dashboard
            navigate('/dashboard');
          }
        });
    }
  };

  const calculateMaturityAmount = () => {
    if (!selectedModel || !selectedSlots) return 0;
    
    const investmentAmount = selectedModel.minInvestment * selectedSlots * quantity;
    const maturityAmount = investmentAmount * Math.pow(1 + (selectedModel.roi / 100), selectedModel.lockInPeriod);
    return Math.round(maturityAmount);
  };

  // Project details for Step 1
  const renderProjectDetails = () => {
    if (!selectedProject) return null;
    
    return (
      <div className="space-y-6">
        <div className="h-64 bg-neutral-200 rounded-lg overflow-hidden relative">
          <img 
            src={selectedProject.image} 
            alt={selectedProject.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-5 text-white">
            <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <p className="text-sm">{selectedProject.location}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-[#e3d4bb] bg-gradient-to-br from-white to-[#f8f2ed]">
            <CardContent className="p-5">
              <div className="flex items-start">
                <div className="bg-[#c7ab6e] bg-opacity-10 p-2 rounded-full mr-3">
                  <Banknote className="h-5 w-5 text-[#a3824a]" />
                </div>
                <div>
                  <p className="text-sm text-[#6b5c3e] mb-1">Minimum Investment</p>
                  <p className="text-lg font-semibold text-[#231e1b]">{formatCurrency(selectedProject.minimumInvestment)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#e3d4bb] bg-gradient-to-br from-white to-[#f8f2ed]">
            <CardContent className="p-5">
              <div className="flex items-start">
                <div className="bg-[#c7ab6e] bg-opacity-10 p-2 rounded-full mr-3">
                  <PercentCircle className="h-5 w-5 text-[#a3824a]" />
                </div>
                <div>
                  <p className="text-sm text-[#6b5c3e] mb-1">Estimated Returns</p>
                  <p className="text-lg font-semibold text-[#231e1b]">{selectedProject.estimatedReturns}% p.a.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#e3d4bb] bg-gradient-to-br from-white to-[#f8f2ed]">
            <CardContent className="p-5">
              <div className="flex items-start">
                <div className="bg-[#c7ab6e] bg-opacity-10 p-2 rounded-full mr-3">
                  <Clock className="h-5 w-5 text-[#a3824a]" />
                </div>
                <div>
                  <p className="text-sm text-[#6b5c3e] mb-1">Lock-in Period</p>
                  <p className="text-lg font-semibold text-[#231e1b]">{selectedProject.lockInPeriod} years</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3 text-[#231e1b]">Project Description</h3>
          <Card className="border-[#e3d4bb]">
            <CardContent className="p-5">
              <p className="text-[#6b5c3e]">
                Subha Farms is a premium farmland investment opportunity located in {selectedProject.location}. 
                This agricultural retreat offers estimated returns of {selectedProject.estimatedReturns}% p.a. with a lock-in period of {selectedProject.lockInPeriod} years.
                With {selectedProject.availableSlots} investment slots available, this is an excellent opportunity to invest in sustainable agriculture and recreational property.
              </p>
              
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#6b5c3e]">Project Size</p>
                    <p className="font-medium text-[#231e1b]">25 Acres</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6b5c3e]">Developer</p>
                    <p className="font-medium text-[#231e1b]">Subha Group</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6b5c3e]">Project Timeline</p>
                    <p className="font-medium text-[#231e1b]">2023 - 2025</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6b5c3e]">Project Stage</p>
                    <p className="font-medium text-[#231e1b]">Active Development</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-[#231e1b] mb-2">Key Amenities</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#6b5c3e]">
                    <li className="flex items-center">
                      <span className="bg-[#c7ab6e] bg-opacity-10 p-1 rounded-full mr-2">
                        <CheckCircle2 className="h-3 w-3 text-[#a3824a]" />
                      </span>
                      Organic Farming Areas
                    </li>
                    <li className="flex items-center">
                      <span className="bg-[#c7ab6e] bg-opacity-10 p-1 rounded-full mr-2">
                        <CheckCircle2 className="h-3 w-3 text-[#a3824a]" />
                      </span>
                      Weekend Retreat Cabins
                    </li>
                    <li className="flex items-center">
                      <span className="bg-[#c7ab6e] bg-opacity-10 p-1 rounded-full mr-2">
                        <CheckCircle2 className="h-3 w-3 text-[#a3824a]" />
                      </span>
                      Event & Community Spaces
                    </li>
                    <li className="flex items-center">
                      <span className="bg-[#c7ab6e] bg-opacity-10 p-1 rounded-full mr-2">
                        <CheckCircle2 className="h-3 w-3 text-[#a3824a]" />
                      </span>
                      Natural Swimming Pool
                    </li>
                    <li className="flex items-center">
                      <span className="bg-[#c7ab6e] bg-opacity-10 p-1 rounded-full mr-2">
                        <CheckCircle2 className="h-3 w-3 text-[#a3824a]" />
                      </span>
                      Hiking & Biking Trails
                    </li>
                    <li className="flex items-center">
                      <span className="bg-[#c7ab6e] bg-opacity-10 p-1 rounded-full mr-2">
                        <CheckCircle2 className="h-3 w-3 text-[#a3824a]" />
                      </span>
                      Children's Play Area
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Investment models for Step 2
  const renderInvestmentModels = () => {
    if (!models.length) return null;
    
    // Feature comparison table with type-safe definitions
    type FeatureKey = 'minInvestment' | 'roi' | 'lockInPeriod' | 'availableSlots' | 'name';
    
    interface ComparisonFeature {
      label: string;
      key: FeatureKey;
      format: (v: string | number) => React.ReactNode;
    }
    
    const comparisonFeatures: ComparisonFeature[] = [
      { 
        label: "Expected ROI", 
        key: "roi", 
        format: (v: string | number) => {
          const numValue = typeof v === 'string' ? parseFloat(v) : v;
          return (
            <span className= "inline-block border-[#231e1b90] font-semibold text-[#231e1b] text-md px-2 py-0.5 rounded border">
              {`${numValue}% p.a.`}
            </span>
          );
        }
      },

      { 
        label: "Min Investment", 
        key: "minInvestment", 
        format: (v: string | number) => {
          return formatCurrency(typeof v === 'string' ? parseFloat(v) : v);
        }
      },
      
      { 
        label: "Lock-in Period", 
        key: "lockInPeriod", 
        format: (v: string | number) => {
          const numValue = typeof v === 'string' ? parseFloat(v) : v;
          return `${numValue} years`;
        }
      },
      { 
        label: "Available Slots", 
        key: "availableSlots", 
        format: (v: string | number) => {
          return String(v);
        }
      },
      { 
        label: "Risk Level", 
        key: "name", 
        format: (v: string | number) => {
          const strValue = String(v);
          if (strValue === "Gold") return "Medium";
          if (strValue === "Platinum") return "Medium-High";
          return "Low";
        }
      },
      { 
        label: "Suitability", 
        key: "name", 
        format: (v: string | number) => {
          const strValue = String(v);
          if (strValue === "Gold" || strValue === "Platinum") return "Long-Term";
          return "Short-Term";
        }
      }
    ];
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-[#e3d4bb] overflow-hidden">
          <div className="grid grid-cols-4">
            {/* Features header */}
            <div className="p-4 border-r border-[#e3d4bb]">
              <div className="h-20 flex items-end pb-2">
                <h3 className="text-sm font-semibold text-[#6b5c3e]">Features</h3>
              </div>
            </div>
            
            {/* Sort models to ensure consistent order: Gold, Platinum, Virtual */}
            {models
              .sort((a, b) => {
                if (a.name === "Gold") return -1;
                if (b.name === "Gold") return 1;
                if (a.name === "Platinum") return -1;
                if (b.name === "Platinum") return 1;
                return 0;
              })
              .map(model => {
                const isSelected = selectedModel?.id === model.id;
                
                let badgeClass = "bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FFA500] shadow-sm text-231e1b";
                if (model.name === "Platinum") {
                  badgeClass = "bg-gradient-to-br from-[#e0e0e0] via-[#cfd8dc] to-[#b0bec5] text-gray-900 p-6 rounded-2xl shadow-sm";
                } else if (model.name === "Virtual") {
                  badgeClass = "bg-[#231e1b] shadow-sm text-white";
                }
                
                return (
                  <div key={model.id} className={`p-4 border-r border-[#e3d4bb] ${isSelected ? "bg-[#faf7f2]" : ""}`}>
                    <div className="h-20 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className={`px-3 py-1 rounded-full text-md font-medium ${badgeClass}`}>
                          {model.name}
                        </span>
                        
                        {isSelected && (
                          <div className="flex-shrink-0 text-[#c7ab6e]">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        className={`w-full mt-2 ${isSelected 
                          ? "bg-[#c7ab6e] hover:bg-[#a3824a] text-white" 
                          : "border-[#c7ab6e] text-[#a3824a] bg-white hover:bg-[#faf7f2]"}`}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleModelSelect(model)}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
          
          {/* Feature rows */}
          {comparisonFeatures.map((feature, index) => (
            <div key={feature.label} className="grid grid-cols-4 border-t border-[#e3d4bb]">
              <div className="p-4 border-r border-[#e3d4bb] bg-[#faf7f2]">
                <p className="text-sm text-[#6b5c3e]">{feature.label}</p>
              </div>
              
              {/* Sort models to ensure consistent order */}
              {models
                .sort((a, b) => {
                  if (a.name === "Gold") return -1;
                  if (b.name === "Gold") return 1;
                  if (a.name === "Platinum") return -1;
                  if (b.name === "Platinum") return 1;
                  return 0;
                })
                .map(model => {
                  const isSelected = selectedModel?.id === model.id;
                  // Type-safe way to access model property
                  let value: React.ReactNode = '';
                  if (feature.key === 'name') {
                    value = feature.format(model.name);
                  } else if (feature.key === 'minInvestment') {
                    value = feature.format(model.minInvestment);
                  } else if (feature.key === 'roi') {
                    value = feature.format(model.roi);
                  } else if (feature.key === 'lockInPeriod') {
                    value = feature.format(model.lockInPeriod);
                  } else if (feature.key === 'availableSlots') {
                    value = feature.format(model.availableSlots);
                  }
                  
                  return (
                    <div 
                      key={model.id} 
                      className={`p-4 border-r border-[#e3d4bb] ${isSelected ? "bg-[#faf7f2]" : ""}`}
                    >
                      <div className="text-sm font-medium text-[#231e1b]">{value}</div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Slot selection for Step 3
  const renderSlotSelection = () => {
    if (!selectedModel) return null;
    
    const totalInvestment = selectedModel.minInvestment * selectedSlots * quantity;
    
    return (
      <div className="space-y-6 max-w-[600px] m-auto">
        <Card className="border-[#e3d4bb]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-[#231e1b]">Selected Investment Model</h3>
            <div className="flex items-center mb-6">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#EFF6E9] text-[#42855B]">
                {selectedModel.name}
              </span>
              <span className="mx-2 text-[#6b5c3e]">•</span>
              <span className="text-sm text-[#6b5c3e]">
                {formatCurrency(selectedModel.minInvestment)} per slot
              </span>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#231e1b] mb-2">Number of Slots</label>
                <div className="flex items-center max-w-xs">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10"
                    onClick={() => handleSlotsChange(selectedSlots - 1)}
                    disabled={selectedSlots <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-20 mx-3">
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full border border-input bg-background h-10 rounded-md px-3 py-2 text-sm text-center"
                        value={selectedSlots}
                        onChange={(e) => handleSlotsChange(parseInt(e.target.value) || 1)}
                        min={1}
                        max={selectedModel.availableSlots}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10"
                    onClick={() => handleSlotsChange(selectedSlots + 1)}
                    disabled={selectedSlots >= selectedModel.availableSlots}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-[#6b5c3e] mt-1">
                  Available slots: {selectedModel.availableSlots}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#231e1b] mb-2">Quantity per Slot</label>
                <div className="flex items-center max-w-xs">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                     <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-20 mx-3">
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full border border-input bg-background h-10 rounded-md px-3 py-2 text-sm text-center"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        min={1}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-[#e3d4bb]">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#231e1b]">Total Investment</span>
                <span className="text-xl font-bold text-[#231e1b]">{formatCurrency(totalInvestment)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Investment summary for Step 4
  const renderInvestmentSummary = () => {
    if (!selectedProject || !selectedModel) return null;
    
    const totalInvestment = selectedModel.minInvestment * selectedSlots * quantity;
    const maturityAmount = calculateMaturityAmount();
    const maturityDate = new Date();
    maturityDate.setFullYear(maturityDate.getFullYear() + selectedModel.lockInPeriod);
    
    return (
      <div className="space-y-6 max-w-[600px] m-auto">
        <Card className="border-[#e3d4bb]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-[#231e1b]">Investment Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#6b5c3e]">Project Name</span>
                <span className="font-medium text-[#231e1b]">{selectedProject.name}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#6b5c3e]">Investment Model</span>
                <span className="font-medium text-[#231e1b]">{selectedModel.name}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#6b5c3e]">Number of Slots</span>
                <span className="font-medium text-[#231e1b]">{selectedSlots}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#6b5c3e]">Quantity per Slot</span>
                <span className="font-medium text-[#231e1b]">{quantity}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#6b5c3e]">Investment Amount</span>
                <span className="font-medium text-[#231e1b]">{formatCurrency(totalInvestment)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#6b5c3e]">Expected Returns</span>
                <span className="font-medium text-[#231e1b]">{selectedModel.roi}% p.a.</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#6b5c3e]">Lock-in Period</span>
                <span className="font-medium text-[#231e1b]">{selectedModel.lockInPeriod} years</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#6b5c3e]">Maturity Date</span>
                <span className="font-medium text-[#231e1b]">{maturityDate.toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#6b5c3e]">Estimated Maturity Value</span>
                <span className="font-bold text-[#42855B]">{formatCurrency(maturityAmount)}</span>
              </div>
            </div>
            
            <div className="mt-6 bg-[#f8f2ed] p-4 rounded-lg">
              <p className="text-sm text-[#6b5c3e]">
                By proceeding with this investment, you agree to the terms and conditions of Subha Invest. The estimated returns are based on current market conditions and may vary.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav 
        title="Investment Process" 
        showBack 
        backTo="/dashboard" 
        right={
          currentStep > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs border-[#c7ab6e] text-[#a3824a]"
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
          )
        }
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6">
        {selectedProject ? (
          <>
            {/* Stepper */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                {STEPS.map((step, index) => (
                  <div key={index} className="flex flex-col items-center relative z-10">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index < currentStep 
                          ? 'bg-[#42855B] text-white' 
                          : index === currentStep 
                            ? 'bg-[#231e1b] text-white' 
                            : 'bg-[#c7ab6e] text-white'
                      }`}
                    >
                      {index < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span 
                      className={`mt-2 text-xs font-medium ${
                        index <= currentStep ? 'text-[#231e1b]' : 'text-[#6b5c3e]'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
                
                {/* Progress line - now with limited width */}
                <div className="absolute top-4 h-0.5 bg-[#e3d4bb] -translate-y-1/2 z-0" style={{ 
                    left: '20px',  /* Adjust to match the center of the first circle */
                    right: '20px', /* Adjust to match the center of the last circle */
                  }}>
                  <div 
                    className="h-full bg-[#c7ab6e]" 
                    style={{ 
                      width: `${(currentStep / (STEPS.length - 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Step content */}
            <div className="mb-8">
              {currentStep === 0 && renderProjectDetails()}
              {currentStep === 1 && renderInvestmentModels()}
              {currentStep === 2 && renderSlotSelection()}
              {currentStep === 3 && renderInvestmentSummary()}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between">
              {currentStep > 0 ? (
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                   className="border-[#231e1b] text-[#231e1b]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-[#231e1b] hover:bg-[#524b47] text-white"
                  disabled={currentStep === 1 && !selectedModel}
                >
                  {currentStep === 0 ? "Select Investment Model" :
                   currentStep === 1 ? "Choose Slots" : "Continue"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className="space-x-3">
                  <Button
                    onClick={handleContactSales}
                    variant="outline"
                    className="border-[#231e1b] text-[#231e1b]"
                  >
                    Contact Our Sales
                  </Button>
                  <Button
                    onClick={handleCompleteInvestment}
                    disabled={isLoading}
                    className="bg-[#231e1b] hover:bg-[#524b47] text-white"
                  >
                    {isLoading ? "Processing..." : "Complete Investment"}
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-[#c7ab6e] border-t-transparent rounded-full"></div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}