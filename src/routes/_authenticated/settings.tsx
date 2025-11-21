import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  User, 
  Mail, 
  Calendar, 
  Download, 
  Trash2, 
  AlertTriangle,
  List,
  Gift,
  Link as LinkIcon,
  ShoppingBag
} from 'lucide-react'
import { getUserProfile, getAccountStats, exportUserData, deleteUserAccount } from '@/services/account'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['account-stats'],
    queryFn: getAccountStats,
  })

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      await exportUserData()
      toast.success('Your data has been exported successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion')
      return
    }

    setIsDeleting(true)
    try {
      await deleteUserAccount()
      toast.success('Your account has been deleted successfully')
      navigate({ to: '/login', search: { redirect: undefined } })
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete account. Please try again.')
      setIsDeleting(false)
    }
  }

  if (profileLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-medium mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account and data preferences</p>
      </div>

      {/* Profile Information */}
      <Card className="p-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile?.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card className="p-8">
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
          <CardDescription>Overview of your wishlists and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50">
              <List className="h-8 w-8 text-primary mb-2" />
              <div className="text-2xl font-bold">{stats?.wishlists || 0}</div>
              <div className="text-xs text-muted-foreground">Wishlists</div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50">
              <Gift className="h-8 w-8 text-primary mb-2" />
              <div className="text-2xl font-bold">{stats?.items || 0}</div>
              <div className="text-xs text-muted-foreground">Items</div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50">
              <LinkIcon className="h-8 w-8 text-primary mb-2" />
              <div className="text-2xl font-bold">{stats?.shareLinks || 0}</div>
              <div className="text-xs text-muted-foreground">Share Links</div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50">
              <ShoppingBag className="h-8 w-8 text-primary mb-2" />
              <div className="text-2xl font-bold">{stats?.reservations || 0}</div>
              <div className="text-xs text-muted-foreground">Reservations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="p-8">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or delete your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium mb-1">Export Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Download a copy of all your wishlists, items, and account data in JSON format.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={isExporting}
              className="ml-4"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive p-8">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
            <div className="flex-1">
              <h3 className="font-medium mb-1">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">
                  <List className="h-3 w-3 mr-1" />
                  {stats?.wishlists || 0} wishlists
                </Badge>
                <Badge variant="outline" className="mr-2">
                  <Gift className="h-3 w-3 mr-1" />
                  {stats?.items || 0} items
                </Badge>
                <Badge variant="outline" className="mr-2">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  {stats?.shareLinks || 0} share links
                </Badge>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setDeleteDialogOpen(true)}
              className="ml-4"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Account Permanently?
            </DialogTitle>
            <DialogDescription>
              <p className="mb-3">This will permanently delete:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Your account and profile</li>
                <li>All {stats?.wishlists || 0} wishlists you've created</li>
                <li>All {stats?.items || 0} wishlist items</li>
                <li>All {stats?.shareLinks || 0} share links</li>
                <li>All permissions you've granted</li>
              </ul>
              <p className="text-sm font-medium pt-2">
                Your {stats?.reservations || 0} reservation(s) will be anonymized but preserved for wishlist owners.
              </p>
              <div className="pt-4 space-y-2">
                <label htmlFor="deleteConfirmation" className="text-sm block mb-2 font-medium">
                  Type <span className="font-bold text-destructive">DELETE</span> to confirm:
                </label>
                <input
                  id="deleteConfirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value.trim())}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  disabled={isDeleting}
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteConfirmation('')
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmation !== 'DELETE'}
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

