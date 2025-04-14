import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import { auth, firestoreDb } from "../../firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, formatPhoneNumber } from "@/lib/utils";
import { User, Investment, Project } from "@/lib/types";
import {
  Building2,
  Download,
  RefreshCcw,
  Users,
  Wallet,
  TrendingUp,
} from "lucide-react";
import * as XLSX from "xlsx";

interface Statistics {
  totalInvestors: number;
  totalInvestment: number;
  projectWiseStats: {
    [key: string]: {
      totalInvestors: number;
      totalAmount: number;
      investments: Investment[];
    };
  };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [investmentData, setInvestmentData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalInvestors: 0,
    totalInvestment: 0,
    projectWiseStats: {},
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportExcel = () => {
    console.log("investments", filteredInvestments);
    const exportData = filteredInvestments.map((investment) => ({
      "Investor Name": investment.userName,
      Phone: investment.userPhone,
      Email: investment.userEmail,
      Project: investment.projectName,
      "Investment Model": investment.modelName,
      "Number of Slots": investment.slots,
      "Amount Invested": investment.amount,
      "Expected Returns": `${investment.expectedReturns}%`,
      "Investment Date": new Date(investment.createdAt).toLocaleDateString(),
      Status: investment.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Investments");

    const date = new Date().toISOString().split("T")[0];
    const fileName =
      selectedProject === "all"
        ? `All_Projects_Investments_${date}.xlsx`
        : `${selectedProject}_Investments_${date}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users and their investments
      const usersRef = collection(firestoreDb, "users");
      const usersSnapshot = await getDocs(usersRef);

      // Fetch projects
      const projectsRef = collection(firestoreDb, "projects");
      const projectsSnapshot = await getDocs(projectsRef);

      const projectsList = projectsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(projectsList);

      // Process investments and statistics
      const investmentsList: any[] = [];
      const stats: Statistics = {
        totalInvestors: 0,
        totalInvestment: 0,
        projectWiseStats: {},
      };

      usersSnapshot.forEach((doc) => {
        const userData = doc.data() as User & { investments?: Investment[] };
        if (userData.investments?.length) {
          stats.totalInvestors++;

          userData.investments.forEach((investment) => {
            investmentsList.push({
              userId: doc.id,
              userName: userData.name,
              userPhone: userData.phone,
              userEmail: userData.email,
              ...investment,
            });

            if (!stats.projectWiseStats[investment.projectName]) {
              stats.projectWiseStats[investment.projectName] = {
                totalInvestors: 0,
                totalAmount: 0,
                investments: [],
              };
            }

            stats.projectWiseStats[investment.projectName].totalInvestors++;
            stats.projectWiseStats[investment.projectName].investments.push(
              investment
            );
            stats.projectWiseStats[investment.projectName].totalAmount +=
              investment.amount;
            stats.totalInvestment += investment.amount;
          });
        }
      });

      setInvestmentData(investmentsList);
      setStatistics(stats);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestments =
    selectedProject === "all"
      ? investmentData
      : investmentData.filter((inv) => inv.projectName === selectedProject);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-[#c7ab6e]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav title="Admin Dashboard" />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#231e1b]">
                Admin Dashboard
              </h1>
              <p className="text-sm text-[#6b5c3e]">
                Last updated: {lastRefresh.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => fetchData()}
                className="border-[#e3d4bb] text-[#6b5c3e] hover:bg-[#f0e7dc]"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={handleExportExcel}
                className="bg-[#231e1b] text-white hover:bg-[#231e1b]/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-[#e3d4bb]">
              <CardContent className="flex flex-col gap-4 p-6">
                <Users className="h-8 w-8 text-[#c7ab6e]" />
                <div>
                  <p className="text-sm font-medium text-[#6b5c3e]">
                    Total Investors
                  </p>
                  <h3 className="text-2xl font-bold text-[#231e1b]">
                    {statistics.totalInvestors}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e3d4bb]">
              <CardContent className="flex flex-col gap-4 p-6">
                <Wallet className="h-8 w-8 text-[#c7ab6e]" />
                <div>
                  <p className="text-sm font-medium text-[#6b5c3e]">
                    Total Investment
                  </p>
                  <h3 className="text-2xl font-bold text-[#231e1b]">
                    {formatCurrency(statistics.totalInvestment)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e3d4bb]">
              <CardContent className="flex flex-col gap-4 p-6">
                <Building2 className="h-8 w-8 text-[#c7ab6e]" />
                <div>
                  <p className="text-sm font-medium text-[#6b5c3e]">
                    Total Projects
                  </p>
                  <h3 className="text-2xl font-bold text-[#231e1b]">
                    {projects.length}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e3d4bb]">
              <CardContent className="flex flex-col gap-4 p-6">
                <TrendingUp className="h-8 w-8 text-[#c7ab6e]" />
                <div>
                  <p className="text-sm font-medium text-[#6b5c3e]">
                    Avg. Investment
                  </p>
                  <h3 className="text-2xl font-bold text-[#231e1b]">
                    {formatCurrency(
                      statistics.totalInvestment / statistics.totalInvestors ||
                        0
                    )}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Statistics */}
          <Card className="mb-6 border-[#e3d4bb]">
            <CardHeader>
              <CardTitle className="text-[#231e1b]">
                Project Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(statistics.projectWiseStats).map(
                  ([projectName, stats]) => (
                    <Card key={projectName} className="border-[#e3d4bb]">
                      <CardContent className="p-6">
                        <h4 className="mb-4 text-lg font-semibold text-[#231e1b]">
                          {projectName}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[#6b5c3e]">Investors</span>
                            <span className="font-medium text-[#231e1b]">
                              {stats.totalInvestors}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b5c3e]">
                              Total Investment
                            </span>
                            <span className="font-medium text-[#231e1b]">
                              {formatCurrency(stats.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Investment Details */}
          <Card className="border-[#e3d4bb]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#231e1b]">
                Investment Details
              </CardTitle>
              <div className="flex items-center gap-4">
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger className="w-[200px] border-[#e3d4bb]">
                    <SelectValue placeholder="Filter by Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-[#e3d4bb]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investor Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Investment Model</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestments
                      .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                      .map((investment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {investment.userName}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p>{formatPhoneNumber(investment.userPhone)}</p>
                              <p className="text-sm text-[#6b5c3e]">
                                {investment.userEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{investment.projectName}</TableCell>
                          <TableCell>{investment.modelName}</TableCell>
                          <TableCell>
                            {formatCurrency(investment.amount)}
                          </TableCell>
                          <TableCell>
                            {formatDate(investment.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                investment.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="bg-[#f0e7dc] text-[#6b5c3e] hover:bg-[#e3d4bb]"
                            >
                              {investment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
