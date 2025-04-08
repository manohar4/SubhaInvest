import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertInvestmentSchema, 
  insertOtpSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import memorystore from "memorystore";
import Stripe from "stripe";
import { sendOTP, validateOTP } from './otp';

// Augment express-session with custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Generate OTP (mock function)
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe if the API key is present
  let stripe: Stripe | undefined;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  const MemoryStore = memorystore(session);
  
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'investestate-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production',
    },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // Authentication Routes
  app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const success = await sendOTP(phoneNumber);
    if (success) {
        res.json({ message: 'OTP sent successfully' });
    } else {
        res.status(500).json({ error: 'Failed to send OTP' });
    }
  });
  
  app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const isValid = validateOTP(phoneNumber, otp);
    if (isValid) {
        // Check if user exists
        const existingUser = await storage.getUserByPhoneNumber(phoneNumber);
        
        if (existingUser) {
            // Set session
            req.session.userId = existingUser.id;
            res.json({ 
                isNewUser: false,
                user: existingUser
            });
        } else {
            res.json({ 
                isNewUser: true
            });
        }
    } else {
        res.status(401).json({ error: 'Invalid OTP' });
    }
  });
  
  app.post('/api/auth/create-profile', async (req: Request, res: Response) => {
    try {
        const { phoneNumber, name } = req.body;
        
        if (!phoneNumber || !name) {
            return res.status(400).json({ message: 'Phone number and name are required' });
        }
        
        // Check if user already exists
        const existingUser = await storage.getUserByPhoneNumber(phoneNumber);
        
        if (existingUser) {
            return res.status(409).json({ message: 'User with this phone number already exists' });
        }
        
        // Create user
        const userData = insertUserSchema.parse({
            phoneNumber,
            name
        });
        
        const user = await storage.createUser(userData);
        
        // Set session
        req.session.userId = user.id;
        
        res.status(201).json(user);
    } catch (error) {
        if (error instanceof ZodError) {
            const validationError = fromZodError(error);
            return res.status(400).json({ message: validationError.message });
        }
        res.status(500).json({ message: 'Failed to create profile' });
    }
  });
  
  app.get('/api/auth/me', async (req: Request, res: Response) => {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });
  
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  // Projects Routes
  app.get('/api/projects', async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get projects' });
    }
  });
  
  app.get('/api/projects/:projectId', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get project' });
    }
  });
  
  app.get('/api/projects/:projectId/models', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const models = await storage.getInvestmentModelsByProject(projectId);
      res.status(200).json(models);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get investment models' });
    }
  });
  
  // Investments Routes
  app.get('/api/investments', async (req: Request, res: Response) => {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const investments = await storage.getInvestmentsByUser(userId);
      res.status(200).json(investments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get investments' });
    }
  });
  
  app.post('/api/investments', async (req: Request, res: Response) => {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      // Validate request body
      const investmentData = insertInvestmentSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if the project exists
      const project = await storage.getProject(investmentData.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if the investment model exists
      const model = await storage.getInvestmentModel(investmentData.modelId);
      if (!model) {
        return res.status(404).json({ message: 'Investment model not found' });
      }
      
      // Check if there are enough slots available
      if (model.availableSlots < investmentData.slots) {
        return res.status(400).json({ message: 'Not enough slots available' });
      }
      
      // Create investment
      const investment = await storage.createInvestment(investmentData);
      
      res.status(201).json(investment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Failed to create investment' });
    }
  });

  // Stripe Payment Routes
  app.post('/api/create-payment-intent', async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(500).json({ 
          message: 'Stripe is not configured. Set the STRIPE_SECRET_KEY environment variable.' 
        });
      }

      const { amount } = req.body;
      
      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Valid amount is required' });
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: 'inr',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        message: 'Failed to create payment intent',
        error: error.message
      });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
