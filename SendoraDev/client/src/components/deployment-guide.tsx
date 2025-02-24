import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RocketIcon, GitForkIcon } from "lucide-react";

export function DeploymentGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-20"
        >
          <RocketIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Deploy Your App</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <Tabs defaultValue="replit">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="replit">Deploy to Replit</TabsTrigger>
              <TabsTrigger value="vercel">Deploy to Vercel</TabsTrigger>
            </TabsList>

            <TabsContent value="replit" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Deploy to Replit</h3>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Fork this Repl to your account</li>
                    <li>Add the following secrets in your Repl:
                      <ul className="list-disc pl-4 mt-2">
                        <li>SUPABASE_URL</li>
                        <li>SUPABASE_ANON_KEY</li>
                        <li>DATABASE_URL</li>
                        <li>SESSION_SECRET</li>
                      </ul>
                    </li>
                    <li>Click "Run" to deploy your application</li>
                  </ol>
                  <Button
                    className="w-full mt-4"
                    onClick={() => window.open("https://replit.com/@sendora/dev", "_blank")}
                  >
                    <GitForkIcon className="w-4 h-4 mr-2" />
                    Fork on Replit
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vercel" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Deploy to Vercel</h3>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Clone the repository to your GitHub account</li>
                    <li>Create a new project on Vercel</li>
                    <li>Connect your GitHub repository</li>
                    <li>Add the following environment variables:
                      <ul className="list-disc pl-4 mt-2">
                        <li>SUPABASE_URL</li>
                        <li>SUPABASE_ANON_KEY</li>
                        <li>DATABASE_URL</li>
                        <li>SESSION_SECRET</li>
                      </ul>
                    </li>
                    <li>Deploy your application</li>
                  </ol>
                  <Button
                    className="w-full mt-4"
                    onClick={() => window.open("https://vercel.com/new", "_blank")}
                  >
                    <RocketIcon className="w-4 h-4 mr-2" />
                    Deploy to Vercel
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
