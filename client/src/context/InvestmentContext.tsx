import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useLocation } from "wouter";
import { Project, InvestmentModel, Investment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { firestoreDb } from "../firebaseConfig.js";
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
  undefined
);

// Mock data for fallback/testing
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

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const { user, isBypassMode } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedModel, setSelectedModel] = useState<InvestmentModel | null>(
    null
  );
  const [selectedSlots, setSelectedSlots] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Basic functions
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

  // Fetch projects from Firebase
  useEffect(() => {
    if (isBypassMode) {
      setProjects(mockProjects); // Use mock data in bypass mode
      setIsLoading(false);
      return;
    }

    const projectsRef = collection(firestoreDb, "projects");
    const unsubscribe = onSnapshot(
      projectsRef,
      (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        setProjects(projectsData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again later.",
          variant: "destructive",
        });
        setProjects(mockProjects); // Fallback to mock data
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isBypassMode, toast]);

  // Fetch user's investments from Firebase
  useEffect(() => {
    console.log("user", user);
    if (!user?.uid) return;

    if (isBypassMode) {
      setInvestments([]); // Clear investments in bypass mode
      return;
    }

    const userRef = doc(firestoreDb, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setInvestments(userData.investments || []);
        }
      },
      (error) => {
        console.error("Error fetching investments:", error);
        toast({
          title: "Error",
          description:
            "Failed to load your investments. Please try again later.",
          variant: "destructive",
        });
        setInvestments([]); // Clear investments on error
      }
    );

    return () => unsubscribe();
  }, [user?.uid, isBypassMode, toast]);

  // Get investment models for a project
  const getModelsByProject = async (
    projectId: string
  ): Promise<InvestmentModel[]> => {
    if (isBypassMode) return [];

    try {
      const projectRef = doc(firestoreDb, "projects", projectId);
      const projectDoc = await getDoc(projectRef);

      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        return projectData.investmentModels || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching investment models:", error);
      toast({
        title: "Error",
        description: "Failed to load investment models",
        variant: "destructive",
      });
      return [];
    }
  };

  // Load models when project is selected
  useEffect(() => {
    if (selectedProject) {
      getModelsByProject(selectedProject.id).then((models) => {
        if (models.length > 0) {
          setSelectedModel(models[0]);
        }
      });
    }
  }, [selectedProject]);

  const createInvestment = async (): Promise<boolean> => {
    if (!selectedProject || !selectedModel || !user?.uid) {
      toast({
        title: "Error",
        description: "Please select a project and investment model",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Verify available slots first
      const projectRef = doc(firestoreDb, "projects", selectedProject.id);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        throw new Error("Project not found");
      }

      const currentSlots = projectDoc.data().availableSlots;
      if (currentSlots < selectedSlots) {
        toast({
          title: "Error",
          description: "Not enough slots available",
          variant: "destructive",
        });
        return false;
      }

      const newInvestment: Investment = {
        id: Date.now(),
        userId: user.uid,
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
            new Date().getFullYear() + selectedModel.lockInPeriod
          )
        ).toISOString(),
        createdAt: new Date().toISOString(),
        status: "active",
      };

      // Update user's investments
      const userRef = doc(firestoreDb, "users", user.uid);
      await updateDoc(userRef, {
        investments: arrayUnion(newInvestment),
      });

      // Update project's available slots
      await updateDoc(projectRef, {
        availableSlots: currentSlots - selectedSlots,
      });

      toast({
        title: "Success",
        description: "Your investment has been confirmed",
      });

      resetSelection();
      navigate("/dashboard");
      return true;
    } catch (error) {
      console.error("Investment error:", error);
      toast({
        title: "Investment failed",
        description:
          "There was an error processing your investment. Please try again.",
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
