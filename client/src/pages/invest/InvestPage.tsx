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
import paymentPlan from "@/assets/paymentPlan.png"
import { CheckCircle2, Check, ArrowLeft, ArrowRight, Building2, MapPin, Calendar, Banknote, PercentCircle, Clock, Plus, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  "Select Unit/Sqft/Amount",
  "Investment Summary",
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
    isLoading,
  } = useInvestment();

  const [currentStep, setCurrentStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [models, setModels] = useState<InvestmentModel[]>([]);

  // Handle draft loading/saving
  const [draft, setDraft] = useState<InvestmentDraft | null>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftToRestore, setDraftToRestore] = useState<InvestmentDraft | null>(
    null
  );

  useEffect(() => {
    const savedDraft = localStorage.getItem(`investDraft_${projectId}`);
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft) as InvestmentDraft;
      setDraftToRestore(parsedDraft);
      setShowDraftDialog(true);
    }
  }, [projectId]);
  const handleRestoreDraft = () => {
    if (draftToRestore) {
      setCurrentStep(draftToRestore.step);
      setSlots(draftToRestore.slots);
      setQuantity(draftToRestore.quantity);

      if (draftToRestore.modelId && models.length > 0) {
        const model = models.find((m) => m.id === draftToRestore.modelId);
        if (model) {
          selectModel(model);
        }
      }
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(`investDraft_${projectId}`);
    setDraftToRestore(null);
    setShowDraftDialog(false);
  };

  // Save draft whenever important values change
  useEffect(() => {
    if (selectedProject && currentStep >= 0) {
      const draftData: InvestmentDraft = {
        projectId: selectedProject.id,
        modelId: selectedModel?.id || null,
        slots: selectedSlots,
        quantity: quantity,
        step: currentStep,
      };
      localStorage.setItem(
        `investDraft_${projectId}`,
        JSON.stringify(draftData)
      );
    }
  }, [
    selectedProject,
    selectedModel,
    selectedSlots,
    quantity,
    currentStep,
    projectId,
  ]);

  useEffect(() => {
    // Find the project by ID
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      selectProject(project);
    } else {
      toast({
        title: "Project not found",
        description: "The requested project could not be found.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [projectId, projects, selectProject, navigate, toast]);

  // Function to get hadcoded models for a project
  const getModelsByProject = (pid: string): InvestmentModel[] => {
    if (!selectedProject || !selectedProject.investmentModels) {
      return [];
    }
    return selectedProject.investmentModels;
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
          variant: "destructive",
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
          variant: "destructive",
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
          variant: "destructive",
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
        step: currentStep + 1,
      };
      localStorage.setItem(
        `investDraft_${projectId}`,
        JSON.stringify(draftData)
      );
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
          step: currentStep - 1,
        };
        localStorage.setItem(
          `investDraft_${projectId}`,
          JSON.stringify(draftData)
        );
      }
    }
  };

  const handleModelSelect = (model: InvestmentModel) => {
    selectModel(model);
  };

  const handleSlotsChange = (newSlots: number) => {
    if (
      newSlots >= 1 &&
      selectedModel &&
      newSlots <= selectedModel.availableSlots
    ) {
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
      description:
        "Your investment process is successfully started. Our sales team will reach out to you shortly. You can view this application anytime under 'My Investments'.",
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
      step: currentStep,
    };

    // Save to localStorage
    localStorage.setItem(`investDraft_${projectId}`, JSON.stringify(draftData));

    toast({
      title: "Draft Saved",
      description:
        "Your investment draft has been saved. You can continue later.",
    });
  };

  const handleCompleteInvestment = () => {
    if (selectedModel && selectedSlots > 0) {
      // Create the investment
      createInvestment().then((success) => {
        if (success) {
          // Clear the draft
          localStorage.removeItem(`investDraft_${projectId}`);

          // Show success toast
          toast({
            title: "Investment Successful!",
            description:
              "Your investment has been successfully processed. You can view it under 'My Investments'.",
          });

          // Navigate back to dashboard
          navigate("/dashboard");
        }
      });
    }
  };

  const calculateMaturityAmount = () => {
    if (!selectedModel || !selectedSlots) return 0;

    const investmentAmount =
      selectedModel.minInvestment * selectedSlots * quantity;
    const maturityAmount =
      investmentAmount *
      Math.pow(1 + selectedModel.roi / 100, selectedModel.lockInPeriod);
    return Math.round(maturityAmount);
  };

  // Project details for Step 1
  const renderProjectDetails = () => {
    if (!selectedProject) return null;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap md:flex-nowrap gap-4">
          {/* Left Section - Image with overlay */}
          <div className="w-full md:w-3/5">
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
          </div>

          {/* Right Section - Card */}
          <div className="w-full md:w-2/5">
            <Card className="border-[#e3d4bb] bg-gradient-to-br from-white to-[#f8f2ed] h-full">
              <CardContent className="p-5 space-y-2">
                <h4> Project Index</h4>
                {[
                  "Total Extent",
                  "No. of Units",
                  "Configurations",
                  "Location",
                  "Approvals",
                  "Launch Timeline",
                  "Project Completion/RTM Timeline",
                ].map((label, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm text-[#000000]"
                  >
                    <span>{label}:</span>
                    <span className="text-[#231e1b] font-medium">--</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* <Card className="border-[#e3d4bb] bg-gradient-to-br from-white to-[#f8f2ed]">
            <CardContent className="p-5">
              <div className="flex items-start">
                <div className="bg-[#c7ab6e] bg-opacity-10 p-2 rounded-full mr-3">
                  <PercentCircle className="h-5 w-5 text-[#a3824a]" />
                </div>
                <div>
                  <p className="text-sm text-[#000000] mb-1">Estimated Returns</p>
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
                  <p className="text-sm text-[#000000] mb-1">Lock-in Period</p>
                  <p className="text-lg font-semibold text-[#231e1b]">{selectedProject.lockInPeriod} years</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[#231e1b]">
            Project Description
          </h3>
          <Card className="border-[#e3d4bb]">
            <CardContent className="p-5">
              <p className="text-[#000000]">{selectedProject.description}</p>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#000000]">Project Size</p>
                    <p className="font-medium text-[#231e1b]">
                      {selectedProject.acres} Acres
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#000000]">Developer</p>
                    <p className="font-medium text-[#231e1b]">
                      {selectedProject.developer}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#000000]">Project Timeline</p>
                    <p className="font-medium text-[#231e1b]">
                      {selectedProject.timeline?.start} -{" "}
                      {selectedProject.timeline?.end}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#000000]">Project Stage</p>
                    <p className="font-medium text-[#231e1b]">
                      {selectedProject.stage}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#231e1b] mb-2">
                    Key Amenities
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#000000]">
                    {selectedProject.amenities?.map((amenity, index) => (
                      <li key={index} className="flex items-center">
                        <span className="bg-[#c7ab6e] bg-opacity-10 p-1 rounded-full mr-2">
                          <CheckCircle2 className="h-3 w-3 text-[#a3824a]" />
                        </span>
                        {amenity}
                      </li>
                    ))}
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
    type FeatureKey =
      | "minInvestment"
      | "roi"
      | "lockInPeriod"
      | "availableSlots"
      | "name";

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
          const numValue = typeof v === "string" ? parseFloat(v) : v;
          return (
            <span className="inline-block font-semibold text-[#231e1b] text-xl px-2 py-0.5 ">
              {`${numValue}% p.a.`}
            </span>
          );
        },
      },

      {
        label: "Min Investment",
        key: "minInvestment",
        format: (v: string | number) => {
          return formatCurrency(typeof v === "string" ? parseFloat(v) : v);
        },
      },

      {
        label: "Max Investment",
        key: "maxInvestment",
        format: (v: string | number) => {
          return formatCurrency(typeof v === "string" ? parseFloat(v) : v);
        },
      },

      {
        label: "Lock-in Period",
        key: "lockInPeriod",
        format: (v: string | number) => {
          const numValue = typeof v === "string" ? parseFloat(v) : v;
          return `${numValue} years`;
        },
      },

      {
        label: "Payment Plan",
        key: "paymentPlan",
        format: (v: string | number) => {
          return (
            <img
              src={typeof v === "string" ? v : ""}
              alt="Payment Plan"
              className="w-fit h-auto rounded-md shadow-sm"
            />
          );
        },
      },
      // {
      //   label: "Available Slots",
      //   key: "availableSlots",
      //   format: (v: string | number) => {
      //     return String(v);
      //   }
      // },
      // {
      //   label: "Risk Level",
      //   key: "name",
      //   format: (v: string | number) => {
      //     const strValue = String(v);
      //     if (strValue === "Gold") return "Medium";
      //     if (strValue === "Platinum") return "Medium-High";
      //     return "Low";
      //   }
      // },
      // {
      //   label: "Suitability",
      //   key: "name",
      //   format: (v: string | number) => {
      //     const strValue = String(v);
      //     if (strValue === "Gold" || strValue === "Platinum") return "Long-Term";
      //     return "Short-Term";
      //   }
      // }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-[#e3d4bb] overflow-hidden">
          <div className="grid grid-cols-4">
            {/* Features header */}
            <div className="p-4 border-r border-[#e3d4bb]">
              <div className="h-20 flex items-end pb-2">
                <h3 className="text-sm font-semibold text-[#000000]">
                  Features
                </h3>
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
              .map((model) => {
                const isSelected = selectedModel?.id === model.id;

                let badgeClass =
                  "bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FFA500] shadow-sm text-231e1b";
                if (model.name === "Platinum") {
                  badgeClass =
                    "bg-gradient-to-br from-[#e0e0e0] via-[#cfd8dc] to-[#b0bec5] text-gray-900 p-6 rounded-2xl shadow-sm";
                } else if (model.name === "Virtual") {
                  badgeClass = "bg-[#231e1b] shadow-sm text-white";
                }

                return (
                  <div
                    key={model.id}
                    className={`p-4 border-r border-[#e3d4bb] ${
                      isSelected ? "bg-[#faf7f2]" : ""
                    }`}
                  >
                    <div className="h-20 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span
                          className={`px-3 py-1 rounded-full text-md font-medium ${badgeClass}`}
                        >
                          {model.name}
                        </span>

                        {isSelected && (
                          <div className="flex-shrink-0 text-[#c7ab6e]">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <Button
                        className={`w-full mt-2 ${
                          isSelected
                            ? "bg-[#c7ab6e] hover:bg-[#a3824a] text-white"
                            : "border-[#c7ab6e] text-[#a3824a] bg-white hover:bg-[#faf7f2]"
                        }`}
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
            <div
              key={feature.label}
              className="grid grid-cols-4 border-t border-[#e3d4bb]"
            >
              <div className="p-4 border-r border-[#e3d4bb] bg-[#faf7f2]">
                <p className="text-sm text-[#000000]">{feature.label}</p>
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
                .map((model) => {
                  const isSelected = selectedModel?.id === model.id;
                  // Type-safe way to access model property
                  let value: React.ReactNode = "";
                  if (feature.key === "name") {
                    value = feature.format(model.name);
                  } else if (feature.key === "minInvestment") {
                    value = feature.format(model.minInvestment);
                  } else if (feature.key === "maxInvestment") {
                    value = feature.format(model.maxInvestment);
                  } else if (feature.key === "roi") {
                    value = feature.format(model.roi);
                  } else if (feature.key === "lockInPeriod") {
                    value = feature.format(model.lockInPeriod);
                  } else if (feature.key === "availableSlots") {
                    value = feature.format(model.availableSlots);
                  } else if (feature.key === "paymentPlan") {
                    // value = feature.format(model.paymentPlan);
                    value = feature.format(paymentPlan);
                  }

                  return (
                    <div
                      key={model.id}
                      className={`p-4 border-r border-[#e3d4bb] ${
                        isSelected ? "bg-[#faf7f2]" : ""
                      }`}
                    >
                      <div className="text-sm font-medium text-[#231e1b]">
                        {value}
                      </div>
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

    const filteredSlots = selectedModel.slots.filter(
      (slot) => slot.type.toLowerCase() === selectedModel.name.toLowerCase()
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSlots.map((slot, index) => {
          const isSelected = selectedSlots === index + 1;

          return (
            <div
              key={index}
              className={`
                relative rounded-xl overflow-hidden cursor-pointer transition-all
                ${
                  isSelected
                    ? "ring-2 ring-[#c7ab6e] bg-[#faf7f2]"
                    : "hover:bg-[#f8f2ed] bg-white"
                }
                border border-[#e3d4bb]
              `}
              onClick={() => handleSlotsChange(index + 1)}
            >
              {/* Selection indicator */}
              <div
                className={`
                absolute top-4 right-4 w-6 h-6 rounded-full border-2 
                ${
                  isSelected
                    ? "border-[#c7ab6e] bg-[#c7ab6e]"
                    : "border-[#e3d4bb]"
                }
                flex items-center justify-center
              `}
              >
                {isSelected && <Check className="h-4 w-4 text-white" />}
              </div>

              <div className="p-6">
                <div className="flex items-start mb-4">
                  <div
                    className={`
                    p-3 rounded-lg mr-4
                    ${slot.type === "virtual" ? "bg-[#E9F6F6]" : "bg-[#EFF6E9]"}
                  `}
                  >
                    <Building2
                      className={`
                      h-6 w-6
                      ${
                        slot.type === "virtual"
                          ? "text-[#2A8D8D]"
                          : "text-[#42855B]"
                      }
                    `}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#231e1b]">
                      {slot.size}
                    </h3>
                    <p className="text-sm text-[#6b5c3e]">{slot.sqft}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-[#6b5c3e]">Investment Amount</p>
                    <p className="font-semibold text-[#231e1b]">
                      {formatCurrency(slot.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6b5c3e]">Expected Returns</p>
                    <p className="font-semibold text-[#42855B]">{slot.roi} %</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6b5c3e]">Lock-in Period</p>
                    <p className="font-semibold text-[#231e1b]">
                      {slot.lockIn} Year
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6b5c3e]">Maturity Amount</p>
                    <p className="font-semibold text-[#231e1b]">
                      {formatCurrency(slot.return)}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-[#e3d4bb]">
                    <p className="text-sm text-[#42855B] flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Selected Investment Option
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Investment summary for Step 4
  const renderInvestmentSummary = () => {
    if (!selectedProject || !selectedModel) return null;

    const totalInvestment =
      selectedModel.minInvestment * selectedSlots * quantity;
    const maturityAmount = calculateMaturityAmount();
    const maturityDate = new Date();
    maturityDate.setFullYear(
      maturityDate.getFullYear() + selectedModel.lockInPeriod
    );

    return (
      <div className="space-y-6 max-w-[600px] m-auto">
        <Card className="border-[#e3d4bb]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-[#231e1b]">
              Investment Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#000000]">Project Name</span>
                <span className="font-medium text-[#231e1b]">
                  {selectedProject.name}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#000000]">Investment Model</span>
                <span className="font-medium text-[#231e1b]">
                  {selectedModel.name}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#000000]">Number of Slots</span>
                <span className="font-medium text-[#231e1b]">
                  {selectedSlots}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#000000]">Quantity per Slot</span>
                <span className="font-medium text-[#231e1b]">{quantity}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#000000]">Investment Amount</span>
                <span className="font-medium text-[#231e1b]">
                  {formatCurrency(totalInvestment)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#000000]">Expected Returns</span>
                <span className="font-medium text-[#231e1b]">
                  {selectedModel.roi}% p.a.
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#000000]">Lock-in Period</span>
                <span className="font-medium text-[#231e1b]">
                  {selectedModel.lockInPeriod} years
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#000000]">Maturity Date</span>
                <span className="font-medium text-[#231e1b]">
                  {maturityDate.toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#e3d4bb]">
                <span className="text-[#000000]">Estimated Maturity Value</span>
                <span className="font-bold text-[#42855B]">
                  {formatCurrency(maturityAmount)}
                </span>
              </div>
            </div>

            <div className="mt-6 bg-[#f8f2ed] p-4 rounded-lg">
              <p className="text-sm text-[#000000]">
                By proceeding with this investment, you agree to the terms and
                conditions of Subha Invest. The estimated returns are based on
                current market conditions and may vary.
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
        // right={
        //   currentStep > 0 && (
        //     <Button
        //       variant="outline"
        //       size="sm"
        //       className="text-xs border-[#c7ab6e] text-[#a3824a]"
        //       onClick={handleSaveDraft}
        //     >
        //       Save Draft
        //     </Button>
        //   )
        // }
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-6">
        {selectedProject ? (
          <>
            {/* Stepper */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                {STEPS.map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index < currentStep
                          ? "bg-[#42855B] text-white"
                          : index === currentStep
                          ? "bg-[#231e1b] text-white"
                          : "bg-[#c7ab6e] text-white"
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
                        index <= currentStep
                          ? "text-[#231e1b]"
                          : "text-[#000000]"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}

                {/* Progress line - now with limited width */}
                <div
                  className="absolute top-4 h-0.5 bg-[#e3d4bb] -translate-y-1/2 z-0"
                  style={{
                    left: "20px" /* Adjust to match the center of the first circle */,
                    right:
                      "20px" /* Adjust to match the center of the last circle */,
                  }}
                >
                  <div
                    className="h-full bg-[#c7ab6e]"
                    style={{
                      width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
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
                <div className="space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-[#c7ab6e] text-[#a3824a]"
                    onClick={handleSaveDraft}
                  >
                    Save Draft
                  </Button>

                  <Button
                    onClick={handleNextStep}
                    className="bg-[#231e1b] hover:bg-[#524b47] text-white"
                    disabled={currentStep === 1 && !selectedModel}
                  >
                    {currentStep === 0
                      ? "Select Investment Model"
                      : currentStep === 1
                      ? "Select Unit/Sqft/Amount"
                      : "Continue"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
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
      <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#231e1b]">
              Resume Investment Draft
            </DialogTitle>
            <DialogDescription className="text-[#6b5c3e]">
              You have an unfinished investment draft for this project. Would
              you like to continue where you left off?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-[#e3d4bb] text-[#6b5c3e] hover:bg-[#faf7f2] hover:text-[#231e1b]"
              onClick={handleDiscardDraft}
            >
              Start Fresh
            </Button>
            <Button
              className="bg-[#231e1b] hover:bg-[#231e1b]/90 text-white"
              onClick={handleRestoreDraft}
            >
              Resume Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}