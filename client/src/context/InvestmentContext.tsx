import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Project, InvestmentModel, Investment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import SubhaFarmsCover from "../assets/subhaFarmsCover.jpg";

interface InvestmentContextType {
  projects: Project[];
  selectedProject: Project | null;
  selectedModel: InvestmentModel | null;
  selectedSlots: number;
  totalAmount: number;
  investments: Investment[];
  selectProject: (project: Project) => void;
  selectModel: (model: InvestmentModel) => void;
  setSlots: (slots: number) => void;
  resetSelection: () => void;
  createInvestment: () => Promise<boolean>;
  isLoading: boolean;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(
  undefined,
);

// Mock projects data
const mockProjects: Project[] = [
  {
    id: "subha-farms",
    name: "Subha Farms",
    location: "Bilanganakuppe, Karnataka 562112",
    minimumInvestment: 100000,
    estimatedReturns: 14,
    lockInPeriod: 3,
    availableSlots: 18,
    image: SubhaFarmsCover,
  },
  {
    id: "subha-white-waters",
    name: "Subha White Waters",
    location: "Electronic City",
    minimumInvestment: 150000,
    estimatedReturns: 16,
    lockInPeriod: 4,
    availableSlots: 12,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
  },
];

// Mock investments data
const mockInvestments: Investment[] = [
  {
    id: 1,
    userId: 1,
    projectId: "subha-farms",
    projectName: "Subha Farms",
    modelId: "premium-a",
    modelName: "Premium A",
    slots: 2,
    amount: 200000,
    expectedReturns: 14,
    lockInPeriod: 3,
    maturityDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 3),
    ).toISOString(),
    createdAt: new Date(
      new Date().setMonth(new Date().getMonth() - 5),
    ).toISOString(),
    status: "active",
  },
  {
    id: 2,
    userId: 1,
    projectId: "subha-white-waters",
    projectName: "Subha White Waters",
    modelId: "luxury-b",
    modelName: "Luxury B",
    slots: 1,
    amount: 150000,
    expectedReturns: 16,
    lockInPeriod: 4,
    maturityDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 4),
    ).toISOString(),
    createdAt: new Date(
      new Date().setMonth(new Date().getMonth() - 2),
    ).toISOString(),
    status: "active",
  },
];

// Get investment models for a project (mock function)
const getInvestmentModels = (projectId: string): InvestmentModel[] => {
  switch (projectId) {
    case "subha-farms":
      return [
        {
          id: "premium-a",
          name: "Premium A",
          minInvestment: 100000,
          roi: 14,
          lockInPeriod: 3,
          availableSlots: 10,
          projectId: "subha-farms",
        },
        {
          id: "premium-b",
          name: "Premium B",
          minInvestment: 150000,
          roi: 15,
          lockInPeriod: 3,
          availableSlots: 8,
          projectId: "subha-farms",
        },
      ];
    case "subha-white-waters":
      return [
        {
          id: "luxury-a",
          name: "Luxury A",
          minInvestment: 150000,
          roi: 16,
          lockInPeriod: 4,
          availableSlots: 6,
          projectId: "subha-white-waters",
        },
        {
          id: "luxury-b",
          name: "Luxury B",
          minInvestment: 200000,
          roi: 17,
          lockInPeriod: 4,
          availableSlots: 6,
          projectId: "subha-white-waters",
        },
      ];
    case "grand-courtyard":
      return [
        {
          id: "deluxe-a",
          name: "Deluxe A",
          minInvestment: 200000,
          roi: 17.5,
          lockInPeriod: 5,
          availableSlots: 4,
          projectId: "grand-courtyard",
        },
        {
          id: "deluxe-b",
          name: "Deluxe B",
          minInvestment: 250000,
          roi: 18.5,
          lockInPeriod: 5,
          availableSlots: 4,
          projectId: "grand-courtyard",
        },
      ];
    default:
      return [];
  }
};

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const { isBypassMode } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedModel, setSelectedModel] = useState<InvestmentModel | null>(
    null,
  );
  const [selectedSlots, setSelectedSlots] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const selectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const selectModel = (model: InvestmentModel) => {
    setSelectedModel(model);
  };

  const setSlots = (slots: number) => {
    setSelectedSlots(slots);
  };

  const resetSelection = () => {
    setSelectedProject(null);
    setSelectedModel(null);
    setSelectedSlots(1);
  };

  // Function to get mock models for a project
  const getModelsByProject = async (
    projectId: string,
  ): Promise<InvestmentModel[]> => {
    return getInvestmentModels(projectId);
  };

  // Load models for the selected project
  useEffect(() => {
    if (selectedProject) {
      // If in bypass mode, use mock data
      getModelsByProject(selectedProject.id).then((models) => {
        if (models.length > 0) {
          setSelectedModel(models[0]);
        }
      });
    }
  }, [selectedProject]);

  const createInvestment = async (): Promise<boolean> => {
    if (!selectedProject || !selectedModel) {
      toast({
        title: "Error",
        description: "Please select a project and investment model",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const newInvestment: Investment = {
        id: investments.length + 1,
        userId: 1,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        modelId: selectedModel.id,
        modelName: selectedModel.name,
        slots: selectedSlots,
        amount: selectedModel.minInvestment * selectedSlots,
        expectedReturns: selectedModel.roi,
        lockInPeriod: selectedModel.lockInPeriod,
        maturityDate: new Date(
          new Date().setFullYear(
            new Date().getFullYear() + selectedModel.lockInPeriod,
          ),
        ).toISOString(),
        createdAt: new Date().toISOString(),
        status: "active",
      };

      // In bypass mode, just add to local state
      if (isBypassMode) {
        setInvestments([...investments, newInvestment]);
      } else {
        // Otherwise, use the API
        const investment: Omit<
          Investment,
          "id" | "userId" | "createdAt" | "status"
        > = {
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          modelId: selectedModel.id,
          modelName: selectedModel.name,
          slots: selectedSlots,
          amount: selectedModel.minInvestment * selectedSlots,
          expectedReturns: selectedModel.roi,
          lockInPeriod: selectedModel.lockInPeriod,
          maturityDate: new Date(
            new Date().setFullYear(
              new Date().getFullYear() + selectedModel.lockInPeriod,
            ),
          ).toISOString(),
        };
        await apiRequest("POST", "/api/investments", investment);
      }

      toast({
        title: "Investment successful!",
        description: "Your investment has been confirmed.",
      });

      resetSelection();
      navigate("/dashboard");
      return true;
    } catch (error) {
      console.error("Investment error:", error);
      toast({
        title: "Investment failed",
        description: "There was an error processing your investment.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = selectedModel
    ? selectedModel.minInvestment * selectedSlots
    : 0;

  return (
    <InvestmentContext.Provider
      value={{
        projects,
        selectedProject,
        selectedModel,
        selectedSlots,
        totalAmount,
        investments,
        selectProject,
        selectModel,
        setSlots,
        resetSelection,
        createInvestment,
        isLoading,
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
}

export function useInvestment() {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error("useInvestment must be used within an InvestmentProvider");
  }
  return context;
}
