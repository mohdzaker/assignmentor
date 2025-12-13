import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    rollNumber: user?.rollNumber || '',
    course: user?.course || '',
    collegeName: user?.collegeName || '',
    section: user?.section || '',
    semester: user?.semester || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    updateProfile(formData);

    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully.",
    });

    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Update your student information for assignment headers.
          </p>
        </div>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              This information will appear in the header of your assignments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Student Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) => handleChange('rollNumber', e.target.value)}
                    placeholder="2021CS001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course / Program</Label>
                  <Input
                    id="course"
                    value={formData.course}
                    onChange={(e) => handleChange('course', e.target.value)}
                    placeholder="B.Tech Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collegeName">College Name</Label>
                  <Input
                    id="collegeName"
                    value={formData.collegeName}
                    onChange={(e) => handleChange('collegeName', e.target.value)}
                    placeholder="ABC College of Engineering"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => handleChange('section', e.target.value)}
                    placeholder="A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => handleChange('semester', e.target.value)}
                    placeholder="5th"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
