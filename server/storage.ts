import { 
  User, InsertUser, 
  Project, InsertProject,
  InvestmentModel, InsertInvestmentModel,
  Investment, InsertInvestment,
  Otp, InsertOtp 
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User Methods
  getUser(id: number): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project Methods
  getProject(id: string): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  
  // Investment Model Methods
  getInvestmentModel(id: string): Promise<InvestmentModel | undefined>;
  getInvestmentModelsByProject(projectId: string): Promise<InvestmentModel[]>;
  
  // Investment Methods
  getInvestment(id: number): Promise<Investment | undefined>;
  getInvestmentsByUser(userId: number): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  
  // OTP Methods
  createOtp(otp: InsertOtp): Promise<Otp>;
  getLatestOtp(phoneNumber: string): Promise<Otp | undefined>;
  markOtpAsUsed(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<string, Project>;
  private investmentModels: Map<string, InvestmentModel>;
  private investments: Map<number, Investment>;
  private otps: Map<number, Otp>;
  
  private userIdCounter: number;
  private investmentIdCounter: number;
  private otpIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.investmentModels = new Map();
    this.investments = new Map();
    this.otps = new Map();
    
    this.userIdCounter = 1;
    this.investmentIdCounter = 1;
    this.otpIdCounter = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Project data to be added to storage
    const projectData = [
      {
        id: "aura",
        name: "Aura",
        location: "Bangalore",
        minimumInvestment: 100000,
        estimatedReturns: 14,
        lockInPeriod: 3,
        availableSlots: 18,
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "subha",
        name: "Codename Skylife 2100",
        location: "Mysore",
        minimumInvestment: 75000,
        estimatedReturns: 12,
        lockInPeriod: 3,
        availableSlots: 25,
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
      }
    ];
    
    // Investment model data to be added to storage
    const modelData = [
      // Aura models
      {
        id: "aura-gold",
        name: "Gold",
        minInvestment: 100000,
        roi: 12,
        lockInPeriod: 3,
        availableSlots: 5,
        projectId: "aura"
      },
      {
        id: "aura-platinum",
        name: "Platinum",
        minInvestment: 100000,
        roi: 14,
        lockInPeriod: 4,
        availableSlots: 3,
        projectId: "aura"
      },
      {
        id: "aura-virtual",
        name: "Virtual",
        minInvestment: 100000,
        roi: 10,
        lockInPeriod: 2,
        availableSlots: 10,
        projectId: "aura"
      },
      // Codename Skylife 2100 models
      {
        id: "subha-gold",
        name: "Gold",
        minInvestment: 75000,
        roi: 12,
        lockInPeriod: 3,
        availableSlots: 10,
        projectId: "subha"
      },
      {
        id: "subha-platinum",
        name: "Platinum",
        minInvestment: 75000,
        roi: 14,
        lockInPeriod: 4,
        availableSlots: 5,
        projectId: "subha"
      },
      {
        id: "subha-virtual",
        name: "Virtual",
        minInvestment: 75000,
        roi: 10,
        lockInPeriod: 2,
        availableSlots: 15,
        projectId: "subha"
      }
    ];
    
    // Add projects to storage
    for (const project of projectData) {
      // We already have the ID in the data, but we need to add it properly to storage
      const { id, ...insertData } = project;
      this.projects.set(id, {
        ...insertData,
        id
      });
    }
    
    // Add investment models to storage
    for (const model of modelData) {
      // We already have the ID in the data, but we need to add it properly to storage
      const { id, ...insertData } = model;
      this.investmentModels.set(id, {
        ...insertData,
        id
      });
    }
  }
  
  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.phoneNumber === phoneNumber) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Project Methods
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  // Investment Model Methods
  async getInvestmentModel(id: string): Promise<InvestmentModel | undefined> {
    return this.investmentModels.get(id);
  }
  
  async getInvestmentModelsByProject(projectId: string): Promise<InvestmentModel[]> {
    const models: InvestmentModel[] = [];
    for (const model of this.investmentModels.values()) {
      if (model.projectId === projectId) {
        models.push(model);
      }
    }
    return models;
  }
  
  // Investment Methods
  async getInvestment(id: number): Promise<Investment | undefined> {
    return this.investments.get(id);
  }
  
  async getInvestmentsByUser(userId: number): Promise<Investment[]> {
    const userInvestments: Investment[] = [];
    for (const investment of this.investments.values()) {
      if (investment.userId === userId) {
        userInvestments.push(investment);
      }
    }
    return userInvestments;
  }
  
  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const id = this.investmentIdCounter++;
    const newInvestment: Investment = {
      ...investment,
      id,
      createdAt: new Date().toISOString()
    };
    this.investments.set(id, newInvestment);
    
    // Update available slots for the model
    const model = await this.getInvestmentModel(investment.modelId);
    if (model) {
      const updatedModel: InvestmentModel = {
        ...model,
        availableSlots: model.availableSlots - investment.slots
      };
      this.investmentModels.set(model.id, updatedModel);
    }
    
    return newInvestment;
  }
  
  // OTP Methods
  async createOtp(otp: InsertOtp): Promise<Otp> {
    const id = this.otpIdCounter++;
    const newOtp: Otp = {
      ...otp,
      id,
      createdAt: new Date().toISOString()
    };
    this.otps.set(id, newOtp);
    return newOtp;
  }
  
  async getLatestOtp(phoneNumber: string): Promise<Otp | undefined> {
    let latestOtp: Otp | undefined;
    let latestTimestamp = 0;
    
    for (const otp of this.otps.values()) {
      if (otp.phoneNumber === phoneNumber && !otp.used) {
        const timestamp = new Date(otp.createdAt).getTime();
        if (timestamp > latestTimestamp) {
          latestOtp = otp;
          latestTimestamp = timestamp;
        }
      }
    }
    
    return latestOtp;
  }
  
  async markOtpAsUsed(id: number): Promise<void> {
    const otp = this.otps.get(id);
    if (otp) {
      this.otps.set(id, {
        ...otp,
        used: true
      });
    }
  }
}

export const storage = new MemStorage();
